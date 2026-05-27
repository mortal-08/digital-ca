import { Outlet } from 'react-router-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, FolderOpen,
  CheckSquare, MessageSquare, Settings, LogOut,
  Bell, Search, ChevronDown, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './CALayout.css';

const navItems = [
  { name: 'Dashboard',  path: '/ca/dashboard', icon: LayoutDashboard },
  { name: 'Clients',    path: '/ca/clients',   icon: Users },
  { name: 'Requests',   path: '/ca/requests',  icon: ClipboardList },
  { name: 'Documents',  path: '/ca/documents', icon: FolderOpen },
  { name: 'Tasks',      path: '/ca/tasks',     icon: CheckSquare },
  { name: 'Messages',   path: '/ca/messages',  icon: MessageSquare },
];

export default function CALayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="ca-shell">
      {/* ── Sidebar ── */}
      <aside className="ca-sidebar">
        <div className="ca-brand">
          <div className="ca-brand-icon"><Briefcase size={20} /></div>
          <div>
            <h2>Digital CA</h2>
            <span>Professional</span>
          </div>
        </div>

        <nav className="ca-nav">
          <p className="ca-nav-label">MAIN MENU</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/ca/dashboard'}
              className={({ isActive }) => `ca-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ca-sidebar-footer">
          <NavLink to="/ca/settings" className={({ isActive }) => `ca-nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={19} /><span>Settings</span>
          </NavLink>
          <button className="ca-nav-item ca-logout-btn" onClick={handleLogout}>
            <LogOut size={19} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ca-main">
        {/* Topbar */}
        <header className="ca-topbar">
          <div className="ca-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search clients, requests…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
          <div className="ca-topbar-right">
            <button className="ca-notif-btn" id="ca-notifications-btn">
              <Bell size={19} />
              <span className="ca-notif-dot" />
            </button>
            <div className="ca-profile-menu" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="ca-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="ca-profile-info">
                <span>{user?.name}</span>
                <small>Chartered Accountant</small>
              </div>
              <ChevronDown size={16} />
              {profileOpen && (
                <div className="ca-profile-dropdown">
                  <NavLink to="/ca/settings">Profile Settings</NavLink>
                  <button onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="ca-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
