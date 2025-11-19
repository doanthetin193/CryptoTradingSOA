import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { marketAPI, portfolioAPI } from '../services/api';
import { onPriceUpdate, onTradeConfirmation, onPriceAlert } from '../services/websocket';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Briefcase,
  DollarSign,
  RefreshCw 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Lấy prices
      const pricesRes = await marketAPI.getPrices();
      if (pricesRes.success) {
        setCoins(pricesRes.data);
        
        // Tạo chart data từ top 5 coins
        const top5 = pricesRes.data.slice(0, 5);
        setChartData(top5.map(coin => ({
          name: coin.symbol,
          price: coin.price,
          change: coin.change24h,
        })));
      }

      // Lấy portfolio
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
    
    // WebSocket listeners
    onPriceUpdate((prices) => {
      setCoins(prices);
    });

    onTradeConfirmation((trade) => {
      showToast('success', `${trade.type === 'buy' ? 'Mua' : 'Bán'} ${trade.amount} ${trade.symbol} thành công!`);
      fetchData(); // Refresh data
    });

    onPriceAlert((alert) => {
      showToast('warning', `${alert.symbol} đã ${alert.condition === 'above' ? 'vượt' : 'xuống dưới'} $${alert.targetPrice}`);
    });
  }, [fetchData]);

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Chào mừng trở lại, {user?.fullName || user?.email}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">USDT</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${user?.balance?.toLocaleString() || '0.00'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Số dư khả dụng</p>
        </div>

        {/* Portfolio Value */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Portfolio</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${portfolio?.totalValue?.toLocaleString() || '0.00'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Tổng giá trị</p>
        </div>

        {/* Profit/Loss */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`${portfolio?.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              {portfolio?.totalProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <span className="text-sm text-gray-500">P/L</span>
          </div>
          <h3 className={`text-2xl font-bold ${portfolio?.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio?.totalProfit >= 0 ? '+' : ''}${portfolio?.totalProfit?.toFixed(2) || '0.00'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {portfolio?.profitPercentage >= 0 ? '+' : ''}{portfolio?.profitPercentage?.toFixed(2) || '0.00'}%
          </p>
        </div>

        {/* Total Assets */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${((user?.balance || 0) + (portfolio?.totalValue || 0)).toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Tổng tài sản</p>
        </div>
      </div>

      {/* Market Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Thị trường Crypto</h2>
          <button 
            onClick={fetchData}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Làm mới</span>
          </button>
        </div>

        {/* Coin Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Coin</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Giá</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">24h %</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Volume 24h</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => (
                <tr key={coin.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {coin.symbol.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{coin.symbol}</p>
                        <p className="text-xs text-gray-500">{coin.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-semibold text-gray-900">
                    ${coin.price.toLocaleString()}
                  </td>
                  <td className={`text-right py-4 px-4 font-semibold ${
                    coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </td>
                  <td className="text-right py-4 px-4 text-gray-600">
                    ${(coin.volume24h / 1000000).toFixed(2)}M
                  </td>
                  <td className="text-right py-4 px-4 text-gray-600">
                    ${(coin.marketCap / 1000000000).toFixed(2)}B
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Biểu đồ giá</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
