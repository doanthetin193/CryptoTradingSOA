import { useState, useEffect } from 'react';
import { portfolioAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

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
    return <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const chartData = portfolio?.holdings?.map(h => ({
    name: h.symbol,
    value: h.amount * h.averageBuyPrice,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <button onClick={fetchPortfolio} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-2">Tổng giá trị</p>
          <p className="text-3xl font-bold">${portfolio?.totalValue?.toLocaleString() || '0.00'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-2">Tổng đầu tư</p>
          <p className="text-3xl font-bold">${portfolio?.totalInvested?.toLocaleString() || '0.00'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-2">Lãi/Lỗ</p>
          <p className={`text-3xl font-bold ${portfolio?.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio?.totalProfit >= 0 ? '+' : ''}${portfolio?.totalProfit?.toFixed(2) || '0.00'}
          </p>
          <p className={`text-sm ${portfolio?.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio?.profitPercentage >= 0 ? '+' : ''}{portfolio?.profitPercentage?.toFixed(2) || '0.00'}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Phân bổ danh mục</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-20">Chưa có holdings</p>
          )}
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Holdings</h2>
          {portfolio?.holdings?.length > 0 ? (
            <div className="space-y-3">
              {portfolio.holdings.map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {holding.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{holding.symbol}</p>
                      <p className="text-sm text-gray-500">{holding.amount} coins</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(holding.amount * holding.averageBuyPrice).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Avg: ${holding.averageBuyPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-20">Chưa có holdings</p>
          )}
        </div>
      </div>
    </div>
  );
}
