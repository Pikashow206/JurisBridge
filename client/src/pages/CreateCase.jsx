import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'Property Dispute', icon: 'fa-house', color: '#1A3C6E' },
  { value: 'Family Matter', icon: 'fa-heart', color: '#c0392b' },
  { value: 'Criminal Case', icon: 'fa-gavel', color: '#8e44ad' },
  { value: 'Employment Issue', icon: 'fa-briefcase', color: '#2980b9' },
  { value: 'Cybercrime', icon: 'fa-shield-halved', color: '#16a085' },
  { value: 'Consumer Complaint', icon: 'fa-cart-shopping', color: '#d4a017' },
  { value: 'Business Contract', icon: 'fa-file-contract', color: '#0D1B2A' },
  { value: 'Intellectual Property', icon: 'fa-lightbulb', color: '#C9A84C' },
];

const CreateCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lawyers, setLawyers] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCase, setCreatedCase] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', priority: 'normal', lawyerId: '',
  });

  useEffect(() => {
    const loadLawyers = async () => {
      try {
        const { data } = await api.get('/lawyers?limit=50&isAvailable=true');
        setLawyers(data.data || []);
      } catch (err) { /* silent */ }
    };
    loadLawyers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) { toast.error('Please select a category'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/cases', formData);
      const caseData = data.data;
      setCreatedCase(caseData);

      // Find the selected lawyer's full info
      if (formData.lawyerId) {
        const lawyer = lawyers.find((l) => l._id === formData.lawyerId);
        setSelectedLawyer(lawyer);
      } else if (caseData?.lawyerId) {
        // If auto-matched by backend
        try {
          const lawyerRes = await api.get(`/lawyers/${typeof caseData.lawyerId === 'object' ? caseData.lawyerId._id : caseData.lawyerId}`);
          setSelectedLawyer(lawyerRes.data.data?.lawyer || lawyerRes.data.data);
        } catch (e) { /* silent */ }
      }

      setShowSuccess(true);
      toast.success('Case created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create case');
    }
    setLoading(false);
  };

  const filteredLawyers = formData.category
    ? lawyers.filter((l) => l.specializations?.some((s) => formData.category.toLowerCase().includes(s.toLowerCase().split(' ')[0])))
    : lawyers;

  const displayLawyers = filteredLawyers.length > 0 ? filteredLawyers : lawyers;

  // Get selected lawyer info for preview in form
  const previewLawyer = formData.lawyerId ? lawyers.find((l) => l._id === formData.lawyerId) : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader
        title="Create New Case"
        subtitle="Describe your legal issue and get matched with a lawyer"
        icon="fa-folder-plus"
        breadcrumbs={[{ label: 'Cases', to: '/cases' }, { label: 'New Case' }]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} onSubmit={handleSubmit} className="space-y-8">

          {/* Category Selection */}
          <div className="rounded-2xl border p-7" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <i className="fas fa-tag text-sm" style={{ color: '#C9A84C' }}></i>
              </div>
              <div>
                <h3 className="text-base font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Legal Category *</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Select the type of legal issue</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} type="button" onClick={() => setFormData({ ...formData, category: cat.value, lawyerId: '' })}
                  className="group relative p-4 rounded-xl border text-center transition-all duration-300 overflow-hidden"
                  style={{
                    background: formData.category === cat.value ? `${cat.color}10` : 'var(--bg-card)',
                    borderColor: formData.category === cat.value ? cat.color : 'var(--border-default)',
                    boxShadow: formData.category === cat.value ? `0 4px 12px ${cat.color}15` : 'none',
                  }}>
                  {formData.category === cat.value && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px]" style={{ background: cat.color }}>
                      <i className="fas fa-check"></i>
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5 transition-transform group-hover:scale-110" style={{ background: `${cat.color}12` }}>
                    <i className={`fas ${cat.icon} text-sm`} style={{ color: cat.color }}></i>
                  </div>
                  <p className="text-[11px] font-semibold leading-tight" style={{ color: formData.category === cat.value ? cat.color : 'var(--text-primary)' }}>
                    {cat.value}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="rounded-2xl border p-7" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,60,110,0.1)' }}>
                <i className="fas fa-pen text-sm" style={{ color: 'var(--brand-primary)' }}></i>
              </div>
              <div>
                <h3 className="text-base font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Case Details *</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Describe your legal situation clearly</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="input-label">Case Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field" placeholder="e.g., Landlord refusing to return security deposit" maxLength={200} required />
                <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{formData.title.length}/200</p>
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field" rows={5} placeholder="Explain the facts — what happened, when, who is involved, what outcome you want..." maxLength={5000} required />
                <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{formData.description.length}/5000</p>
              </div>
              <div>
                <label className="input-label">Priority</label>
                <div className="flex gap-2">
                  {[
                    { key: 'low', label: 'Low', color: '#8494A7' },
                    { key: 'normal', label: 'Normal', color: '#2980b9' },
                    { key: 'high', label: 'High', color: '#d4a017' },
                    { key: 'urgent', label: 'Urgent', color: '#c0392b' },
                  ].map((p) => (
                    <button key={p.key} type="button" onClick={() => setFormData({ ...formData, priority: p.key })}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200"
                      style={{
                        background: formData.priority === p.key ? `${p.color}12` : 'transparent',
                        borderColor: formData.priority === p.key ? p.color : 'var(--border-default)',
                        color: formData.priority === p.key ? p.color : 'var(--text-secondary)',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Select Lawyer */}
          <div className="rounded-2xl border p-7" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <i className="fas fa-user-tie text-sm" style={{ color: '#C9A84C' }}></i>
              </div>
              <div>
                <h3 className="text-base font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Choose a Lawyer</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formData.category ? `Showing lawyers for "${formData.category}"` : 'Select a category first for better matches'}
                </p>
              </div>
            </div>

            {/* Selected Lawyer Preview */}
            <AnimatePresence>
              {previewLawyer && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden">
                  <div className="rounded-xl p-4 border-2 relative" style={{ background: 'rgba(26,60,110,0.03)', borderColor: 'var(--brand-primary)' }}>
                    <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: 'var(--brand-primary)' }}></div>
                    <div className="flex items-center gap-4 pl-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,60,110,0.08)' }}>
                        <i className="fas fa-user-tie text-lg" style={{ color: 'var(--brand-primary)' }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{previewLawyer.userId?.name || 'Lawyer'}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2d8a5e]/10 text-[#2d8a5e] rounded-full text-[9px] font-bold">
                            <i className="fas fa-check text-[7px]"></i>Selected
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[11px] flex items-center gap-1" style={{ color: '#C9A84C' }}>
                            <i className="fas fa-star text-[8px]"></i>{previewLawyer.rating || 0}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{previewLawyer.experience || 0} yrs exp</span>
                          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>₹{(previewLawyer.consultationFee || 0).toLocaleString('en-IN')}</span>
                          {previewLawyer.specializations?.slice(0, 2).map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/lawyers/${previewLawyer._id}`} target="_blank" className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                          title="View Full Profile">
                          <i className="fas fa-external-link text-[9px]"></i>
                        </Link>
                        <button type="button" onClick={() => setFormData({ ...formData, lawyerId: '' })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-[#c0392b]/10 hover:text-[#c0392b] hover:border-[#c0392b]"
                          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                          title="Remove">
                          <i className="fas fa-xmark text-xs"></i>
                        </button>
                      </div>
                    </div>

                    {/* Info note */}
                    <div className="mt-3 ml-3 pl-3 flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)', borderLeft: '2px solid var(--border-default)' }}>
                      <i className="fas fa-info-circle text-[8px]"></i>
                      Your case request will be sent to this lawyer for review. They will accept or decline within 24–48 hours.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lawyer Grid */}
            {!previewLawyer && (
              <>
                {displayLawyers.length > 0 ? (
                  <>
                    <p className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <i className="fas fa-circle-info text-[9px]"></i>
                      {filteredLawyers.length > 0
                        ? `${filteredLawyers.length} lawyers match "${formData.category}"`
                        : `Showing all ${displayLawyers.length} available lawyers`
                      }
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {displayLawyers.slice(0, 10).map((l) => (
                        <button key={l._id} type="button" onClick={() => setFormData({ ...formData, lawyerId: l._id })}
                          className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 group hover:-translate-y-0.5"
                          style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-default)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ background: 'var(--bg-hover)' }}>
                              <i className="fas fa-user-tie text-sm" style={{ color: 'var(--text-secondary)' }}></i>
                            </div>
                            {l.isAvailable && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#2d8a5e] rounded-full" style={{ border: '2px solid var(--bg-card)' }}></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{l.userId?.name || 'Lawyer'}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#C9A84C' }}>
                                <i className="fas fa-star text-[7px]"></i>{l.rating || 0}
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{l.experience || 0}y</span>
                              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>₹{(l.consultationFee || 0).toLocaleString('en-IN')}</span>
                            </div>
                            {l.specializations?.length > 0 && (
                              <div className="flex gap-1 mt-1.5">
                                {l.specializations.slice(0, 2).map((s) => (
                                  <span key={s} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <i className="fas fa-plus text-[9px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--brand-primary)' }}></i>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-center py-6" style={{ color: 'var(--text-secondary)' }}>No lawyers available right now</p>
                )}

                <div className="mt-4 pt-4 flex items-center gap-2 text-[11px]" style={{ borderTop: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  <i className="fas fa-robot text-[9px]" style={{ color: '#C9A84C' }}></i>
                  <span>Not sure? Skip lawyer selection — the system will auto-match based on your category.</span>
                </div>
              </>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => navigate('/cases')} className="btn-ghost text-sm">
              <i className="fas fa-arrow-left text-xs"></i>Cancel
            </button>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: loading ? 'var(--text-secondary)' : 'var(--brand-primary)' }}>
              {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Creating...</>) : (<><i className="fas fa-folder-plus text-xs"></i>Create Case</>)}
            </motion.button>
          </div>
        </motion.form>
      </div>

      {/* ====== SUCCESS MODAL ====== */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>

              {/* Success Header */}
              <div className="relative px-6 py-8 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B2A, #1A3C6E)' }}>
                <div className="absolute top-[-30%] right-[-10%] w-40 h-40 rounded-full bg-[#C9A84C] opacity-[0.06] blur-[40px]" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-[#2d8a5e] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#2d8a5e]/30">
                  <i className="fas fa-check text-white text-2xl"></i>
                </motion.div>
                <h2 className="text-xl font-heading font-bold" style={{ color: '#ffffff' }}>Case Created Successfully!</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Your case has been filed and is pending review
                </p>
              </div>

              {/* Case Info */}
              <div className="px-6 py-5 space-y-4">
                {/* Case Details */}
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-hover)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                      <i className="fas fa-folder-open text-xs" style={{ color: 'var(--brand-primary)' }}></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {createdCase?.title || formData.title}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {formData.category} · {formData.priority} priority
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lawyer Info */}
                <div className="rounded-xl p-4 border-2" style={{ background: 'rgba(201,168,76,0.03)', borderColor: 'rgba(201,168,76,0.15)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: '#C9A84C' }}>
                    <i className="fas fa-paper-plane text-[8px]"></i>
                    Request Sent To
                  </p>

                  {(selectedLawyer || previewLawyer) ? (
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,60,110,0.08)', border: '1px solid var(--border-default)' }}>
                          <i className="fas fa-user-tie text-xl" style={{ color: 'var(--brand-primary)' }}></i>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#2d8a5e] rounded-full flex items-center justify-center" style={{ border: '2px solid var(--bg-card)' }}>
                          <i className="fas fa-check text-[6px] text-white"></i>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {(selectedLawyer || previewLawyer)?.userId?.name || 'Lawyer'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-[11px] flex items-center gap-1" style={{ color: '#C9A84C' }}>
                            <i className="fas fa-star text-[8px]"></i>
                            {(selectedLawyer || previewLawyer)?.rating || 0}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {(selectedLawyer || previewLawyer)?.experience || 0} yrs experience
                          </span>
                          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                            ₹{((selectedLawyer || previewLawyer)?.consultationFee || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {(selectedLawyer || previewLawyer)?.specializations?.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {(selectedLawyer || previewLawyer).specializations.slice(0, 3).map((s) => (
                              <span key={s} className="text-[9px] px-2 py-0.5 rounded-md font-medium" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                        <i className="fas fa-robot text-xl" style={{ color: '#C9A84C' }}></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Auto-Matching in Progress</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Our system is finding the best lawyer for your "{formData.category}" case
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 flex items-center gap-2 text-[10px]" style={{ borderTop: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    <i className="fas fa-clock text-[8px]" style={{ color: '#d4a017' }}></i>
                    The lawyer will review and respond within 24–48 hours
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-hover)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>What Happens Next</p>
                  <div className="space-y-3">
                    {[
                      { icon: 'fa-check-circle', color: '#2d8a5e', text: 'Case filed and pending review', done: true },
                      { icon: 'fa-eye', color: '#d4a017', text: 'Lawyer reviews your case details', done: false },
                      { icon: 'fa-handshake', color: 'var(--brand-primary)', text: 'Lawyer accepts and consultation begins', done: false },
                      { icon: 'fa-comments', color: 'var(--brand-primary)', text: 'Chat and video call become available', done: false },
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: step.done ? `${step.color}15` : 'var(--bg-card)' }}>
                          <i className={`fas ${step.icon} text-[10px]`} style={{ color: step.done ? step.color : 'var(--border-default)' }}></i>
                        </div>
                        <p className="text-xs" style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex items-center gap-3">
                <Link to={createdCase?._id ? `/cases/${createdCase._id}` : '/cases'} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'var(--brand-primary)' }}>
                  <i className="fas fa-folder-open text-xs"></i>
                  View Case
                </Link>
                <Link to="/cases" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                  <i className="fas fa-list text-xs"></i>
                  All Cases
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCase;