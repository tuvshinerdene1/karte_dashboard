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

exports.getStaffByStep = async (req, res) => {
    try {
        const staff = await HospitalModel.getAssignedStaff(req.params.stepId);
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};