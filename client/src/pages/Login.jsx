import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(formData);
      navigate(data.user.role === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
    } catch (err) { /* handled */ }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[80px]" style={{ background: 'var(--brand-primary)' }} />
      <div className="absolute bottom-[-15%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]" style={{ background: '#C9A84C' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-[#0D1B2A] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#0D1B2A]/20">
            <i className="fas fa-gavel text-[#C9A84C] text-xl"></i>
          </motion.div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Sign in to your JurisBridge account</p>
        </div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="input-label">Email Address</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-envelope input-icon" style={{ color: focused === 'email' ? 'var(--brand-primary)' : undefined }}></i>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  className="input-field" placeholder="you@example.com" required autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-lock input-icon" style={{ color: focused === 'password' ? 'var(--brand-primary)' : undefined }}></i>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  className="input-field !pr-12" placeholder="Enter your password" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors" style={{ color: 'var(--text-secondary)' }} tabIndex={-1}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: isLoading ? 'var(--text-secondary)' : 'var(--brand-primary)' }}>
              {isLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Signing in...</>) : (<><i className="fas fa-right-to-bracket text-xs"></i>Sign In</>)}
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }}></div>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }}></div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--brand-primary)' }}>Create Account</Link>
            </p>
            <Link to="/register/lawyer" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}>
              <i className="fas fa-user-tie text-xs"></i>Register as a Lawyer
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;