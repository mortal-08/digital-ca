const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CAProfile = require('../models/CAProfile');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user or CA
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, fullName, email, password, role, caEmail } = req.body;
        const finalName = fullName || name;

        if (!finalName) {
            return res.status(400).json({ message: 'Name or fullName is required' });
        }

        // Email uniqueness check across BOTH collections
        const userExists = await User.findOne({ email });
        const caExists = await CAProfile.findOne({ email });

        if (userExists || caExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const normalizedRole = (role && role.toLowerCase() === 'ca') ? 'ca' : 'user';

        if (normalizedRole === 'ca') {
            // Save CA only in CAProfiles
            const ca = await CAProfile.create({
                fullName: finalName,
                email,
                password, // pre-save hook hashes this
                role: 'ca',
                status: 'approved'
            });

            return res.status(201).json({
                _id: ca._id,
                name: ca.fullName,
                email: ca.email,
                role: 'ca',
                status: ca.status,
                caId: null,
                caName: null,
                token: generateToken(ca._id),
            });
        } else {
            // Save client/user in User collection
            let caId = null;
            let status = 'approved';

            if (caEmail) {
                // Link client to CA from CAProfiles collection or User collection (where role is ca)
                let caMatch = await CAProfile.findOne({ email: caEmail });
                if (!caMatch) {
                    caMatch = await User.findOne({ email: caEmail, role: 'ca' });
                }
                if (caMatch) {
                    caId = caMatch._id;
                    status = 'approved';
                }
            }

            const user = await User.create({
                name: finalName,
                fullName: finalName,
                email,
                password,
                role: 'user',
                caId,
                status
            });

            const createdUser = await User.findById(user._id);
            let caNameVal = null;
            let caIdVal = null;
            let caEmailVal = null;
            if (createdUser && createdUser.caId) {
                caIdVal = createdUser.caId;
                let caMatch = await CAProfile.findById(createdUser.caId);
                if (caMatch) {
                    caNameVal = caMatch.fullName;
                    caEmailVal = caMatch.email;
                } else {
                    caMatch = await User.findById(createdUser.caId);
                    if (caMatch) {
                        caNameVal = caMatch.fullName || caMatch.name;
                        caEmailVal = caMatch.email;
                    }
                }
            }

            return res.status(201).json({
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
                status: createdUser.status,
                caId: caIdVal,
                caName: caNameVal,
                caEmail: caEmailVal,
                token: generateToken(createdUser._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user/CA & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Try to find in User collection first
        let account = await User.findOne({ email });
        let isCA = false;

        if (account && account.role === 'ca') {
            isCA = true;
        }

        // 2. If not found in User, try CAProfile collection
        if (!account) {
            account = await CAProfile.findOne({ email });
            isCA = true;
        }

        if (account && (await account.matchPassword(password))) {
            if (account.role === 'ca' && account.status !== 'approved') {
                return res.status(403).json({ message: 'Your account is pending approval.' });
            }

            let caNameVal = null;
            let caIdVal = null;
            let caEmailVal = null;
            if (!isCA && account.caId) {
                caIdVal = account.caId;
                let caMatch = await CAProfile.findById(account.caId);
                if (caMatch) {
                    caNameVal = caMatch.fullName;
                    caEmailVal = caMatch.email;
                } else {
                    caMatch = await User.findById(account.caId);
                    if (caMatch) {
                        caNameVal = caMatch.fullName || caMatch.name;
                        caEmailVal = caMatch.email;
                    }
                }
            }

            return res.json({
                _id: account._id,
                name: isCA ? (account.fullName || account.name) : account.name,
                email: account.email,
                role: account.role,
                status: account.status,
                caId: caIdVal,
                caName: caNameVal,
                caEmail: caEmailVal,
                token: generateToken(account._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, phone, company, address, pan, gstin, caEmail } = req.body;

        user.name = name || user.name;
        user.fullName = name || user.fullName;
        user.phone = phone !== undefined ? phone : user.phone;
        user.company = company !== undefined ? company : user.company;
        user.address = address !== undefined ? address : user.address;
        user.pan = pan !== undefined ? pan : user.pan;
        user.gstin = gstin !== undefined ? gstin : user.gstin;

        if (caEmail) {
            // Find CA in CAProfile or User collections
            let caMatch = await CAProfile.findOne({ email: caEmail });
            if (!caMatch) {
                caMatch = await User.findOne({ email: caEmail, role: 'ca' });
            }
            if (caMatch) {
                user.caId = caMatch._id;
                user.status = 'approved'; // Make approved so they can chat immediately
            } else {
                return res.status(400).json({ message: 'CA email not found in the system' });
            }
        } else if (caEmail === '') {
            user.caId = null;
        }

        const updatedUser = await user.save();

        let caNameVal = null;
        let caIdVal = null;
        let caEmailVal = null;
        if (updatedUser.caId) {
            caIdVal = updatedUser.caId;
            let caMatch = await CAProfile.findById(updatedUser.caId);
            if (caMatch) {
                caNameVal = caMatch.fullName;
                caEmailVal = caMatch.email;
            } else {
                caMatch = await User.findById(updatedUser.caId);
                if (caMatch) {
                    caNameVal = caMatch.fullName || caMatch.name;
                    caEmailVal = caMatch.email;
                }
            }
        }

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            phone: updatedUser.phone,
            company: updatedUser.company,
            address: updatedUser.address,
            pan: updatedUser.pan,
            gstin: updatedUser.gstin,
            caId: caIdVal,
            caName: caNameVal,
            caEmail: caEmailVal,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateProfile };
