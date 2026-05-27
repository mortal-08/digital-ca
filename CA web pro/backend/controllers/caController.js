const CAProfile = require('../models/CAProfile');

// @desc    Get all CA records
// @route   GET /api/ca/all
// @access  Public
const getAllCAs = async (req, res) => {
    try {
        const cas = await CAProfile.find({}, { password: 0 });
        res.json(cas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCAs
};
