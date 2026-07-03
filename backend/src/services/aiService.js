const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiKey } = require('../config/env');

let genAI = null;
let model25 = null;
let modelFallback = null;
let modelLite = null;
let try25After = 0; // Timestamp to retry model 2.5
let try20After = 0; // Timestamp to retry model 2.0

if (geminiKey) {
  genAI = new GoogleGenerativeAI(geminiKey);
  model25 = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  modelFallback = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  modelLite = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
}

// Basic AI service that uses Gemini (if key provided) or falls back to a simple stub.
exports.analyze = async (text, opts = {}) => {
  if (model25 && modelFallback) {
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
      
      const requestPayload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      let result;
      
      const executeWithFallback = async () => {
        if (Date.now() >= try25After) {
          try {
            return await model25.generateContent(requestPayload);
          } catch (err) {
            if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
              const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/i);
              const delayMs = match ? parseFloat(match[1]) * 1000 + 1000 : 60 * 1000;
              try25After = Date.now() + delayMs;
              console.warn(`gemini-2.5-flash quota exceeded. Falling back to gemini-2.0-flash. Will retry 2.5 at ${new Date(try25After).toLocaleTimeString()}`);
            } else {
              throw err;
            }
          }
        }
        
        if (Date.now() >= try20After) {
          try {
            return await modelFallback.generateContent(requestPayload);
          } catch (err) {
            if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
              const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/i);
              const delayMs = match ? parseFloat(match[1]) * 1000 + 1000 : 60 * 1000;
              try20After = Date.now() + delayMs;
              console.warn(`gemini-2.0-flash quota exceeded. Falling back to gemini-2.0-flash-lite. Will retry 2.0 at ${new Date(try20After).toLocaleTimeString()}`);
            } else {
              throw err;
            }
          }
        }
        
        // If both are in backoff, use the lite model
        try {
          return await modelLite.generateContent(requestPayload);
        } catch (err) {
          if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
            const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/i);
            const delayMs = match ? parseFloat(match[1]) * 1000 + 1000 : 60 * 1000;
            console.warn(`gemini-2.0-flash-lite quota exceeded. All models exhausted. Will retry lite at ${new Date(Date.now() + delayMs).toLocaleTimeString()}`);
            throw new Error("QUOTA_EXHAUSTED");
          }
          throw err;
        }
      };

      result = await executeWithFallback();

      const response = await result.response;
      let textRes = response.text().trim();
      
      return JSON.parse(textRes);
    } catch (e) {
      if (e.message === "QUOTA_EXHAUSTED") {
        return {
          text: `[Quota Exhausted] Your daily Gemini quota is reached.`,
          sentiment: 'neutral',
          tone: 'neutral',
          confidence: 50,
          keyPoints: ['You have exhausted all daily AI quotas.'],
          suggestions: ['Try again tomorrow or set up billing in Google AI Studio.'],
          reassurance: `Don't worry, you can still reflect on this locally!`,
          notes: []
        };
      }
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
  if (model25 && modelFallback) {
    try {
      let finalPrompt = prompt;
      
      // If it's a conversation scenario, instruct Gemini strictly.
      if (opts.scenario && !['coach', 'analysis', 'general', 'energy_analysis'].includes(opts.scenario)) {
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

      let result;
      
      const executeWithFallback = async () => {
        if (Date.now() >= try25After) {
          try {
            return await model25.generateContent(requestPayload);
          } catch (err) {
            if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
              const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/i);
              const delayMs = match ? parseFloat(match[1]) * 1000 + 1000 : 60 * 1000;
              try25After = Date.now() + delayMs;
              console.warn(`gemini-2.5-flash quota exceeded. Falling back to gemini-2.0-flash. Will retry 2.5 at ${new Date(try25After).toLocaleTimeString()}`);
            } else {
              throw err;
            }
          }
        }
        
        if (Date.now() >= try20After) {
          try {
            return await modelFallback.generateContent(requestPayload);
          } catch (err) {
            if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
              const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/i);
              const delayMs = match ? parseFloat(match[1]) * 1000 + 1000 : 60 * 1000;
              try20After = Date.now() + delayMs;
              console.warn(`gemini-2.0-flash quota exceeded. Falling back to gemini-2.0-flash-lite. Will retry 2.0 at ${new Date(try20After).toLocaleTimeString()}`);
            } else {
              throw err;
            }
          }
        }
        
        // If both are in backoff, use the lite model
        try {
          return await modelLite.generateContent(requestPayload);
        } catch (err) {
          if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
            const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/i);
            const delayMs = match ? parseFloat(match[1]) * 1000 + 1000 : 60 * 1000;
            console.warn(`gemini-2.0-flash-lite quota exceeded. All models exhausted. Will retry lite at ${new Date(Date.now() + delayMs).toLocaleTimeString()}`);
            throw new Error("QUOTA_EXHAUSTED");
          }
          throw err;
        }
      };

      result = await executeWithFallback();

      const response = await result.response;
      let textRes = response.text().trim();

      return { reply: textRes };
    } catch (e) {
      if (e.message === "QUOTA_EXHAUSTED") {
        return { reply: `[System]: You have exhausted your daily Gemini API quota for all models. Please try again later or configure a paid plan. Your prompt was: ${prompt.slice(0, 50)}...` };
      }
      console.error('gemini simulate error', e.message);
      return { reply: `[AI Error]: ${e.message}. Please try again.` };
    }
  }
  // simple echo stub
  return { reply: `Simulated reply (stub) for prompt: ${prompt.slice(0, 50)}...` };
};
