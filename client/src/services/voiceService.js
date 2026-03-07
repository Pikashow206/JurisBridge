/* ==============================
   JURISBRIDGE VOICE SERVICE
   - Speech Recognition (mic input)
   - Text-to-Speech (AI voice output)
   - Language support: English + Hindi
   ============================== */

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.selectedVoice = null;
    this.voicesLoaded = false;

    this._initRecognition();
    this._loadVoices();
  }

  /* ============================
     SPEECH RECOGNITION (Mic Input)
     ============================ */
  _initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Voice] Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  isRecognitionSupported() {
    return !!this.recognition;
  }

  isSynthesisSupported() {
    return !!this.synthesis;
  }

  startListening({ language = 'en', onResult, onInterim, onEnd, onError }) {
    if (!this.recognition) {
      onError?.('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    // Stop any ongoing speech before listening
    this.stopSpeaking();

    this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) onInterim?.(interimTranscript);
      if (finalTranscript) onResult?.(finalTranscript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not found. Please check your device.',
        'not-allowed': 'Microphone permission denied. Please allow access in your browser settings.',
        'network': 'Network error. Please check your connection.',
        'aborted': 'Listening was cancelled.',
      };
      onError?.(errorMessages[event.error] || `Recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      onError?.('Failed to start speech recognition. Please try again.');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /* ============================
     TEXT-TO-SPEECH (Voice Output)
     ============================ */
  _loadVoices() {
    const loadFn = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) this.voicesLoaded = true;
    };

    loadFn();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadFn;
    }
  }

  _getBestVoice(language) {
    const voices = this.synthesis.getVoices();
    const langCode = language === 'hi' ? 'hi' : 'en';

    // Priority order: Google voices > Microsoft voices > any matching voice
    const priorities = [
      (v) => v.name.includes('Google') && v.lang.startsWith(langCode),
      (v) => v.name.includes('Microsoft') && v.lang.startsWith(langCode),
      (v) => v.name.includes('Female') && v.lang.startsWith(langCode),
      (v) => v.lang.startsWith(langCode) && !v.localService,
      (v) => v.lang.startsWith(langCode),
    ];

    for (const check of priorities) {
      const match = voices.find(check);
      if (match) return match;
    }

    // Fallback to first English voice
    return voices.find((v) => v.lang.startsWith('en')) || voices[0];
  }

  speak({ text, language = 'en', rate = 0.92, pitch = 1.0, onStart, onEnd, onError }) {
    if (!this.synthesis) {
      onError?.('Speech synthesis is not supported in your browser.');
      return;
    }

    // Stop any current speech
    this.stopSpeaking();

    // Clean text for better speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, '. ')
      .trim();

    // Split long text into chunks (max 200 chars per utterance for reliability)
    const chunks = this._splitIntoChunks(cleanText, 200);

    let currentChunk = 0;

    const speakChunk = () => {
      if (currentChunk >= chunks.length) {
        this.isSpeaking = false;
        this.currentUtterance = null;
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
      utterance.voice = this._getBestVoice(language);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        if (currentChunk === 0) {
          this.isSpeaking = true;
          onStart?.();
        }
      };

      utterance.onend = () => {
        currentChunk++;
        speakChunk();
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'cancelled') {
          this.isSpeaking = false;
          onError?.(`Speech error: ${event.error}`);
        }
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    };

    speakChunk();
  }

  _splitIntoChunks(text, maxLength) {
    const chunks = [];
    const sentences = text.split(/(?<=[.!?।])\s+/);
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).length > maxLength && current.length > 0) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = current ? current + ' ' + sentence : sentence;
      }
    }

    if (current.trim()) chunks.push(current.trim());
    if (chunks.length === 0) chunks.push(text);

    return chunks;
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /* ============================
     UTILS
     ============================ */
  getAvailableVoices(language = 'en') {
    const voices = this.synthesis.getVoices();
    const langCode = language === 'hi' ? 'hi' : 'en';
    return voices.filter((v) => v.lang.startsWith(langCode));
  }

  destroy() {
    this.stopListening();
    this.stopSpeaking();
  }
}

// Singleton instance
const voiceService = new VoiceService();
export default voiceService;