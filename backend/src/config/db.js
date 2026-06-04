const mongoose = require('mongoose');

// Disable buffering globally so queries fail fast when connection is lost/unestablished
mongoose.set('bufferCommands', false);

module.exports = function connectDB(uri){
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging indefinitely
  });
};
