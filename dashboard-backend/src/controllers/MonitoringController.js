const MonitoringModel = require('../models/MonitoringModel');

exports.getDashboard = async(req, res) => {
    try {
        const data = await MonitoringModel.getLiveBottlenecks();
        res.json(data);
    } catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.postSimulatorEvent = async (req,res) =>{
    try{
        const {visit_id, hospital_step_id, staff_id} = req.body;
        const newEvent = await MonitoringModel.recordMovement(visit_id, hospital_step_id, staff_id);

        res.status(201).json(newEvent);
    } catch (err){
        res.status(500).json({error: err.message});
    }
};