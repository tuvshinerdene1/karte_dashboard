const db = require('../config/database');

class SupportModel {
    static async getNotificationsForUser(userId) {
        const query = `
            SELECT id, visit_event_id, type, message, is_read, created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async markNotificationRead(notificationId, userId) {
        const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1 AND user_id = $2
            RETURNING id, visit_event_id, type, message, is_read, created_at
        `;
        const { rows } = await db.query(query, [notificationId, userId]);
        return rows[0];
    }

    static async getSupportRequests(user) {
        const baseQuery = `
            SELECT sr.id,
                   sr.hospital_id,
                   sr.requester_staff_id,
                   sr.assigned_operator_id,
                   sr.title,
                   sr.description,
                   sr.status,
                   sr.priority,
                   sr.created_at,
                   sr.updated_at,
                   s.full_name AS requester_name,
                   u.username AS assigned_operator_username
            FROM support_requests sr
            LEFT JOIN staff s ON sr.requester_staff_id = s.id
            LEFT JOIN users u ON sr.assigned_operator_id = u.id
        `;

        if (user.role === 'admin' || user.role === 'operator' || user.role === 'dev') {
            const query = baseQuery + ` ORDER BY sr.updated_at DESC`;
            const { rows } = await db.query(query);
            return rows;
        }

        if (!user.staffId && !user.hospitalId) {
            return [];
        }

        const query = baseQuery + `
            WHERE sr.requester_staff_id = $1 OR sr.hospital_id = $2
            ORDER BY sr.updated_at DESC
        `;
        const { rows } = await db.query(query, [user.staffId, user.hospitalId]);
        return rows;
    }

    static async getSupportRequestById(requestId, user) {
        const query = `
            SELECT sr.id,
                   sr.hospital_id,
                   sr.requester_staff_id,
                   sr.assigned_operator_id,
                   sr.title,
                   sr.description,
                   sr.status,
                   sr.priority,
                   sr.created_at,
                   sr.updated_at,
                   s.full_name AS requester_name,
                   u.username AS assigned_operator_username
            FROM support_requests sr
            LEFT JOIN staff s ON sr.requester_staff_id = s.id
            LEFT JOIN users u ON sr.assigned_operator_id = u.id
            WHERE sr.id = $1
        `;

        const { rows } = await db.query(query, [requestId]);
        const request = rows[0];
        if (!request) return null;

        if (user.role === 'admin' || user.role === 'operator' || user.role === 'dev') {
            return request;
        }

        if (user.staffId && request.requester_staff_id === user.staffId) {
            return request;
        }

        if (user.hospitalId && request.hospital_id === user.hospitalId) {
            return request;
        }

        return null;
    }

    static async createSupportRequest({ hospitalId, requesterStaffId, title, description, priority, assignedOperatorId }) {
        const query = `
            INSERT INTO support_requests (
                hospital_id,
                requester_staff_id,
                assigned_operator_id,
                title,
                description,
                status,
                priority,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'open', COALESCE($6, 'medium'), NOW(), NOW())
            RETURNING id, hospital_id, requester_staff_id, assigned_operator_id, title, description, status, priority, created_at, updated_at
        `;
        const { rows } = await db.query(query, [hospitalId, requesterStaffId, assignedOperatorId, title, description, priority]);
        return rows[0];
    }

    static async updateSupportRequest(requestId, fields, user) {
        const fieldMap = {
            title: 'title',
            description: 'description',
            status: 'status',
            priority: 'priority',
            assignedOperatorId: 'assigned_operator_id'
        };
        const updates = [];
        const values = [];
        let idx = 1;

        for (const [fieldKey, dbColumn] of Object.entries(fieldMap)) {
            if (fields[fieldKey] !== undefined) {
                updates.push(`${dbColumn} = $${idx}`);
                values.push(fields[fieldKey]);
                idx += 1;
            }
        }

        if (updates.length === 0) {
            return this.getSupportRequestById(requestId, user);
        }

        values.push(requestId);
        const updateQuery = `
            UPDATE support_requests
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${idx}
            RETURNING id, hospital_id, requester_staff_id, assigned_operator_id, title, description, status, priority, created_at, updated_at
        `;

        const { rows } = await db.query(updateQuery, values);
        const request = rows[0];
        if (!request) {
            return null;
        }

        if (user.role === 'admin' || user.role === 'operator' || user.role === 'dev') {
            return request;
        }

        if (user.staffId && request.requester_staff_id === user.staffId) {
            return request;
        }

        if (user.hospitalId && request.hospital_id === user.hospitalId) {
            return request;
        }

        return null;
    }
}

module.exports = SupportModel;
