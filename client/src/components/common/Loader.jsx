const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-[3px] animate-spin" style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--brand-primary)' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full" style={{ background: 'var(--bg-hover)' }}>
            <i className="fas fa-gavel text-[8px] flex items-center justify-center w-full h-full" style={{ color: '#C9A84C' }}></i>
          </div>
        </div>
      </div>
      <p className="text-xs font-medium animate-pulse" style={{ color: 'var(--text-secondary)' }}>{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
};

export default Loader;