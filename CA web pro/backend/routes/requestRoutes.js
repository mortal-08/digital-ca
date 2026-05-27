const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const CAProfile = require('../models/CAProfile');
const { protect } = require('../middleware/authMiddleware');

const populateCARecord = async (caId) => {
  if (!caId) return null;
  let ca = await CAProfile.findById(caId).select('fullName email');
  if (ca) {
    return { _id: ca._id, name: ca.fullName, email: ca.email };
  }
  ca = await User.findById(caId).select('name email');
  if (ca) {
    return { _id: ca._id, name: ca.name, email: ca.email };
  }
  return null;
};

// ─── USER routes ────────────────────────────────────────────────────────────

// POST /api/requests — Create a new service request (user)
router.post('/', protect, async (req, res) => {
  try {
    const { serviceType, description, priority, deadline, amount } = req.body;
    const request = await ServiceRequest.create({
      userId: req.user._id,
      serviceType,
      description,
      priority: priority || 'Medium',
      deadline: deadline ? new Date(deadline) : undefined,
      amount: amount || 0
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/my — Get logged-in user's requests
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const populated = await Promise.all(requests.map(async (doc) => {
      const obj = doc.toObject();
      obj.caId = await populateCARecord(obj.caId);
      return obj;
    }));

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CA routes ───────────────────────────────────────────────────────────────

// GET /api/requests — All requests (CA only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ca') return res.status(403).json({ message: 'CA access only' });
    const requests = await ServiceRequest.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone company');

    const populated = await Promise.all(requests.map(async (doc) => {
      const obj = doc.toObject();
      obj.caId = await populateCARecord(obj.caId);
      return obj;
    }));

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/requests/:id/status — Update request status (CA)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ca') return res.status(403).json({ message: 'CA access only' });
    const { status } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status, caId: req.user._id, ...(status === 'Completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    ).populate('userId', 'name email');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    const obj = request.toObject();
    obj.caId = await populateCARecord(obj.caId);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/message — Send message in a request thread
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text
    });
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CA client management ────────────────────────────────────────────────────

// GET /api/requests/clients — All unique users who have submitted requests (CA)
router.get('/clients', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ca') return res.status(403).json({ message: 'CA access only' });
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/stats — Dashboard stats for CA
router.get('/stats/ca', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ca') return res.status(403).json({ message: 'CA access only' });
    const [totalClients, pending, completed, inProgress] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      ServiceRequest.countDocuments({ status: 'Pending' }),
      ServiceRequest.countDocuments({ status: 'Completed' }),
      ServiceRequest.countDocuments({ status: 'In Progress' })
    ]);
    res.json({ totalClients, pending, completed, inProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
