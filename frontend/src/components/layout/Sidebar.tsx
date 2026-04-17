import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calculator, PieChart, MessageSquare, Settings, ClipboardList, Newspaper, LogOut, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calculators', path: '/dashboard/calculators', icon: Calculator },
    { name: 'Documents', path: '/dashboard/documents', icon: Upload },
    { name: 'Reports', path: '/dashboard/reports', icon: PieChart },
    { name: 'Tasks', path: '/dashboard/tasks', icon: ClipboardList },
    { name: 'News', path: '/dashboard/news', icon: Newspaper },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">CA</div>
        <div className="brand-text">
          <h2>Digital CA</h2>
          <span className="brand-sub">Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isAdmin && <span className="admin-badge">Admin</span>}
        <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings className="nav-icon" size={20} />
          <span>Settings</span>
        </NavLink>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut className="nav-icon" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
