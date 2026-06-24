const express = require('express');
const router = express.Router();
const controller = require('../controllers/MonitoringController');

// for the dashboard
router.get('/dashboard', controller.getDashboard);

// for the python simulator
router.post('/event', controller.postSimulatorEvent);

module.exports = router;