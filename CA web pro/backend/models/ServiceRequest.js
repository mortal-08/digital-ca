const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String },
  senderRole: { type: String, enum: ['ca', 'user'] },
  text: { type: String, required: true },
  attachment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const serviceRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caId: { type: mongoose.Schema.Types.ObjectId, ref: 'CAProfile' },
  serviceType: {
    type: String,
    required: true
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  documents: [{ name: String, url: String, uploadedAt: Date }],
  messages: [messageSchema],
  notes: { type: String },
  deadline: { type: Date },
  completedAt: { type: Date },
  amount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
