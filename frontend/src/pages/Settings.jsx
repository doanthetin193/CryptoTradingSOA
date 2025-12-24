import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userAPI, notificationAPI } from '../services/api';
import { User, Mail, Bell, Plus, Trash2, Save, Settings as SettingsIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Toast from '../components/Toast';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTC',
    coinId: 'bitcoin',
    condition: 'above',
    targetPrice: '',
  });

  const symbolToCoinId = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
    'DOT': 'polkadot',
    'SOL': 'solana',
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await notificationAPI.getPriceAlerts();
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await userAPI.updateProfile({ fullName: profile.fullName });
      if (res.success) {
        showToast('success', 'Cập nhật thông tin thành công!');
        await refreshUser();
      } else {
        showToast('error', res.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newAlert,
        coinId: symbolToCoinId[newAlert.symbol] || newAlert.symbol.toLowerCase(),
      };

      const res = await notificationAPI.createPriceAlert(payload);
      if (res.success) {
        showToast('success', 'Tạo cảnh báo giá thành công!');
        setAlerts([...alerts, res.data]);
        setNewAlert({ symbol: 'BTC', coinId: 'bitcoin', condition: 'above', targetPrice: '' });
      } else {
        showToast('error', res.message || 'Tạo cảnh báo thất bại');
      }
    } catch (error) {
      console.error('Alert creation error:', error);
      showToast('error', error.message);
    }
  };

  const deleteAlert = async (id) => {
    try {
      const res = await notificationAPI.deletePriceAlert(id);
      if (res.success) {
        showToast('success', 'Xóa cảnh báo thành công!');
        setAlerts(alerts.filter(a => a._id !== id));
      }
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const coins = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'XRP', 'DOGE'];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 min-w-[300px]">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-crypto flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-crypto-primary">Cài đặt</h1>
          <p className="text-crypto-muted">Quản lý tài khoản và cảnh báo giá</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="crypto-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
            <User className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <h2 className="text-xl font-bold text-crypto-primary">Thông tin cá nhân</h2>
        </div>

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-crypto-secondary mb-2">
              Họ tên
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="crypto-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-crypto-secondary mb-2">
              Email
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-crypto-hover flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-crypto-muted" />
              </div>
              <input
                type="email"
                value={profile.email}
                className="crypto-input bg-crypto-hover cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-crypto-muted mt-2">Email không thể thay đổi</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="crypto-btn crypto-btn-primary disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Price Alerts Section */}
      <div className="crypto-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.1)] flex items-center justify-center">
            <Bell className="w-5 h-5 text-crypto-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-crypto-primary">Cảnh báo giá</h2>
            <p className="text-sm text-crypto-muted">Nhận thông báo khi giá đạt mục tiêu</p>
          </div>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={createAlert} className="mb-6 p-4 bg-crypto-secondary rounded-xl border border-crypto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-crypto-secondary mb-2">
                Coin
              </label>
              <select
                value={newAlert.symbol}
                onChange={(e) => {
                  const symbol = e.target.value;
                  setNewAlert({
                    ...newAlert,
                    symbol,
                    coinId: symbolToCoinId[symbol] || symbol.toLowerCase()
                  });
                }}
                className="crypto-input"
              >
                {coins.map(coin => (
                  <option key={coin} value={coin} className="bg-crypto-card text-crypto-primary">{coin}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-crypto-secondary mb-2">
                Điều kiện
              </label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                className="crypto-input"
              >
                <option value="above" className="bg-crypto-card text-crypto-primary">📈 Vượt quá</option>
                <option value="below" className="bg-crypto-card text-crypto-primary">📉 Xuống dưới</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-crypto-secondary mb-2">
                Giá mục tiêu ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                className="crypto-input"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="crypto-btn crypto-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo cảnh báo</span>
          </button>
        </form>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-crypto-muted opacity-30 mx-auto mb-4" />
              <p className="text-crypto-muted">Chưa có cảnh báo nào</p>
              <p className="text-sm text-crypto-muted mt-1">Tạo cảnh báo để theo dõi giá</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert._id}
                className={`flex items-center justify-between p-4 rounded-xl border transition ${alert.triggered
                    ? 'bg-[rgba(16,185,129,0.1)] border-[var(--success)]'
                    : 'bg-crypto-secondary border-crypto hover:border-[var(--border-hover)]'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`coin-icon text-white ${alert.condition === 'above'
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-gradient-to-br from-red-400 to-rose-500'
                    }`}>
                    {alert.symbol?.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-crypto-primary text-lg">{alert.symbol}</span>
                      {alert.triggered && (
                        <span className="crypto-badge crypto-badge-success">
                          ✓ Đã kích hoạt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-crypto-secondary">
                      {alert.condition === 'above' ? (
                        <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[var(--error)]" />
                      )}
                      <span>{alert.condition === 'above' ? 'Vượt quá' : 'Xuống dưới'}</span>
                      <span className="font-bold text-crypto-accent">
                        ${alert.targetPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteAlert(alert._id)}
                  className="p-2 text-[var(--error)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
