const express = require('express');
const router = express.Router();
const { getAllCAs } = require('../controllers/caController');

router.get('/all', getAllCAs);

module.exports = router;
