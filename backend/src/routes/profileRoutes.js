const express = require('express');
const router = express.Router();
const controller = require('../controllers/profileController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, controller.getProfile);
router.put('/', auth, controller.updateProfile);

module.exports = router;
