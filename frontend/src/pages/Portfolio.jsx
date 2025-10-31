import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { portfolioAPI } from "../services/api";

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await portfolioAPI.getPortfolio();
      if (response.success) {
        setPortfolio(response.data);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolio();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  const holdings = portfolio?.holdings || [];
  const summary = portfolio?.summary || {};
  const totalPortfolioValue = summary.totalValue || 0;
  const totalInvested = summary.totalInvested || 0;
  const totalProfit = summary.totalProfit || 0;
  const totalProfitPercent = summary.profitPercentage || 0;

  // Data for pie chart
  const pieData = holdings.map((coin, index) => ({
    name: coin.symbol,
    value: coin.currentValue,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Portfolio</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục đầu tư của bạn</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link to="/trade">
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
              <Plus className="w-5 h-5" />
              <span>Giao dịch</span>
            </button>
          </Link>
        </div>
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
            {holdings.length}
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
          {holdings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có coin nào trong danh mục</p>
              <Link to="/trade" className="text-blue-600 hover:underline mt-2 inline-block">
                Bắt đầu giao dịch →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((coin, index) => (
                <div
                  key={coin.symbol}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {coin.symbol.charAt(0)}
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
                    ${coin.currentValue.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs ${
                      coin.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {coin.profit >= 0 ? "+" : ""}
                    {coin.profitPercentage?.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
            </div>
          )}
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
              {holdings.map((coin, index) => (
                <tr
                  key={coin.symbol}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {coin.symbol.charAt(0)}
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
                    ${coin.averageBuyPrice.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 font-semibold text-gray-800">
                    ${coin.currentPrice.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 font-semibold text-gray-800">
                    ${coin.currentValue.toFixed(2)}
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
                        {coin.profitPercentage?.toFixed(2)}%)
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
