const express = require('express');
const router = express.Router();
const controller = require('../controllers/simulationController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.simulate);

module.exports = router;
