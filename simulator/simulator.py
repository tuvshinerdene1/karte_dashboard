import streamlit as st
import requests
import time
import random
import concurrent.futures
from datetime import datetime

API_BASE_URL = "http://localhost:3000/api"

st.set_page_config(page_title="Hospital Traffic Generator", layout="wide")

# --- DATA FETCHING ---
@st.cache_data(ttl=60)
def fetch_metadata():
    """Get Hospitals and their Services from DB"""
    hospitals = requests.get(f"{API_BASE_URL}/hospitals").json()
    # Assuming an endpoint that returns services for a hospital
    return hospitals

# --- SIMULATION ENGINE ---
def simulate_patient(p_index, hospital_id, service_name, stress_level):
    p_id = f"AUTO-{p_index}-{random.randint(100, 999)}"
    
    # 1. Get the actual steps for this service from DB
    # This ensures we NEVER have a mapping error
    steps = requests.get(f"{API_BASE_URL}/hospitals/{hospital_id}/services/{service_name}/steps").json()
    
    for step in steps:
        # START
        requests.post(f"{API_BASE_URL}/events", json={
            "patient_identifier": p_id,
            "hospital_step_id": step['id'],
            "action": "START"
        })
        
        # SLEEP: (Base time from DB * Stress Level) + some random variance
        base_mins = step.get('mid_threshold_minutes', 15)
        variance = random.uniform(0.8, 1.2) # Adds realistic "human" randomness
        sleep_time = (base_mins * stress_level * variance) / st.session_state.sim_speed
        
        time.sleep(sleep_time)
        
        # END
        requests.post(f"{API_BASE_URL}/events", json={
            "patient_identifier": p_id,
            "hospital_step_id": step['id'],
            "action": "END"
        })

# --- UI INTERFACE ---
st.title("🚦 Hospital Traffic Generator")

col1, col2 = st.columns(2)

with col1:
    st.header("Configure Scenario")
    hospitals = fetch_metadata()
    selected_hosp = st.selectbox("Target Hospital", hospitals, format_func=lambda x: x['name'])
    
    # Fetch services for the selected hospital
    services = requests.get(f"{API_BASE_URL}/hospitals/{selected_hosp['id']}/services").json()
    selected_svc = st.selectbox("Service to Flood", services, format_func=lambda x: x['service_name'])

with col2:
    st.header("Traffic Parameters")
    num_patients = st.number_input("Number of Patients", min_value=1, max_value=100, value=5)
    st.session_state.sim_speed = st.slider("Sim Speed (1s : X mins)", 1, 100, 20)
    stress = st.slider("Stress Multiplier (Step Duration)", 0.5, 5.0, 1.0)

if st.button("🚀 Launch Traffic"):
    st.info(f"Generating {num_patients} patients for {selected_svc['service_name']}...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_patients) as executor:
        for i in range(num_patients):
            # Stagger arrivals randomly over 1-10 simulated minutes
            arrival_delay = random.uniform(0, 10) / st.session_state.sim_speed
            time.sleep(arrival_delay) 
            executor.submit(simulate_patient, i, selected_hosp['id'], selected_svc['service_name'], stress)
            
    st.success("All patient journeys initiated!")