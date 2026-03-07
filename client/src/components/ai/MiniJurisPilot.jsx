import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

const MiniJurisPilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userQuery = query.trim();
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/quick-ask', { query: userQuery, language: 'en' });
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: data.data.response, provider: data.data.provider },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Unable to process your question right now. Please try the full JurisPilot chat.' },
      ]);
    }
    setLoading(false);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center hover:scale-105"
        style={{ background: 'var(--brand-primary)', color: '#ffffff' }}
        title="Ask JurisPilot AI"
      >
        <i className={`fas ${isOpen ? 'fa-xmark' : 'fa-microchip'} text-sm`}></i>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-22 right-6 w-[340px] rounded-2xl shadow-2xl z-50 overflow-hidden border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#0D1B2A' }}>
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center">
              <i className="fas fa-microchip text-[#0D1B2A] text-xs"></i>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">JurisPilot</p>
              <p className="text-[#8494A7] text-[10px]">Quick Legal Assistance</p>
            </div>
            <button
              onClick={() => { setMessages([]); }}
              className="w-6 h-6 rounded flex items-center justify-center text-[#8494A7] hover:text-white transition-colors"
              title="Clear chat"
            >
              <i className="fas fa-rotate-right text-[9px]"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="h-56 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <i className="fas fa-scale-balanced text-2xl mb-3" style={{ color: 'var(--border-default)' }}></i>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Ask any legal question</p>
                <div className="mt-3 space-y-1.5 w-full">
                  {['Tenant rights in India?', 'How to file an FIR?'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[11px] border transition-colors"
                      style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                    >
                      <i className="fas fa-arrow-right text-[7px] mr-1.5" style={{ color: 'var(--brand-gold)' }}></i>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 text-[12px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-xl rounded-br-sm text-white'
                      : 'rounded-xl rounded-bl-sm border'
                  }`} style={
                    msg.role === 'user'
                      ? { background: 'var(--brand-primary)' }
                      : { background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }
                  }>
                    {msg.text.length > 400 ? msg.text.substring(0, 400) + '...' : msg.text}
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-2 mt-1.5 pt-1.5" style={{ borderTop: '1px solid var(--border-default)' }}>
                        {msg.provider && (
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            <i className="fas fa-microchip mr-0.5"></i>{msg.provider}
                          </span>
                        )}
                        <button onClick={() => speakText(msg.text)} className="ml-auto transition-colors" style={{ color: 'var(--text-muted)' }} title="Read aloud">
                          <i className="fas fa-volume-high text-[9px]"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }}></span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Analyzing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleAsk} className="p-2.5 flex gap-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a legal question..."
              className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              maxLength={500}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-30"
              style={{ background: 'var(--brand-primary)' }}
            >
              <i className="fas fa-paper-plane text-[10px]"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default MiniJurisPilot;