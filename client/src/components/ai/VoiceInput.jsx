import { useState, useEffect, useRef } from 'react';
import voiceService from '../../services/voiceService';

const VoiceInput = ({ onResult, onInterim, language = 'en', disabled = false }) => {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  const startVolumeVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(avg / 128, 1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      // Silently fail — visualizer is optional
    }
  };

  const stopEverything = () => {
    voiceService.stopListening();
    setListening(false);
    setInterimText('');
    setVolume(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopEverything();
      return;
    }

    setError('');
    setInterimText('');
    startVolumeVisualizer();

    voiceService.startListening({
      language,
      onResult: (text) => {
        stopEverything();
        onResult?.(text);
      },
      onInterim: (text) => {
        setInterimText(text);
        onInterim?.(text);
      },
      onEnd: () => {
        stopEverything();
      },
      onError: (msg) => {
        stopEverything();
        setError(msg);
        setTimeout(() => setError(''), 4000);
      },
    });

    setListening(true);
  };

  if (!voiceService.isRecognitionSupported()) return null;

  return (
    <div className="relative flex items-center">
      {/* Mic Button */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 ${
          listening ? 'scale-105' : 'hover:scale-105'
        }`}
        style={{
          background: listening ? '#c0392b' : 'var(--bg-hover)',
          color: listening ? '#ffffff' : 'var(--text-secondary)',
          boxShadow: listening ? '0 0 20px rgba(192,57,43,0.3)' : 'none',
        }}
        title={listening ? 'Stop listening' : 'Voice input'}
      >
        {/* Pulse rings when listening */}
        {listening && (
          <>
            <span
              className="absolute inset-0 rounded-xl animate-ping"
              style={{ background: 'rgba(192,57,43,0.2)', animationDuration: '1.5s' }}
            ></span>
            <span
              className="absolute rounded-xl"
              style={{
                inset: `-${4 + volume * 8}px`,
                background: `rgba(192,57,43,${0.1 + volume * 0.15})`,
                borderRadius: '12px',
                transition: 'all 0.1s ease',
              }}
            ></span>
          </>
        )}
        <i className={`fas ${listening ? 'fa-stop' : 'fa-microphone'} text-sm relative z-10`}></i>
      </button>

      {/* Interim text tooltip */}
      {listening && interimText && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg text-xs max-w-[200px] text-center whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full animate-pulse"></span>
            <span className="truncate">{interimText}</span>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {listening && !interimText && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg text-[10px] font-medium"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: '#c0392b',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full animate-pulse"></span>
            Listening...
          </div>
        </div>
      )}

      {/* Error tooltip */}
      {error && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg text-[10px] max-w-[240px] text-center"
          style={{
            background: '#c0392b',
            color: '#ffffff',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;