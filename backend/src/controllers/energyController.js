const EnergyLog = require('../models/EnergyLog');

exports.log = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const { level, note } = req.body;
		const entry = await EnergyLog.create({ user: userId, level, note });
		return res.json(entry);
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
