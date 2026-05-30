const ScriptTemplate = require('../models/ScriptTemplate');

exports.create = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { title, content } = req.body;
    const s = await ScriptTemplate.create({ user: userId, title, content });
    return res.json(s);
  } catch (e) {
    console.error('script create error:', e.message);
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const items = await ScriptTemplate.find({ user: userId }).sort({ createdAt: -1 }).limit(200);
    return res.json(items);
  } catch (e) {
    console.error('script list error:', e.message);
    return next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { id } = req.params;
    const doc = await ScriptTemplate.findOneAndUpdate({ _id: id, user: userId }, req.body, { new: true });
    if (!doc) return res.status(404).json({ msg: 'not found' });
    return res.json(doc);
  } catch (e) {
    console.error('script update error:', e.message);
    return next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { id } = req.params;
    const doc = await ScriptTemplate.findOneAndDelete({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ msg: 'not found' });
    return res.json({ ok: true });
  } catch (e) {
    console.error('script delete error:', e.message);
    return next(e);
  }
};
