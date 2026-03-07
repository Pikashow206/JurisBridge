import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
};

const LawyerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/cases?status=pending');
      setRequests(data.data || []);
    } catch (err) { console.error('Fetch requests error:', err); }
    setLoading(false);
  };

  const handleAccept = async (caseId) => {
    setActionLoading(caseId + '_accept');
    try {
      await api.put(`/cases/${caseId}/accept`);
      toast.success('Case accepted! You can now communicate with the client.');
      setRequests((prev) => prev.filter((r) => r._id !== caseId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to accept case'); }
    setActionLoading('');
  };

  const handleReject = async (caseId) => {
    setActionLoading(caseId + '_reject');
    try {
      await api.put(`/cases/${caseId}/reject`, { reason: 'Not available at the moment' });
      toast.success('Case declined');
      setRequests((prev) => prev.filter((r) => r._id !== caseId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to decline case'); }
    setActionLoading('');
  };

  if (loading) return <Loader fullScreen text="Loading requests..." />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <PageHeader
        title="Case Requests"
        subtitle={`${requests.length} pending request${requests.length !== 1 ? 's' : ''}`}
        icon="fa-inbox"
        breadcrumbs={[{ label: 'Case Requests' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {requests.length === 0 ? (
          <EmptyState
            icon="fa-inbox"
            title="No Pending Requests"
            description="You don't have any pending case requests. New requests from clients will appear here."
          />
        ) : (
          <motion.div initial="hidden" animate="visible" className="space-y-4">
            {requests.map((req, idx) => (
              <motion.div key={req._id} custom={idx} variants={fadeUp}
                className="rounded-2xl border p-6 relative overflow-hidden group transition-all duration-300"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
              >
                {/* Priority indicator */}
                <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{
                  background: req.priority === 'urgent' ? '#c0392b' : req.priority === 'high' ? '#d4a017' : 'var(--brand-primary)',
                }}></div>

                {/* Top section */}
                <div className="flex items-start gap-5 pl-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-hover)' }}>
                    <i className="fas fa-folder-open text-sm" style={{ color: 'var(--brand-primary)' }}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{req.title}</h3>
                      {req.priority === 'urgent' && (
                        <span className="px-2 py-0.5 bg-[#c0392b]/10 text-[#c0392b] rounded-md text-[9px] font-bold uppercase">Urgent</span>
                      )}
                      {req.priority === 'high' && (
                        <span className="px-2 py-0.5 bg-[#d4a017]/10 text-[#d4a017] rounded-md text-[9px] font-bold uppercase">High</span>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{req.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        <i className="fas fa-tag text-[8px]" style={{ color: 'var(--brand-primary)' }}></i>{req.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        <i className="fas fa-calendar text-[8px]"></i>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {req.userId?.name && (
                        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          <i className="fas fa-user text-[8px]"></i>{req.userId.name}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleAccept(req._id)}
                        disabled={!!actionLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                        style={{ background: '#2d8a5e' }}>
                        {actionLoading === req._id + '_accept' ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <i className="fas fa-check text-[10px]"></i>}
                        Accept Case
                      </motion.button>

                      <button onClick={() => handleReject(req._id)} disabled={!!actionLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 disabled:opacity-50"
                        style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.background = 'rgba(192,57,43,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {actionLoading === req._id + '_reject' ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin"></div> : <i className="fas fa-xmark text-[10px]"></i>}
                        Decline
                      </button>

                      <Link to={`/cases/${req._id}`} className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--brand-primary)' }}>
                        View Details
                        <i className="fas fa-arrow-right text-[8px]"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LawyerRequests;