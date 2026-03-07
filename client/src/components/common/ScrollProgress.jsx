import { useState, useEffect } from 'react';

const ScrollProgress = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-24 right-6 w-10 h-10 rounded-xl flex items-center justify-center z-40 transition-all duration-300"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-md)',
          opacity: showBackToTop ? 1 : 0,
          pointerEvents: showBackToTop ? 'auto' : 'none',
          transform: showBackToTop ? 'translateY(0)' : 'translateY(20px)',
        }}
        title="Back to top"
      >
        <i className="fas fa-arrow-up text-xs"></i>
      </button>

      {/* Global Smooth Scroll CSS */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        
        * {
          scroll-behavior: smooth;
        }
        
        main {
          animation: pageSlideIn 0.35s ease-out;
        }
        
        @keyframes pageSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ScrollProgress;