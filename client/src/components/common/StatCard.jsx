import { motion } from 'framer-motion';

const accentConfig = {
  primary: { gradient: 'from-[#1A3C6E] to-[#3B6CB5]', glow: 'rgba(26,60,110,0.08)' },
  gold: { gradient: 'from-[#C9A84C] to-[#d4b96e]', glow: 'rgba(201,168,76,0.08)' },
  success: { gradient: 'from-[#2d8a5e] to-[#3da673]', glow: 'rgba(45,138,94,0.08)' },
  info: { gradient: 'from-[#2980b9] to-[#5dade2]', glow: 'rgba(41,128,185,0.08)' },
  danger: { gradient: 'from-[#c0392b] to-[#e74c3c]', glow: 'rgba(192,57,43,0.08)' },
};

const StatCard = ({ icon, label, value, accent = 'primary', change, suffix = '' }) => {
  const a = accentConfig[accent] || accentConfig.primary;

  return (
    <div className="group rounded-2xl border p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}>

      {/* Corner glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${a.gradient} opacity-[0.04] group-hover:opacity-[0.1] rounded-bl-full transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-11 h-11 bg-gradient-to-br ${a.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <i className={`fas ${icon} text-white text-sm`}></i>
          </div>
          {change !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${change >= 0 ? 'text-[#2d8a5e] bg-[#2d8a5e]/10' : 'text-[#c0392b] bg-[#c0392b]/10'}`}>
              <i className={`fas fa-arrow-${change >= 0 ? 'up' : 'down'} text-[7px] mr-0.5`}></i>
              {Math.abs(change)}%
            </span>
          )}
        </div>

        <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}
          className="text-2xl font-heading font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </motion.p>
        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;