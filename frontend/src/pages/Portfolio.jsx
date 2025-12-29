import { useState, useEffect } from 'react';
import { portfolioAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Briefcase, DollarSign, Target, Wallet } from 'lucide-react';

const COLORS = ['#00d4aa', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await portfolioAPI.getPortfolio();
      if (res.success) {
        setPortfolio(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
          </div>
          <p className="text-crypto-secondary">Đang tải portfolio...</p>
        </div>
      </div>
    );
  }

  const chartData = portfolio?.holdings?.map(h => ({
    name: h.symbol,
    value: h.amount * (h.currentPrice || h.averageBuyPrice),
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-crypto flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-crypto-primary">Portfolio</h1>
            <p className="text-crypto-muted">Danh mục đầu tư của bạn</p>
          </div>
        </div>
        <button
          onClick={fetchPortfolio}
          className="crypto-btn crypto-btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-card-icon bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs text-crypto-muted">Portfolio Value</span>
          </div>
          <p className="text-3xl font-bold text-gradient-crypto">
            ${portfolio?.totalValue?.toLocaleString() || '0.00'}
          </p>
          <p className="text-sm text-crypto-muted mt-2">Tổng giá trị hiện tại</p>
        </div>

        {/* Total Invested */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-card-icon bg-[rgba(245,158,11,0.1)] text-[var(--warning)] group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs text-crypto-muted">Invested</span>
          </div>
          <p className="text-3xl font-bold text-crypto-primary">
            ${portfolio?.totalInvested?.toLocaleString() || '0.00'}
          </p>
          <p className="text-sm text-crypto-muted mt-2">Tổng vốn đầu tư</p>
        </div>

        {/* Profit/Loss */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className={`stat-card-icon group-hover:scale-110 transition-transform ${portfolio?.totalProfit >= 0
              ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]'
              : 'bg-[rgba(239,68,68,0.1)] text-[var(--error)]'
              }`}>
              {portfolio?.totalProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <span className={`crypto-badge ${portfolio?.totalProfit >= 0 ? 'crypto-badge-success' : 'crypto-badge-error'}`}>
              {portfolio?.profitPercentage >= 0 ? '+' : ''}{portfolio?.profitPercentage?.toFixed(2) || '0.00'}%
            </span>
          </div>
          <p className={`text-3xl font-bold ${portfolio?.totalProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            {portfolio?.totalProfit >= 0 ? '+' : ''}${portfolio?.totalProfit?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-crypto-muted mt-2">Lãi/Lỗ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="crypto-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.1)] flex items-center justify-center">
              <Target className="w-5 h-5 text-crypto-accent" />
            </div>
            <h2 className="text-xl font-bold text-crypto-primary">Phân bổ danh mục</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#00d4aa' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Giá trị']}
                />
                <Legend
                  wrapperStyle={{ color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-crypto-muted opacity-30 mx-auto mb-4" />
              <p className="text-crypto-muted">Chưa có holdings</p>
              <p className="text-sm text-crypto-muted mt-1">Mua crypto đầu tiên của bạn!</p>
            </div>
          )}
        </div>

        {/* Holdings Table */}
        <div className="crypto-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-xl font-bold text-crypto-primary">Holdings</h2>
          </div>
          {portfolio?.holdings?.length > 0 ? (
            <div className="space-y-3">
              {portfolio.holdings.map((holding, index) => {
                const currentValue = holding.amount * (holding.currentPrice || holding.averageBuyPrice);
                const investedValue = holding.amount * holding.averageBuyPrice;
                const profit = currentValue - investedValue;
                const profitPercent = investedValue > 0 ? ((profit / investedValue) * 100) : 0;

                return (
                  <div
                    key={holding.symbol}
                    className="flex items-center justify-between p-4 bg-crypto-secondary rounded-xl border border-crypto hover:border-[var(--border-hover)] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="coin-icon text-white"
                        style={{ background: COLORS[index % COLORS.length] }}
                      >
                        {holding.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-crypto-primary">{holding.symbol}</p>
                        <p className="text-sm text-crypto-muted">{holding.amount.toFixed(6)} coins</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-crypto-primary">${currentValue.toFixed(2)}</p>
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-sm font-semibold ${profit >= 0 ? 'price-up' : 'price-down'}`}>
                          {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                        </span>
                        {profit >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-[var(--success)]" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-[var(--error)]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Wallet className="w-16 h-16 text-crypto-muted opacity-30 mx-auto mb-4" />
              <p className="text-crypto-muted">Chưa có holdings</p>
              <p className="text-sm text-crypto-muted mt-1">Bắt đầu giao dịch để có holdings!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
