import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { marketAPI, portfolioAPI } from '../services/api';
import { onPriceUpdate, onTradeConfirmation, onPriceAlert } from '../services/websocket';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Briefcase,
  DollarSign,
  RefreshCw,
  ExternalLink,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const pricesRes = await marketAPI.getPrices();
      if (pricesRes.success) {
        setCoins(pricesRes.data);

        const top5 = pricesRes.data.slice(0, 5);
        setChartData(top5.map(coin => ({
          name: coin.symbol,
          price: coin.price,
          change: coin.change24h,
        })));
      }

      const portfolioRes = await portfolioAPI.getPortfolio();
      if (portfolioRes.success) {
        setPortfolio(portfolioRes.data);
      }
    } catch (error) {
      showToast('error', 'Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    onPriceUpdate((prices) => {
      setCoins(prices);
    });

    onTradeConfirmation((trade) => {
      showToast('success', `${trade.type === 'buy' ? 'Mua' : 'Bán'} ${trade.amount} ${trade.symbol} thành công!`);
      refreshUser();
      fetchData();
    });

    onPriceAlert((alert) => {
      showToast('warning', `${alert.symbol} đã ${alert.condition === 'above' ? 'vượt' : 'xuống dưới'} $${alert.targetPrice}`);
    });
  }, [fetchData, refreshUser]);

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

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 min-w-[300px]">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-crypto-primary">Dashboard</h1>
          <p className="text-crypto-secondary mt-1">
            Chào mừng trở lại, <span className="text-crypto-accent">{user?.fullName || user?.email}</span>!
          </p>
        </div>
        <button
          onClick={fetchData}
          className="crypto-btn crypto-btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-card-icon group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="crypto-badge crypto-badge-success">USDT</span>
          </div>
          <h3 className="text-3xl font-bold text-crypto-primary">
            ${user?.balance?.toLocaleString() || '0.00'}
          </h3>
          <p className="text-sm text-crypto-muted mt-2">Số dư khả dụng</p>
        </div>

        {/* Portfolio Value */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-card-icon bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-xs text-crypto-muted">Portfolio</span>
          </div>
          <h3 className="text-3xl font-bold text-crypto-primary">
            ${portfolio?.totalValue?.toLocaleString() || '0.00'}
          </h3>
          <p className="text-sm text-crypto-muted mt-2">Tổng giá trị đầu tư</p>
        </div>

        {/* Profit/Loss */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className={`stat-card-icon group-hover:scale-110 transition-transform ${portfolio?.totalProfit >= 0
              ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]'
              : 'bg-[rgba(239,68,68,0.1)] text-[var(--error)]'
              }`}>
              {portfolio?.totalProfit >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
            <span className={`crypto-badge ${portfolio?.totalProfit >= 0 ? 'crypto-badge-success' : 'crypto-badge-error'}`}>
              {portfolio?.profitPercentage >= 0 ? '+' : ''}{portfolio?.profitPercentage?.toFixed(2) || '0.00'}%
            </span>
          </div>
          <h3 className={`text-3xl font-bold ${portfolio?.totalProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            {portfolio?.totalProfit >= 0 ? '+' : ''}${portfolio?.totalProfit?.toFixed(2) || '0.00'}
          </h3>
          <p className="text-sm text-crypto-muted mt-2">Lãi/Lỗ</p>
        </div>

        {/* Total Assets */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-card-icon bg-[rgba(245,158,11,0.1)] text-[var(--warning)] group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <Activity className="w-4 h-4 text-crypto-muted" />
          </div>
          <h3 className="text-3xl font-bold text-gradient-crypto">
            ${((user?.balance || 0) + (portfolio?.totalValue || 0)).toLocaleString()}
          </h3>
          <p className="text-sm text-crypto-muted mt-2">Tổng tài sản</p>
        </div>
      </div>

      {/* Market Overview */}
      <div className="crypto-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-crypto flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-crypto-primary">Thị trường Crypto</h2>
              <p className="text-sm text-crypto-muted">Giá realtime từ CoinGecko</p>
            </div>
          </div>
        </div>

        {/* Coin Table */}
        <div className="overflow-x-auto">
          <table className="crypto-table">
            <thead>
              <tr>
                <th className="text-left">Coin</th>
                <th className="text-right">Giá (USD)</th>
                <th className="text-right">24h %</th>
                <th className="text-right hidden md:table-cell">Volume 24h</th>
                <th className="text-right hidden lg:table-cell">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, index) => (
                <tr
                  key={coin.symbol}
                  className="cursor-pointer transition-all hover:bg-[var(--bg-hover)]"
                  onClick={() => navigate(`/coin/${coin.coinId}`)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`coin-icon ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                            index === 2 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                              'bg-gradient-to-br from-gray-400 to-gray-600'
                          } text-white`}>
                          {coin.symbol.substring(0, 1)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-card)] text-[10px] flex items-center justify-center text-crypto-muted font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-crypto-primary">{coin.symbol}</span>
                          <ExternalLink className="w-3 h-3 text-crypto-muted" />
                        </div>
                        <span className="text-xs text-crypto-muted capitalize">{coin.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    <span className="font-bold text-crypto-primary">
                      ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className={`inline-flex items-center gap-1 font-semibold ${coin.change24h >= 0 ? 'price-up' : 'price-down'
                      }`}>
                      {coin.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-right hidden md:table-cell text-crypto-secondary">
                    ${(coin.volume24h / 1000000).toFixed(2)}M
                  </td>
                  <td className="text-right hidden lg:table-cell text-crypto-secondary">
                    ${(coin.marketCap / 1000000000).toFixed(2)}B
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Chart */}
      <div className="crypto-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-crypto-primary">So sánh giá Top Coins</h2>
            <p className="text-sm text-crypto-muted">Biểu đồ so sánh giá các coin hàng đầu</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-primary)'
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
              itemStyle={{ color: '#00d4aa' }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Giá']}
            />
            <Bar
              dataKey="price"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={['#00d4aa', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'][index % 5]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
