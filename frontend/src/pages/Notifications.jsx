import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, Check, Trash2, RefreshCw } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Backend uses 'status' param: 'read' or 'unread'
      const params = {};
      if (filter === 'read') params.status = 'read';
      if (filter === 'unread') params.status = 'unread';
      
      const res = await notificationAPI.getNotifications(params);
      if (res.success) {
        // Backend returns data.notifications, not data directly
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
    return <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <p className="text-gray-600 mt-1">
            {notifications.filter(n => n.status === 'unread').length} thông báo chưa đọc
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Check className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </button>
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có thông báo</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border flex items-start gap-4 ${
                notification.status === 'read' ? 'bg-white' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.sentAt || notification.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="text-gray-600">{notification.message}</p>
              </div>
              <div className="flex gap-2">
                {notification.status === 'unread' && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    title="Đánh dấu đã đọc"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
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
