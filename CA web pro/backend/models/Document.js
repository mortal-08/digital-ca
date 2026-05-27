const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    size: { type: Number },
    format: { type: String },
    category: { type: String, default: 'General' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    statusNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
