const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CAProfile = require('../models/CAProfile');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            let userDoc = await User.findById(decoded.id).select('-password');
            if (!userDoc) {
                userDoc = await CAProfile.findById(decoded.id).select('-password');
            }
            req.user = userDoc;
            next();
        } catch (error) {
            if (global.serverLog) {
                global.serverLog(`JWT Verification Error: ${error.message}`);
            } else {
                console.error('JWT Verification Error:', error.message);
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        if (global.serverLog) {
            global.serverLog(`Blocking request: No authorization token provided`);
        }
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
