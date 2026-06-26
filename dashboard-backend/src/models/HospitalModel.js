const db = require('../config/database');

class HospitalModel {
    static async getAll() {
        const query = `SELECT id, name FROM hospitals ORDER BY name ASC`;
        const { rows } = await db.query(query);
        return rows;
    }

    static async getConfiguration(hospitalId) {
        const query = `
            SELECT 
                hs.id as hospital_step_id,
                s.service_name,
                ss.step_name,
                ss.step_order,
                hs.mid_threshold_minutes,
                hs.high_threshold_minutes
            FROM hospital_steps hs
            JOIN service_steps ss ON hs.step_id = ss.id
            JOIN services s ON ss.service_id = s.id
            WHERE hs.hospital_id = $1
            ORDER BY s.service_name, ss.step_order;
        `;
        const { rows } = await db.query(query, [hospitalId]);
        return rows;
    }

    static async getServices(hospitalId) {
        const query =
            `
        SELECT DISTINCT s.id, s.service_name
        FROM services s
        JOIN service_steps ss ON s.id = ss.service_id
        JOIN hospital_steps hs ON ss.id = hs.step_id
        WHERE hs.hospital_id = $1
        `
        const { rows } = await db.query(query, [hospitalId]);
        return rows;
    };

    static async getServiceSteps(hospitalId, serviceId) {
        const query =
            `
        SELECT 
            hs.id,
            ss.step_name,
            hs.mid_threshold_minutes,
            hs.high_threshold_minutes
        FROM hospital_steps hs
        JOIN service_steps ss ON hs.step_id = ss.id
        WHERE hs.hospital_id = $1 AND ss.service_id = $2
        ORDER BY ss.step_order ASC;

        `
        const { rows } = await db.query(query, [hospitalId, serviceId]);
        return rows;
    };

    static async updateThresholds(hospitalStepId, mid, high) {
        const query = `
            UPDATE hospital_steps 
            SET mid_threshold_minutes = $1, high_threshold_minutes = $2
            WHERE id = $3
            RETURNING *;
        `;
        const { rows } = await db.query(query, [mid, high, hospitalStepId]);
        return rows[0];
    }

    static async getAllStaff(hospitalId) {
        const query =
            `
        SELECT id, full_name, specialization FROM staff WHERE hospital_id = $1 ORDER BY  full_name ASC
        `;
        const { rows } = await db.query(query, [hospitalId]);
        return rows;
    }

    static async getAssignedStaff(hospitalStepId) {
        const query = `
            SELECT s.id, s.full_name, s.specialization, s.phone_number
            FROM staff s
            JOIN staff_step_assignments ssa ON s.id = ssa.staff_id
            WHERE ssa.hospital_step_id = $1;
        `;
        const { rows } = await db.query(query, [hospitalStepId]);
        return rows;
    }

    //handling logic of finding/creating a visit and then starting or ending an event.
    // HospitalModel.js

    static async processEvent(patient_identifier, hospital_step_id, action, preferred_staff_id = null, custom_timestamp = null) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Get hospital, service, and step configuration info
            const stepInfo = await client.query(
                `SELECT hs.hospital_id, ss.service_id, ss.step_name, hs.mid_threshold_minutes, hs.high_threshold_minutes
                 FROM hospital_steps hs
                 JOIN service_steps ss ON hs.step_id = ss.id
                 WHERE hs.id = $1`, [hospital_step_id]
            );

            if (stepInfo.rows.length === 0) throw new Error("Invalid hospital_step_id");
            const { hospital_id, service_id, step_name, mid_threshold_minutes, high_threshold_minutes } = stepInfo.rows[0];

            // 2. Find or create visit
            let visitId;
            const visitRes = await client.query(
                `SELECT id FROM visits WHERE patient_identifier = $1 AND status = 'active' AND hospital_id = $2 LIMIT 1`,
                [patient_identifier, hospital_id]
            );

            if (visitRes.rows.length === 0) {
                const newVisit = await client.query(
                    `INSERT INTO visits(hospital_id, service_id, patient_identifier, status, start_time)
                     VALUES ($1, $2, $3, 'active', COALESCE($4, CURRENT_TIMESTAMP))
                     RETURNING id`, [hospital_id, service_id, patient_identifier, custom_timestamp]
                );
                visitId = newVisit.rows[0].id;
            } else {
                visitId = visitRes.rows[0].id;
            }

            if (action === 'START') {
                // A. Check if patient is already waiting/in_progress for this specific step
                const existingEvent = await client.query(
                    `SELECT id, status FROM visit_events 
                     WHERE visit_id = $1 AND hospital_step_id = $2 AND status != 'completed'`,
                    [visitId, hospital_step_id]
                );

                // B. If they aren't even in the queue yet, put them in 'waiting'
                if (existingEvent.rows.length === 0) {
                    await client.query(
                        `INSERT INTO visit_events (visit_id, hospital_step_id, arrived_at, status)
                         VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), 'waiting')`,
                        [visitId, hospital_step_id, custom_timestamp]
                    );
                }

                // C. Find an available staff member assigned to this step
                const freeStaffRes = await client.query(`
                    SELECT ssa.staff_id FROM staff_step_assignments ssa
                    WHERE ssa.hospital_step_id = $1
                    AND ($2::uuid IS NULL OR ssa.staff_id = $2)
                    AND ssa.staff_id NOT IN (
                        SELECT staff_id FROM visit_events WHERE status = 'in_progress' AND staff_id IS NOT NULL
                    )
                    LIMIT 1
                `, [hospital_step_id, preferred_staff_id]);

                if (freeStaffRes.rows.length > 0) {
                    const assignedStaffId = freeStaffRes.rows[0].staff_id;

                    // D. MOVE FROM WAITING TO IN_PROGRESS
                    await client.query(`
                        UPDATE visit_events 
                        SET status = 'in_progress', 
                            staff_id = $1, 
                            entered_at = COALESCE($2, CURRENT_TIMESTAMP)
                        WHERE visit_id = $3 AND hospital_step_id = $4 AND status = 'waiting'
                    `, [assignedStaffId, custom_timestamp, visitId, hospital_step_id]);

                    await client.query('COMMIT');
                    return { success: true, status: 'in_progress', message: "Patient started treatment" };
                } else {
                    // E. REMAIN IN WAITING
                    await client.query('COMMIT');
                    return { success: true, status: 'waiting', message: "No staff available, patient is in queue" };
                }
            }

