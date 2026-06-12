const aiService = require('../services/aiService');

exports.simulate = async (req, res, next) => {
	try {
		const { prompt, scenario, role, tone, difficulty } = req.body;
		if (!prompt) return res.status(400).json({ msg: 'prompt required' });

		const reply = await aiService.simulate(prompt, { scenario, role, tone, difficulty });
		return res.json({ reply });
	} catch (e) {
		console.error('simulation run error:', e.message);
		return next(e);
	}
};
