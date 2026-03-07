import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const Navbar = () => {
  const { user, token, logout, isLawyer } = useAuthStore();
  const { darkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for glass effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };
  const closeMobile = () => setMobileOpen(false);
  const isActive = (path) => location.pathname === path;

  const navLink = (path, icon, label) => (
    <Link to={path} onClick={closeMobile}
      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
        isActive(path) ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
      }`}>
      {/* Active indicator glow */}
      {isActive(path) && (
        <span className="absolute inset-0 rounded-xl bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
      )}
      <i className={`fas ${icon} text-[10px] relative z-10 ${isActive(path) ? 'text-[#C9A84C]' : ''}`}></i>
      <span className="relative z-10">{label}</span>
    </Link>
  );

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-black/10' : ''
    }`} style={{
      background: scrolled ? 'rgba(13,27,42,0.92)' : '#0D1B2A',
      backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#C9A84C] to-[#d4b96e] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#C9A84C]/20">
              <i className="fas fa-gavel text-[#0D1B2A] text-sm"></i>
            </div>
            <div className="leading-tight">
              <span className="text-lg font-heading font-bold text-white tracking-wide">
                Juris<span className="text-[#C9A84C]">Bridge</span>
              </span>
              <span className="hidden sm:block text-[9px] text-[#8494A7] font-medium tracking-wider uppercase">
                AI Legal Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!token ? (
              <>
                {navLink('/lawyers', 'fa-scale-balanced', 'Find Lawyers')}
                {navLink('/login', 'fa-right-to-bracket', 'Sign In')}
                <Link to="/register" className="ml-3 px-5 py-2 bg-gradient-to-r from-[#C9A84C] to-[#d4b96e] hover:from-[#d4b96e] hover:to-[#C9A84C] text-[#0D1B2A] rounded-xl text-[13px] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A84C]/20 hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {navLink('/dashboard', 'fa-grid-2', 'Dashboard')}
                {navLink('/jurispilot', 'fa-microchip', 'JurisPilot')}
                {isLawyer() ? (
                  <>
                    {navLink('/lawyer/requests', 'fa-inbox', 'Requests')}
                    {navLink('/cases', 'fa-folder-open', 'Cases')}
                  </>
                ) : (
                  <>
                    {navLink('/cases', 'fa-folder-open', 'Cases')}
                    {navLink('/documents', 'fa-file-lines', 'Documents')}
                    {navLink('/notices', 'fa-scroll', 'Notices')}
                  </>
                )}
                {navLink('/lawyers', 'fa-user-tie', 'Lawyers')}
              </>
            )}

            {/* Theme Toggle */}
            <button onClick={toggleTheme}
              className="ml-2 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all duration-300 hover:rotate-12"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
            </button>

            {/* User + Logout */}
            {token && (
              <div className="ml-2 pl-3 border-l border-white/10 flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A3C6E] to-[#3B6CB5] flex items-center justify-center shadow-sm">
                    <span className="text-white text-[10px] font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="text-right leading-tight">
                    <p className="text-white text-xs font-medium">{user?.name?.split(' ')[0]}</p>
                    <p className="text-[#8494A7] text-[9px] capitalize">{user?.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c0392b] text-white/50 hover:text-white flex items-center justify-center transition-all duration-200"
                  title="Sign Out">
                  <i className="fas fa-right-from-bracket text-xs"></i>
                </button>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white"><i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-sm`}></i></button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white">
              <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 pb-4" style={{ background: 'rgba(13,27,42,0.98)', backdropFilter: 'blur(16px)' }}>
          <div className="px-4 pt-3 space-y-1">
            {!token ? (
              <>
                {navLink('/lawyers', 'fa-scale-balanced', 'Find Lawyers')}
                {navLink('/login', 'fa-right-to-bracket', 'Sign In')}
                <Link to="/register" onClick={closeMobile} className="block text-center mt-3 px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#d4b96e] text-[#0D1B2A] rounded-xl text-sm font-bold">Get Started</Link>
              </>
            ) : (
              <>
                {navLink('/dashboard', 'fa-grid-2', 'Dashboard')}
                {navLink('/jurispilot', 'fa-microchip', 'JurisPilot')}
                {navLink('/cases', 'fa-folder-open', 'Cases')}
                {!isLawyer() && <>{navLink('/documents', 'fa-file-lines', 'Documents')}{navLink('/notices', 'fa-scroll', 'Notices')}</>}
                {isLawyer() && navLink('/lawyer/requests', 'fa-inbox', 'Requests')}
                {navLink('/lawyers', 'fa-user-tie', 'Lawyers')}
                <button onClick={handleLogout} className="w-full mt-3 flex items-center gap-2 px-3 py-2.5 bg-[#c0392b]/90 text-white rounded-xl text-sm font-medium">
                  <i className="fas fa-right-from-bracket text-xs"></i>Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;