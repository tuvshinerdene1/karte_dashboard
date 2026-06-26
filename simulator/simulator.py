import streamlit as st
import requests
import time
import random
import threading
import concurrent.futures
import os
from datetime import datetime, timedelta

# --- CONFIGURATION ---
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8080/api/hospital")
SIMULATOR_API_KEY = os.environ.get("SIMULATOR_API_KEY", "simulator-dev-key")

def api_headers():
    headers = {"Content-Type": "application/json"}
    if SIMULATOR_API_KEY:
        headers["X-Simulator-Key"] = SIMULATOR_API_KEY
    return headers

def api_get(url):
    return requests.get(url, headers=api_headers())

def api_post(url, payload):
    return requests.post(url, json=payload, headers=api_headers())

st.set_page_config(page_title="Hospital Flow Master", layout="wide", page_icon="🏥")

# --- RAW API HELPERS (No Streamlit Decorators - Used by Thread) ---
def raw_fetch_services(h_id):
    try: return api_get(f"{API_BASE_URL}/{h_id}/service").json()
    except: return []

def raw_fetch_steps(h_id, s_id):
    try: return api_get(f"{API_BASE_URL}/{h_id}/service/{s_id}/steps").json()
    except: return []

def raw_fetch_staff_for_step(step_id):
    try: return api_get(f"{API_BASE_URL}/steps/{step_id}/staff").json()
    except: return []

# --- CACHED API HELPERS (For UI only) ---
@st.cache_data(ttl=60)
def fetch_hospitals():
    try: return api_get(API_BASE_URL).json()
    except: return []

@st.cache_data(ttl=60)
def cached_fetch_services(h_id):
    return raw_fetch_services(h_id)

@st.cache_data(ttl=60)
def cached_fetch_steps(h_id, s_id):
    return raw_fetch_steps(h_id, s_id)

@st.cache_data(ttl=10)
def cached_fetch_staff(step_id):
    return raw_fetch_staff_for_step(step_id)

# --- BACKGROUND ENGINE ---
def run_simulation_task(sim_entry, work_list, num_patients, stress, speed, start_dt, stagger, assignments):
    """
    Runs in a background thread.
    Launches each patient journey in parallel to simulate concurrent hospital activity.
    """
    try:
        def simulate_patient(p_index, h_id, s_id):
            p_id = f"SIM-{sim_entry['id']}-P{p_index}"
            
            # Arrival Time (Staggered)
            arrival_offset = p_index * stagger * random.uniform(0.7, 1.3)
            current_pseudo_time = start_dt + timedelta(minutes=arrival_offset)
            
            steps = raw_fetch_steps(h_id, s_id)
            for step in steps:
                step_id = step['id']
                
                # --- PHASE 1: QUEUEING ---
                in_room = False
                while not in_room:
                    assigned_id = assignments.get(step_id)
                    
                    payload = {
                        "patient_identifier": p_id, 
                        "hospital_step_id": step_id,
                        "action": "START", 
                        "staff_id": assigned_id,
                        "custom_timestamp": current_pseudo_time.isoformat()
                    }
                    
                    response = api_post(f"{API_BASE_URL}/events", payload)
                    
                    if response.status_code == 201:
                        in_room = True
                    elif response.status_code == 202:
                        # Patient is WAITING in the queue
                        current_pseudo_time += timedelta(minutes=1) 
                        time.sleep(2 / speed) 
                    else:
                        raise Exception(f"API Error: {response.text}")

                # --- PHASE 2: PROCESSING ---
                base_mins = step.get('mid_threshold_minutes', 15)
                dur = base_mins * stress * random.uniform(0.8, 1.2)
                
                time.sleep(max(0.01, (dur / speed))) 
                current_pseudo_time += timedelta(minutes=dur)

                # --- PHASE 3: EXIT ---
                api_post(f"{API_BASE_URL}/events", {
                    "patient_identifier": p_id, 
                    "hospital_step_id": step_id,
                    "action": "END", 
                    "custom_timestamp": current_pseudo_time.isoformat()
                })

        # --- CONCURRENT PATIENT EXECUTION ---
        # We launch all patient journeys at once so they compete for staff resources
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_patients + 5) as patient_executor:
            futures = []
            for h_id, s_id in work_list:
                for i in range(num_patients):
                    futures.append(patient_executor.submit(simulate_patient, i, h_id, s_id))
            
            # Wait for all patient journeys in this simulation to finish
            concurrent.futures.wait(futures)
        
        sim_entry['status'] = "Completed ✅"

    except Exception as e:
        sim_entry['status'] = f"Error ❌: {str(e)}"

