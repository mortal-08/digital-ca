import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, FileText, PieChart, MessageSquare, Settings, ClipboardList, Newspaper } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calculators', path: '/dashboard/calculators', icon: Calculator },
    { name: 'Documents', path: '/dashboard/documents', icon: FileText },
    { name: 'Reports', path: '/dashboard/reports', icon: PieChart },
    { name: 'Tasks', path: '/dashboard/tasks', icon: ClipboardList },
    { name: 'News & Updates', path: '/dashboard/news', icon: Newspaper },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">CA</div>
        <h2>Digital CA</h2>
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
        <NavLink to="/dashboard/settings" className="nav-item">
          <Settings className="nav-icon" size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
