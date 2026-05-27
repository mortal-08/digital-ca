const User = require('../models/User');

// @desc    Get pending clients for CA
// @route   GET /api/clients/pending
// @access  Private (CA only)
const getPendingClients = async (req, res) => {
    try {
        if (req.user.role !== 'ca') {
            return res.status(403).json({ message: 'Access denied. CAs only.' });
        }
        
        const clients = await User.find({ caId: req.user._id, status: 'pending' }).select('-password');
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active clients for CA
// @route   GET /api/clients
// @access  Private (CA only)
const getClients = async (req, res) => {
    try {
        if (req.user.role !== 'ca') {
            return res.status(403).json({ message: 'Access denied. CAs only.' });
        }
        
        const clients = await User.find({ caId: req.user._id, status: 'approved' }).select('-password');
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve client
// @route   PUT /api/clients/:id/approve
// @access  Private (CA only)
const approveClient = async (req, res) => {
    try {
        if (req.user.role !== 'ca') {
            return res.status(403).json({ message: 'Access denied. CAs only.' });
        }
        
        const client = await User.findOne({ _id: req.params.id, caId: req.user._id });
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found or not linked to you' });
        }
        
        await User.updateOne({ _id: client._id }, { $set: { status: 'approved' } });
        
        res.json({ message: 'Client approved', client: { _id: client._id, name: client.name, email: client.email, status: client.status } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject client
// @route   PUT /api/clients/:id/reject
// @access  Private (CA only)
const rejectClient = async (req, res) => {
    try {
        if (req.user.role !== 'ca') {
            return res.status(403).json({ message: 'Access denied. CAs only.' });
        }
        
        const client = await User.findOne({ _id: req.params.id, caId: req.user._id });
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found or not linked to you' });
        }
        
        await User.updateOne({ _id: client._id }, { $set: { status: 'rejected' } });
        
        res.json({ message: 'Client rejected', client: { _id: client._id, name: client.name, email: client.email, status: client.status } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPendingClients,
    getClients,
    approveClient,
    rejectClient
};
