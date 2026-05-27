const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const { protect } = require('../middleware/authMiddleware');

// Define directory for uploads relative to backend folder
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Configure Multer Disk Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine owner ID (client folder name)
        let ownerId = req.body.clientId || req.user._id.toString();
        if (req.user.role === 'user') {
            ownerId = req.user._id.toString();
        }

        // Folder structure: uploads/ownerId/
        const userDir = path.join(UPLOADS_DIR, ownerId);

        // Automatically create user-specific folders if they do not exist
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        // Sanitize the file name to prevent directory traversal or invalid characters
        const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '_');
        // Prepend a short unique identifier/timestamp to avoid name collisions
        const uniqueName = `${Date.now()}_${cleanName}`;
        cb(null, uniqueName);
    }
});

// File Type Validation (PDF, Images, Word, Excel)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /pdf|jpg|jpeg|png|doc|docx|xls|xlsx/i;
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, and XLSX are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// @desc    Upload a document (stored on EC2 local filesystem)
// @route   POST /api/documents/upload
router.post('/upload', protect, (req, res, next) => {
    // Multer single file upload with error handling
    upload.single('file')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Multer-specific error (e.g. file size exceeded)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File is too large. Maximum size allowed is 10MB.' });
            }
            return res.status(400).json({ message: `Multer upload error: ${err.message}` });
        } else if (err) {
            // General or custom filter validation error
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Determine owner
        let clientOwner = req.body.clientId || req.user._id;
        if (req.user.role === 'user') {
            clientOwner = req.user._id;
        }

        // Generate file URL (e.g., http://EC2_PUBLIC_IP:3000/uploads/user1/resume.pdf)
        const host = req.get('host');
        const protocol = req.protocol;
        const fileUrl = `${protocol}://${host}/uploads/${clientOwner}/${req.file.filename}`;

        // Save metadata to MongoDB
        const doc = await Document.create({
            name: req.file.filename,
            originalName: req.file.originalname,
            url: fileUrl,
            publicId: `uploads/${clientOwner}/${req.file.filename}`, // Local storage path relative to project
            size: req.file.size,
            format: req.file.filename.split('.').pop(),
            category: req.body.category || 'General',
            uploadedBy: req.user._id,
            client: clientOwner,
        });

        res.status(201).json({
            _id: doc._id,
            name: doc.name,
            url: doc.url,
            size: doc.size,
            format: doc.format,
            category: doc.category,
            createdAt: doc.createdAt,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message || 'Upload failed' });
    }
});

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'user') {
            query = {
                $or: [
                    { client: req.user._id },
                    { client: { $exists: false }, uploadedBy: req.user._id }
                ]
            };
        } else if (req.user.role === 'ca') {
            const User = require('../models/User');
            const clients = await User.find({ caId: req.user._id, status: 'approved' }).select('_id');
            const clientIds = clients.map(c => c._id);
            query = {
                $or: [
                    { client: { $in: clientIds } },
                    { uploadedBy: req.user._id },
                    { client: { $exists: false }, uploadedBy: { $in: clientIds } }
                ]
            };
        }

        const docs = await Document.find(query)
            .populate('uploadedBy', 'name')
            .populate('client', 'name email')
            .sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all documents for a specific client (for CA view)
// @route   GET /api/documents/client/:clientId
router.get('/client/:clientId', protect, async (req, res) => {
    try {
        const { clientId } = req.params;
        
        if (req.user.role === 'ca') {
            const User = require('../models/User');
            const client = await User.findOne({ _id: clientId, caId: req.user._id });
            if (!client) {
                return res.status(403).json({ message: 'Access denied. This client is not linked to you.' });
            }
        } else {
            if (req.user._id.toString() !== clientId) {
                return res.status(403).json({ message: 'Access denied. You can only view your own documents.' });
            }
        }

        const docs = await Document.find({
            client: clientId
        })
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 });

        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Download/view a document by ID with browser download header
// @route   GET /api/documents/download/:id
router.get('/download/:id', protect, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Security check
        if (req.user.role === 'user' && doc.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. This is not your document.' });
        }
        if (req.user.role === 'ca') {
            const User = require('../models/User');
            const client = await User.findOne({ _id: doc.client, caId: req.user._id });
            if (!client && doc.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied to this client\'s document.' });
            }
        }

        // Locate file on the disk (doc.publicId has format uploads/clientId/filename)
        // Resolve it relative to the backend folder
        const filePath = path.join(__dirname, '..', doc.publicId);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on local storage.' });
        }

        // Trigger file download with original name
        res.download(filePath, doc.originalName);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Security check
        if (req.user.role === 'user' && doc.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (req.user.role === 'ca') {
            const User = require('../models/User');
            const client = await User.findOne({ _id: doc.client, caId: req.user._id });
            if (!client && doc.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // Delete from local filesystem
        const filePath = path.join(__dirname, '..', doc.publicId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove metadata from DB
        await Document.findByIdAndDelete(req.params.id);

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
