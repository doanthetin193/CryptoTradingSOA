import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { marketAPI, tradeAPI } from '../services/api';
import { Search, TrendingUp, TrendingDown, Loader, ExternalLink, ArrowUpDown, Zap, Wallet } from 'lucide-react';
import Toast from '../components/Toast';

export default function Trade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const coinIdFromUrl = searchParams.get('coin');

  const [tradeType, setTradeType] = useState('buy');
  const [inputType, setInputType] = useState('amount');
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

        if (coinIdFromUrl) {
          const coinFromUrl = res.data.find(c => c.coinId === coinIdFromUrl);
          if (coinFromUrl) {
            setSelectedCoin(coinFromUrl);
          } else if (res.data.length > 0) {
            setSelectedCoin(res.data[0]);
          }
        } else if (res.data.length > 0 && !selectedCoin) {
          setSelectedCoin(res.data[0]);
        }
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  }, [coinIdFromUrl, selectedCoin]);

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
      const total = numAmount * selectedCoin.price;
      const fee = total * 0.001;
      return tradeType === 'buy' ? total + fee : total - fee;
    } else {
      return numAmount;
    }
  };

  const getCoinAmount = () => {
    if (!selectedCoin || !amount) return 0;
    const numAmount = parseFloat(amount);

    if (inputType === 'amount') {
      return numAmount;
    } else {
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

    if (coinAmount <= 0 || !isFinite(coinAmount)) {
      showToast('error', 'Số lượng không hợp lệ');
      return;
    }

    if (tradeType === 'buy') {
      const total = calculateTotal();
      if (total > (user?.balance || 0)) {
        showToast('error', `Số dư không đủ! Cần ${total.toFixed(2)} USDT nhưng chỉ có ${user?.balance?.toFixed(2) || 0} USDT`);
        return;
      }
    }

    setTrading(true);
    try {
      const data = tradeType === 'buy'
        ? {
          symbol: selectedCoin.symbol,
          coinId: selectedCoin.coinId,
          amount: coinAmount,
        }
        : {
          symbol: selectedCoin.symbol,
          amount: coinAmount,
        };

      const res = tradeType === 'buy'
        ? await tradeAPI.buy(data)
        : await tradeAPI.sell(data);

      if (res.success) {
        showToast('success', `${tradeType === 'buy' ? 'Mua' : 'Bán'} ${coinAmount.toFixed(8)} ${selectedCoin.symbol} thành công!`);

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newBalance = res.data.newBalance || res.data.balanceAfter;

        if (newBalance !== undefined) {
          const updatedUser = { ...currentUser, balance: newBalance };
          localStorage.setItem('user', JSON.stringify(updatedUser));
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
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
          </div>
          <p className="text-crypto-secondary">Đang tải dữ liệu...</p>
        </div>
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

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-crypto flex items-center justify-center">
          <ArrowUpDown className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-crypto-primary">Trade</h1>
          <p className="text-crypto-muted">Mua bán crypto với giá realtime</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coin List */}
        <div className="lg:col-span-2 crypto-card">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-crypto-muted z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="crypto-input"
                style={{ paddingLeft: '3rem' }}
                placeholder="Tìm coin..."
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredCoins.map((coin, index) => (
              <div key={coin.symbol} className="relative group">
                <button
                  onClick={() => setSelectedCoin(coin)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${selectedCoin?.symbol === coin.symbol
                    ? 'border-[var(--accent-primary)] bg-[rgba(0,212,170,0.1)]'
                    : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-crypto-card'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`coin-icon ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                        index === 2 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                      } text-white`}>
                      {coin.symbol.substring(0, 2)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-crypto-primary">{coin.symbol}</p>
                      <p className="text-sm text-crypto-muted capitalize">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-crypto-primary">${coin.price.toLocaleString()}</p>
                    <p className={`text-sm font-semibold flex items-center justify-end gap-1 ${coin.change24h >= 0 ? 'price-up' : 'price-down'}`}>
                      {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => navigate(`/coin/${coin.coinId}`)}
                  className="absolute top-3 right-3 p-2 bg-crypto-hover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(0,212,170,0.2)]"
                  title="Xem biểu đồ"
                >
                  <ExternalLink className="w-4 h-4 text-crypto-accent" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Form */}
        <div className="crypto-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-xl font-bold text-crypto-primary">Giao dịch</h2>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-crypto-secondary rounded-xl">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${tradeType === 'buy'
                ? 'bg-[var(--success)] text-white glow-success'
                : 'text-crypto-muted hover:text-crypto-primary'
                }`}
            >
              Mua
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${tradeType === 'sell'
                ? 'bg-[var(--error)] text-white glow-error'
                : 'text-crypto-muted hover:text-crypto-primary'
                }`}
            >
              Bán
            </button>
          </div>

          {selectedCoin && (
            <div className="space-y-4">
              {/* Selected Coin Info */}
              <div className="p-4 rounded-xl bg-crypto-secondary border border-crypto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-crypto-primary">{selectedCoin.symbol}</span>
                    <button
                      onClick={() => navigate(`/coin/${selectedCoin.coinId}`)}
                      className="text-crypto-accent hover:text-[var(--accent-secondary)]"
                      title="Xem biểu đồ"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`flex items-center gap-1 ${selectedCoin.change24h >= 0 ? 'price-up' : 'price-down'}`}>
                    {selectedCoin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{selectedCoin.change24h.toFixed(2)}%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gradient-crypto">${selectedCoin.price.toLocaleString()}</p>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-crypto-secondary">
                    {inputType === 'amount' ? `Số lượng ${selectedCoin.symbol}` : 'Số tiền (USDT)'}
                  </label>
                  <button
                    onClick={() => {
                      setInputType(inputType === 'amount' ? 'total' : 'amount');
                      setAmount('');
                    }}
                    className="text-xs text-crypto-accent hover:text-[var(--accent-secondary)] flex items-center gap-1"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    {inputType === 'amount' ? 'Nhập theo USDT' : 'Nhập theo số lượng'}
                  </button>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="crypto-input"
                  placeholder={inputType === 'amount' ? '0.00000000' : '0.00'}
                  step={inputType === 'amount' ? '0.00000001' : '0.01'}
                />
                {inputType === 'total' && (
                  <p className="text-xs text-crypto-muted mt-2">
                    ≈ {getCoinAmount().toFixed(8)} {selectedCoin.symbol}
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="p-4 rounded-xl bg-crypto-secondary border border-crypto">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-crypto-muted flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Số dư:
                  </span>
                  <span className="font-semibold text-crypto-primary">${user?.balance?.toLocaleString() || '0.00'} USDT</span>
                </div>
                {amount && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-crypto-muted">Số lượng:</span>
                      <span className="font-semibold text-crypto-primary">{getCoinAmount().toFixed(8)} {selectedCoin.symbol}</span>
                    </div>
                    {inputType === 'amount' && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-crypto-muted">Giá trị:</span>
                        <span className="font-semibold text-crypto-primary">${(getCoinAmount() * selectedCoin.price).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-crypto-muted">Phí (0.1%):</span>
                      <span className="font-semibold text-crypto-primary">${((getCoinAmount() * selectedCoin.price) * 0.001).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-crypto pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-crypto-primary">Tổng thanh toán:</span>
                    <span className="text-xl font-bold text-gradient-crypto">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                {tradeType === 'buy' && amount && calculateTotal() > (user?.balance || 0) && (
                  <p className="text-xs text-[var(--error)] mt-3 flex items-center gap-1">
                    ⚠️ Số dư không đủ! Cần thêm ${(calculateTotal() - (user?.balance || 0)).toFixed(2)} USDT
                  </p>
                )}
              </div>

              {/* Trade Button */}
              <button
                onClick={handleTrade}
                disabled={trading || !amount}
                className={`w-full py-4 rounded-xl font-semibold text-white transition ${tradeType === 'buy'
                  ? 'bg-[var(--success)] hover:glow-success'
                  : 'bg-[var(--error)] hover:glow-error'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {trading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  tradeType === 'buy' ? '🚀 Mua ngay' : '💸 Bán ngay'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
