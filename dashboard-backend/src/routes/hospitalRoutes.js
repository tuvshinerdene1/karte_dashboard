const express = require('express');
const router = express.Router();
const controller = require('../controllers/HospitalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/',controller.getHospitals);
router.get('/:id/config', controller.getHospitalConfig);
router.get('/steps/:stepId/staff', controller.getStaffByStep);

router.patch('/steps/:stepId/thresholds', (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
}, controller.updateStepThresholds);

module.exports = router;