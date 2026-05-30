const User = require('../models/User');
const { hash, compare } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');

exports.signup = async (req, res, next) => {
	try {
		const { email, password, name } = req.body;
		if (!email || !password) return res.status(400).json({ msg: 'email and password required' });
		const normalizedEmail = email.toLowerCase().trim();
		const existing = await User.findOne({ email: normalizedEmail });
		if (existing) return res.status(409).json({ msg: 'email already registered' });
		const passwordHash = await hash(password);
		const user = await User.create({ email: normalizedEmail, passwordHash, name });
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
		const user = await User.findOne({ email: normalizedEmail });
		if (!user) return res.status(401).json({ msg: 'invalid credentials' });
		const ok = await compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ msg: 'invalid credentials' });
		const token = generateToken({ id: user._id });
		return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
	} catch (e) {
		console.error('login error:', e.message);
		return next(e);
	}
};
