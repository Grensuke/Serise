const express = require('express');
const router = express.Router();
const controller = require('../controllers/conversationController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);
router.get('/:id/analyze', auth, controller.analyze);

module.exports = router;
