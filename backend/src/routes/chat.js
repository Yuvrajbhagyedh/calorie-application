const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

const SYSTEM_PROMPT = `You are a friendly, helpful assistant for Calorie IQ, a calorie-tracking app. You help users with:
- Calorie estimates for foods and meals (use metric and common Indian/global foods when relevant)
- Meal ideas and suggestions that fit their goals
- How to use the app: logging meals, setting goals, viewing history
- General nutrition tips in 2–3 short sentences

Keep replies concise (2–4 sentences unless they ask for more). Be warm and practical. If you don't know something, say so and suggest they log the food in the app to see values.`;

const getFallbackReply = (message) => {
  const m = (message || '').toLowerCase().trim();
  if (!m) return "Hi! Ask me about calories, meal ideas, or how to use the tracker.";
  if (m.includes('calorie') && (m.includes('how') || m.includes('many') || m.includes('what')))
    return "Most meals range from 200–600 calories. Log your food in the tracker to see exact values. Need a guess? A typical Indian breakfast is ~300–450 cal, lunch 450–650, dinner similar.";
  if (m.includes('suggest') || m.includes('idea') || m.includes('meal'))
    return "Try logging: idli & chutney (~320 cal), veg biryani (~580), or a fruit bowl (~150). Use the Log Meal form to add them quickly.";
  if (m.includes('track') || m.includes('log'))
    return "Use the tracker on the home page: pick a meal type (breakfast/lunch/dinner/snacks), choose a dish or add custom food, then tap Add. Your history appears in Recent.";
  if (m.includes('goal') || m.includes('target'))
    return "Set your daily calorie goal in Profile. The tracker shows today's total vs your goal so you can stay on track.";
  if (m.includes('hello') || m.includes('hi') || m.includes('hey'))
    return "Hello! I'm here to help with calories, logging, and meal ideas. What would you like to know?";
  if (m.includes('thank'))
    return "You're welcome! Happy tracking.";
  if (m.includes('help'))
    return "I can help with: calorie estimates, meal suggestions, how to log food, and goal tips. Just ask in your own words.";
  if (m.includes('weight') || m.includes('lose') || m.includes('loose') || m.includes('slim') || m.includes('diet'))
    return "To lose weight safely: eat in a small calorie deficit (track in this app), focus on protein and veggies, and move more. Set a daily calorie goal in Profile slightly below what you need—the tracker helps you stay on it.";
  return "I'm your Calorie IQ assistant. Ask about calories, meal ideas, or how to use the tracker—I'll do my best to help!";
};

async function callGemini(userMessage, model = 'gemini-1.5-flash') {
  const key = config.geminiApiKey;
  if (!key || key.length < 20) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage || 'Hello'}\n\nAssistant:`;
  try {
    const { data } = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 256, temperature: 0.7 },
    }, { timeout: 15000 });
    const candidate = data?.candidates?.[0];
    if (!candidate) return null;
    const text = candidate?.content?.parts?.[0]?.text;
    if (typeof text === 'string' && text.trim()) return text.trim();
    return null;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const msg = err.response.data?.error?.message || err.message;
      console.error('Gemini API', status, msg);
      if (status === 404 && model === 'gemini-1.5-flash') {
        return await callGemini(userMessage, 'gemini-pro');
      }
    }
    throw err;
  }
}

const callOpenAI = async (openai, userMessage, model = 'gpt-4o-mini') => {
  return openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage || 'Hello' },
    ],
    max_tokens: 256,
    temperature: 0.7,
  });
};

async function callGroq(userMessage) {
  const key = config.groqApiKey;
  if (!key || key.length < 20) return null;
  const openai = new OpenAI({
    apiKey: key,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  const completion = await callOpenAI(openai, userMessage, 'llama-3.1-8b-instant');
  return completion.choices?.[0]?.message?.content?.trim() || null;
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body || {};
    const userMessage = typeof message === 'string' ? message.trim() : '';

    if (config.geminiApiKey && config.geminiApiKey.length >= 20) {
      try {
        const reply = await callGemini(userMessage);
        if (reply) return res.json({ reply });
      } catch (geminiErr) {
        const status = geminiErr.response?.status;
        const body = geminiErr.response?.data;
        console.error('Chat Gemini error:', status, body?.error?.message || geminiErr.message);
        if (status === 429) {
          await new Promise((r) => setTimeout(r, 3000));
          const retryReply = await callGemini(userMessage);
          if (retryReply) return res.json({ reply: retryReply });
        }
      }
    }

    if (config.groqApiKey && config.groqApiKey.length >= 20) {
      try {
        const reply = await callGroq(userMessage);
        if (reply) return res.json({ reply });
      } catch (groqErr) {
        console.error('Chat Groq error:', groqErr.message || groqErr);
      }
    }

    const apiKey = config.openaiApiKey;
    if (apiKey && apiKey.length >= 20) {
      const openai = new OpenAI({ apiKey });
      let completion;
      try {
        completion = await callOpenAI(openai, userMessage);
      } catch (rateLimitErr) {
        const status = rateLimitErr.status ?? rateLimitErr.response?.status;
        if (status === 429) {
          await new Promise((r) => setTimeout(r, 4000));
          completion = await callOpenAI(openai, userMessage);
        } else {
          throw rateLimitErr;
        }
      }
      const reply = completion.choices?.[0]?.message?.content?.trim() || getFallbackReply(userMessage);
      return res.json({ reply });
    }

    const reply = getFallbackReply(userMessage);
    return res.json({ reply });
  } catch (err) {
    const status = err.status ?? err.response?.status;
    const code = err.code ?? err.response?.data?.error?.code;
    console.error('Chat API error:', err.message || err, status ? `(status ${status})` : '');

    if (status === 401 || code === 'invalid_api_key') {
      return res.status(200).json({
        reply: "The AI key isn't valid. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY in the server .env and restart the backend.",
      });
    }
    if (status === 429) {
      const fallback = getFallbackReply(req.body?.message);
      return res.status(200).json({ reply: fallback });
    }

    const fallback = getFallbackReply(req.body?.message);
    return res.status(200).json({ reply: fallback });
  }
});

module.exports = router;
