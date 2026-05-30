const Conversation = require('../models/Conversation');
const aiService = require('../services/aiService');

exports.create = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const { summary, mood, tags, transcript, analysis, participants, title, actionItems } = req.body;

		if (!summary || !String(summary).trim()) {
			return res.status(400).json({ msg: 'summary is required' });
		}

		const conv = await Conversation.create({
			user: userId,
			summary: String(summary).trim(),
			mood: mood || 'calm',
			tags: Array.isArray(tags) ? tags : [],
			transcript: transcript || '',
			analysis: analysis || null,
			participants: participants ? String(participants).trim() : '',
			title: title ? String(title).trim() : '',
			actionItems: Array.isArray(actionItems) ? actionItems : [],
		});

		return res.status(201).json(conv);
	} catch (e) {
		console.error('conversation create error:', e.message);
		return next(e);
	}
};

exports.list = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const items = await Conversation.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
		return res.json(items);
	} catch (e) {
		console.error('conversation list error:', e.message);
		return next(e);
	}
};

exports.getOne = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const conv = await Conversation.findOne({ _id: req.params.id, user: userId });
		if (!conv) return res.status(404).json({ msg: 'not found' });
		return res.json(conv);
	} catch (e) {
		console.error('conversation get error:', e.message);
		return next(e);
	}
};

exports.update = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const { summary, mood, tags, transcript, participants, title, actionItems } = req.body;

		const conv = await Conversation.findOne({ _id: req.params.id, user: userId });
		if (!conv) return res.status(404).json({ msg: 'not found' });

		if (summary !== undefined) conv.summary = String(summary).trim();
		if (mood !== undefined) conv.mood = mood;
		if (tags !== undefined) conv.tags = Array.isArray(tags) ? tags : conv.tags;
		if (transcript !== undefined) conv.transcript = transcript;
		if (participants !== undefined) conv.participants = String(participants).trim();
		if (title !== undefined) conv.title = String(title).trim();
		if (actionItems !== undefined) conv.actionItems = Array.isArray(actionItems) ? actionItems : conv.actionItems;

		if (!conv.summary) return res.status(400).json({ msg: 'summary cannot be empty' });

		await conv.save();
		return res.json(conv);
	} catch (e) {
		console.error('conversation update error:', e.message);
		return next(e);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const conv = await Conversation.findOneAndDelete({ _id: req.params.id, user: userId });
		if (!conv) return res.status(404).json({ msg: 'not found' });
		return res.json({ msg: 'deleted', id: conv._id });
	} catch (e) {
		console.error('conversation delete error:', e.message);
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
		const ai = await aiService.analyze(text, {
			userId,
			conversationId: id,
			participants: conv.participants,
			mood: conv.mood,
		});

		const insights = {
			tone: ai.sentiment || ai.tone || 'neutral',
			confidence: ai.confidence || ai.score || 0,
			keyPoints: ai.keyPoints || ai.notes || [],
			suggestedReplies: ai.suggestions || ai.suggestedReplies || [],
			reassurance: ai.reassurance || (ai.text ? ai.text.slice(0, 200) : ''),
			raw: ai,
		};

		conv.analysis = insights;
		await conv.save();

		return res.json(insights);
	} catch (e) {
		console.error('conversation analyze error:', e.message);
		return next(e);
	}
};
