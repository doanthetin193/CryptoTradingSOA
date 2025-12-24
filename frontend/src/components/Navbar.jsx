import { Bell, User, LogOut, Wallet, Check, Trash2, X, ExternalLink, Zap } from 'lucide-react';
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
        setUnreadCount(res.data.unreadCount || 0);
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
    <nav className="fixed top-0 left-0 right-0 bg-crypto-secondary border-b border-crypto z-50 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-crypto flex items-center justify-center animate-pulse-glow">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="text-xl font-bold text-gradient-crypto">CryptoTrading</span>
            <span className="text-xl font-bold text-crypto-secondary ml-1">SOA</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Balance */}
          <div className="hidden md:flex items-center gap-2 bg-crypto-card border border-crypto px-4 py-2 rounded-xl">
            <Wallet className="w-5 h-5 text-crypto-accent" />
            <span className="font-bold text-crypto-primary">
              ${user?.balance?.toLocaleString() || '0.00'}
            </span>
            <span className="text-xs text-crypto-muted">USDT</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-crypto-card rounded-xl transition border border-transparent hover:border-crypto"
            >
              <Bell className="w-5 h-5 text-crypto-secondary" />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-crypto-card border border-crypto rounded-2xl shadow-xl max-h-[500px] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-crypto flex items-center justify-between">
                  <h3 className="font-semibold text-crypto-primary">Thông báo</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="p-1.5 hover:bg-crypto-hover rounded-lg text-crypto-accent"
                      title="Xem tất cả thông báo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1.5 hover:bg-crypto-hover rounded-lg text-crypto-muted"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-crypto-muted">
                      <Bell className="w-12 h-12 text-crypto-muted opacity-30 mx-auto mb-2" />
                      <p>Không có thông báo</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-crypto">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 hover:bg-crypto-hover transition ${notification.status === 'unread' ? 'bg-[rgba(0,212,170,0.05)]' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-medium text-sm text-crypto-primary">{notification.title}</h4>
                                {notification.status === 'unread' && (
                                  <span className="w-2 h-2 bg-crypto-accent rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-xs text-crypto-secondary mb-2">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-crypto-muted">
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
                                      className="p-1 text-crypto-accent hover:bg-[rgba(0,212,170,0.1)] rounded"
                                      title="Đánh dấu đã đọc"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification._id)}
                                    className="p-1 text-[var(--error)] hover:bg-[rgba(239,68,68,0.1)] rounded"
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
              className="flex items-center gap-3 hover:bg-crypto-card px-3 py-2 rounded-xl transition border border-transparent hover:border-crypto"
            >
              <div className="w-9 h-9 bg-gradient-crypto rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="font-medium text-crypto-primary text-sm">{user?.fullName || user?.email}</p>
                <p className="text-xs text-crypto-muted">{user?.role === 'admin' ? 'Administrator' : 'Trader'}</p>
              </div>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-crypto-card border border-crypto rounded-xl shadow-xl py-2">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-crypto-hover text-crypto-primary text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Cài đặt</span>
                </button>
                <div className="border-t border-crypto my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[rgba(239,68,68,0.1)] text-[var(--error)] text-sm"
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
