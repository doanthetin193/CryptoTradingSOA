import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - sẽ thay bằng data thực từ backend
const mockPortfolio = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.5,
    avgPrice: 65000,
    currentPrice: 67500,
    icon: "₿",
    color: "#3b82f6",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: 2.5,
    avgPrice: 3200,
    currentPrice: 3450,
    icon: "Ξ",
    color: "#8b5cf6",
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    amount: 5,
    avgPrice: 580,
    currentPrice: 605,
    icon: "B",
    color: "#f59e0b",
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: 10,
    avgPrice: 140,
    currentPrice: 145,
    icon: "◎",
    color: "#10b981",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    amount: 1000,
    avgPrice: 0.7,
    currentPrice: 0.75,
    icon: "X",
    color: "#ef4444",
  },
];

const Portfolio = () => {
  // Calculate portfolio data
  const portfolioData = mockPortfolio.map((coin) => {
    const totalValue = coin.amount * coin.currentPrice;
    const totalCost = coin.amount * coin.avgPrice;
    const profit = totalValue - totalCost;
    const profitPercent = ((profit / totalCost) * 100).toFixed(2);

    return {
      ...coin,
      totalValue,
      totalCost,
      profit,
      profitPercent,
    };
  });

  const totalPortfolioValue = portfolioData.reduce(
    (sum, coin) => sum + coin.totalValue,
    0
  );
  const totalInvested = portfolioData.reduce(
    (sum, coin) => sum + coin.totalCost,
    0
  );
  const totalProfit = totalPortfolioValue - totalInvested;
  const totalProfitPercent = ((totalProfit / totalInvested) * 100).toFixed(2);

  // Data for pie chart
  const pieData = portfolioData.map((coin) => ({
    name: coin.symbol,
    value: coin.totalValue,
    color: coin.color,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Portfolio</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục đầu tư của bạn</p>
        </div>
        <Link to="/trade">
          <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Giao dịch</span>
          </button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-2">Tổng giá trị</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            ${totalPortfolioValue.toFixed(2)}
          </h3>
          <p className="text-xs text-gray-500">
            Vốn đầu tư: ${totalInvested.toFixed(2)}
          </p>
        </div>

        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
            totalProfit >= 0 ? "border-green-500" : "border-red-500"
          }`}
        >
          <p className="text-gray-600 text-sm mb-2">Lợi nhuận/Lỗ</p>
          <h3
            className={`text-3xl font-bold mb-1 ${
              totalProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${Math.abs(totalProfit).toFixed(2)}
          </h3>
          <div
            className={`flex items-center space-x-1 text-sm ${
              totalProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {totalProfit >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {totalProfit >= 0 ? "+" : ""}
              {totalProfitPercent}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm mb-2">Số lượng coin</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {portfolioData.length}
          </h3>
          <p className="text-xs text-gray-500">Đa dạng hóa danh mục</p>
        </div>
      </div>

      {/* Charts and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Phân bổ danh mục
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Holdings Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Tổng quan nắm giữ
          </h2>
          <div className="space-y-3">
            {portfolioData.map((coin) => (
              <div
                key={coin.symbol}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: coin.color }}
                  >
                    {coin.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{coin.symbol}</p>
                    <p className="text-xs text-gray-500">
                      {coin.amount} {coin.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ${coin.totalValue.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs ${
                      coin.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {coin.profit >= 0 ? "+" : ""}
                    {coin.profitPercent}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Holdings Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Chi tiết nắm giữ
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Coin
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Số lượng
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Giá TB mua
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Giá hiện tại
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Tổng giá trị
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Lợi nhuận
                </th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map((coin) => (
                <tr
                  key={coin.symbol}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: coin.color }}
                      >
                        {coin.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {coin.symbol}
                        </p>
                        <p className="text-xs text-gray-500">{coin.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-gray-800">
                    {coin.amount}
                  </td>
                  <td className="text-right py-4 px-4 text-gray-800">
                    ${coin.avgPrice.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 font-semibold text-gray-800">
                    ${coin.currentPrice.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 font-semibold text-gray-800">
                    ${coin.totalValue.toFixed(2)}
                  </td>
                  <td className="text-right py-4 px-4">
                    <div
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                        coin.profit >= 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {coin.profit >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>
                        {coin.profit >= 0 ? "+" : ""}${coin.profit.toFixed(2)}
                      </span>
                      <span>
                        ({coin.profit >= 0 ? "+" : ""}
                        {coin.profitPercent}%)
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
