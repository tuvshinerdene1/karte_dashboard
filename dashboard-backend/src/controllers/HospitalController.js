const HospitalModel = require('../models/HospitalModel');

exports.getHospitals = async (req, res) => {
    try {
        const hospitals = await HospitalModel.getAll();
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHospitalConfig = async (req, res) => {
    try {
        const config = await HospitalModel.getConfiguration(req.params.id);
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHospitalServices = async (req, res) => {
    try {
        const services = await HospitalModel.getServices(req.params.id);
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getHospitalServiceSteps = async (req, res) => {
    try {
        const steps = await HospitalModel.getServiceSteps(req.params.id, req.params.serviceId);
        res.json(steps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStepThresholds = async (req, res) => {
    try {
        const { mid, high } = req.body;
        const updated = await HospitalModel.updateThresholds(req.params.stepId, mid, high);

        // Log this action (Optional: You could also alert the support team)
        console.log(`Thresholds updated for step ${req.params.stepId}`);

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHospitalStaff = async (req, res) => {
    try {
        const staff = await HospitalModel.getAllStaff(req.params.id);
        res.json(staff);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStaffByStep = async (req, res) => {
    try {
        const staff = await HospitalModel.getAssignedStaff(req.params.stepId);
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.handleEvent = async (req, res) => {
    try {
        const { patient_identifier, hospital_step_id, action, staff_id, custom_timestamp } = req.body;

        const result = await HospitalModel.processEvent(
            patient_identifier,
            hospital_step_id,
            action,
            staff_id,
            custom_timestamp
        );

        // 🚀 BROADCAST TO FRONTEND
        // This sends the update to all connected dashboards instantly
        req.io.emit('HOSPITAL_UPDATE', {
            action,
            patient_identifier,
            hospital_step_id,
            status: result.status, // 'waiting', 'in_progress', or 'completed'
            message: result.message,
            timestamp: custom_timestamp || new Date()
        });

        const statusCode = (action === 'START' && result.status === 'waiting') ? 202 :
            (action === 'START' ? 201 : 200);

        return res.status(statusCode).json(result);
    } catch (error) {
        console.error("Controller error: ", error.message);
        return res.status(500).json({ error: error.message });
    }
};

exports.getDashboardSnapshot = async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const analytics = await HospitalModel.getLiveAnalytics(hospitalId);
        const staff = await HospitalModel.getAllStaff(hospitalId);

        res.json({
            analytics,
            staff,
            timestamp: new Date()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const snapshot = await HospitalModel.getLiveSnapshot(req.params.id);
        res.json(snapshot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
