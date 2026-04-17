const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Document = require('../models/Document');
const { protect } = require('../middleware/authMiddleware');

// Multer memory storage (files stay in RAM, then stream to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// @desc    Upload a document to Cloudinary
// @route   POST /api/documents/upload
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload buffer to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'digital_ca_platform',
                    resource_type: 'auto',
                    public_id: `${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        // Save to MongoDB
        const doc = await Document.create({
            name: req.file.originalname,
            originalName: req.file.originalname,
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            format: result.format || req.file.originalname.split('.').pop(),
            category: req.body.category || 'General',
            uploadedBy: req.user._id,
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

// @desc    Get all documents
// @route   GET /api/documents
router.get('/', protect, async (req, res) => {
    try {
        const docs = await Document.find()
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(docs);
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

        // Remove from Cloudinary
        await cloudinary.uploader.destroy(doc.publicId);
        // Remove from DB
        await Document.findByIdAndDelete(req.params.id);

        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
