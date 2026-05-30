const bcrypt = require('bcryptjs');

// Use async functions to prevent event-loop blocking
exports.hash = async (pw) => bcrypt.hash(pw, 10);
exports.compare = async (pw, hash) => bcrypt.compare(pw, hash);
