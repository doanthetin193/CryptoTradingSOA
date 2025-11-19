import { Bell, User, LogOut, Wallet, Check, Trash2, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.getNotifications({ limit: 10 });
      if (res.success) {
        setNotifications(res.data?.notifications || res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, status: 'read' } : n
      ));
      fetchUnreadCount();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      fetchUnreadCount();
    } catch (error) {
      console.error(error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'trade': return '💰';
      case 'price_alert': return '📈';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Wallet className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">CryptoTrading SOA</span>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-6">
          {/* Balance */}
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              ${user?.balance?.toLocaleString() || '0.00'}
            </span>
            <span className="text-sm text-gray-600">USDT</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border max-h-[500px] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Thông báo</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                      title="Xem tất cả thông báo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>Không có thông báo</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 hover:bg-gray-50 ${
                            notification.status === 'unread' ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                {notification.status === 'unread' && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  {new Date(notification.sentAt || notification.createdAt).toLocaleString('vi-VN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <div className="flex gap-1">
                                  {notification.status === 'unread' && (
                                    <button
                                      onClick={() => markAsRead(notification._id)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                      title="Đánh dấu đã đọc"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification._id)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{user?.fullName || user?.email}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
