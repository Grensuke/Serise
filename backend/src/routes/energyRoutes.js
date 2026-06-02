const express = require('express');
const router = express.Router();
const controller = require('../controllers/energyController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.log);
router.get('/', auth, controller.list);
router.get('/analyze', auth, controller.analyze);

module.exports = router;
