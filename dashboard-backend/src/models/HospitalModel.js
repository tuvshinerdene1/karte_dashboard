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

    static async getServices(hospitalId){
        const query = 
        `
        SELECT DISTINCT s.id, s.service_name
        FROM services s
        JOIN service_steps ss ON s.id = ss.service_id
        JOIN hospital_steps hs ON ss.id = hs.step_id
        WHERE hs.hospital_id = $1
        `
        const {rows} = await db.query(query, [hospitalId]);
        return rows;
    };

    static async getServiceSteps(hospitalId, serviceId){
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
        const {rows} = await db.query(query, [hospitalId, serviceId]);
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
    static async processEvent(patient_identifier, hospital_step_id, action){
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            //1. get hospital and service id from the hospital_step_id
            const stepInfo = await client.query(
                `
                SELECT hs.hospital_id, ss.service_id
                FROM hospital_steps hs
                JOIN service_steps ss ON hs.step_id = ss.id
                WHERE hs.id = $1
                `, [hospital_step_id]
            );

            if (stepInfo.rows.length === 0) throw new Error("Invalid hospital_step_id");
            const {hospital_id, service_id } = stepInfo.rows[0];

            //2. find or create an active visit
            let visitId;
            const visitRes = await client.query(
                `
                SELECT id FROM visits
                WHERE patient_identifier = $1 AND status = 'active' AND hospital_id = $2
                LIMIT 1
                `, [patient_identifier, hospital_id]
            );

            if(visitRes.rows.length === 0){
                const newVisit = await client.query(
                    `
                    INSERT INTO visits(hospital_id, service_id, patient_identifier, status)
                    VALUES ($1, $2, $3, 'active')
                    RETURNING id
                    `, [hospital_id, service_id, patient_identifier]
                );
                visitId = newVisit.rows[0].id;
            } else {
                visitId = visitRes.rows[0].id;
            }

            //3. perform the action (start or end)
            let resultMessage = "";
            if (action === 'START'){
                await client.query(`
                    INSERT INTO visit_events (visit_id, hospital_step_id, entered_at)
                    VALUES ($1, $2, CURRENT_TIMESTAMP)
                `, [visitId, hospital_step_id]);
                resultMessage = "Event Started";
            }
            else if(action === 'END'){
                const updateRes = await client.query(`
                    UPDATE visit_events
                    SET exited_at = CURRENT_TIMESTAMP
                    WHERE visit_id = $1 AND hospital_step_id = $2 AND exited_at IS NULL
                `,[visitId, hospital_step_id]);

                if (updateRes.rowCount === 0) throw new Error("No active event found to end");
                resultMessage = "Event Ended";
            }
            await client.query('COMMIT');
            return {success:true, message:resultMessage};
        } catch(error){
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = HospitalModel;