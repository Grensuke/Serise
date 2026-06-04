const express = require('express');
const router = express.Router();
const controller = require('../controllers/overthinkingController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.submit);
router.get('/', auth, controller.list);
router.delete('/:id', auth, controller.remove);

module.exports = router;
