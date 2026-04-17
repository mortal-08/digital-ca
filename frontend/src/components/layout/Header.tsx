import { Bell, Search, User, Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDark]);

  return (
    <header className="app-header glass-panel">
      <div className="search-bar">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search for clients, reports..." />
      </div>

      <div className="header-actions">
        <button className="icon-btn" onClick={() => setIsDark(!isDark)} title="Toggle Theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn notification-btn" title="Notifications">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name || "User"}</p>
            <p className="user-role" style={{textTransform: 'capitalize'}}>{user?.role || "Client"}</p>
          </div>
        </div>
        <button className="icon-btn" onClick={logout} title="Sign Out" style={{marginLeft: '0.5rem', color: 'var(--status-danger)'}}>
            <LogOut size={20}/>
        </button>
      </div>
    </header>
  );
}
