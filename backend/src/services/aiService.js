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
      let prompt = '';
      if (opts.type === 'overthinking') {
        prompt = `Analyze the following anxious or overthinking thought. Focus on cognitive reframing and providing grounded, calming advice.
Thought: ${text}
Return a JSON response (without markdown block formatting, just raw JSON string) containing keys: text (string summary of reframed thought), sentiment (positive/cautious/neutral), tone (string), confidence (number 0-100), keyPoints (array of strings), suggestions (array of actionable reframing steps), reassurance (string).`;
      } else {
        prompt = `Analyze the following conversation context. Focus on the tone and providing encouraging advice.
Conversation: ${text}
Options: ${JSON.stringify(opts)}
Return a JSON response (without markdown block formatting, just raw JSON string) containing keys: text (string summary), sentiment (positive/cautious/neutral), tone (string), confidence (number 0-100), keyPoints (array of strings), suggestions (array of strings), reassurance (string).`;
      }
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const response = await result.response;
      let textRes = response.text().trim();
      
      return JSON.parse(textRes);
    } catch (e) {
      console.error('gemini analyze error', e.message);
      throw new Error(`AI Analysis Failed: ${e.message}`);
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
      let finalPrompt = prompt;
      
      // If it's a conversation scenario, instruct Gemini strictly.
      if (opts.scenario && !['coach', 'analysis', 'general'].includes(opts.scenario)) {
        finalPrompt = `You are an AI acting as a ${opts.role || 'partner'} in a roleplay simulation. 
Scenario context: ${opts.scenario}
Your persona tone: ${opts.tone || 'Friendly'}
Difficulty level: ${opts.difficulty || 'Normal'}
INSTRUCTIONS: Respond ONLY as your character. Provide exactly one reply to continue the conversation. Do not break character. Do not include extra commentary or analyze the dialogue.

${prompt}`;
      } else if (opts.scenario === 'coach' || opts.scenario === 'analysis') {
        finalPrompt = `INSTRUCTIONS: You must act as an objective analysis engine. Provide ONLY the requested JSON object without any markdown formatting or extra text.\n\n${prompt}`;
      }

      let requestPayload = {
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }]
      };

      if (opts.scenario === 'coach' || opts.scenario === 'analysis') {
        requestPayload.generationConfig = { responseMimeType: "application/json" };
      }

      const result = await model.generateContent(requestPayload);
      const response = await result.response;
      let text = response.text().trim();

      return { reply: text };
    } catch (e) {
      console.error('gemini simulate error', e.message);
      return { reply: `[AI Error]: ${e.message}. Please try again.` };
    }
  }
  // simple echo stub
  return { reply: `Simulated reply (stub) for prompt: ${prompt.slice(0, 50)}...` };
};
