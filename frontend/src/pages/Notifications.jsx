import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, Check, Trash2, RefreshCw, CheckCheck, Filter } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'read') params.status = 'read';
      if (filter === 'unread') params.status = 'unread';

      const res = await notificationAPI.getNotifications(params);
      if (res.success) {
        setNotifications(res.data?.notifications || res.data || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await notificationAPI.markAsRead(id);
      if (res.success) {
        setNotifications(notifications.map(n =>
          n._id === id ? { ...n, status: 'read' } : n
        ));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
          </div>
          <p className="text-crypto-secondary">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-crypto flex items-center justify-center relative">
            <Bell className="w-6 h-6 text-black" />
            {unreadCount > 0 && (
              <span className="notification-badge !top-0 !right-0">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-crypto-primary">Thông báo</h1>
            <p className="text-crypto-muted">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="crypto-btn crypto-btn-primary"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đánh dấu tất cả</span>
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="crypto-btn crypto-btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-crypto-card border border-crypto rounded-xl">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
                  ? 'bg-gradient-crypto text-black'
                  : 'text-crypto-muted hover:text-crypto-primary hover:bg-crypto-hover'
                }`}
            >
              {f === 'all' ? 'Tất cả' : f === 'unread' ? '🔵 Chưa đọc' : '✅ Đã đọc'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-crypto-muted">
          <Filter className="w-4 h-4" />
          Tổng: <span className="font-semibold text-crypto-primary">{notifications.length}</span> thông báo
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="crypto-card text-center py-20">
            <Bell className="w-16 h-16 text-crypto-muted opacity-30 mx-auto mb-4" />
            <p className="text-crypto-muted">Không có thông báo</p>
            <p className="text-sm text-crypto-muted mt-1">Các hoạt động sẽ hiển thị ở đây</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`crypto-card !p-4 flex items-start gap-4 transition ${notification.status === 'unread'
                  ? 'border-l-4 border-l-[var(--accent-primary)] bg-[rgba(0,212,170,0.05)]'
                  : ''
                }`}
            >
              <div className="w-12 h-12 rounded-xl bg-crypto-hover flex items-center justify-center text-2xl flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-crypto-primary">{notification.title}</h3>
                  <span className="text-xs text-crypto-muted ml-2 flex-shrink-0">
                    {new Date(notification.sentAt || notification.createdAt).toLocaleString('vi-VN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-crypto-secondary text-sm">{notification.message}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {notification.status === 'unread' && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="p-2 text-crypto-accent hover:bg-[rgba(0,212,170,0.1)] rounded-lg transition"
                    title="Đánh dấu đã đọc"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="p-2 text-[var(--error)] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition"
                  title="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
