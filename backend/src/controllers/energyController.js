const EnergyLog = require('../models/EnergyLog');

exports.log = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const level = Number(req.body.level);
		const note = req.body.note != null ? String(req.body.note) : '';

		if (Number.isNaN(level) || level < 0 || level > 100) {
			return res.status(400).json({ msg: 'level must be a number between 0 and 100' });
		}

		const entry = await EnergyLog.create({ user: userId, level, note });
		return res.status(201).json(entry);
	} catch (e) {
		console.error('energy log error:', e.message);
		return next(e);
	}
};

exports.list = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const items = await EnergyLog.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
		return res.json(items);
	} catch (e) {
		console.error('energy list error:', e.message);
		return next(e);
	}
};
