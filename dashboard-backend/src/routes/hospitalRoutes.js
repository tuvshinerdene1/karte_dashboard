const express = require('express');
const router = express.Router();
const controller = require('../controllers/HospitalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/',controller.getHospitals);
router.get('/:id/config', controller.getHospitalConfig);
router.get('/:id/service', controller.getHospitalServices);
router.get('/:id/service/:serviceId/steps', controller.getHospitalServiceSteps);
router.get('/steps/:stepId/staff', controller.getStaffByStep);

// router.patch('/steps/:stepId/thresholds', (req, res, next) => {
//     if (req.user.role !== 'admin' && req.user.role !== 'operator') {
//         return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
//     }
//     next();
// }, controller.updateStepThresholds);

router.post('/events', controller.handleEvent);

module.exports = router;

