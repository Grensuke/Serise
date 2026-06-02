const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const energyRoutes = require('./routes/energyRoutes');
const overthinkingRoutes = require('./routes/overthinkingRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const scriptRoutes = require('./routes/scriptRoutes');
const goalRoutes = require('./routes/goalRoutes');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/overthinking', overthinkingRoutes);
app.use('/api/simulate', simulationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/goals', goalRoutes);

app.get('/health', (req,res) => res.json({ok:true}));

// Unhandled error processing middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
