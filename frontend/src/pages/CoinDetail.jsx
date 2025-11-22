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
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function CoinDetail() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState(7);

  useEffect(() => {
    fetchCoinData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId, timeframe]);

  const fetchCoinData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching data for coinId:', coinId);
      
      // Fetch coin price
      const priceRes = await marketAPI.getCoinPrice(coinId);
      console.log('Price API response:', priceRes);
      
      if (priceRes.success) {
        console.log('Coin data:', priceRes.data);
        setCoin(priceRes.data);
      } else {
        console.error('Price API failed:', priceRes.message);
        showToast('error', 'Không thể tải giá coin: ' + (priceRes.message || 'Unknown error'));
      }

      // Fetch chart data
      const chartRes = await marketAPI.getChartData(coinId, timeframe);
      console.log('Chart API response:', chartRes);
      
      if (chartRes.success && chartRes.data) {
        // Check data structure
        const prices = chartRes.data.prices || [];
        console.log('Prices array length:', prices.length);
        
        if (prices.length > 0) {
          // Backend returns array of objects: [{timestamp, date, price}]
          const transformedData = prices.map((item) => ({
            timestamp: item.timestamp,
            date: new Date(item.timestamp).toLocaleDateString('vi-VN', { 
              month: 'short', 
              day: 'numeric',
              hour: timeframe === 1 ? '2-digit' : undefined,
            }),
            price: parseFloat(item.price.toFixed(2)),
          }));
          console.log('Transformed data:', transformedData.slice(0, 3)); // Log first 3 items
          setChartData(transformedData);
        } else {
          console.warn('No price data in chart response');
          setChartData([]);
        }
      } else {
        console.error('Chart API failed:', chartRes.message);
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching coin data:', error);
      showToast('error', 'Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    // Simple toast implementation
    alert(`[${type.toUpperCase()}] ${message}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Không tìm thấy coin</p>
        <button 
          onClick={() => navigate('/trade')}
          className="mt-4 text-blue-600 hover:underline"
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/trade')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{coin.name}</h1>
              <span className="text-xl text-gray-500">{coin.symbol}</span>
            </div>
            <p className="text-gray-600 mt-1">#{coin.marketCapRank || 'N/A'} by Market Cap</p>
          </div>
        </div>
        <button
          onClick={fetchCoinData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Price Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Current Price */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Giá hiện tại</p>
            <p className="text-3xl font-bold">${coin.price.toLocaleString()}</p>
            <div className={`flex items-center space-x-1 mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-500">24h</span>
            </div>
          </div>

          {/* Volume 24h */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Volume 24h</p>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <p className="text-xl font-semibold">
                ${coin.volume24h ? (coin.volume24h / 1e9).toFixed(2) + 'B' : 'N/A'}
              </p>
            </div>
          </div>

          {/* Market Cap */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Market Cap</p>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <p className="text-xl font-semibold">
                ${coin.marketCap ? (coin.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={() => navigate(`/trade?coin=${coinId}`)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>Giao dịch {coin.symbol}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Biểu đồ giá</h2>
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeframe === tf.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    stopColor={isPositive ? '#10B981' : '#EF4444'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? '#10B981' : '#EF4444'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickMargin={10}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                tickMargin={10}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Giá']}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                fill="url(#colorPrice)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Không có dữ liệu biểu đồ</p>
          </div>
        )}
      </div>

      {/* Price Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Thống kê giá</h2>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Giá cao nhất {timeframe}D</span>
              <span className="font-semibold">
                ${Math.max(...chartData.map(d => d.price)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Giá thấp nhất {timeframe}D</span>
              <span className="font-semibold">
                ${Math.min(...chartData.map(d => d.price)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Biến động 24h</span>
              <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Volume / Market Cap</span>
              <span className="font-semibold">
                {coin.marketCap && coin.volume24h 
                  ? ((coin.volume24h / coin.marketCap) * 100).toFixed(2) + '%'
                  : 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Không có dữ liệu thống kê</p>
        )}
      </div>
    </div>
  );
}