# --- UI ---
if 'simulations' not in st.session_state:
    st.session_state.simulations = []

st.title("🏥 Multi-Simulation Manager")
st.markdown("Patients will now **wait in queue** if all assigned doctors for a step are busy.")

col1, col2 = st.columns([1, 1])
final_doctor_assignments = {}

with col1:
    st.header("1. Scenario Scope")
    hospitals = fetch_hospitals()
    hosp_options = [{"id": "ALL", "name": "🌍 All Hospitals"}] + hospitals
    sel_hosp = st.selectbox("Hospital", hosp_options, format_func=lambda x: x['name'])
    
    sel_svc = {"id": "ALL", "service_name": "All Services"}
    if sel_hosp['id'] != "ALL":
        services = cached_fetch_services(sel_hosp['id'])
        svc_options = [{"id": "ALL", "service_name": "📦 All Services"}] + services
        sel_svc = st.selectbox("Service", svc_options, format_func=lambda x: x['service_name'])
        
        if sel_svc['id'] != "ALL":
            with st.expander("Granular Staffing (Optional)"):
                steps = cached_fetch_steps(sel_hosp['id'], sel_svc['id'])
                for step in steps:
                    staff = cached_fetch_staff(step['id'])
                    choice = st.selectbox(
                        f"{step['step_name']}", 
                        [{"id": None, "full_name": "🎲 Random"}] + staff, 
                        format_func=lambda x: x['full_name'], 
                        key=f"staff_{step['id']}"
                    )
                    final_doctor_assignments[step['id']] = choice['id']

with col2:
    st.header("2. Simulation Parameters")
    c1, c2 = st.columns(2)
    p_date = c1.date_input("Pseudo Date", datetime.now())
    p_time = c2.time_input("Start Time", datetime.now().replace(hour=8, minute=0))
    start_dt = datetime.combine(p_date, p_time)
    
    stagger = st.number_input("Mins between patient arrivals", 0, 60, 10)
    num_p = st.number_input("Patients per stream", 1, 100, 5)
    speed = st.slider("Sim Speed (Higher = Faster)", 1, 1000, 100)
    stress = st.slider("Step Duration Stress (1.0 = Normal)", 0.1, 5.0, 1.0)

    if st.button("🚀 Launch Simulation", use_container_width=True):
        work_list = []
        if sel_hosp['id'] == "ALL":
            for h in hospitals:
                svcs = raw_fetch_services(h['id'])
                for s in svcs: work_list.append((h['id'], s['id']))
        elif sel_svc['id'] == "ALL":
            svcs = raw_fetch_services(sel_hosp['id'])
            for s in svcs: work_list.append((sel_hosp['id'], s['id']))
        else:
            work_list.append((sel_hosp['id'], sel_svc['id']))

        sim_id = str(random.randint(1000, 9999))
        new_sim = {
            "id": sim_id,
            "target": f"{sel_hosp['name']} / {sel_svc['service_name']}",
            "status": "Running 🏃‍♂️",
            "params": f"Pats: {num_p}, Stress: {stress}, Speed: {speed}"
        }
        st.session_state.simulations.append(new_sim)

        thread = threading.Thread(
            target=run_simulation_task, 
            args=(new_sim, work_list, num_p, stress, speed, start_dt, stagger, final_doctor_assignments.copy()),
            daemon=True
        )
        thread.start()
        st.toast(f"Simulation {sim_id} started!")

# --- SIMULATION MONITOR ---
st.divider()
st.header("🕵️‍♂️ Active & Recent Simulations")

if not st.session_state.simulations:
    st.write("No active simulations.")
else:
    for sim in reversed(st.session_state.simulations):
        with st.container():
            c1, c2, c3, c4 = st.columns([1, 2, 2, 1])
            c1.write(f"**ID:** {sim['id']}")
            c2.write(f"**Target:** {sim['target']}")
            c3.write(f"**Config:** {sim['params']}")
            c4.write(f"**Status:** {sim['status']}")
            st.divider()

if any(s['status'] == "Running 🏃‍♂️" for s in st.session_state.simulations):
    time.sleep(2)
    st.rerun()