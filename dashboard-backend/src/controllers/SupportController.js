const SupportModel = require('../models/SupportModel');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await SupportModel.getNotificationsForUser(req.user.userId);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await SupportModel.markNotificationRead(req.params.id, req.user.userId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await SupportModel.getSupportRequests(req.user);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const request = await SupportModel.getSupportRequestById(req.params.id, req.user);
        if (!request) {
            return res.status(404).json({ message: 'Support request not found' });
        }
        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { hospital_id, title, description, priority, assigned_operator_id } = req.body;

        if (!hospital_id || !title) {
            return res.status(400).json({ message: 'hospital_id and title are required' });
        }

        const newRequest = await SupportModel.createSupportRequest({
            hospitalId: hospital_id,
            requesterStaffId: req.user.staffId || null,
            title,
            description,
            priority,
            assignedOperatorId: assigned_operator_id || null
        });

        res.status(201).json(newRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const { title, description, status, priority, assigned_operator_id } = req.body;

        const updatedRequest = await SupportModel.updateSupportRequest(
            req.params.id,
            {
                title,
                description,
                status,
                priority,
                assignedOperatorId: assigned_operator_id
            },
            req.user
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Support request not found or access denied' });
        }

        res.json(updatedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
