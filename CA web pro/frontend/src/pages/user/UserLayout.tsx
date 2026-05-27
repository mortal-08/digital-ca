import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Upload, Clock, MessageSquare, User, LogOut, Bell, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './UserLayout.css';

const navItems = [
  { name: 'Dashboard',  path: '/user/dashboard', icon: LayoutDashboard },
  { name: 'Find CA',    path: '/user/find-ca',   icon: Shield },
  { name: 'Services',   path: '/user/services',  icon: PlusCircle },
  { name: 'Documents',  path: '/user/documents', icon: Upload },
  { name: 'Tracking',   path: '/user/tracking',  icon: Clock },
  { name: 'Messages',   path: '/user/messages',  icon: MessageSquare },
  { name: 'Profile',    path: '/user/profile',   icon: User },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="user-shell">
      {/* Sidebar */}
      <aside className="user-sidebar">
        <div className="user-brand">
          <div className="user-brand-icon">CA</div>
          <div>
            <h2>Digital CA</h2>
            <span>Client Portal</span>
          </div>
        </div>

        <nav className="user-nav">
          {navItems.map(item => (
            <NavLink key={item.name} to={item.path} end={item.path === '/user/dashboard'}
              className={({ isActive }) => `user-nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-sidebar-footer">
          <div className="user-avatar-mini">
            <div className="user-av">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p>{user?.name}</p>
              <small>Client</small>
            </div>
          </div>
          <button className="user-logout-btn" onClick={handleLogout}><LogOut size={17} /></button>
        </div>
      </aside>

      {/* Main */}
      <div className="user-main">
        <header className="user-topbar">
          <div>
            <h2 className="user-topbar-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
            <p className="user-topbar-sub">Manage your financial services with ease.</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ position:'relative' }}>
              <button className="user-notif-btn" id="user-notifications-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={19} />
                <span className="user-notif-dot" />
              </button>
              {notifOpen && (
                <div className="user-notif-dropdown">
                  <p style={{ fontWeight:700, fontSize:'0.88rem', padding:'0.75rem 1rem', borderBottom:'1px solid var(--border-color)', margin:0 }}>Notifications</p>
                  {[
                    { text:'Your Tax Filing request is In Progress', time:'2 hrs ago', color:'#5e5ce6' },
                    { text:'Document approved by your CA', time:'Yesterday', color:'#32d74b' },
                    { text:'Reminder: GST Return due May 20', time:'2 days ago', color:'#ff9f0a' },
                  ].map((n,i) => (
                    <div key={i} style={{ padding:'0.7rem 1rem', borderBottom:'1px solid var(--border-color)', display:'flex', gap:'0.6rem' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:n.color, marginTop:5, flexShrink:0 }} />
                      <div>
                        <p style={{ margin:0, fontSize:'0.82rem', color:'var(--text-main)' }}>{n.text}</p>
                        <small style={{ color:'var(--text-muted)', fontSize:'0.72rem' }}>{n.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
