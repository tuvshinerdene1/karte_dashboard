import streamlit as st
import requests
import time
import random
import concurrent.futures
from datetime import datetime, timedelta

# --- CONFIGURATION ---
API_BASE_URL = "http://localhost:8080/api/hospital"

st.set_page_config(page_title="Hospital Flow Simulator", layout="wide", page_icon="🏥")

# --- API DATA FETCHING ---
@st.cache_data(ttl=60)
def fetch_hospitals():
    try:
        return requests.get(API_BASE_URL).json()
    except: return []

@st.cache_data(ttl=60)
def fetch_services(h_id):
    try:
        return requests.get(f"{API_BASE_URL}/{h_id}/service").json()
    except: return []

@st.cache_data(ttl=60)
def fetch_steps(h_id, s_id):
    try:
        return requests.get(f"{API_BASE_URL}/{h_id}/service/{s_id}/steps").json()
    except: return []

@st.cache_data(ttl=60)
def fetch_staff_for_step(step_id):
    try:
        return requests.get(f"{API_BASE_URL}/steps/{step_id}/staff").json()
    except: return []

# --- SIMULATION ENGINE ---
def simulate_patient(p_index, h_id, s_id, stress, speed, global_start_dt, stagger_mins, doctor_assignments):
    """
    p_index: used to stagger the start time
    stagger_mins: max minutes between patient arrivals
    """
    p_id = f"AUTO-{p_index}-{random.randint(1000, 9999)}"
    
    # CALCULATE PSEUDO ARRIVAL TIME
    # Patient 0 starts at Start Time, Patient 1 starts ~stagger_mins later, etc.
    arrival_offset = p_index * stagger_mins * random.uniform(0.7, 1.3)
    current_pseudo_time = global_start_dt + timedelta(minutes=arrival_offset)
    
    try:
        steps = fetch_steps(h_id, s_id)
        
        for step in steps:
            step_id = step['id']
            
            # Staff Logic
            assigned_staff_id = None
            if doctor_assignments and step_id in doctor_assignments and doctor_assignments[step_id]:
                assigned_staff_id = doctor_assignments[step_id]
            else:
                staff_list = fetch_staff_for_step(step_id)
                assigned_staff_id = random.choice(staff_list)['id'] if staff_list else None

            # 1. START EVENT (Pseudo-time)
            requests.post(f"{API_BASE_URL}/events", json={
                "patient_identifier": p_id,
                "hospital_step_id": step_id,
                "action": "START",
                "staff_id": assigned_staff_id,
                "custom_timestamp": current_pseudo_time.isoformat()
            })
            
            # 2. DURATION CALCULATION
            base_mins = step.get('mid_threshold_minutes', 15)
            sim_mins = base_mins * stress * random.uniform(0.8, 1.2)
            
            # 3. UPDATE CLOCK
            current_pseudo_time += timedelta(minutes=sim_mins)
            
            # 4. THROTTLE (Real-world wait)
            time.sleep(max(0.1, sim_mins / speed))
            
            # 5. END EVENT (Pseudo-time)
            requests.post(f"{API_BASE_URL}/events", json={
                "patient_identifier": p_id,
                "hospital_step_id": step_id,
                "action": "END",
                "custom_timestamp": current_pseudo_time.isoformat()
            })
            
    except Exception as e:
        print(f"Error for {p_id}: {e}")

# --- UI ---
st.title("🏥 Pseudo-Time Hospital Simulator")
st.markdown("Simulate specific time blocks (e.g., a busy Monday morning) with staggered patient arrivals.")

col1, col2 = st.columns([1, 1])
final_doctor_assignments = {}

with col1:
    st.header("1. Target Scope")
    hospitals = fetch_hospitals()
    hosp_options = [{"id": "ALL", "name": "🌍 All Hospitals"}] + hospitals
    sel_hosp = st.selectbox("Hospital", hosp_options, format_func=lambda x: x['name'])
    
    sel_svc = {"id": "ALL", "service_name": "All Services"}
    if sel_hosp['id'] != "ALL":
        services = fetch_services(sel_hosp['id'])
        svc_options = [{"id": "ALL", "service_name": "📦 All Services"}] + services
        sel_svc = st.selectbox("Service", svc_options, format_func=lambda x: x['service_name'])
        
        if sel_svc['id'] != "ALL":
            st.divider()
            st.subheader(f"Staffing for {sel_svc['service_name']}")
            steps = fetch_steps(sel_hosp['id'], sel_svc['id'])
            for step in steps:
                staff_list = fetch_staff_for_step(step['id'])
                options = [{"id": None, "full_name": "🎲 Random"}] + staff_list
                choice = st.selectbox(f"Step: {step['step_name']}", options, format_func=lambda x: x['full_name'], key=step['id'])
                final_doctor_assignments[step['id']] = choice['id']

with col2:
    st.header("2. Pseudo-Clock & Timing")
    
    c1, c2 = st.columns(2)
    with c1:
        p_date = st.date_input("Simulation Date", datetime.now())
    with c2:
        p_time = st.time_input("Arrival Start Time", datetime.now().replace(hour=8, minute=0))
    
    global_start_dt = datetime.combine(p_date, p_time)
    
    st.divider()
    stagger = st.slider("Arrival Interval (Avg mins between patients)", 0, 30, 10)
    num_patients = st.number_input("Total Patients per Stream", 1, 100, 5)
    
    st.divider()
    sim_speed = st.slider("Sim Speed (1s real : X mins sim)", 1, 200, 40)
    stress = st.slider("Step Duration Stress", 0.5, 5.0, 1.0)

    if st.button("🚀 Start Pseudo-Time Simulation", use_container_width=True):
        work_list = []
        if sel_hosp['id'] == "ALL":
            for h in hospitals:
                for s in fetch_services(h['id']): work_list.append((h['id'], s['id']))
        elif sel_svc['id'] == "ALL":
            for s in fetch_services(sel_hosp['id']): work_list.append((sel_hosp['id'], s['id']))
        else:
            work_list.append((sel_hosp['id'], sel_svc['id']))

        is_granular = (sel_hosp['id'] != "ALL" and sel_svc['id'] != "ALL")
        
        with st.spinner("Simulating... Check your DB/Dashboard for timestamps."):
            with concurrent.futures.ThreadPoolExecutor() as executor:
                tasks = []
                for h_id, s_id in work_list:
                    assignments = final_doctor_assignments if is_granular else None
                    for i in range(num_patients):
                        tasks.append(executor.submit(
                            simulate_patient, i, h_id, s_id, stress, sim_speed, global_start_dt, stagger, assignments
                        ))
                concurrent.futures.wait(tasks)
        st.success(f"Finished! Patients simulated starting from {global_start_dt.strftime('%H:%M')}")