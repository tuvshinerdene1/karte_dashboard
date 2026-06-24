const db = require('../config/database');

class MonitoringModel{
    static async recordMovement(visitId, hospitalStepId, staffId){
        await db.query(
            `UPDATE visit_events SET exited_at = NOW()
             WHERE visit_id = $1 AND exited_at IS NULL`,
             [visitId]
        );

        const result = await db.query(
            `INSERT INTO visit_events (visit_id, hospital_step_id, staff_id)
            VALUES ($1, $2, $3) RETURNING *`,
            [visitId, hospitalStepId, staffId]
        );

        return result.rows[0];
    }

    static async getLiveBottlenecks(){
        const query = `
            SELECT 
                ve.id as event_id,
                h.name as hospital_name,
                ss.step_name,
                s.full_name as staff_member,
                EXTRACT(EPOCH FROM (NOW() - ve.entered_at))/60 as minutes_waiting,
                hs.mid_threshold_minutes,
                hs.high_threshold_minutes
            FROM visit_events ve
            JOIN hospital_steps hs ON ve.hospital_step_id = hs.id
            JOIN service_steps ss ON hs.step_id = ss.id
            JOIN visits v ON ve.visit_id = v.id
            JOIN hospitals h ON v.hospital_id = h.id
            JOIN staff s ON ve.staff_id = s.id
            WHERE ve.exited_at IS NULL
        
        `;
        const {rows} = await db.query(query);

        return rows.map(event => ({
            ...event,
            status: event.minutes_waiting >= event.high_threshold_minutes ? 'CRITICAL':
                    event.minutes_waiting >= event.mid_threshold_minutes ? 'WARNING' : 'NORMAL'
        }));
    }
}

module.exports = MonitoringModel;