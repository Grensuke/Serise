const axios = require('axios');
const { geminiKey, openaiKey } = require('../config/env');

// Basic AI service that uses Gemini (if key provided) or falls back to a simple stub.
exports.analyze = async (text, opts = {}) => {
  if (geminiKey) {
    // Example Gemini integration placeholder. Replace with real REST call if desired.
    try {
      const url = process.env.GEMINI_ENDPOINT || 'https://api.example.com/gemini/analyze';
      const resp = await axios.post(url, { input: text, opts }, { headers: { Authorization: `Bearer ${geminiKey}` } });
      return resp.data;
    } catch (e) {
      console.error('gemini analyze error', e.message);
    }
  }

  if (openaiKey) {
    // Could implement OpenAI fallback here.
  }

  // Structured stub when no AI key is configured
  const snippet = String(text || '').slice(0, 120);
  const moodHint = opts.mood ? ` You noted feeling ${opts.mood}.` : '';
  return {
    text: `Reflection on: "${snippet}${text && text.length > 120 ? '…' : ''}"`,
    sentiment: opts.mood === 'confident' ? 'positive' : opts.mood === 'anxious' ? 'cautious' : 'neutral',
    tone: opts.mood === 'confident' ? 'confident' : opts.mood === 'anxious' ? 'anxious' : 'neutral',
    confidence: opts.mood === 'confident' ? 72 : opts.mood === 'anxious' ? 45 : 58,
    keyPoints: [
      snippet ? 'You recorded a real social interaction' : 'No summary text provided',
      opts.participants ? `Conversation involved ${opts.participants}` : 'Practice logging who you spoke with',
      'Reviewing entries builds conversation confidence over time',
    ],
    suggestions: [
      'Send a brief follow-up if the chat went well',
      'Note one thing you did well for next time',
      'Practice a similar scenario in the Simulator',
    ],
    reassurance: `Logging this conversation is a win.${moodHint} Small steps add up to stronger social skills.`,
    notes: [],
  };
};

exports.simulate = async (prompt, opts = {}) => {
  if (geminiKey) {
    try {
      const url = process.env.GEMINI_ENDPOINT || 'https://api.example.com/gemini/simulate';
      const resp = await axios.post(url, { prompt, opts }, { headers: { Authorization: `Bearer ${geminiKey}` } });
      return resp.data;
    } catch (e) {
      console.error('gemini simulate error', e.message);
    }
  }
  // simple echo stub
  return { reply: `Simulated reply (stub) for prompt: ${prompt}` };
};
