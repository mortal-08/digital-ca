const express = require('express');
const router = express.Router();
const { getPendingClients, getClients, approveClient, rejectClient } = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getClients);
router.get('/pending', protect, getPendingClients);
router.put('/:id/approve', protect, approveClient);
router.put('/:id/reject', protect, rejectClient);

module.exports = router;
