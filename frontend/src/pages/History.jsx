import { useState } from "react";
import {
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

// Mock data - sẽ thay bằng data thực từ backend
const mockTransactions = [
  {
    id: 1,
    type: "buy",
    coin: "BTC",
    symbol: "₿",
    amount: 0.5,
    price: 65000,
    total: 32500,
    date: "2025-10-17 14:30:00",
    status: "completed",
  },
  {
    id: 2,
    type: "sell",
    coin: "ETH",
    symbol: "Ξ",
    amount: 1.2,
    price: 3200,
    total: 3840,
    date: "2025-10-17 12:15:00",
    status: "completed",
  },
  {
    id: 3,
    type: "buy",
    coin: "BNB",
    symbol: "B",
    amount: 5,
    price: 580,
    total: 2900,
    date: "2025-10-17 10:45:00",
    status: "completed",
  },
  {
    id: 4,
    type: "buy",
    coin: "SOL",
    symbol: "◎",
    amount: 10,
    price: 140,
    total: 1400,
    date: "2025-10-16 16:20:00",
    status: "completed",
  },
  {
    id: 5,
    type: "sell",
    coin: "XRP",
    symbol: "X",
    amount: 500,
    price: 0.7,
    total: 350,
    date: "2025-10-16 14:10:00",
    status: "completed",
  },
  {
    id: 6,
    type: "buy",
    coin: "ADA",
    symbol: "₳",
    amount: 800,
    price: 0.58,
    total: 464,
    date: "2025-10-16 11:30:00",
    status: "completed",
  },
  {
    id: 7,
    type: "buy",
    coin: "ETH",
    symbol: "Ξ",
    amount: 1.3,
    price: 3180,
    total: 4134,
    date: "2025-10-15 15:45:00",
    status: "completed",
  },
  {
    id: 8,
    type: "sell",
    coin: "BTC",
    symbol: "₿",
    amount: 0.2,
    price: 64800,
    total: 12960,
    date: "2025-10-15 09:20:00",
    status: "completed",
  },
];

const History = () => {
  const [filterType, setFilterType] = useState("all"); // 'all', 'buy', 'sell'
  const [filterCoin, setFilterCoin] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get unique coins
  const uniqueCoins = ["all", ...new Set(mockTransactions.map((t) => t.coin))];

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;
    const coinMatch = filterCoin === "all" || transaction.coin === filterCoin;
    return typeMatch && coinMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate statistics
  const totalBuy = mockTransactions
    .filter((t) => t.type === "buy")
    .reduce((sum, t) => sum + t.total, 0);
  const totalSell = mockTransactions
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + t.total, 0);
  const netAmount = totalSell - totalBuy;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Transaction History
          </h1>
          <p className="text-gray-600 mt-1">Lịch sử giao dịch mua bán</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
          <Download className="w-5 h-5" />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Tổng mua</p>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            ${totalBuy.toFixed(2)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {mockTransactions.filter((t) => t.type === "buy").length} giao dịch
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Tổng bán</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            ${totalSell.toFixed(2)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {mockTransactions.filter((t) => t.type === "sell").length} giao dịch
          </p>
        </div>

        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
            netAmount >= 0 ? "border-purple-500" : "border-red-500"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Net Amount</p>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <h3
            className={`text-2xl font-bold ${
              netAmount >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {netAmount >= 0 ? "+" : ""}${netAmount.toFixed(2)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {mockTransactions.length} giao dịch tổng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giao dịch
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="buy">Mua</option>
              <option value="sell">Bán</option>
            </select>
          </div>

          {/* Coin Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coin
            </label>
            <select
              value={filterCoin}
              onChange={(e) => {
                setFilterCoin(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              {uniqueCoins.map((coin) => (
                <option key={coin} value={coin}>
                  {coin === "all" ? "Tất cả" : coin}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Loại
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Coin
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                  Số lượng
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                  Giá
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                  Tổng
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Thời gian
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-6 text-gray-600">#{transaction.id}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === "buy"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.type === "buy" ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      <span>{transaction.type === "buy" ? "MUA" : "BÁN"}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{transaction.symbol}</span>
                      <span className="font-semibold text-gray-800">
                        {transaction.coin}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-6 font-medium text-gray-800">
                    {transaction.amount}
                  </td>
                  <td className="text-right py-4 px-6 text-gray-800">
                    ${transaction.price.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-6 font-bold text-gray-800">
                    ${transaction.total.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {transaction.date}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      Hoàn thành
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Hiển thị {startIndex + 1} -{" "}
              {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}{" "}
              của {filteredTransactions.length} giao dịch
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