            else if (action === 'END') {
                // A. Fetch the entered_at time to calculate duration before completing
                const currentEventRes = await client.query(
                    `SELECT id, entered_at FROM visit_events 
                     WHERE visit_id = $1 AND hospital_step_id = $2 AND status = 'in_progress'`,
                    [visitId, hospital_step_id]
                );

                if (currentEventRes.rows.length === 0) throw new Error("No active treatment found to end");

                const eventId = currentEventRes.rows[0].id;
                const enteredAt = currentEventRes.rows[0].entered_at;
                const exitTime = custom_timestamp ? new Date(custom_timestamp) : new Date();

                // B. Calculate duration in minutes
                const durationMins = (exitTime - new Date(enteredAt)) / (1000 * 60);

                // C. Update the event to completed
                await client.query(`
                    UPDATE visit_events
                    SET exited_at = $1,
                        status = 'completed'
                    WHERE id = $2
                `, [exitTime, eventId]);

                // D. BOTTLENECK DETECTION LOGIC
                let alertType = null;
                if (durationMins > high_threshold_minutes) {
                    alertType = 'critical';
                } else if (durationMins > mid_threshold_minutes) {
                    alertType = 'warning';
                }

                let alertGenerated = false;
                if (alertType) {
                    const alertMsg = `Patient ${patient_identifier} stayed ${Math.round(durationMins)} mins in ${step_name} (Threshold: ${mid_threshold_minutes}/${high_threshold_minutes})`;

                    const userResult = await client.query(`
                        SELECT user_id FROM staff WHERE id = $1
                    `, [currentEventRes.rows[0].staff_id]);
                    const userId = userResult.rows[0] ? userResult.rows[0].user_id : null;

                    if (userId) {
                        await client.query(`
                            INSERT INTO notifications (user_id, visit_event_id, type, message)
                            VALUES ($1, $2, $3, $4)
                        `, [userId, eventId, alertType, alertMsg]);
                        alertGenerated = true;
                    }
                }

                await client.query('COMMIT');
                return {
                    success: true,
                    status: 'completed',
                    message: "Treatment finished",
                    alert_generated: alertGenerated,
                    alert_type: alertType
                };
            }

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    static async getLiveAnalytics(hospitalId) {
        const query = `
        SELECT 
            hs.id AS hospital_step_id,
            ss.step_name,
            s.service_name,
            -- Current status counts
            COUNT(CASE WHEN ve.status = 'waiting' THEN 1 END) AS queue_count,
            COUNT(CASE WHEN ve.status = 'in_progress' THEN 1 END) AS active_count,
            -- Average Wait Time (Last 1 hour)
            ROUND(AVG(EXTRACT(EPOCH FROM (ve.entered_at - ve.arrived_at))/60)) AS avg_wait_mins,
            -- Thresholds for comparison
            hs.mid_threshold_minutes,
            hs.high_threshold_minutes
        FROM hospital_steps hs
        JOIN service_steps ss ON hs.step_id = ss.id
        JOIN services s ON ss.service_id = s.id
        LEFT JOIN visit_events ve ON hs.id = ve.hospital_step_id 
            AND (ve.status != 'completed' OR ve.exited_at > NOW() - INTERVAL '1 hour')
        WHERE hs.hospital_id = $1
        GROUP BY hs.id, ss.step_name, s.service_name, hs.mid_threshold_minutes, hs.high_threshold_minutes
        ORDER BY s.service_name, ss.step_order;
    `;
        const { rows } = await db.query(query, [hospitalId]);
        return rows;
    }
    static async getLiveSnapshot(hospitalId) {
        const query = `
        SELECT 
            hs.id AS hospital_step_id,
            ss.step_name,
            s.service_name,
            COUNT(CASE WHEN ve.status = 'waiting' THEN 1 END) AS waiting_count,
            COUNT(CASE WHEN ve.status = 'in_progress' THEN 1 END) AS in_progress_count,
            hs.mid_threshold_minutes,
            hs.high_threshold_minutes
        FROM hospital_steps hs
        JOIN service_steps ss ON hs.step_id = ss.id
        JOIN services s ON ss.service_id = s.id
        LEFT JOIN visit_events ve ON hs.id = ve.hospital_step_id AND ve.status != 'completed'
        WHERE hs.hospital_id = $1
        GROUP BY hs.id, ss.step_name, s.service_name, hs.mid_threshold_minutes, hs.high_threshold_minutes, ss.step_order
        ORDER BY s.service_name, ss.step_order;
    `;
        const { rows } = await db.query(query, [hospitalId]);
        return rows;
    }
};

module.exports = HospitalModel;