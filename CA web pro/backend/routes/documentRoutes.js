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
                    { uploadedBy: req.user._id }
                ]
            };
        } else if (req.user.role === 'ca') {
            const User = require('../models/User');
            const CAProfile = require('../models/CAProfile');

            // The CA might exist in CAProfile or User collection.
            // req.user._id is from whichever collection the auth middleware found.
            // Clients store caId which could point to either collection's _id.
            // We need to find clients linked to ANY of the CA's possible IDs.
            const caIds = [req.user._id];

            // If CA is in CAProfile, also check if they exist in User collection (or vice versa)
            if (req.user.email) {
                const caInUser = await User.findOne({ email: req.user.email, role: 'ca' }).select('_id');
                if (caInUser && caInUser._id.toString() !== req.user._id.toString()) {
                    caIds.push(caInUser._id);
                }
                const caInProfile = await CAProfile.findOne({ email: req.user.email }).select('_id');
                if (caInProfile && caInProfile._id.toString() !== req.user._id.toString()) {
                    caIds.push(caInProfile._id);
                }
            }

            const clients = await User.find({ caId: { $in: caIds }, status: 'approved' }).select('_id');
            const clientIds = clients.map(c => c._id);

            console.log(`[Documents] CA ${req.user._id} (${req.user.email}) - caIds: [${caIds}], found ${clientIds.length} clients: [${clientIds}]`);

            if (clientIds.length > 0) {
                query = {
                    $or: [
                        { client: { $in: clientIds } },
                        { uploadedBy: { $in: caIds } },
                        { uploadedBy: { $in: clientIds } }
                    ]
                };
            } else {
                // No clients found, only show CA's own uploads
                query = { uploadedBy: { $in: caIds } };
            }
        }

        const docs = await Document.find(query)
            .populate('uploadedBy', 'name')
            .populate('client', 'name email')
            .sort({ createdAt: -1 });

        console.log(`[Documents] Returning ${docs.length} documents for ${req.user.role} ${req.user._id}`);
        res.json(docs);
    } catch (error) {
        console.error('[Documents] Error fetching documents:', error);
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
            const CAProfile = require('../models/CAProfile');
            // Build list of all possible CA IDs
            const caIds = [req.user._id];
            if (req.user.email) {
                const caInUser = await User.findOne({ email: req.user.email, role: 'ca' }).select('_id');
                if (caInUser && caInUser._id.toString() !== req.user._id.toString()) caIds.push(caInUser._id);
                const caInProfile = await CAProfile.findOne({ email: req.user.email }).select('_id');
                if (caInProfile && caInProfile._id.toString() !== req.user._id.toString()) caIds.push(caInProfile._id);
            }
            const client = await User.findOne({ _id: clientId, caId: { $in: caIds } });
            if (!client) {
                return res.status(403).json({ message: 'Access denied. This client is not linked to you.' });
            }
        } else {
            if (req.user._id.toString() !== clientId) {
                return res.status(403).json({ message: 'Access denied. You can only view your own documents.' });
            }
        }

        const docs = await Document.find({
            $or: [{ client: clientId }, { uploadedBy: clientId }]
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
            const CAProfile = require('../models/CAProfile');
            const caIds = [req.user._id];
            if (req.user.email) {
                const caInUser = await User.findOne({ email: req.user.email, role: 'ca' }).select('_id');
                if (caInUser && caInUser._id.toString() !== req.user._id.toString()) caIds.push(caInUser._id);
                const caInProfile = await CAProfile.findOne({ email: req.user.email }).select('_id');
                if (caInProfile && caInProfile._id.toString() !== req.user._id.toString()) caIds.push(caInProfile._id);
            }
            const client = await User.findOne({ _id: doc.client, caId: { $in: caIds } });
            const isOwnUpload = caIds.some(id => doc.uploadedBy.toString() === id.toString());
            if (!client && !isOwnUpload) {
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
            const CAProfile = require('../models/CAProfile');
            const caIds = [req.user._id];
            if (req.user.email) {
                const caInUser = await User.findOne({ email: req.user.email, role: 'ca' }).select('_id');
                if (caInUser && caInUser._id.toString() !== req.user._id.toString()) caIds.push(caInUser._id);
                const caInProfile = await CAProfile.findOne({ email: req.user.email }).select('_id');
                if (caInProfile && caInProfile._id.toString() !== req.user._id.toString()) caIds.push(caInProfile._id);
            }
            const client = await User.findOne({ _id: doc.client, caId: { $in: caIds } });
            const isOwnUpload = caIds.some(id => doc.uploadedBy.toString() === id.toString());
            if (!client && !isOwnUpload) {
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

// @desc    Update document status (CA only — Approve/Reject)
// @route   PATCH /api/documents/:id/status
router.patch('/:id/status', protect, async (req, res) => {
    try {
        if (req.user.role !== 'ca') {
            return res.status(403).json({ message: 'Only CA can update document status' });
        }

        const { status, statusNote } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected.' });
        }

        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Verify this CA has access to the document's client
        const User = require('../models/User');
        const CAProfile = require('../models/CAProfile');
        const caIds = [req.user._id];
        if (req.user.email) {
            const caInUser = await User.findOne({ email: req.user.email, role: 'ca' }).select('_id');
            if (caInUser && caInUser._id.toString() !== req.user._id.toString()) caIds.push(caInUser._id);
            const caInProfile = await CAProfile.findOne({ email: req.user.email }).select('_id');
            if (caInProfile && caInProfile._id.toString() !== req.user._id.toString()) caIds.push(caInProfile._id);
        }

        if (doc.client) {
            const client = await User.findOne({ _id: doc.client, caId: { $in: caIds } });
            const isOwnUpload = caIds.some(id => doc.uploadedBy.toString() === id.toString());
            if (!client && !isOwnUpload) {
                return res.status(403).json({ message: 'Access denied to this document.' });
            }
        }

        doc.status = status;
        if (statusNote !== undefined) doc.statusNote = statusNote;
        await doc.save();

        res.json({ message: `Document ${status.toLowerCase()} successfully`, document: doc });
    } catch (error) {
        console.error('[Documents] Status update error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
