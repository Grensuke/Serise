const Profile = require('../models/Profile');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Goal = require('../models/Goal');

async function buildProfileResponse(userId) {
	const user = await User.findById(userId).select('name email');
	if (!user) return null;

	let profile = await Profile.findOne({ user: userId });
	if (!profile) {
		profile = await Profile.create({ user: userId, strengths: [], triggers: [], bio: '' });
	}

	const [conversationCount, goalCount] = await Promise.all([
		Conversation.countDocuments({ user: userId }),
		Goal.countDocuments({ user: userId }),
	]);

	return {
		id: profile._id,
		name: user.name || '',
		email: user.email || '',
		bio: profile.bio || '',
		strengths: profile.strengths || [],
		triggers: profile.triggers || [],
		conversationCount,
		goalCount,
	};
}

exports.getProfile = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const data = await buildProfileResponse(userId);
		if (!data) return res.status(404).json({ msg: 'user not found' });
		return res.json(data);
	} catch (e) {
		console.error('profile get error:', e.message);
		return next(e);
	}
};

exports.updateProfile = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		const { bio, name } = req.body;

		let profile = await Profile.findOne({ user: userId });
		if (!profile) {
			profile = await Profile.create({ user: userId, strengths: [], triggers: [], bio: '' });
		}

		if (bio !== undefined) {
			profile.bio = String(bio).slice(0, 500);
			await profile.save();
		}

		if (name !== undefined && String(name).trim()) {
			await User.findByIdAndUpdate(userId, { name: String(name).trim().slice(0, 80) });
		}

		const data = await buildProfileResponse(userId);
		if (!data) return res.status(404).json({ msg: 'user not found' });
		return res.json(data);
	} catch (e) {
		console.error('profile update error:', e.message);
		return next(e);
	}
};
