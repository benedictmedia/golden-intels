import { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import axios from 'axios';
import API_URL from '../api/config';

export default function NotificationBell({ onNotificationClick }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  const deleteNotification = async (event, id) => {
    event.stopPropagation()
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.filter(notification => notification.id !== id))
      setUnreadCount(prev => Math.max(0, prev - (notifications.find(notification => notification.id === id && !notification.read) ? 1 : 0)))
    } catch (error) {
      console.error('Failed to delete notification from this portal:', error)
      alert('Could not delete this notification. Please try again.')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all"
      >
        <Bell size={22} className={`text-gray-600 ${unreadCount > 0 ? 'animate-shake' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[420px] overflow-auto">
          <div className="p-4 border-b bg-white sticky top-0">
            <h3 className="font-bold text-lg">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No notifications yet</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={async () => {
                  await markAsRead(notif.id);
                  setShowPanel(false);
                  if (onNotificationClick) onNotificationClick(notif);
                }}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
              >
                <p className="font-medium text-sm">{notif.title}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] text-gray-400">{new Date(notif.createdAt).toLocaleString()}</p>
                  <button
                    type="button"
                    onClick={event => deleteNotification(event, notif.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete notification from this portal"
                    title="Delete for me"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
