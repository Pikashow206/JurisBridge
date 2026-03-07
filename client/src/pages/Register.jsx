import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', language: 'en' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await register(formData); navigate('/dashboard'); } catch (err) { /* handled */ }
  };

  // Password strength
  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(formData.password);
  const strengthColors = ['#c0392b', '#c0392b', '#d4a017', '#d4a017', '#2d8a5e', '#2d8a5e'];
  const strengthLabels = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-8%] w-[350px] h-[350px] rounded-full opacity-[0.03] blur-[80px]" style={{ background: '#C9A84C' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]" style={{ background: 'var(--brand-primary)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-[#0D1B2A] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#0D1B2A]/20">
            <i className="fas fa-user-plus text-[#C9A84C] text-xl"></i>
          </motion.div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Start your legal journey with JurisBridge</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-user input-icon" style={{ color: focused === 'name' ? 'var(--brand-primary)' : undefined }}></i>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                  className="input-field" placeholder="Enter your full name" required />
              </div>
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-envelope input-icon" style={{ color: focused === 'email' ? 'var(--brand-primary)' : undefined }}></i>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  className="input-field" placeholder="you@example.com" required autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-lock input-icon" style={{ color: focused === 'password' ? 'var(--brand-primary)' : undefined }}></i>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  className="input-field !pr-12" placeholder="Minimum 6 characters" minLength={6} required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-secondary)' }} tabIndex={-1}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
              {/* Strength meter */}
              {formData.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i < strength ? strengthColors[strength] : 'var(--border-default)' }}></div>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Phone <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>(Optional)</span></label>
              <div className="input-icon-wrapper">
                <i className="fas fa-phone input-icon" style={{ color: focused === 'phone' ? 'var(--brand-primary)' : undefined }}></i>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                  className="input-field" placeholder="Enter phone number" />
              </div>
            </div>
            <div>
              <label className="input-label">Preferred Language</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-language input-icon"></i>
                <select name="language" value={formData.language} onChange={handleChange} className="input-field appearance-none">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>

            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: isLoading ? 'var(--text-secondary)' : 'var(--brand-primary)' }}>
              {isLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Creating account...</>) : (<><i className="fas fa-arrow-right text-xs"></i>Create Account</>)}
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }}></div>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }}></div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--brand-primary)' }}>Sign In</Link></p>
            <Link to="/register/lawyer" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}><i className="fas fa-user-tie text-xs"></i>Register as a Lawyer</Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;