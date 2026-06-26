const express = require('express');
const router = express.Router();
const controller = require('../controllers/SupportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/notifications', controller.getNotifications);
router.patch('/notifications/:id/read', controller.markNotificationRead);

router.get('/requests', controller.getRequests);
router.get('/requests/:id', controller.getRequestById);
router.post('/requests', controller.createRequest);
router.patch('/requests/:id', controller.updateRequest);

module.exports = router;
