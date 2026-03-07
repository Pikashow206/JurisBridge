const Anthropic = require('@anthropic-ai/sdk').default;
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const AI_CONFIG = require('../config/aiProviders');

// ========================
// PROVIDER INITIALIZATIONS
// ========================

let claudeClient = null;
let openaiClient = null;
let geminiClient = null;
let groqClient = null;

const initProviders = () => {
  // Claude
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'placeholder') {
    claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log('   🟣 Claude API: Ready');
  } else {
    console.log('   🟣 Claude API: Not configured (skipping)');
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder') {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('   🟢 OpenAI API: Ready');
  } else {
    console.log('   🟢 OpenAI API: Not configured (skipping)');
  }

  // Gemini
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder') {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('   🔵 Gemini API: Ready');
  } else {
    console.log('   🔵 Gemini API: Not configured (skipping)');
  }

  // Groq
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'placeholder') {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('   🟠 Groq API: Ready');
  } else {
    console.log('   🟠 Groq API: Not configured (skipping)');
  }
};

// ========================
// SLEEP UTILITY
// ========================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ========================
// INDIVIDUAL PROVIDER CALLS
// ========================

// 🟣 Claude
const callClaude = async (query, language) => {
  if (!claudeClient) throw new Error('Claude API not configured');

  const config = AI_CONFIG.providers.claude;
  const response = await claudeClient.messages.create({
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    system: AI_CONFIG.systemPrompt(language),
    messages: [{ role: 'user', content: query }],
  });

  const text = response.content[0].text;
  return { text, provider: config.name };
};

// 🟢 OpenAI
const callOpenAI = async (query, language) => {
  if (!openaiClient) throw new Error('OpenAI API not configured');

  const config = AI_CONFIG.providers.openai;
  const response = await openaiClient.chat.completions.create({
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    messages: [
      { role: 'system', content: AI_CONFIG.systemPrompt(language) },
      { role: 'user', content: query },
    ],
  });

  const text = response.choices[0].message.content;
  return { text, provider: config.name };
};

// 🔵 Gemini
const callGemini = async (query, language) => {
  if (!geminiClient) throw new Error('Gemini API not configured');

  const config = AI_CONFIG.providers.gemini;
  const model = geminiClient.getGenerativeModel({
    model: config.model,
    systemInstruction: AI_CONFIG.systemPrompt(language),
  });

  const result = await model.generateContent(query);
  const response = result.response;
  const text = response.text();

  return { text, provider: config.name };
};

// 🟠 Groq (NEW — Free & Fast!)
const callGroq = async (query, language) => {
  if (!groqClient) throw new Error('Groq API not configured');

  const config = AI_CONFIG.providers.groq;
  const response = await groqClient.chat.completions.create({
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    messages: [
      { role: 'system', content: AI_CONFIG.systemPrompt(language) },
      { role: 'user', content: query },
    ],
  });

  const text = response.choices[0].message.content;
  return { text, provider: config.name };
};

// ========================
// RETRY WRAPPER
// ========================

const callWithRetry = async (providerFn, query, language, providerName, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await providerFn(query, language);
    } catch (error) {
      const isRateLimit =
        error.message?.includes('429') ||
        error.message?.includes('Too Many Requests') ||
        error.message?.includes('rate') ||
        error.message?.includes('quota');

      if (isRateLimit && attempt <= maxRetries) {
        const waitTime = attempt * 15;
        console.log(`⏳ ${providerName}: Rate limited. Retrying in ${waitTime}s... (attempt ${attempt}/${maxRetries})`);
        await sleep(waitTime * 1000);
        continue;
      }

      throw error;
    }
  }
};

// ========================
// CONFIDENCE PARSER
// ========================

const parseConfidence = (responseText) => {
  const match = responseText.match(/\[CONFIDENCE:\s*(\d+)\]/i);
  if (match) {
    const score = parseInt(match[1], 10);
    const cleanText = responseText.replace(/\[CONFIDENCE:\s*\d+\]/i, '').trim();
    return { confidence: Math.min(score, 100), cleanText };
  }
  return { confidence: 70, cleanText: responseText };
};

// ========================
// CATEGORY DETECTION
// ========================

const detectCategory = async (query) => {
  const providers = [
    { fn: callGroq, available: !!groqClient, name: 'Groq' },
    { fn: callGemini, available: !!geminiClient, name: 'Gemini' },
    { fn: callOpenAI, available: !!openaiClient, name: 'OpenAI' },
    { fn: callClaude, available: !!claudeClient, name: 'Claude' },
  ];

  for (const provider of providers) {
    if (!provider.available) continue;
    try {
      const result = await callWithRetry(
        provider.fn,
        `${AI_CONFIG.categoryPrompt}\n\nUser query: "${query}"`,
        'en',
        provider.name,
        1
      );
      return result.text.trim();
    } catch (err) {
      continue;
    }
  }

  return 'Other';
};

// ========================
// MAIN CASCADE FUNCTION
// ========================

const getAIResponse = async (query, language = 'en') => {
  // Cascade: Claude → OpenAI → Gemini → Groq → Human Lawyer
  const providers = [
    { name: 'Claude', fn: callClaude, available: !!claudeClient },
    { name: 'OpenAI', fn: callOpenAI, available: !!openaiClient },
    { name: 'Gemini', fn: callGemini, available: !!geminiClient },
    { name: 'Groq', fn: callGroq, available: !!groqClient },
  ];

  const errors = [];

  for (const provider of providers) {
    if (!provider.available) {
      errors.push(`${provider.name}: Not configured`);
      continue;
    }

    try {
      console.log(`🤖 JurisPilot: Trying ${provider.name}...`);

      const result = await callWithRetry(
        provider.fn,
        query,
        language,
        provider.name,
        2
      );

      const { confidence, cleanText } = parseConfidence(result.text);
      console.log(`✅ ${provider.name} responded with confidence: ${confidence}%`);

      if (confidence >= AI_CONFIG.confidenceThreshold) {
        const category = await detectCategory(query);

        return {
          success: true,
          response: cleanText,
          provider: result.provider,
          confidence,
          category,
          escalated: false,
        };
      }

      console.log(`⚠️ ${provider.name} confidence too low (${confidence}%), trying next...`);
      errors.push(`${provider.name}: Low confidence (${confidence}%)`);

    } catch (error) {
      console.error(`❌ ${provider.name} failed:`, error.message);
      errors.push(`${provider.name}: ${error.message}`);
      continue;
    }
  }

  console.log('🚨 JurisPilot: All AI providers exhausted. Escalating to human lawyer.');

  const category = await detectCategory(query).catch(() => 'Other');

  return {
    success: true,
    response:
      language === 'hi'
        ? '🤝 मुझे इस कानूनी प्रश्न का विश्वसनीय उत्तर देने में कठिनाई हो रही है। आपकी बेहतर सहायता के लिए, मैं आपको एक सत्यापित वकील से जोड़ रहा हूं जो इस मामले में विशेषज्ञ हैं।'
        : '🤝 I am unable to provide a reliable answer to this legal question. For your safety and best interest, I am connecting you with a verified lawyer who specializes in this area.',
    provider: 'Human Lawyer',
    confidence: 0,
    category,
    escalated: true,
    escalationReason: errors.join('; '),
  };
};

module.exports = {
  initProviders,
  getAIResponse,
  detectCategory,
  callClaude,
  callOpenAI,
  callGemini,
  callGroq,
};