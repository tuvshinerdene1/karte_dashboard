DO $$
DECLARE
    h_id UUID;
    s_id UUID;
    step_id UUID;
    h_step_id UUID;
    u_id UUID;
    st_id UUID;
    h_count INTEGER;
    s_count INTEGER;
    step_count INTEGER;
    staff_count INTEGER;
    i INTEGER;
    j INTEGER;
    k INTEGER;
    step_names TEXT[] := ARRAY['Reception', 'Initial Assessment', 'Consultation', 'Diagnostic Testing', 'Treatment', 'Pharmacy', 'Discharge'];
BEGIN
    -- 1. Create 2 Hospitals
    FOR i IN 1..2 LOOP
        INSERT INTO hospitals (name, location)
        VALUES (
            CASE WHEN i = 1 THEN 'St. Marys General' ELSE 'City Central Clinic' END,
            CASE WHEN i = 1 THEN 'North District' ELSE 'South Hub' END
        ) RETURNING id INTO h_id;

        -- 2. Create 15 Staff/Users per Hospital
        FOR j IN 1..15 LOOP
            -- Create User first
            INSERT INTO users (username, password_hash, role)
            VALUES (
                'staff_' || i || '_' || j,
                'hashed_password_here',
                'hospital_staff'
            ) RETURNING id INTO u_id;

            -- Create Staff linked to User and Hospital
            INSERT INTO staff (user_id, hospital_id, full_name, specialization, phone_number)
            VALUES (
                u_id,
                h_id,
                'Dr. ' || CASE 
                    WHEN j % 3 = 0 THEN 'Smith ' 
                    WHEN j % 3 = 1 THEN 'Johnson ' 
                    ELSE 'Williams ' END || i || j,
                CASE 
                    WHEN j % 4 = 0 THEN 'Cardiology'
                    WHEN j % 4 = 1 THEN 'Pediatrics'
                    WHEN j % 4 = 2 THEN 'General Practice'
                    ELSE 'Surgery' END,
                '555-010' || i || j
            );
        END LOOP;
    END LOOP;

    -- 3. Create 20 Services (Global)
    FOR i IN 1..20 LOOP
        INSERT INTO services (service_name)
        VALUES (
            CASE 
                WHEN i = 1 THEN 'Emergency Care'
                WHEN i = 2 THEN 'Cardiology'
                WHEN i = 3 THEN 'Oncology'
                WHEN i = 4 THEN 'Neurology'
                WHEN i = 5 THEN 'Pediatrics'
                WHEN i = 6 THEN 'Orthopedics'
                WHEN i = 7 THEN 'Dermatology'
                WHEN i = 8 THEN 'Radiology'
                WHEN i = 9 THEN 'Gastroenterology'
                WHEN i = 10 THEN 'Urology'
                ELSE 'Specialized Service ' || i END
        ) RETURNING id INTO s_id;

        -- 4. Create 4 to 5 Steps for each Service
        step_count := 4 + (i % 2); -- Alternates between 4 and 5 steps
        FOR j IN 1..step_count LOOP
            INSERT INTO service_steps (service_id, step_name, step_order)
            VALUES (s_id, step_names[j], j)
            RETURNING id INTO step_id;

            -- 5. Link Steps to both Hospitals (Hospital-Specific Config)
            FOR h_id IN (SELECT id FROM hospitals) LOOP
                INSERT INTO hospital_steps (hospital_id, step_id, mid_threshold_minutes, high_threshold_minutes)
                VALUES (h_id, step_id, 20 + (j * 5), 45 + (j * 10))
                RETURNING id INTO h_step_id;

                -- 6. Assign Staff to Steps (Requirement: Multiple doctors can do a step)
                -- We assign 2-3 doctors from the specific hospital to every step
                INSERT INTO staff_step_assignments (staff_id, hospital_step_id)
                SELECT id, h_step_id
                FROM staff
                WHERE hospital_id = h_id
                ORDER BY RANDOM()
                LIMIT 3; 
            END LOOP;
        END LOOP;
    END LOOP;

    -- 7. Optional: Generate a few active visits to see data in the dashboard
    FOR i IN 1..10 LOOP
        INSERT INTO visits (hospital_id, service_id, patient_identifier, status)
        SELECT 
            h.id, 
            s.id, 
            'PATIENT-' || i * 100,
            'active'
        FROM hospitals h, services s
        ORDER BY RANDOM()
        LIMIT 1;
    END LOOP;

END $$;