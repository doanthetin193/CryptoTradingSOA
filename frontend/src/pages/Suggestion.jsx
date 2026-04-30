import { useState, useCallback } from 'react';
import { sentimentAPI } from '../services/api';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Info,
  BarChart2,
  Newspaper,
} from 'lucide-react';
import Toast from '../components/Toast';

const SUPPORTED_COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

const SIGNAL_CONFIG = {
  BULLISH: {
    label: 'BULLISH — Tín hiệu tăng',
    icon: TrendingUp,
    cardClass: 'border-green-500/50 bg-green-500/5',
    badgeClass: 'bg-green-500/20 text-green-400 border border-green-500/40',
    iconClass: 'text-green-400',
    barColor: '#22c55e',
  },
  BEARISH: {
    label: 'BEARISH — Tín hiệu giảm',
    icon: TrendingDown,
    cardClass: 'border-red-500/50 bg-red-500/5',
    badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/40',
    iconClass: 'text-red-400',
    barColor: '#ef4444',
  },
  NEUTRAL: {
    label: 'NEUTRAL — Chưa có xu hướng',
    icon: Minus,
    cardClass: 'border-gray-500/50 bg-gray-500/5',
    badgeClass: 'bg-gray-500/20 text-gray-300 border border-gray-500/40',
    iconClass: 'text-gray-400',
    barColor: '#6b7280',
  },
  CAUTION: {
    label: 'CAUTION — Cẩn thận',
    icon: AlertTriangle,
    cardClass: 'border-yellow-500/50 bg-yellow-500/5',
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    iconClass: 'text-yellow-400',
    barColor: '#eab308',
  },
};

const SENTIMENT_LABEL = {
  positive: { label: 'Tích cực', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  negative: { label: 'Tiêu cực', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  neutral: { label: 'Trung lập', className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
};

function SentimentBar({ distribution, total }) {
  if (!total) return null;
  const pct = (v) => Math.round((v / total) * 100);
  return (
    <div className="space-y-2">
      {[
        { key: 'positive', label: 'Tích cực', color: 'bg-green-500' },
        { key: 'neutral', label: 'Trung lập', color: 'bg-gray-500' },
        { key: 'negative', label: 'Tiêu cực', color: 'bg-red-500' },
      ].map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs text-crypto-muted w-16 shrink-0">{label}</span>
          <div className="flex-1 bg-crypto-secondary rounded-full h-2">
            <div
              className={`${color} h-2 rounded-full transition-all duration-700`}
              style={{ width: `${pct(distribution?.[key] ?? 0)}%` }}
            />
          </div>
          <span className="text-xs text-white w-8 text-right">{distribution?.[key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

export default function Suggestion() {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSuggestion = useCallback(async (symbol) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await sentimentAPI.getSuggestion(symbol);
      if (res) {
        setResult(res);
      }
    } catch (err) {
      const msg = err.message || 'Không thể lấy dữ liệu';
      if (msg.includes('503') || msg.includes('unavailable')) {
        showToast('error', 'Sentiment Service chưa khởi động. Hãy chạy start-all-services.ps1');
      } else {
        showToast('error', msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCoinSelect = (symbol) => {
    setSelectedCoin(symbol);
    setDropdownOpen(false);
    fetchSuggestion(symbol);
  };

  const handleAnalyze = () => {
    fetchSuggestion(selectedCoin);
  };

  const signal = result ? SIGNAL_CONFIG[result.suggestion?.signal] ?? SIGNAL_CONFIG.NEUTRAL : null;
  const SignalIcon = signal?.icon ?? BrainCircuit;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <BrainCircuit className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Trade Suggestion</h1>
          <p className="text-sm text-crypto-muted">Phân tích tâm lý tin tức + biến động giá bằng FinBERT AI</p>
        </div>
      </div>

      {/* Selector */}
      <div className="crypto-card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <span className="text-sm text-crypto-muted shrink-0">Chọn coin:</span>

        {/* Custom dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-crypto-secondary border border-crypto rounded-lg text-white hover:border-blue-500/50 transition-colors min-w-[110px]"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className="font-semibold">{selectedCoin}</span>
            <ChevronDown className="w-4 h-4 text-crypto-muted ml-auto" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-crypto-secondary border border-crypto rounded-lg shadow-xl z-10 w-36">
              {SUPPORTED_COINS.map((s) => (
                <button
                  key={s}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg ${s === selectedCoin ? 'text-blue-400 font-semibold' : 'text-white'}`}
                  onClick={() => handleCoinSelect(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <BrainCircuit className="w-4 h-4" />
          )}
          {loading ? 'Đang phân tích...' : 'Phân tích'}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="crypto-card p-6 h-40 bg-crypto-secondary/50" />
          <div className="grid grid-cols-2 gap-4">
            <div className="crypto-card p-4 h-28 bg-crypto-secondary/50" />
            <div className="crypto-card p-4 h-28 bg-crypto-secondary/50" />
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Main signal card */}
          <div className={`crypto-card p-6 border-2 ${signal.cardClass} space-y-4`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-black/20`}>
                <SignalIcon className={`w-8 h-8 ${signal.iconClass}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${signal.badgeClass}`}>
                    {result.suggestion.signal}
                  </span>
                  <span className="text-white font-semibold text-lg">{result.suggestion.title}</span>
                </div>
                <p className="text-crypto-muted text-sm leading-relaxed">{result.suggestion.reason}</p>
                <p className="text-crypto-muted/70 text-xs mt-2">{result.suggestion.detail}</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price info */}
            <div className="crypto-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                Giá thị trường
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  ${result.price.current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-sm font-medium mt-1 ${result.price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.price.change24h >= 0 ? '+' : ''}{result.price.change24h.toFixed(2)}% (24h)
                </div>
              </div>
            </div>

            {/* Sentiment info */}
            <div className="crypto-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Newspaper className="w-4 h-4 text-purple-400" />
                Tâm lý tin tức ({result.sentiment.articleCount} bài)
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SENTIMENT_LABEL[result.sentiment.label]?.className}`}>
                  {SENTIMENT_LABEL[result.sentiment.label]?.label ?? result.sentiment.label}
                </span>
                <span className="text-white font-semibold">{Math.round(result.sentiment.score * 100)}% confidence</span>
              </div>
              <SentimentBar
                distribution={result.sentiment.distribution}
                total={result.sentiment.articleCount}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <Info className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-400/80">{result.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="crypto-card p-12 text-center space-y-3">
          <BrainCircuit className="w-12 h-12 text-crypto-muted mx-auto" />
          <p className="text-white font-medium">Chọn coin và nhấn Phân tích</p>
          <p className="text-sm text-crypto-muted">AI sẽ kết hợp giá thực + tâm lý tin tức để đưa ra nhận định</p>
        </div>
      )}
    </div>
  );
}
