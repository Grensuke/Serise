const Goal = require('../models/Goal');

exports.create = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { title, cadence } = req.body;
    const g = await Goal.create({ user: userId, title, cadence, progress: 0 });
    return res.json(g);
  } catch (e) {
    console.error('goal create error:', e.message);
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const items = await Goal.find({ user: userId }).sort({ createdAt: -1 }).limit(200);
    return res.json(items);
  } catch (e) {
    console.error('goal list error:', e.message);
    return next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { id } = req.params;
    const doc = await Goal.findOneAndUpdate({ _id: id, user: userId }, req.body, { new: true });
    if (!doc) return res.status(404).json({ msg: 'not found' });
    return res.json(doc);
  } catch (e) {
    console.error('goal update error:', e.message);
    return next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { id } = req.params;
    const doc = await Goal.findOneAndDelete({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ msg: 'not found' });
    return res.json({ ok: true });
  } catch (e) {
    console.error('goal delete error:', e.message);
    return next(e);
  }
};
