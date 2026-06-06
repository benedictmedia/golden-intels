import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
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
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[60vh] overflow-auto">
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
                <p className="text-[10px] text-gray-400 mt-2">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
