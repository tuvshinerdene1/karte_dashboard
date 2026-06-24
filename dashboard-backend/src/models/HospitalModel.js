const db = require('../config/database');

class HospitalModel {
    static async getAll() {
        const query = `SELECT * FROM hospitals ORDER BY name ASC`;
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

}

module.exports = HospitalModel;