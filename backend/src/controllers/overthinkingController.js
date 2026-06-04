const OverthinkingEntry = require('../models/OverthinkingEntry');
const aiService = require('../services/aiService');

exports.submit = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const { thought } = req.body;
		// generate AI response (may be stub)
		const ai = await aiService.analyze(thought, { userId });
		const entry = await OverthinkingEntry.create({ user: userId, thought, aiResponse: ai.text || JSON.stringify(ai) });
		return res.json(entry);
	} catch (e) {
		console.error('overthinking submit error:', e.message);
		return next(e);
	}
};

exports.list = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const items = await OverthinkingEntry.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
		return res.json(items);
	} catch (e) {
		console.error('overthinking list error:', e.message);
		return next(e);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const doc = await OverthinkingEntry.findOneAndDelete({ _id: req.params.id, user: userId });
		if (!doc) return res.status(404).json({ msg: 'not found' });
		return res.json({ ok: true, id: doc._id });
	} catch (e) {
		console.error('overthinking delete error:', e.message);
		return next(e);
	}
};
