import { useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

// Mock data - sẽ thay bằng data thực từ CoinGecko API
const mockCoins = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67500,
    change: 5.32,
    icon: "₿",
    volume: "28.5B",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3450,
    change: 3.87,
    icon: "Ξ",
    volume: "15.2B",
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    price: 605,
    change: 4.31,
    icon: "B",
    volume: "2.8B",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 145,
    change: -2.15,
    icon: "◎",
    volume: "3.5B",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 0.75,
    change: 1.23,
    icon: "X",
    volume: "1.9B",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.58,
    change: -1.45,
    icon: "₳",
    volume: "850M",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.12,
    change: 2.87,
    icon: "Ð",
    volume: "1.2B",
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    price: 7.85,
    change: 0.56,
    icon: "●",
    volume: "650M",
  },
];

const Trade = () => {
  const [tradeType, setTradeType] = useState("buy"); // 'buy' or 'sell'
  const [selectedCoin, setSelectedCoin] = useState(mockCoins[0]);
  const [amount, setAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const userBalance = 1000; // USDT balance

  const filteredCoins = mockCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => {
    return (parseFloat(amount) || 0) * selectedCoin.price;
  };

  const handleTrade = (e) => {
    e.preventDefault();
    // Mock trade execution - sẽ kết nối backend sau
    console.log("Trade executed:", {
      type: tradeType,
      coin: selectedCoin.symbol,
      amount: amount,
      total: calculateTotal(),
    });
    alert(
      `${tradeType === "buy" ? "Mua" : "Bán"} ${amount} ${
        selectedCoin.symbol
      } thành công!`
    );
    setAmount("");
  };

  const setMaxAmount = () => {
    if (tradeType === "buy") {
      const maxAmount = (userBalance / selectedCoin.price).toFixed(8);
      setAmount(maxAmount);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Trade</h1>
        <p className="text-gray-600 mt-1">Mua và bán crypto ảo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trade Type Selector */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setTradeType("buy")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  tradeType === "buy"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Mua
              </button>
              <button
                onClick={() => setTradeType("sell")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  tradeType === "sell"
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Bán
              </button>
            </div>

            {/* Selected Coin Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedCoin.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {selectedCoin.symbol}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedCoin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    ${selectedCoin.price.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center justify-end space-x-1 text-sm ${
                      selectedCoin.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedCoin.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {selectedCoin.change >= 0 ? "+" : ""}
                      {selectedCoin.change}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Form */}
            <form onSubmit={handleTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng {selectedCoin.symbol}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="0.00"
                    required
                  />
                  <button
                    type="button"
                    onClick={setMaxAmount}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 text-sm font-semibold hover:text-purple-700"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng tiền (USDT)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={calculateTotal().toFixed(2)}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                  />
                </div>
              </div>

              {/* Balance Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Số dư khả dụng:</span>
                <span className="font-semibold text-gray-800">
                  ${userBalance.toLocaleString()} USDT
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-4 rounded-lg font-bold text-white transition-all shadow-lg hover:shadow-xl ${
                  tradeType === "buy"
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {tradeType === "buy" ? "Mua" : "Bán"} {selectedCoin.symbol}
                  </span>
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Coin List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Chọn coin</h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Tìm kiếm coin..."
            />
          </div>

          {/* Coin List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCoins.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedCoin.symbol === coin.symbol
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        selectedCoin.symbol === coin.symbol
                          ? "bg-white/20 text-white"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                      }`}
                    >
                      {coin.icon}
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${
                          selectedCoin.symbol === coin.symbol
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {coin.symbol}
                      </p>
                      <p
                        className={`text-xs ${
                          selectedCoin.symbol === coin.symbol
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {coin.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={`font-bold ${
                      selectedCoin.symbol === coin.symbol
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    ${coin.price.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center space-x-1 text-sm ${
                      selectedCoin.symbol === coin.symbol
                        ? coin.change >= 0
                          ? "text-green-200"
                          : "text-red-200"
                        : coin.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
