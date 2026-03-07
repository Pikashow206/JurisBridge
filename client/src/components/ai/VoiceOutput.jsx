import { useState } from 'react';
import voiceService from '../../services/voiceService';

const VoiceOutput = ({ text, language = 'en', size = 'sm' }) => {
  const [speaking, setSpeaking] = useState(false);

  const toggleSpeak = () => {
    if (speaking) {
      voiceService.stopSpeaking();
      setSpeaking(false);
      return;
    }

    voiceService.speak({
      text,
      language,
      rate: 0.92,
      pitch: 1.0,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  if (!voiceService.isSynthesisSupported() || !text) return null;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-9 h-9 text-xs',
  };

  return (
    <button
      onClick={toggleSpeak}
      className={`${sizeClasses[size] || sizeClasses.sm} rounded-lg flex items-center justify-center transition-all duration-300 relative`}
      style={{
        background: speaking ? 'rgba(201,168,76,0.15)' : 'transparent',
        color: speaking ? '#C9A84C' : 'var(--text-muted)',
      }}
      title={speaking ? 'Stop speaking' : 'Read aloud'}
    >
      {speaking && (
        <span className="absolute inset-0 rounded-lg animate-pulse" style={{ background: 'rgba(201,168,76,0.08)' }}></span>
      )}

      {/* Sound wave bars animation when speaking */}
      {speaking ? (
        <div className="flex items-end gap-[2px] h-3 relative z-10">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[2px] rounded-full"
              style={{
                background: '#C9A84C',
                animation: `soundBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                height: '40%',
              }}
            ></span>
          ))}
          <style>{`
            @keyframes soundBar {
              0% { height: 20%; }
              100% { height: 100%; }
            }
          `}</style>
        </div>
      ) : (
        <i className="fas fa-volume-high relative z-10"></i>
      )}
    </button>
  );
};

export default VoiceOutput;