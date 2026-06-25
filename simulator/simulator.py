import streamlit as st
import requests
import time
import random
import concurrent.futures

# Configuration
API_BASE_URL = "http://localhost:8080/api/hospital"

st.set_page_config(page_title="Hospital Flow Simulator", layout="wide")

# --- DATA FETCHING ---
@st.cache_data(ttl=5)
def fetch_hospitals():
    try:
        # Auth is disabled on backend, so no headers needed
        res = requests.get(API_BASE_URL)
        return res.json()
    except Exception as e:
        st.error(f"Error connecting to backend: {e}")
        return []

# --- SIMULATION ENGINE ---
def simulate_patient(p_index, hospital_id, service_id, stress_level, speed):
    p_id = f"AUTO-{p_index}-{random.randint(100, 999)}"
    
    try:
        # 1. Get the path (steps) for this specific service
        # Matches: GET /api/hospital/:id/service/:serviceId/steps
        steps_url = f"{API_BASE_URL}/{hospital_id}/service/{service_id}/steps"
        steps = requests.get(steps_url).json()
        
        for step in steps:
            # START ACTION
            # Matches: POST /api/hospital/events
            requests.post(f"{API_BASE_URL}/events", json={
                "patient_identifier": p_id,
                "hospital_step_id": step['id'],
                "action": "START"
            })
            
            # SIMULATE PROCESSING TIME
            # Use mid_threshold_minutes from DB as the base duration
            base_mins = step.get('mid_threshold_minutes', 15)
            # Add 20% random variance for realism
            variance = random.uniform(0.8, 1.2)
            sleep_time = (base_mins * stress_level * variance) / speed
            
            time.sleep(max(0.1, sleep_time))
            
            # END ACTION
            requests.post(f"{API_BASE_URL}/events", json={
                "patient_identifier": p_id,
                "hospital_step_id": step['id'],
                "action": "END"
            })
            
    except Exception as e:
        print(f"Simulation Error for patient {p_id}: {e}")

# --- UI INTERFACE ---
st.title("🚦 Hospital Traffic Generator (Auth Bypassed)")
st.info("Simulation mode: Auth is currently disabled via DISABLE_AUTH=true on the backend.")

col1, col2 = st.columns(2)

with col1:
    st.header("1. Scenario")
    hospitals = fetch_hospitals()
    
    if hospitals:
        selected_hosp = st.selectbox("Select Target Hospital", hospitals, format_func=lambda x: x['name'])
        
        # Fetch services for the chosen hospital
        # Matches: GET /api/hospital/:id/service
        try:
            services_res = requests.get(f"{API_BASE_URL}/{selected_hosp['id']}/service")
            services = services_res.json()
            selected_svc = st.selectbox("Select Service to Flood", services, format_func=lambda x: x['service_name'])
        except:
            st.error("Could not fetch services.")
    else:
        st.warning("No hospitals found. Ensure your backend is running on port 8080 and seeded.")

with col2:
    st.header("2. Parameters")
    num_patients = st.number_input("Number of Patients", min_value=1, max_value=50, value=5)
    sim_speed = st.slider("Sim Speed (1s real : X mins sim)", 1, 100, 20)
    stress = st.slider("Stress Multiplier (Step Duration)", 0.5, 5.0, 1.0)

if st.button("🚀 Start Simulation"):
    if not hospitals or not selected_svc:
        st.error("Please select a hospital and service first.")
    else:
        st.info(f"Injecting {num_patients} patients into {selected_svc['service_name']}...")
        
        # ProgressBar for UI feedback
        progress_bar = st.progress(0)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_patients) as executor:
            tasks = []
            for i in range(num_patients):
                # Stagger arrivals slightly (0 to 5 simulated minutes apart)
                time.sleep(random.uniform(0, 5) / sim_speed)
                
                tasks.append(executor.submit(
                    simulate_patient, 
                    i, 
                    selected_hosp['id'], 
                    selected_svc['id'], 
                    stress, 
                    sim_speed
                ))
            
            # Wait for all patient journeys to complete
            for j, future in enumerate(concurrent.futures.as_completed(tasks)):
                progress_bar.progress((j + 1) / num_patients)
                
        st.success(f"Simulation Complete! {num_patients} patients processed through {selected_svc['service_name']}.")