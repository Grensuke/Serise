const Conversation = require('../models/Conversation');
const aiService = require('../services/aiService');

exports.create = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const { summary, mood, tags, transcript, analysis } = req.body;
		const conv = await Conversation.create({ user: userId, summary, mood, tags, transcript, analysis });
		return res.json(conv);
	} catch (e) {
		console.error('conversation create error:', e.message);
		return next(e);
	}
};

exports.list = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const items = await Conversation.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
		return res.json(items);
	} catch (e) {
		console.error('conversation list error:', e.message);
		return next(e);
	}
};

exports.analyze = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const id = req.params.id;
		const conv = await Conversation.findOne({ _id: id, user: userId });
		if (!conv) return res.status(404).json({ msg: 'not found' });

		const text = conv.transcript || conv.summary || '';
		const ai = await aiService.analyze(text, { userId, conversationId: id });

		// Normalize ai response into a simple insights object
		const insights = {
			tone: ai.sentiment || (ai.tone || 'neutral'),
			confidence: ai.confidence || ai.score || 0,
			keyPoints: ai.keyPoints || ai.notes || [],
			suggestedReplies: ai.suggestions || [],
			reassurance: ai.reassurance || (ai.text ? ai.text.slice(0,200) : ''),
			raw: ai
		};

		return res.json(insights);
	} catch (e) {
		console.error('conversation analyze error:', e.message);
		return next(e);
	}
}
