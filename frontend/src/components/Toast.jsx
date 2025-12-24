import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: {
    bg: 'bg-[rgba(16,185,129,0.1)]',
    border: 'border-[var(--success)]',
    text: 'text-[var(--success)]',
    icon: 'text-[var(--success)]',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
  },
  error: {
    bg: 'bg-[rgba(239,68,68,0.1)]',
    border: 'border-[var(--error)]',
    text: 'text-[var(--error)]',
    icon: 'text-[var(--error)]',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]'
  },
  info: {
    bg: 'bg-[rgba(0,212,170,0.1)]',
    border: 'border-[var(--accent-primary)]',
    text: 'text-[var(--accent-primary)]',
    icon: 'text-[var(--accent-primary)]',
    glow: 'shadow-[0_0_20px_rgba(0,212,170,0.2)]'
  },
  warning: {
    bg: 'bg-[rgba(245,158,11,0.1)]',
    border: 'border-[var(--warning)]',
    text: 'text-[var(--warning)]',
    icon: 'text-[var(--warning)]',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
  },
};

export default function Toast({ type = 'info', message, onClose, duration = 5000 }) {
  const Icon = icons[type];
  const style = styles[type];

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm ${style.bg} ${style.border} ${style.glow} animate-slide-in`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${style.icon}`} />
      </div>
      <p className="flex-1 font-medium text-crypto-primary">{message}</p>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-crypto-hover rounded-lg transition text-crypto-muted hover:text-crypto-primary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
