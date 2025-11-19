import { useState, useEffect, useCallback } from 'react';
import { marketAPI, tradeAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Search, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import Toast from '../components/Toast';

export default function Trade() {
  const { user, refreshUser } = useAuth();
  const [tradeType, setTradeType] = useState('buy');
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [amount, setAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await marketAPI.getPrices();
      if (res.success) {
        setCoins(res.data);
        if (res.data.length > 0 && !selectedCoin) {
          setSelectedCoin(res.data[0]);
        }
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCoin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => {
    if (!selectedCoin || !amount) return 0;
    const total = parseFloat(amount) * selectedCoin.price;
    const fee = total * 0.001; // 0.1% fee
    return tradeType === 'buy' ? total + fee : total - fee;
  };

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('error', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }

    setTrading(true);
    try {
      const data = {
        symbol: selectedCoin.symbol,
        coinId: selectedCoin.coinId,
        amount: parseFloat(amount),
      };

      const res = tradeType === 'buy' 
        ? await tradeAPI.buy(data)
        : await tradeAPI.sell(data);

      if (res.success) {
        showToast('success', `${tradeType === 'buy' ? 'Mua' : 'Bán'} thành công!`);
        setAmount('');
        await refreshUser();
        await fetchData();
      } else {
        showToast('error', res.message);
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setTrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 min-w-[300px]">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <h1 className="text-3xl font-bold">Trade</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coin List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
                placeholder="Tìm coin..."
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredCoins.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition ${
                  selectedCoin?.symbol === coin.symbol
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {coin.symbol.substring(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{coin.symbol}</p>
                    <p className="text-sm text-gray-500">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${coin.price.toLocaleString()}</p>
                  <p className={`text-sm ${coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trade Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Giao dịch</h2>

          {/* Buy/Sell Toggle */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                tradeType === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Mua
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                tradeType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Bán
            </button>
          </div>

          {selectedCoin && (
            <div className="space-y-4">
              {/* Selected Coin Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{selectedCoin.symbol}</span>
                  <div className={`flex items-center ${selectedCoin.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedCoin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="ml-1">{selectedCoin.change24h.toFixed(2)}%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">${selectedCoin.price.toLocaleString()}</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Số lượng</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="0.00"
                  step="0.00000001"
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Số dư:</span>
                  <span className="font-semibold">${user?.balance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Phí (0.1%):</span>
                  <span className="font-semibold">${(calculateTotal() * 0.001).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Tổng:</span>
                    <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trade Button */}
              <button
                onClick={handleTrade}
                disabled={trading || !amount}
                className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                  tradeType === 'buy'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {trading ? 'Đang xử lý...' : tradeType === 'buy' ? 'Mua ngay' : 'Bán ngay'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
