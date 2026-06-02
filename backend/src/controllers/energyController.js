const EnergyLog = require('../models/EnergyLog');
const aiService = require('../services/aiService');

exports.log = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const level = Number(req.body.level);
		const note = req.body.note != null ? String(req.body.note) : '';
		const activities = Array.isArray(req.body.activities) ? req.body.activities : [];

		if (Number.isNaN(level) || level < 0 || level > 100) {
			return res.status(400).json({ msg: 'level must be a number between 0 and 100' });
		}

		const entry = await EnergyLog.create({ user: userId, level, activities, note });
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

exports.analyze = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const items = await EnergyLog.find({ user: userId }).sort({ createdAt: -1 }).limit(14);
		
		if (!items || items.length < 3) {
			return res.json({ analysis: "Keep logging your energy! We need at least 3 entries to identify trends." });
		}

		const prompt = `Analyze these recent energy logs for an introvert managing their social battery. Identify trends related to activities, energy levels, and notes. Give a short, encouraging 2-sentence summary, then 1-3 bullet points of insights.
Logs:
${items.map(i => `- Level: ${i.level}%, Activities: ${i.activities.join(', ') || 'None'}, Note: ${i.note || 'None'}`).join('\n')}`;

		const result = await aiService.simulate(prompt, { scenario: 'energy_analysis' });
		const analysisText = result?.reply || result || "Analysis could not be generated.";
		
		return res.json({ analysis: analysisText });
	} catch (e) {
		console.error('energy analyze error:', e.message);
		return next(e);
	}
};
