const db = require('../config/database');
const bcrypt = require('bcryptjs');

class AuthModel{
    static async findByUsername(username){
        const query = `
            SELECT u.*, s.id as staff_id, s.hospital_id 
            FROM users u
            LEFT JOIN staff s ON u.id = s.user_id
            WHERE u.username = $1
        `;
        const {rows} = await db.query(query, [username]);
        return rows[0];
    }

    static async createUser(username, password, role){
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, $3)
            RETURNING id, username, role
        `;
        const {rows} = await db.query(query, [username, hash, role]);        
        // const {rows} = await db.query(query, [username, password, role]);
        return rows[0];
    }
}

module.exports = AuthModel