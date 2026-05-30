const Profile = require('../models/Profile');

exports.getProfile = async (req, res, next) => {
	try {
		const userId = req.user && req.user.id;
		let profile = await Profile.findOne({ user: userId });
		if (!profile) {
			profile = await Profile.create({ user: userId, strengths: [], triggers: [] });
		}
		return res.json(profile);
	} catch (e) {
		console.error('profile get error:', e.message);
		return next(e);
	}
};
