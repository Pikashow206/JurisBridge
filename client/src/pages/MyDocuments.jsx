import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const analyzeRef = useRef(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try { const { data } = await api.get('/documents'); setDocuments(data.data || []); } catch (e) {}
    setLoading(false);
  };

  const handleUploadAndAnalyze = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    formData.append('language', 'en');
    setAnalyzing(true);
    try {
      const { data } = await api.post('/documents/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document analyzed!');
      setDocuments((prev) => [data.data, ...prev]);
      setSelectedDoc(data.data);
      setShowAnalysis(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Analysis failed'); }
    setAnalyzing(false);
    if (analyzeRef.current) analyzeRef.current.value = '';
  };

  const handleUploadOnly = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    setUploading(true);
    try {
      const { data } = await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document uploaded');
      setDocuments((prev) => [data.data, ...prev]);
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    setUploading(false);
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (selectedDoc?._id === docId) { setSelectedDoc(null); setShowAnalysis(false); }
      toast.success('Deleted');
    } catch (e) { toast.error('Delete failed'); }
  };

  const viewAnalysis = async (doc) => {
    if (!doc.isAnalyzed) return;
    try { const { data } = await api.get(`/documents/${doc._id}`); setSelectedDoc(data.data); setShowAnalysis(true); } catch (e) { toast.error('Failed to load analysis'); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUploadAndAnalyze(file);
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return 'fa-file-pdf';
    if (type?.includes('word') || type?.includes('document')) return 'fa-file-word';
    return 'fa-file-lines';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) return <Loader fullScreen text="Loading documents..." />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader title="Documents" subtitle="Upload, analyze, and manage your legal documents" icon="fa-file-lines"
        breadcrumbs={[{ label: 'Documents' }]}
        actions={
          <div className="flex items-center gap-2">
            <label className="btn-ghost text-xs cursor-pointer">
              <i className="fas fa-upload"></i>Upload
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleUploadOnly(e.target.files[0])} disabled={uploading} />
            </label>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'var(--brand-primary)' }}>
              {analyzing ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Analyzing...</> : <><i className="fas fa-microchip"></i>Upload & Analyze</>}
              <input ref={analyzeRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleUploadAndAnalyze(e.target.files[0])} disabled={analyzing} />
            </label>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Document List */}
          <div className={`${showAnalysis ? 'w-1/2' : 'w-full'} transition-all duration-500`}>
            {/* Drop Zone */}
            {documents.length === 0 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="rounded-2xl border-2 border-dashed p-12 mb-6 text-center transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: dragOver ? 'var(--brand-primary)' : 'var(--border-default)',
                  background: dragOver ? 'rgba(26,60,110,0.03)' : 'transparent',
                }}
                onClick={() => analyzeRef.current?.click()}
              >
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-hover)' }}>
                    <i className="fas fa-cloud-arrow-up text-2xl" style={{ color: dragOver ? 'var(--brand-primary)' : 'var(--border-default)' }}></i>
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Drop your document here</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>or click to browse — PDF, DOC, DOCX, TXT</p>
                  <p className="text-[10px] mt-3 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <i className="fas fa-microchip text-[#C9A84C]"></i>AI will analyze clauses, risks, and provide summaries
                  </p>
                </motion.div>
              </div>
            )}

            {documents.length === 0 ? (
              <EmptyState icon="fa-file-lines" title="No Documents" description="Upload a legal document to get AI-powered analysis with risk indicators and clause breakdown." />
            ) : (
              <motion.div initial="hidden" animate="visible" className="space-y-3">
                {documents.map((doc, idx) => (
                  <motion.div key={doc._id} custom={idx} variants={fadeUp}
                    onClick={() => viewAnalysis(doc)}
                    className={`rounded-xl p-5 border cursor-pointer group transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 ${selectedDoc?._id === doc._id ? '' : ''}`}
                    style={{
                      background: selectedDoc?._id === doc._id ? 'var(--bg-elevated)' : 'var(--bg-card)',
                      borderColor: selectedDoc?._id === doc._id ? 'var(--brand-primary)' : 'var(--border-default)',
                      boxShadow: selectedDoc?._id === doc._id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    }}
                  >
                    {/* Left accent */}
                    <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: doc.isAnalyzed ? '#2d8a5e' : 'var(--border-default)' }}></div>

                    <div className="flex items-start gap-4 pl-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'var(--bg-hover)' }}>
                        <i className={`fas ${getFileIcon(doc.fileType)} text-sm`} style={{ color: 'var(--brand-primary)' }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{doc.fileName}</p>
                          {doc.isAnalyzed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2d8a5e]/10 text-[#2d8a5e] rounded-md text-[9px] font-bold uppercase flex-shrink-0">
                              <i className="fas fa-check text-[7px]"></i>Analyzed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          <span>{formatSize(doc.fileSize)}</span>
                          <span>·</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          {doc.analyzedBy && <><span>·</span><span className="flex items-center gap-1"><i className="fas fa-microchip text-[8px]" style={{ color: '#C9A84C' }}></i>{doc.analyzedBy}</span></>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }} onClick={(e) => e.stopPropagation()}>
                            <i className="fas fa-download text-[10px]"></i>
                          </a>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#c0392b]/10 hover:text-[#c0392b] transition-colors" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                          <i className="fas fa-trash text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Analysis Panel */}
          <AnimatePresence>
            {showAnalysis && selectedDoc?.analysis && (
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35 }}
                className="w-1/2 rounded-2xl border overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <i className="fas fa-microchip text-xs" style={{ color: '#C9A84C' }}></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Analysis</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>by {selectedDoc.analyzedBy}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAnalysis(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-xmark text-xs"></i>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)] space-y-6">
                  {selectedDoc.analysis.summary && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <i className="fas fa-align-left text-[9px]"></i>Summary
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{selectedDoc.analysis.summary}</p>
                    </div>
                  )}

                  {selectedDoc.analysis.riskIndicators?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <i className="fas fa-triangle-exclamation text-[9px]"></i>Risk Indicators
                      </h4>
                      <div className="space-y-2">
                        {selectedDoc.analysis.riskIndicators.map((risk, i) => {
                          const col = risk.risk === 'high' ? '#c0392b' : risk.risk === 'medium' ? '#d4a017' : '#2d8a5e';
                          return (
                            <div key={i} className="rounded-xl p-3.5 border relative overflow-hidden" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-hover)' }}>
                              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: col }}></div>
                              <div className="pl-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="w-2 h-2 rounded-full" style={{ background: col }}></span>
                                  <span className="text-[10px] font-bold uppercase" style={{ color: col }}>{risk.risk} Risk</span>
                                </div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{risk.clause}</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{risk.explanation}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedDoc.analysis.clauseBreakdown?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <i className="fas fa-list-check text-[9px]"></i>Clauses
                      </h4>
                      <div className="space-y-2">
                        {selectedDoc.analysis.clauseBreakdown.map((c, i) => (
                          <div key={i} className="rounded-xl p-3.5 border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-hover)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>{c.title}</p>
                            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{c.content}</p>
                            {c.implication && <p className="text-xs mt-1 italic" style={{ color: 'var(--text-secondary)' }}><i className="fas fa-arrow-right text-[7px] mr-1"></i>{c.implication}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDoc.analysis.recommendation && (
                    <div className="rounded-xl p-4 border" style={{ borderColor: 'rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.04)' }}>
                      <h4 className="text-xs font-bold mb-2 flex items-center gap-2" style={{ color: '#C9A84C' }}>
                        <i className="fas fa-lightbulb text-[9px]"></i>Recommendation
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{selectedDoc.analysis.recommendation}</p>
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

export default MyDocuments;