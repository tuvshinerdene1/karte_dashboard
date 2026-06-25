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

    static async processEvent(patient_identifier, hospital_step_id, action, staff_id = null, custom_timestamp = null) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Get hospital and service info
            const stepInfo = await client.query(
                `SELECT hs.hospital_id, ss.service_id
             FROM hospital_steps hs
             JOIN service_steps ss ON hs.step_id = ss.id
             WHERE hs.id = $1`, [hospital_step_id]
            );

            if (stepInfo.rows.length === 0) throw new Error("Invalid hospital_step_id");
            const { hospital_id, service_id } = stepInfo.rows[0];

            // 2. Find or create visit
            let visitId;
            const visitRes = await client.query(
                `SELECT id FROM visits WHERE patient_identifier = $1 AND status = 'active' AND hospital_id = $2 LIMIT 1`,
                [patient_identifier, hospital_id]
            );

            // If a custom timestamp is provided for a NEW visit, use it for start_time
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

            let resultMessage = "";
            // Use the provided custom_timestamp or fall back to DB CURRENT_TIMESTAMP
            const eventTime = custom_timestamp || 'CURRENT_TIMESTAMP';

            if (action === 'START') {
                await client.query(`
                INSERT INTO visit_events (visit_id, hospital_step_id, staff_id, entered_at)
                VALUES ($1, $2, $3, ${custom_timestamp ? '$4' : 'CURRENT_TIMESTAMP'})
            `, custom_timestamp ? [visitId, hospital_step_id, staff_id, custom_timestamp] : [visitId, hospital_step_id, staff_id]);
                resultMessage = "Event Started";
            }
            else if (action === 'END') {
                if (custom_timestamp) {
                    await client.query(`
        UPDATE visit_events
        SET exited_at = $1
        WHERE visit_id = $2 AND hospital_step_id = $3 AND exited_at IS NULL
    `, [custom_timestamp, visitId, hospital_step_id]);
                } else {
                    await client.query(`
        UPDATE visit_events
        SET exited_at = CURRENT_TIMESTAMP
        WHERE visit_id = $1 AND hospital_step_id = $2 AND exited_at IS NULL
    `, [visitId, hospital_step_id]);
                }
            }

            await client.query('COMMIT');
            return { success: true, message: resultMessage };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = HospitalModel;