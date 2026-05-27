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

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer config for service request document uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userDir = path.join(UPLOADS_DIR, 'requests', req.user._id.toString());
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${Date.now()}_${cleanName}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(null, false); // silently skip unsupported files instead of throwing
        }
    }
});

// POST /api/requests — Create a new service request with documents (user)
router.post('/', protect, (req, res, next) => {
  upload.array('documents', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { serviceType, description, priority, deadline, amount } = req.body;
    
    // Build documents array from uploaded files
    const host = req.get('host');
    const protocol = req.protocol;
    const docs = (req.files || []).map(file => ({
      name: file.originalname,
      url: `${protocol}://${host}/uploads/requests/${req.user._id}/${file.filename}`,
      localPath: `uploads/requests/${req.user._id}/${file.filename}`,
      uploadedAt: new Date()
    }));

    const request = await ServiceRequest.create({
      userId: req.user._id,
      serviceType,
      description,
      priority: priority || 'Medium',
      deadline: deadline ? new Date(deadline) : undefined,
      amount: amount || 0,
      documents: docs
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
