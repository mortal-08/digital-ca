const Chat = require('../models/Chat');
const User = require('../models/User');
const CAProfile = require('../models/CAProfile');

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user._id;

        // Security Validation
        // If sender is CA, receiver must be a client linked to them (caId === senderId)
        // If sender is Client, receiver must be their linked CA (receiverId === sender.caId)
        
        let sender = await User.findById(senderId);
        if (!sender) {
            sender = await CAProfile.findById(senderId);
        }
        
        let receiver = await User.findById(receiverId);
        if (!receiver) {
            receiver = await CAProfile.findById(receiverId);
        }

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (sender.role === 'ca') {
            if (receiver.caId?.toString() !== senderId.toString()) {
                return res.status(403).json({ message: 'You can only message your own clients' });
            }
        } else {
            if (sender.caId?.toString() !== receiverId.toString()) {
                return res.status(403).json({ message: 'You can only message your assigned CA' });
            }
        }

        const chat = await Chat.create({
            senderId,
            receiverId,
            message
        });

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get conversation
// @route   GET /api/chat/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const { userId } = req.params; // The other person in the chat
        const currentUserId = req.user._id;

        let sender = await User.findById(currentUserId);
        if (!sender) {
            sender = await CAProfile.findById(currentUserId);
        }
        
        let receiver = await User.findById(userId);
        if (!receiver) {
            receiver = await CAProfile.findById(userId);
        }

        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (sender.role === 'ca') {
            if (receiver.caId?.toString() !== currentUserId.toString()) {
                return res.status(403).json({ message: 'You can only view chats with your own clients' });
            }
        } else {
            if (sender.caId?.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'You can only view chats with your assigned CA' });
            }
        }

        const messages = await Chat.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getConversation
};
