const aiService = require('../services/aiService');

exports.run = async (req, res, next) => {
	try {
		const { prompt, scenario } = req.body;
		const result = await aiService.simulate(prompt || '', { scenario });
		return res.json({ result });
	} catch (e) {
		console.error('simulation run error:', e.message);
		return next(e);
	}
};
