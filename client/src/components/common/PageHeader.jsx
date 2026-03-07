const PageHeader = ({ title, subtitle, icon, breadcrumbs, actions }) => {
  return (
    <div className="border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mb-3 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            <a href="/dashboard" className="hover:underline transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              <i className="fas fa-home text-[9px]"></i>
            </a>
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <i className="fas fa-chevron-right text-[7px] opacity-40"></i>
                {crumb.to ? (
                  <a href={crumb.to} className="hover:underline transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    style={{ color: 'var(--text-muted)' }}>
                    {crumb.label}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-[#0D1B2A] to-[#1A3C6E] rounded-xl flex items-center justify-center shadow-lg shadow-[#0D1B2A]/10">
                <i className={`fas ${icon} text-[#C9A84C] text-base`}></i>
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;