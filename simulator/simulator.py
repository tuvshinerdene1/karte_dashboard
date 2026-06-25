import streamlit as st
import requests
import time
import random
import threading
from datetime import datetime, timedelta

# --- CONFIGURATION ---
API_BASE_URL = "http://localhost:8080/api/hospital"

st.set_page_config(page_title="Hospital Flow Master", layout="wide", page_icon="🏥")

# --- RAW API HELPERS (No Streamlit Decorators - Used by Thread) ---
def raw_fetch_services(h_id):
    try: return requests.get(f"{API_BASE_URL}/{h_id}/service").json()
    except: return []

def raw_fetch_steps(h_id, s_id):
    try: return requests.get(f"{API_BASE_URL}/{h_id}/service/{s_id}/steps").json()
    except: return []

def raw_fetch_staff_for_step(step_id):
    try: return requests.get(f"{API_BASE_URL}/steps/{step_id}/staff").json()
    except: return []

# --- CACHED API HELPERS (For UI only) ---
@st.cache_data(ttl=60)
def fetch_hospitals():
    try: return requests.get(API_BASE_URL).json()
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
    Runs in a pure background thread. 
    Does NOT use any st.* functions or cached functions.
    """
    try:
        def simulate_patient(p_index, h_id, s_id):
            p_id = f"SIM-{sim_entry['id']}-P{p_index}"
            arrival_offset = p_index * stagger * random.uniform(0.7, 1.3)
            current_pseudo_time = start_dt + timedelta(minutes=arrival_offset)
            
            # Use RAW functions here
            steps = raw_fetch_steps(h_id, s_id)
            for step in steps:
                # Staff selection
                assigned_id = assignments.get(step['id'])
                if not assigned_id:
                    staff = raw_fetch_staff_for_step(step['id'])
                    assigned_id = random.choice(staff)['id'] if staff else None

                # START
                requests.post(f"{API_BASE_URL}/events", json={
                    "patient_identifier": p_id, "hospital_step_id": step['id'],
                    "action": "START", "staff_id": assigned_id,
                    "custom_timestamp": current_pseudo_time.isoformat()
                })

                dur = step.get('mid_threshold_minutes', 15) * stress * random.uniform(0.8, 1.2)
                current_pseudo_time += timedelta(minutes=dur)
                
                # Throttle sleep
                time.sleep(max(0.01, (dur / speed))) 

                # END
                requests.post(f"{API_BASE_URL}/events", json={
                    "patient_identifier": p_id, "hospital_step_id": step['id'],
                    "action": "END", "custom_timestamp": current_pseudo_time.isoformat()
                })

        # Process work list
        for h_id, s_id in work_list:
            for i in range(num_patients):
                simulate_patient(i, h_id, s_id)
        
        sim_entry['status'] = "Completed ✅"

    except Exception as e:
        sim_entry['status'] = f"Error ❌: {str(e)}"

# --- UI ---
if 'simulations' not in st.session_state:
    st.session_state.simulations = []

st.title("🏥 Multi-Simulation Manager")

col1, col2 = st.columns([1, 1])
final_doctor_assignments = {}

with col1:
    st.header("1. New Simulation")
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
                    choice = st.selectbox(f"{step['step_name']}", [{"id": None, "full_name": "🎲 Random"}] + staff, format_func=lambda x: x['full_name'], key=f"staff_{step['id']}")
                    final_doctor_assignments[step['id']] = choice['id']

with col2:
    st.header("2. Timing & Load")
    c1, c2 = st.columns(2)
    p_date = c1.date_input("Pseudo Date", datetime.now())
    p_time = c2.time_input("Start Time", datetime.now().replace(hour=8, minute=0))
    start_dt = datetime.combine(p_date, p_time)
    
    stagger = st.number_input("Mins between patients", 0, 60, 10)
    num_p = st.number_input("Patients per stream", 1, 100, 5)
    speed = st.slider("Sim Speed", 1, 1000, 100)
    stress = st.slider("Stress Multiplier", 0.1, 5.0, 1.0)

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

        # Start standard thread without Streamlit Context
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