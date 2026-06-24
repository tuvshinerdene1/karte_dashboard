const db = require('../config/database');

class StaffModel {
    static async getByHospital(hospitalId) {
        const query = `
            SELECT s.*, u.username, u.role
            FROM staff s
            JOIN users u ON s.user_id = u.id
            WHERE s.hospital_id = $1
            ORDER BY s.full_name ASC
        `;
        const { rows } = await db.query(query, [hospitalId]);
        return rows;
    }
}