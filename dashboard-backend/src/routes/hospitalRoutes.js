const express = require('express');
const router = express.Router();
const controller = require('../controllers/HospitalController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes except events endpoint (simulator uses X-Simulator-Key)
router.use((req, res, next) => {
  if (req.path === '/events' && req.method === 'POST') {
    return next(); // Skip auth for events endpoint - handled in controller
  }
  return authMiddleware(req, res, next);
});

router.get('/',controller.getHospitals);
router.get('/:id/config', controller.getHospitalConfig);
router.get('/:id/service', controller.getHospitalServices);
router.get('/:id/service/:serviceId/steps', controller.getHospitalServiceSteps);
router.get('/steps/:stepId/staff', controller.getStaffByStep);
router.get('/:id/staff', controller.getHospitalStaff)
router.get('/:id/dashboard-snapshot', controller.getDashboardSnapshot);
router.get('/:id/snapshot', controller.getDashboardData);
// router.patch('/steps/:stepId/thresholds', (req, res, next) => {
//     if (req.user.role !== 'admin' && req.user.role !== 'operator') {
//         return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
//     }
//     next();
// }, controller.updateStepThresholds);

router.post('/events', authMiddleware, controller.handleEvent);

module.exports = router;
