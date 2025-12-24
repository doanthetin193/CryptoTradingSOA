import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketAPI } from '../services/api';
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import Toast from '../components/Toast';

export default function CoinDetail() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState(7);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCoinData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId, timeframe]);

  const fetchCoinData = async () => {
    try {
      setLoading(true);

      const priceRes = await marketAPI.getCoinPrice(coinId);

      if (priceRes.success) {
        setCoin(priceRes.data);
      } else {
        showToast('error', 'Không thể tải giá coin');
      }

      const chartRes = await marketAPI.getChartData(coinId, timeframe);

      if (chartRes.success && chartRes.data) {
        const prices = chartRes.data.prices || [];

        if (prices.length > 0) {
          const transformedData = prices.map((item) => ({
            timestamp: item.timestamp,
            date: new Date(item.timestamp).toLocaleDateString('vi-VN', {
              month: 'short',
              day: 'numeric',
              hour: timeframe === 1 ? '2-digit' : undefined,
            }),
            price: parseFloat(item.price.toFixed(2)),
          }));
          setChartData(transformedData);
        } else {
          setChartData([]);
        }
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching coin data:', error);
      showToast('error', 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
          </div>
          <p className="text-crypto-secondary">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="crypto-card text-center py-20">
        <BarChart3 className="w-16 h-16 text-crypto-muted opacity-30 mx-auto mb-4" />
        <p className="text-crypto-muted mb-4">Không tìm thấy coin</p>
        <button
          onClick={() => navigate('/trade')}
          className="crypto-btn crypto-btn-primary"
        >
          Quay lại Trade
        </button>
      </div>
    );
  }

  const timeframes = [
    { label: '1D', value: 1 },
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ];

  const isPositive = coin.change24h >= 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 min-w-[300px]">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trade')}
            className="p-2.5 hover:bg-crypto-card rounded-xl transition border border-transparent hover:border-crypto"
          >
            <ArrowLeft className="w-6 h-6 text-crypto-secondary" />
          </button>
          <div className="flex items-center gap-4">
            <div className={`coin-icon text-white text-xl ${isPositive
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : 'bg-gradient-to-br from-red-400 to-rose-500'
              }`}>
              {coin.symbol?.substring(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-crypto-primary capitalize">{coin.name}</h1>
                <span className="text-xl text-crypto-muted">{coin.symbol}</span>
              </div>
              <p className="text-crypto-muted text-sm mt-1">#{coin.marketCapRank || 'N/A'} by Market Cap</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchCoinData}
          className="crypto-btn crypto-btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Price Overview */}
      <div className="crypto-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Current Price */}
          <div className="stat-card">
            <p className="text-sm text-crypto-muted mb-2">Giá hiện tại</p>
            <p className="text-3xl font-bold text-gradient-crypto">${coin.price?.toLocaleString()}</p>
            <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'price-up' : 'price-down'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{coin.change24h?.toFixed(2)}%
              </span>
              <span className="text-sm text-crypto-muted">24h</span>
            </div>
          </div>

          {/* Volume 24h */}
          <div className="stat-card">
            <p className="text-sm text-crypto-muted mb-2">Volume 24h</p>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-crypto-accent" />
              <p className="text-xl font-bold text-crypto-primary">
                ${coin.volume24h ? (coin.volume24h / 1e9).toFixed(2) + 'B' : 'N/A'}
              </p>
            </div>
          </div>

          {/* Market Cap */}
          <div className="stat-card">
            <p className="text-sm text-crypto-muted mb-2">Market Cap</p>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
              <p className="text-xl font-bold text-crypto-primary">
                ${coin.marketCap ? (coin.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={() => navigate(`/trade?coin=${coinId}`)}
              className="crypto-btn crypto-btn-primary w-full py-4"
            >
              <Zap className="w-5 h-5" />
              <span>Giao dịch {coin.symbol}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="crypto-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-xl font-bold text-crypto-primary">Biểu đồ giá</h2>
          </div>
          <div className="flex gap-2 p-1 bg-crypto-secondary border border-crypto rounded-xl">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${timeframe === tf.value
                    ? 'bg-gradient-crypto text-black'
                    : 'text-crypto-muted hover:text-crypto-primary'
                  }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#00d4aa' : '#EF4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#00d4aa' : '#EF4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                style={{ fontSize: '12px' }}
                tickMargin={10}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                tickMargin={10}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Giá']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#00d4aa' : '#EF4444'}
                strokeWidth={2}
                fill="url(#colorPrice)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-crypto-muted">Không có dữ liệu biểu đồ</p>
          </div>
        )}
      </div>

      {/* Price Statistics */}
      <div className="crypto-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.1)] flex items-center justify-center">
            <Activity className="w-5 h-5 text-crypto-accent" />
          </div>
          <h2 className="text-xl font-bold text-crypto-primary">Thống kê giá</h2>
        </div>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between py-4 px-4 bg-crypto-secondary rounded-xl border border-crypto">
              <span className="text-crypto-muted">Giá cao nhất {timeframe}D</span>
              <span className="font-bold text-[var(--success)]">
                ${Math.max(...chartData.map(d => d.price)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-4 px-4 bg-crypto-secondary rounded-xl border border-crypto">
              <span className="text-crypto-muted">Giá thấp nhất {timeframe}D</span>
              <span className="font-bold text-[var(--error)]">
                ${Math.min(...chartData.map(d => d.price)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-4 px-4 bg-crypto-secondary rounded-xl border border-crypto">
              <span className="text-crypto-muted">Biến động 24h</span>
              <span className={`font-bold ${isPositive ? 'price-up' : 'price-down'}`}>
                {isPositive ? '+' : ''}{coin.change24h?.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between py-4 px-4 bg-crypto-secondary rounded-xl border border-crypto">
              <span className="text-crypto-muted">Volume / Market Cap</span>
              <span className="font-bold text-crypto-primary">
                {coin.marketCap && coin.volume24h
                  ? ((coin.volume24h / coin.marketCap) * 100).toFixed(2) + '%'
                  : 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-crypto-muted py-10">Không có dữ liệu thống kê</p>
        )}
      </div>
    </div>
  );
}
