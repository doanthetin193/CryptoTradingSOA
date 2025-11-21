import { useState, useEffect, useCallback } from 'react';
import { marketAPI, tradeAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Search, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import Toast from '../components/Toast';

export default function Trade() {
  const { user, refreshUser, login } = useAuth();
  const [tradeType, setTradeType] = useState('buy');
  const [inputType, setInputType] = useState('amount'); // 'amount' or 'total'
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
    const numAmount = parseFloat(amount);
    
    if (inputType === 'amount') {
      // User entered coin amount
      const total = numAmount * selectedCoin.price;
      const fee = total * 0.001;
      return tradeType === 'buy' ? total + fee : total - fee;
    } else {
      // User entered USD total
      return numAmount;
    }
  };

  const getCoinAmount = () => {
    if (!selectedCoin || !amount) return 0;
    const numAmount = parseFloat(amount);
    
    if (inputType === 'amount') {
      // User entered coin amount directly
      return numAmount;
    } else {
      // User entered USD total - need to calculate coin amount
      // For buy: total = (amount * price) + fee
      // So: amount = total / (price * 1.001)
      // For sell: total = (amount * price) - fee
      // So: amount = total / (price * 0.999)
      const priceWithFee = tradeType === 'buy' 
        ? selectedCoin.price * 1.001 
        : selectedCoin.price * 0.999;
      return numAmount / priceWithFee;
    }
  };

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('error', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const coinAmount = getCoinAmount();
    
    // Validate coin amount
    if (coinAmount <= 0 || !isFinite(coinAmount)) {
      showToast('error', 'Số lượng không hợp lệ');
      return;
    }

    // Check balance for buy orders
    if (tradeType === 'buy') {
      const total = calculateTotal();
      if (total > (user?.balance || 0)) {
        showToast('error', `Số dư không đủ! Cần ${total.toFixed(2)} USDT nhưng chỉ có ${user?.balance?.toFixed(2) || 0} USDT`);
        return;
      }
    }

    setTrading(true);
    try {
      // Prepare data based on trade type
      const data = tradeType === 'buy' 
        ? {
            symbol: selectedCoin.symbol,
            coinId: selectedCoin.coinId,  // coinId only needed for buy
            amount: coinAmount,
          }
        : {
            symbol: selectedCoin.symbol,  // sell only needs symbol and amount
            amount: coinAmount,
          };

      console.log('Trade request:', data);

      const res = tradeType === 'buy' 
        ? await tradeAPI.buy(data)
        : await tradeAPI.sell(data);

      if (res.success) {
        console.log('✅ Trade success response:', res.data);
        showToast('success', `${tradeType === 'buy' ? 'Mua' : 'Bán'} ${coinAmount.toFixed(8)} ${selectedCoin.symbol} thành công!`);
        
        // Update balance manually from response - NO API CALLS!
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newBalance = res.data.newBalance || res.data.balanceAfter;
        
        if (newBalance !== undefined) {
          const updatedUser = { ...currentUser, balance: newBalance };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('💰 Balance updated to:', newBalance);
          
          // Dispatch custom event to update AuthContext
          window.dispatchEvent(new Event('balanceUpdated'));
        }
        
        setAmount('');
      } else {
        showToast('error', res.message || 'Giao dịch thất bại');
      }
    } catch (error) {
      console.error('Trade error:', error);
      showToast('error', error.message || 'Giao dịch thất bại');
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    {inputType === 'amount' ? `Số lượng ${selectedCoin.symbol}` : 'Số tiền (USDT)'}
                  </label>
                  <button
                    onClick={() => {
                      setInputType(inputType === 'amount' ? 'total' : 'amount');
                      setAmount('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {inputType === 'amount' ? '↔ Nhập theo USDT' : '↔ Nhập theo số lượng'}
                  </button>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder={inputType === 'amount' ? '0.00000000' : '0.00'}
                  step={inputType === 'amount' ? '0.00000001' : '0.01'}
                />
                {inputType === 'total' && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {getCoinAmount().toFixed(8)} {selectedCoin.symbol}
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Số dư:</span>
                  <span className="font-semibold">${user?.balance?.toLocaleString() || '0.00'} USDT</span>
                </div>
                {amount && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Số lượng:</span>
                      <span className="font-semibold">{getCoinAmount().toFixed(8)} {selectedCoin.symbol}</span>
                    </div>
                    {inputType === 'amount' && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Giá trị:</span>
                        <span className="font-semibold">${(getCoinAmount() * selectedCoin.price).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Phí giao dịch (0.1%):</span>
                      <span className="font-semibold">${((getCoinAmount() * selectedCoin.price) * 0.001).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Tổng thanh toán:</span>
                    <span className="text-xl font-bold text-blue-600">${calculateTotal().toFixed(2)} USDT</span>
                  </div>
                </div>
                {tradeType === 'buy' && amount && calculateTotal() > (user?.balance || 0) && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Số dư không đủ! Cần thêm ${(calculateTotal() - (user?.balance || 0)).toFixed(2)} USDT
                  </p>
                )}
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
