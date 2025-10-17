import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Activity,
} from "lucide-react";

// Mock data - sẽ thay bằng data thực từ CoinGecko API
const mockPriceData = [
  { time: "00:00", BTC: 65000, ETH: 3200, BNB: 580 },
  { time: "04:00", BTC: 65500, ETH: 3250, BNB: 585 },
  { time: "08:00", BTC: 64800, ETH: 3180, BNB: 575 },
  { time: "12:00", BTC: 66200, ETH: 3300, BNB: 595 },
  { time: "16:00", BTC: 67000, ETH: 3400, BNB: 600 },
  { time: "20:00", BTC: 66500, ETH: 3350, BNB: 590 },
  { time: "23:59", BTC: 67500, ETH: 3450, BNB: 605 },
];

const mockTopCoins = [
  { symbol: "BTC", name: "Bitcoin", price: 67500, change: 5.32, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", price: 3450, change: 3.87, icon: "Ξ" },
  { symbol: "BNB", name: "Binance Coin", price: 605, change: 4.31, icon: "B" },
  { symbol: "SOL", name: "Solana", price: 145, change: -2.15, icon: "◎" },
  { symbol: "XRP", name: "Ripple", price: 0.75, change: 1.23, icon: "X" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Tổng quan thị trường và danh mục đầu tư
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              USDT
            </span>
          </div>
          <p className="text-white/80 text-sm mb-1">Số dư khả dụng</p>
          <h3 className="text-3xl font-bold">$1,000.00</h3>
        </div>

        {/* Portfolio Value */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-white/80 text-sm mb-1">Giá trị danh mục</p>
          <h3 className="text-3xl font-bold">$1,234.56</h3>
        </div>

        {/* 24h Change */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              24h
            </span>
          </div>
          <p className="text-white/80 text-sm mb-1">Thay đổi 24h</p>
          <h3 className="text-3xl font-bold">+5.32%</h3>
        </div>

        {/* Total Assets */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              Coins
            </span>
          </div>
          <p className="text-white/80 text-sm mb-1">Tổng tài sản</p>
          <h3 className="text-3xl font-bold">5</h3>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Biểu đồ giá Real-time
            </h2>
            <p className="text-gray-600 text-sm mt-1">Giá coin trong 24h qua</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
              BTC
            </button>
            <button className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
              ETH
            </button>
            <button className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
              BNB
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={mockPriceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#888" style={{ fontSize: "12px" }} />
            <YAxis stroke="#888" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="BTC"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="ETH"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="BNB"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Coins */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Top Coins</h2>
          <p className="text-gray-600 text-sm mt-1">Các coin phổ biến nhất</p>
        </div>
        <div className="space-y-4">
          {mockTopCoins.map((coin) => (
            <div
              key={coin.symbol}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {coin.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{coin.symbol}</h3>
                  <p className="text-sm text-gray-500">{coin.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">
                  ${coin.price.toLocaleString()}
                </p>
                <div
                  className={`flex items-center justify-end space-x-1 text-sm ${
                    coin.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {coin.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {coin.change >= 0 ? "+" : ""}
                    {coin.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
