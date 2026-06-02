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

const allowedOrigins = [
  'http://localhost:5173', // Default local Vite dev server
  process.env.FRONTEND_URL, // Configured production domain
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl, same-origin, or postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
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
