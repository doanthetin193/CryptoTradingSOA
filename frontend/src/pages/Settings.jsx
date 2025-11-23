import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userAPI, notificationAPI } from '../services/api';
import { User, Mail, Bell, Plus, Trash2, Save } from 'lucide-react';
import Toast from '../components/Toast';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Profile settings
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  // Price alerts
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTC',
    coinId: 'bitcoin',
    condition: 'above',
    targetPrice: '',
  });

  // Symbol to CoinId mapping
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
      // Only send fullName, email cannot be changed
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

  const coins = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'MATIC', 'AVAX'];

  return (
    <div className="p-6 max-w-4xl">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        </div>

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ tên
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                disabled
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Price Alerts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Cảnh báo giá</h2>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={createAlert} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {coins.map(coin => (
                  <option key={coin} value={coin}>{coin}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điều kiện
              </label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="above">Vượt quá</option>
                <option value="below">Xuống dưới</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá mục tiêu ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tạo cảnh báo
          </button>
        </form>

        {/* Alerts List */}
        <div className="space-y-2">
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có cảnh báo nào</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg">{alert.symbol}</span>
                  <span className="text-gray-600">
                    {alert.condition === 'above' ? 'Vượt quá' : 'Xuống dưới'}
                  </span>
                  <span className="font-semibold text-blue-600">
                    ${alert.targetPrice.toLocaleString()}
                  </span>
                  {alert.triggered && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Đã kích hoạt
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteAlert(alert._id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
