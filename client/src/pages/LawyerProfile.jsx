import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }) };

const LawyerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isLawyer } = useAuthStore();
  const [lawyer, setLawyer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const { data } = await api.get(`/lawyers/${id}`);
        // API returns: data.data = { lawyer: {...}, reviews: [...] }
        const lawyerData = data.data?.lawyer || data.data;
        const reviewsData = data.data?.reviews || [];
        setLawyer(lawyerData);
        setReviews(reviewsData);
      } catch (err) { toast.error('Failed to load profile'); navigate('/lawyers'); }
      setLoading(false);
    };
    fetchLawyer();
  }, [id, navigate]);

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0;
    const stars = [];
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<i key={i} className="fas fa-star text-[#C9A84C] text-sm"></i>);
      else if (i === full && half) stars.push(<i key={i} className="fas fa-star-half-stroke text-[#C9A84C] text-sm"></i>);
      else stars.push(<i key={i} className="fas fa-star text-sm" style={{ color: 'rgba(255,255,255,0.15)' }}></i>);
    }
    return stars;
  };

  if (loading) return <Loader fullScreen text="Loading profile..." />;
  if (!lawyer) return null;

  // ====== EXACT DATA MAPPING (matched to your API) ======
  const name = lawyer.userId?.name || 'Lawyer';
  const email = lawyer.userId?.email || '';
  const phone = lawyer.userId?.phone || '';
  const city = lawyer.userId?.location?.city || '';
  const state = lawyer.userId?.location?.state || '';
  const location = [city, state].filter(Boolean).join(', ');
  const rating = lawyer.rating || 0;
  const totalReviews = lawyer.totalReviews || 0;
  const experience = lawyer.experience || 0;
  const fee = lawyer.consultationFee || 0;
  const totalCases = lawyer.totalCases || 0;
  const bio = lawyer.bio || '';
  const barCouncil = lawyer.barCouncilNumber || '';
  const court = lawyer.courtPractice || '';
  const education = lawyer.education || '';
  const specializations = lawyer.specializations || [];
  const languages = lawyer.languages || [];
  const isAvailable = lawyer.isAvailable || false;
  const isVerified = lawyer.isVerified || false;

  const tabs = [
    { key: 'about', label: 'About', icon: 'fa-user' },
    { key: 'specializations', label: 'Expertise', icon: 'fa-scale-balanced' },
    { key: 'reviews', label: `Reviews (${totalReviews})`, icon: 'fa-star' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ====== HERO ====== */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B2A, #1A3C6E)' }}>
        <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#C9A84C] opacity-[0.04] blur-[80px]" />
        <div className="absolute bottom-[-40%] left-[-5%] w-[300px] h-[300px] rounded-full bg-white opacity-[0.03] blur-[60px]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 relative z-10">
          <Link to="/lawyers" className="inline-flex items-center gap-2 text-xs mb-6 transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
            <i className="fas fa-arrow-left text-[9px]"></i>Back to Lawyers
          </Link>

          <motion.div initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <motion.div custom={0} variants={fadeUp} className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-xl"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                <i className="fas fa-user-tie text-4xl" style={{ color: 'rgba(255,255,255,0.5)' }}></i>
              </div>
              {isAvailable && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2d8a5e] rounded-full flex items-center justify-center"
                  style={{ border: '3px solid #0D1B2A', boxShadow: '0 0 10px rgba(45,138,94,0.4)' }}>
                  <i className="fas fa-check text-[8px]" style={{ color: '#ffffff' }}></i>
                </span>
              )}
            </motion.div>

            {/* Info */}
            <motion.div custom={1} variants={fadeUp} className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold" style={{ color: '#ffffff' }}>{name}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(45,138,94,0.2)', color: '#4ade80' }}>
                    <i className="fas fa-circle-check text-[8px]"></i>Verified
                  </span>
                )}
              </div>

              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {[barCouncil && `Bar Council: ${barCouncil}`, court, location].filter(Boolean).join(' · ') || 'Legal Professional'}
              </p>

              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
                <span className="text-base font-bold" style={{ color: '#C9A84C' }}>{rating.toFixed(1)}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>({totalReviews} reviews)</span>
              </div>

              {/* Quick Stats */}
              <motion.div custom={2} variants={fadeUp} className="flex flex-wrap items-center gap-3">
                {[
                  { icon: 'fa-briefcase', value: `${experience} yrs`, label: 'Experience' },
                  { icon: 'fa-indian-rupee-sign', value: `₹${fee.toLocaleString('en-IN')}`, label: 'Consultation' },
                  { icon: 'fa-folder', value: totalCases, label: 'Cases' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <i className={`fas ${s.icon} text-xs`} style={{ color: '#C9A84C' }}></i>
                    <div>
                      <p className="text-sm font-bold leading-tight" style={{ color: '#ffffff' }}>{s.value}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* CTA */}
            {token && !isLawyer() && (
              <motion.div custom={3} variants={fadeUp} className="flex-shrink-0">
                <Link to="/cases/new" className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#d4b96e] rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:-translate-y-0.5" style={{ color: '#0D1B2A' }}>
                  <i className="fas fa-folder-plus text-xs"></i>Hire This Lawyer
                  <i className="fas fa-arrow-right text-[9px] transition-transform group-hover:translate-x-1"></i>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-12 relative z-20">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all duration-200"
              style={{
                background: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--bg-card)',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                borderColor: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--border-default)',
                boxShadow: activeTab === tab.key ? '0 4px 12px rgba(26,60,110,0.2)' : 'var(--shadow-sm)',
              }}>
              <i className={`fas ${tab.icon} text-[10px]`}></i>{tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Bio */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <i className="fas fa-user text-[9px]"></i>About
                  </h3>
                  {bio ? (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{bio}</p>
                  ) : (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No bio provided yet</p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <i className="fas fa-info-circle text-[9px]"></i>Professional Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'fa-briefcase', label: 'Experience', value: `${experience} years` },
                      { icon: 'fa-indian-rupee-sign', label: 'Consultation Fee', value: `₹${fee.toLocaleString('en-IN')}` },
                      { icon: 'fa-id-card', label: 'Bar Council', value: barCouncil },
                      { icon: 'fa-building-columns', label: 'Court Practice', value: court },
                      { icon: 'fa-graduation-cap', label: 'Education', value: education },
                      { icon: 'fa-location-dot', label: 'Location', value: location },
                      { icon: 'fa-folder-open', label: 'Cases Handled', value: totalCases.toString() },
                      { icon: 'fa-star', label: 'Rating', value: `${rating.toFixed(1)} (${totalReviews} reviews)` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-card)' }}>
                          <i className={`fas ${item.icon} text-[10px]`} style={{ color: '#C9A84C' }}></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                          <p className="text-sm font-semibold truncate" style={{ color: item.value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {item.value || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Specializations Tab */}
            {activeTab === 'specializations' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <i className="fas fa-scale-balanced text-[9px]"></i>Areas of Expertise
                </h3>
                {specializations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {specializations.map((spec, idx) => (
                      <motion.div key={spec} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,60,110,0.08)' }}>
                          <i className="fas fa-scale-balanced text-[10px]" style={{ color: 'var(--brand-primary)' }}></i>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{spec}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>No specializations listed</p>
                )}
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {reviews.length > 0 ? reviews.map((review, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                    className="rounded-2xl border p-5 relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: (review.rating || 0) >= 4 ? '#C9A84C' : (review.rating || 0) >= 3 ? '#2980b9' : '#8494A7' }}></div>
                    <div className="pl-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                            <i className="fas fa-user text-[10px]" style={{ color: 'var(--text-secondary)' }}></i>
                          </div>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{review.userId?.name || 'Client'}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : 'Verified Client'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star text-[9px] ${i < (review.rating || 0) ? 'text-[#C9A84C]' : ''}`}
                              style={i >= (review.rating || 0) ? { color: 'var(--border-default)' } : {}}></i>
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>"{review.comment}"</p>}
                    </div>
                  </motion.div>
                )) : (
                  <div className="rounded-2xl border p-10 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                    <i className="fas fa-star text-2xl mb-3" style={{ color: 'var(--border-default)' }}></i>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ====== SIDEBAR ====== */}
          <div className="space-y-5">
            {/* Contact */}
            <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Contact</h3>
              <div className="space-y-3">
                {[
                  { icon: 'fa-envelope', label: 'Email', value: email },
                  { icon: 'fa-phone', label: 'Phone', value: phone },
                  { icon: 'fa-location-dot', label: 'Location', value: location },
                  { icon: 'fa-graduation-cap', label: 'Education', value: education },
                  { icon: 'fa-id-card', label: 'Bar Council', value: barCouncil },
                ].map((c) => (
                  <div key={c.icon} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-hover)' }}>
                      <i className={`fas ${c.icon} text-[10px]`} style={{ color: 'var(--text-secondary)' }}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
                      <p className="text-xs font-medium truncate" style={{ color: c.value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {c.value || 'Not provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <span key={lang} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>{lang}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations Quick View */}
            {specializations.length > 0 && (
              <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <span key={spec} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border"
                      style={{ background: 'rgba(26,60,110,0.05)', borderColor: 'rgba(26,60,110,0.1)', color: 'var(--brand-primary)' }}>{spec}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-[#2d8a5e] animate-pulse' : 'bg-[#8494A7]'}`}
                  style={isAvailable ? { boxShadow: '0 0 8px rgba(45,138,94,0.4)' } : {}}></span>
                <span className="text-sm font-semibold" style={{ color: isAvailable ? '#2d8a5e' : 'var(--text-secondary)' }}>
                  {isAvailable ? 'Available for Consultation' : 'Currently Unavailable'}
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                {isAvailable ? 'Accepting new cases right now' : 'Check back later or browse other lawyers'}
              </p>
              {isAvailable && token && !isLawyer() && (
                <Link to="/cases/new" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: 'var(--brand-primary)', color: '#ffffff' }}>
                  <i className="fas fa-folder-plus"></i>File a Case
                </Link>
              )}
              {!token && (
                <Link to="/login" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                  <i className="fas fa-right-to-bracket text-[10px]"></i>Sign in to Hire
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;