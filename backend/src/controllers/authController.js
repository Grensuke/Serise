const User = require('../models/User');
const Profile = require('../models/Profile');
const { hash, compare } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.signup = async (req, res, next) => {
	try {
		const { email, password, name } = req.body;
		if (!email || !password) return res.status(400).json({ msg: 'email and password required' });
		
		const normalizedEmail = email.toLowerCase().trim();
		if (!EMAIL_REGEX.test(normalizedEmail)) {
			return res.status(400).json({ msg: 'invalid email format' });
		}
		if (password.length < 6) {
			return res.status(400).json({ msg: 'password must be at least 6 characters long' });
		}

		const existing = await User.findOne({ email: normalizedEmail });
		if (existing) return res.status(409).json({ msg: 'email already registered' });
		
		const passwordHash = await hash(password);
		const user = await User.create({ email: normalizedEmail, passwordHash, name });
		await Profile.create({ user: user._id, strengths: [], triggers: [], bio: '' });
		const token = generateToken({ id: user._id });
		return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
	} catch (e) {
		console.error('signup error:', e.message);
		return next(e);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ msg: 'email and password required' });
		
		const normalizedEmail = email.toLowerCase().trim();
		if (!EMAIL_REGEX.test(normalizedEmail)) {
			return res.status(400).json({ msg: 'invalid email format' });
		}

		const user = await User.findOne({ email: normalizedEmail });
		// Securely handle cases where a user document has no passwordHash field
		if (!user || !user.passwordHash) {
			return res.status(401).json({ msg: 'invalid credentials' });
		}

		const ok = await compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ msg: 'invalid credentials' });
		const token = generateToken({ id: user._id });
		return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
	} catch (e) {
		console.error('login error:', e.message);
		return next(e);
	}
};

exports.forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ msg: 'email is required' });
		
		const normalizedEmail = email.toLowerCase().trim();
		if (!EMAIL_REGEX.test(normalizedEmail)) {
			return res.status(400).json({ msg: 'invalid email format' });
		}

		// In a real application, you'd generate a reset token and email it here.
		// For prototype purposes, we simulate success securely without revealing if email exists.
		return res.json({ msg: 'If this email is registered, a reset link will be sent.' });
	} catch (e) {
		console.error('forgot password error:', e.message);
		return next(e);
	}
};
