const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiKey } = require('../config/env');

let genAI = null;
let model = null;

if (geminiKey) {
  genAI = new GoogleGenerativeAI(geminiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// Basic AI service that uses Gemini (if key provided) or falls back to a simple stub.
exports.analyze = async (text, opts = {}) => {
  if (model) {
    try {
      const prompt = `Analyze the following conversation context. Focus on the tone and providing encouraging advice.
      Conversation: ${text}
      Options: ${JSON.stringify(opts)}
      Return a JSON response (without markdown block formatting, just raw JSON string) containing keys: text (string summary), sentiment (positive/cautious/neutral), tone (string), confidence (number 0-100), keyPoints (array of strings), suggestions (array of strings), reassurance (string).`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let textRes = response.text();
      
      if (textRes.startsWith('```json')) {
        textRes = textRes.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(textRes);
    } catch (e) {
      console.error('gemini analyze error', e.message);
    }
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
  if (model) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }

      return { reply: text };
    } catch (e) {
      console.error('gemini simulate error', e.message);
    }
  }
  // simple echo stub
  return { reply: `Simulated reply (stub) for prompt: ${prompt}` };
};
