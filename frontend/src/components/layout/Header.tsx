import { Bell, Search, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import './Header.css';

const notifications = [
  { id: 1, text: 'ITR deadline approaching — July 31, 2026', time: '2h ago', unread: true },
  { id: 2, text: 'New client registration: Patel Industries', time: '5h ago', unread: true },
  { id: 3, text: 'GST Q4 Return submitted successfully', time: 'Yesterday', unread: false },
  { id: 4, text: 'TDS deposit reminder — Due in 3 days', time: '2 days ago', unread: false },
  { id: 5, text: 'Audit report ready for ABC Textiles', time: '3 days ago', unread: false },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState(notifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <header className="app-header">
      <div className="search-bar">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search clients, reports, documents..." />
      </div>

      <div className="header-actions">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button className="icon-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} title="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="dropdown-panel notif-panel">
              <div className="dropdown-header">
                <strong>Notifications</strong>
                {unreadCount > 0 && <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>}
              </div>
              <div className="notif-list">
                {notifs.map(n => (
                  <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className="notif-dot-wrap">{n.unread && <span className="notif-dot" />}</div>
                    <div className="notif-content">
                      <p>{n.text}</p>
                      <small>{n.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="dropdown-wrapper" ref={profileRef}>
          <button className="profile-trigger" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}>
            <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'User'}</p>
              <p className="user-role" style={{ textTransform: 'capitalize' }}>{user?.role || 'Client'}</p>
            </div>
            <ChevronDown size={16} className={`chevron ${showProfile ? 'open' : ''}`} />
          </button>
          {showProfile && (
            <div className="dropdown-panel profile-panel">
              <div className="profile-header">
                <div className="avatar-lg">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                <div>
                  <strong>{user?.name}</strong>
                  <small>{user?.email}</small>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { navigate('/dashboard/settings'); setShowProfile(false); }}>
                <Settings size={16} /> Account Settings
              </button>
              <button className="dropdown-item" onClick={() => { navigate('/dashboard/settings'); setShowProfile(false); }}>
                <User size={16} /> Edit Profile
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={() => { logout(); navigate('/'); }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
