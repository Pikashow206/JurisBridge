import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const SPECIALIZATIONS = [
  'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Litigation',
  'Cyber Law', 'Property Law', 'Employment Law', 'Intellectual Property',
  'Consumer Rights', 'Tax Law', 'Immigration Law', 'Constitutional Law',
];

const RegisterLawyer = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    barCouncilNumber: '', specializations: [], experience: '',
    consultationFee: '', bio: '', education: '', courtPractice: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [currentSection, setCurrentSection] = useState(1);
  const { registerLawyer, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSpec = (spec) => {
    const c = formData.specializations;
    setFormData({ ...formData, specializations: c.includes(spec) ? c.filter((s) => s !== spec) : [...c, spec] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerLawyer({ ...formData, experience: parseInt(formData.experience), consultationFee: parseFloat(formData.consultationFee) });
      navigate('/lawyer/dashboard');
    } catch (err) {}
  };

  const canProceed1 = formData.name && formData.email && formData.password;
  const canProceed2 = formData.barCouncilNumber && formData.experience && formData.consultationFee && formData.specializations.length > 0;

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[80px]" style={{ background: '#C9A84C' }} />
      <div className="absolute bottom-[-15%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]" style={{ background: 'var(--brand-primary)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-[#0D1B2A] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#0D1B2A]/20">
            <i className="fas fa-user-tie text-[#C9A84C] text-xl"></i>
          </motion.div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Lawyer Registration</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Join the JurisBridge network of verified professionals</p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[
            { num: 1, label: 'Personal Info', icon: 'fa-user' },
            { num: 2, label: 'Professional', icon: 'fa-briefcase' },
          ].map((s) => (
            <button key={s.num} onClick={() => setCurrentSection(s.num)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                background: currentSection === s.num ? 'var(--brand-primary)' : 'var(--bg-card)',
                color: currentSection === s.num ? '#fff' : 'var(--text-secondary)',
                borderColor: currentSection === s.num ? 'var(--brand-primary)' : 'var(--border-default)',
                boxShadow: currentSection === s.num ? '0 4px 12px rgba(26,60,110,0.2)' : 'none',
              }}>
              <i className={`fas ${s.icon} text-[10px]`}></i>{s.label}
              {s.num === 1 && canProceed1 && <i className="fas fa-check text-[8px] ml-1 text-[#2d8a5e]"></i>}
              {s.num === 2 && canProceed2 && <i className="fas fa-check text-[8px] ml-1 text-[#2d8a5e]"></i>}
            </button>
          ))}
        </div>

        {/* Card */}
        <motion.div layout className="rounded-2xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit}>

            {/* Section 1: Personal */}
            {currentSection === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <div className="input-icon-wrapper">
                      <i className="fas fa-user input-icon" style={{ color: focused === 'name' ? 'var(--brand-primary)' : undefined }}></i>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} onFocus={() => setFocused('name')} onBlur={() => setFocused('')} className="input-field" placeholder="Adv. Full Name" required />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Email *</label>
                    <div className="input-icon-wrapper">
                      <i className="fas fa-envelope input-icon" style={{ color: focused === 'email' ? 'var(--brand-primary)' : undefined }}></i>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} className="input-field" placeholder="lawyer@example.com" required autoComplete="email" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Password *</label>
                    <div className="input-icon-wrapper">
                      <i className="fas fa-lock input-icon" style={{ color: focused === 'password' ? 'var(--brand-primary)' : undefined }}></i>
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} className="input-field !pr-12" placeholder="Min 6 characters" minLength={6} required autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-secondary)' }} tabIndex={-1}>
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Phone</label>
                    <div className="input-icon-wrapper">
                      <i className="fas fa-phone input-icon"></i>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="Phone number" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <motion.button type="button" onClick={() => setCurrentSection(2)} disabled={!canProceed1} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:-translate-y-0.5" style={{ background: 'var(--brand-primary)' }}>
                    Next: Professional <i className="fas fa-arrow-right text-xs"></i>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Section 2: Professional */}
            {currentSection === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Bar Council Number *</label>
                    <input type="text" name="barCouncilNumber" value={formData.barCouncilNumber} onChange={handleChange} className="input-field" placeholder="e.g. MH/1234/2020" required />
                  </div>
                  <div>
                    <label className="input-label">Experience (years) *</label>
                    <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="input-field" placeholder="e.g. 8" min={0} max={60} required />
                  </div>
                  <div>
                    <label className="input-label">Consultation Fee (₹) *</label>
                    <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="input-field" placeholder="e.g. 1500" min={0} required />
                  </div>
                  <div>
                    <label className="input-label">Court Practice</label>
                    <select name="courtPractice" value={formData.courtPractice} onChange={handleChange} className="input-field">
                      <option value="">Select court</option>
                      <option value="Supreme Court">Supreme Court</option>
                      <option value="High Court">High Court</option>
                      <option value="District Court">District Court</option>
                    </select>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <label className="input-label mb-3">Specializations * <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>({formData.specializations.length} selected)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => {
                      const selected = formData.specializations.includes(spec);
                      return (
                        <motion.button key={spec} type="button" onClick={() => handleSpec(spec)} whileTap={{ scale: 0.95 }}
                          className="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200"
                          style={{
                            background: selected ? 'var(--brand-primary)' : 'transparent',
                            color: selected ? '#fff' : 'var(--text-secondary)',
                            borderColor: selected ? 'var(--brand-primary)' : 'var(--border-default)',
                            boxShadow: selected ? '0 2px 8px rgba(26,60,110,0.15)' : 'none',
                          }}>
                          {selected && <i className="fas fa-check mr-1.5 text-[9px]"></i>}{spec}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="input-label">Education</label>
                  <input type="text" name="education" value={formData.education} onChange={handleChange} className="input-field" placeholder="e.g. LLM, Delhi University" />
                </div>
                <div>
                  <label className="input-label">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} className="input-field" rows={3} placeholder="Brief description of your practice..." maxLength={500} />
                  <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{formData.bio.length}/500</p>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <button type="button" onClick={() => setCurrentSection(1)} className="btn-ghost text-sm">
                    <i className="fas fa-arrow-left text-xs"></i>Back
                  </button>
                  <motion.button type="submit" disabled={isLoading || !canProceed2} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: isLoading ? 'var(--text-secondary)' : 'var(--brand-primary)' }}>
                    {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Registering...</> : <><i className="fas fa-user-check text-xs"></i>Register as Lawyer</>}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }}></div>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }}></div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already registered? <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--brand-primary)' }}>Sign In</Link>
              <span className="mx-2" style={{ color: 'var(--border-default)' }}>|</span>
              <Link to="/register" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Register as User</Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterLawyer;