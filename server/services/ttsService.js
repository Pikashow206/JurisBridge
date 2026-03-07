const axios = require('axios');

// ========================
// GOOGLE TEXT-TO-SPEECH
// ========================

const googleTTS = async (text, language = 'en') => {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey || apiKey === 'placeholder') {
    throw new Error('Google TTS API key not configured');
  }

  const languageCode = language === 'hi' ? 'hi-IN' : 'en-IN';
  const voiceName = language === 'hi' ? 'hi-IN-Wavenet-A' : 'en-IN-Wavenet-A';

  const response = await axios.post(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      input: { text: text.substring(0, 5000) }, // Google TTS limit
      voice: {
        languageCode,
        name: voiceName,
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95,
        pitch: 0,
      },
    }
  );

  // Returns base64 encoded audio
  return {
    audioContent: response.data.audioContent,
    format: 'mp3',
    provider: 'Google TTS',
  };
};

// ========================
// ELEVENLABS TTS (Premium)
// ========================

const elevenLabsTTS = async (text, language = 'en') => {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey || apiKey === 'placeholder') {
    throw new Error('ElevenLabs API key not configured');
  }

  // Default voice IDs (you can change these)
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel — works well for English

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: text.substring(0, 2500), // ElevenLabs limit on free tier
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
    {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      responseType: 'arraybuffer',
    }
  );

  // Returns raw audio buffer
  const base64Audio = Buffer.from(response.data).toString('base64');

  return {
    audioContent: base64Audio,
    format: 'mp3',
    provider: 'ElevenLabs',
  };
};

// ========================
// BROWSER-BASED FALLBACK
// ========================

// If no TTS API is configured, return text for browser's Web Speech API
const browserTTSFallback = (text, language = 'en') => {
  return {
    audioContent: null,
    text: text,
    format: 'browser',
    provider: 'Browser Web Speech API',
    instruction: 'Use the browser Web Speech API (speechSynthesis) to read this text aloud on the frontend.',
  };
};

// ========================
// MAIN TTS FUNCTION (CASCADE)
// ========================

const synthesizeSpeech = async (text, language = 'en', preferPremium = false) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for speech synthesis');
  }

  // If premium requested, try ElevenLabs first
  if (preferPremium) {
    try {
      console.log('🔊 TTS: Trying ElevenLabs (premium)...');
      return await elevenLabsTTS(text, language);
    } catch (err) {
      console.log('⚠️ ElevenLabs failed, falling back...');
    }
  }

  // Try Google TTS
  try {
    console.log('🔊 TTS: Trying Google TTS...');
    return await googleTTS(text, language);
  } catch (err) {
    console.log('⚠️ Google TTS failed, using browser fallback');
  }

  // Fallback to browser
  console.log('🔊 TTS: Using browser Web Speech API fallback');
  return browserTTSFallback(text, language);
};

module.exports = {
  synthesizeSpeech,
  googleTTS,
  elevenLabsTTS,
};