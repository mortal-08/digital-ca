const express = require('express');
const router = express.Router();
const { getAllCAs } = require('../controllers/caController');
const { protect } = require('../middleware/authMiddleware');
const CAProfile = require('../models/CAProfile');
const User = require('../models/User');

// Existing: Get all CAs
router.get('/all', getAllCAs);

// @desc    List all CAs with client count (for clients to browse)
// @route   GET /api/ca/list
router.get('/list', protect, async (req, res) => {
    try {
        const cas = await CAProfile.find({ status: 'approved' }).select('fullName email createdAt');
        
        const caList = await Promise.all(cas.map(async (ca) => {
            const clientCount = await User.countDocuments({ caId: ca._id, status: 'approved' });
            return {
                _id: ca._id,
                name: ca.fullName,
                email: ca.email,
                clientCount,
                joinedAt: ca.createdAt
            };
        }));
        
        res.json(caList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Client requests to link with a CA
// @route   POST /api/ca/link-request
router.post('/link-request', protect, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only clients can request to link with a CA' });
        }
        
        const { caId } = req.body;
        if (!caId) {
            return res.status(400).json({ message: 'CA ID is required' });
        }
        
        const ca = await CAProfile.findById(caId);
        if (!ca) {
            return res.status(404).json({ message: 'CA not found' });
        }
        
        const client = await User.findById(req.user._id);
        if (client.caId && client.caId.toString() === caId && client.status === 'approved') {
            return res.status(400).json({ message: 'You are already linked to this CA' });
        }
        if (client.caId && client.caId.toString() === caId && client.status === 'pending') {
            return res.status(400).json({ message: 'Your request is already pending with this CA' });
        }
        
        client.caId = caId;
        client.status = 'pending';
        await client.save();
        
        res.json({ 
            message: `Link request sent to ${ca.fullName}. Please wait for approval.`,
            caName: ca.fullName,
            caId: ca._id,
            status: 'pending'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
