import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto relative overflow-hidden" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)' }}>
      {/* Subtle gradient decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C9A84C] to-[#d4b96e] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A84C]/15">
                <i className="fas fa-gavel text-[#0D1B2A] text-sm"></i>
              </div>
              <span className="text-xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
                Juris<span style={{ color: '#C9A84C' }}>Bridge</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
              AI-powered legal assistance connecting citizens with verified lawyers.
              Featuring JurisPilot AI for instant guidance, document analysis, voice input,
              video consultations, and secure Razorpay payments.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: 'fa-twitter', hover: '#1DA1F2' },
                { icon: 'fa-linkedin-in', hover: '#0A66C2' },
                { icon: 'fa-github', hover: '#ffffff' },
              ].map((s) => (
                <a key={s.icon} href="#" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border"
                  style={{ background: 'transparent', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.hover; e.currentTarget.style.color = s.hover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <i className={`fab ${s.icon} text-xs`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-4" style={{ color: '#C9A84C' }}>Platform</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/lawyers', icon: 'fa-user-tie', label: 'Find Lawyers' },
                { to: '/jurispilot', icon: 'fa-microchip', label: 'JurisPilot AI' },
                { to: '/documents', icon: 'fa-file-lines', label: 'Document Analysis' },
                { to: '/notices', icon: 'fa-scroll', label: 'Legal Notices' },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="group text-sm flex items-center gap-2.5 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    <i className={`fas ${item.icon} text-[10px] w-4 text-center group-hover:scale-110 transition-transform`} style={{ color: 'rgba(201,168,76,0.4)' }}></i>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-4" style={{ color: '#C9A84C' }}>Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 relative" style={{ borderTop: '1px solid var(--border-default)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} JurisBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5"><i className="fas fa-microchip" style={{ color: 'rgba(201,168,76,0.4)' }}></i>JurisPilot AI</span>
            <span className="flex items-center gap-1.5"><i className="fas fa-shield-halved" style={{ color: 'rgba(201,168,76,0.4)' }}></i>SHA256 Secured</span>
            <span className="flex items-center gap-1.5"><i className="fas fa-credit-card" style={{ color: 'rgba(201,168,76,0.4)' }}></i>Razorpay Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;