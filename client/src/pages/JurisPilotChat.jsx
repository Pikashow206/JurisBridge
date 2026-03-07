import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import voiceService from '../services/voiceService';
import PageHeader from '../components/common/PageHeader';
import VoiceInput from '../components/ai/VoiceInput';
import VoiceOutput from '../components/ai/VoiceOutput';

const JurisPilotChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try { const { data } = await api.get('/ai/history?limit=20'); setHistory(data.data || []); } catch (e) {}
    };
    loadHistory();
  }, []);

  useEffect(() => { return () => voiceService.destroy(); }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/query', { query: userMessage, language, source: 'chat_page' });
      const ai = data.data;
      setMessages((prev) => [...prev, { role: 'ai', content: ai.response, provider: ai.provider, confidence: ai.confidence, category: ai.category, escalated: ai.escalated }]);
      setHistory((prev) => [ai, ...prev].slice(0, 20));
      if (autoSpeak && ai.response) voiceService.speak({ text: ai.response, language, rate: 0.92 });
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'I apologize, but I am unable to process your request. Please try again.', provider: 'System', confidence: 0 }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleVoiceSend = (text) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: text, isVoice: true }]);
    setInput('');
    setLoading(true);
    api.post('/ai/query', { query: text, language, source: 'voice_input' })
      .then(({ data }) => {
        const ai = data.data;
        setMessages((prev) => [...prev, { role: 'ai', content: ai.response, provider: ai.provider, confidence: ai.confidence, category: ai.category, escalated: ai.escalated }]);
        setHistory((prev) => [ai, ...prev].slice(0, 20));
        if (autoSpeak && ai.response) voiceService.speak({ text: ai.response, language, rate: 0.92 });
      })
      .catch(() => { setMessages((prev) => [...prev, { role: 'ai', content: 'Unable to process. Please try again.', provider: 'System', confidence: 0 }]); })
      .finally(() => { setLoading(false); inputRef.current?.focus(); });
  };

  const suggestions = [
    { icon: 'fa-house', text: 'What are my rights as a tenant in India?' },
    { icon: 'fa-shield-halved', text: 'How do I file an FIR for cyberbullying?' },
    { icon: 'fa-heart', text: 'Process for divorce by mutual consent?' },
    { icon: 'fa-briefcase', text: 'Can my employer fire me without notice?' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <PageHeader title="JurisPilot AI" subtitle="Your intelligent legal research assistant" icon="fa-microchip"
        breadcrumbs={[{ label: 'JurisPilot AI' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => { setAutoSpeak(!autoSpeak); if (autoSpeak) voiceService.stopSpeaking(); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200"
              style={{ background: autoSpeak ? 'rgba(201,168,76,0.08)' : 'var(--bg-card)', borderColor: autoSpeak ? '#C9A84C' : 'var(--border-default)', color: autoSpeak ? '#C9A84C' : 'var(--text-secondary)' }}>
              <i className={`fas ${autoSpeak ? 'fa-volume-high' : 'fa-volume-xmark'} text-[10px]`}></i>
              <span className="hidden sm:inline">{autoSpeak ? 'Voice ON' : 'Voice OFF'}</span>
            </button>
            <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-default)' }}>
              {['en', 'hi'].map((l) => (
                <button key={l} onClick={() => setLanguage(l)} className="px-3 py-1.5 text-xs font-medium transition-all" style={{ background: language === l ? 'var(--brand-primary)' : 'var(--bg-card)', color: language === l ? '#fff' : 'var(--text-secondary)' }}>
                  {l === 'en' ? '🇬🇧 EN' : '🇮🇳 HI'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
              style={{ background: showHistory ? 'var(--brand-primary)' : 'var(--bg-card)', borderColor: showHistory ? 'var(--brand-primary)' : 'var(--border-default)', color: showHistory ? '#fff' : 'var(--text-secondary)' }}>
              <i className="fas fa-clock-rotate-left text-xs"></i>
            </button>
          </div>
        }
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-220px)]">
          {/* Chat */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  {/* Animated Logo */}
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-[#0D1B2A] rounded-2xl flex items-center justify-center shadow-xl shadow-[#0D1B2A]/20">
                      <i className="fas fa-microchip text-[#C9A84C] text-2xl"></i>
                    </div>
                    <div className="absolute -inset-2 bg-[#C9A84C]/10 rounded-3xl animate-pulse" />
                  </motion.div>

                  <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-xl font-heading font-bold mb-2" style={{ color: 'var(--text-primary)' }}>JurisPilot AI</motion.h3>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-sm mb-2 text-center max-w-md" style={{ color: 'var(--text-secondary)' }}>
                    Ask me any legal question — type or use the <i className="fas fa-microphone text-[#c0392b] text-[11px] mx-0.5"></i> microphone.
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-xs mb-8 text-center" style={{ color: 'var(--text-muted)' }}>
                    Powered by Groq · Gemini · OpenAI · Claude
                  </motion.p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {suggestions.map((s, idx) => (
                      <motion.button key={s.text} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}
                        onClick={() => { setInput(s.text); inputRef.current?.focus(); }}
                        className="group text-left px-4 py-3.5 rounded-xl text-xs border transition-all duration-200"
                        style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" style={{ background: 'var(--bg-card)' }}>
                            <i className={`fas ${s.icon} text-[10px]`} style={{ color: 'var(--brand-primary)' }}></i>
                          </div>
                          <span className="leading-relaxed">{s.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-8 h-8 bg-[#0D1B2A] rounded-lg flex items-center justify-center flex-shrink-0 mr-3 mt-1 shadow-sm">
                          <i className="fas fa-microchip text-[#C9A84C] text-[10px]"></i>
                        </div>
                      )}
                      <div className="max-w-[75%]">
                        <div className={`px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user' ? 'rounded-2xl rounded-br-sm text-white' : 'rounded-2xl rounded-bl-sm border'
                        }`} style={msg.role === 'user' ? { background: 'var(--brand-primary)', boxShadow: '0 2px 8px rgba(26,60,110,0.2)' } : { background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                          {msg.isVoice && msg.role === 'user' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-medium opacity-60 mb-1">
                              <i className="fas fa-microphone text-[7px]"></i> Voice
                            </span>
                          )}
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                        {msg.role === 'ai' && (
                          <div className="flex items-center gap-3 mt-2 px-1 flex-wrap">
                            {msg.provider && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                                <i className="fas fa-microchip text-[7px]"></i>{msg.provider}
                              </span>
                            )}
                            {msg.confidence > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                                  <div className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#d4b96e]" style={{ width: `${msg.confidence}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold" style={{ color: '#C9A84C' }}>{msg.confidence}%</span>
                              </div>
                            )}
                            {msg.category && <span className="text-[9px] px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{msg.category}</span>}
                            {msg.escalated && <span className="text-[9px] text-[#c0392b] font-semibold flex items-center gap-1"><i className="fas fa-arrow-up-right-from-square text-[7px]"></i>Needs Lawyer</span>}
                            <div className="ml-auto"><VoiceOutput text={msg.content} language={language} size="xs" /></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Loading */}
              {loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#0D1B2A] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"><i className="fas fa-microchip text-[#C9A84C] text-[10px]"></i></div>
                  <div className="rounded-2xl rounded-bl-sm px-5 py-3.5 border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((d) => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#C9A84C', animationDelay: `${d}ms` }}></span>)}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyzing your query...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}>
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <VoiceInput language={language} disabled={loading} onResult={handleVoiceSend} onInterim={(t) => setInput(t)} />
                <div className="flex-1 relative">
                  <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder={language === 'hi' ? 'लिखें या माइक दबाएं...' : 'Type your legal question or press mic...'}
                    className="w-full px-4 py-3.5 pr-16 rounded-xl text-sm transition-all focus:outline-none"
                    style={{ background: 'var(--bg-hover)', border: '1.5px solid var(--border-default)', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                    maxLength={5000} disabled={loading} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: 'var(--text-muted)' }}>{input.length}/5k</span>
                </div>
                <motion.button type="submit" disabled={loading || !input.trim()} whileTap={{ scale: 0.93 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 hover:shadow-lg"
                  style={{ background: 'var(--brand-primary)' }}>
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <i className="fas fa-paper-plane text-xs"></i>}
                </motion.button>
              </form>
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-[10px] flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                  <span><i className="fas fa-microphone mr-1 text-[#c0392b]"></i>Speak</span>
                  <span><i className="fas fa-volume-high mr-1 text-[#C9A84C]"></i>AI Voice</span>
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <i className="fas fa-info-circle mr-1"></i>Information, not legal advice
                </p>
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, x: 30, width: 0 }} animate={{ opacity: 1, x: 0, width: 320 }} exit={{ opacity: 0, x: 30, width: 0 }} transition={{ duration: 0.3 }}
                className="hidden lg:flex flex-col rounded-2xl overflow-hidden flex-shrink-0 border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <i className="fas fa-clock-rotate-left text-xs" style={{ color: 'var(--text-secondary)' }}></i>History
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{history.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {history.length > 0 ? history.map((h, idx) => (
                    <button key={h._id || idx} onClick={() => setMessages((prev) => [...prev, { role: 'user', content: h.query }, { role: 'ai', content: h.response, provider: h.provider, confidence: h.confidence, category: h.category, escalated: h.escalated }])}
                      className="w-full text-left px-5 py-3.5 transition-all group"
                      style={{ borderBottom: '1px solid var(--bg-hover)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{h.query}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{h.provider}</span>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                          <div className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#d4b96e]" style={{ width: `${h.confidence}%` }}></div>
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: '#C9A84C' }}>{h.confidence}%</span>
                      </div>
                    </button>
                  )) : (
                    <div className="px-5 py-10 text-center">
                      <i className="fas fa-clock-rotate-left text-xl mb-2" style={{ color: 'var(--border-default)' }}></i>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No queries yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JurisPilotChat;