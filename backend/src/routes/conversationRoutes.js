const express = require('express');
const router = express.Router();
const controller = require('../controllers/conversationController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);
router.get('/:id/analyze', auth, controller.analyze);
router.get('/:id', auth, controller.getOne);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;
