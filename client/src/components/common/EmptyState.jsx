import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EmptyState = ({
  icon = 'fa-inbox',
  title = 'Nothing Here Yet',
  description = 'No data to display.',
  actionLabel,
  actionTo,
  actionIcon = 'fa-plus',
  actionClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
          <i className={`fas ${icon} text-3xl`} style={{ color: 'var(--border-default)' }}></i>
        </div>
        {/* Decorative ring */}
        <div className="absolute -inset-3 rounded-3xl border border-dashed opacity-30" style={{ borderColor: 'var(--border-default)' }}></div>
      </motion.div>

      <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-lg font-heading font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
        {title}
      </motion.h3>

      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-sm text-center max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </motion.p>

      {(actionLabel && (actionTo || actionClick)) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {actionTo ? (
            <Link to={actionTo}
              className="group inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'var(--brand-primary)' }}>
              <i className={`fas ${actionIcon} text-xs`}></i>
              {actionLabel}
              <i className="fas fa-arrow-right text-[9px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"></i>
            </Link>
          ) : (
            <button onClick={actionClick}
              className="group inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'var(--brand-primary)' }}>
              <i className={`fas ${actionIcon} text-xs`}></i>
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;