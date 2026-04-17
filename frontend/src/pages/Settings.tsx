import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Shield, Eye, EyeOff, Save, CheckCircle, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import './Settings.css';

type Tab = 'profile' | 'security' | 'notifications' | 'appearance';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [firm, setFirm] = useState('');

  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passError, setPassError] = useState('');

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [deadlineNotif, setDeadlineNotif] = useState(true);
  const [newsNotif, setNewsNotif] = useState(false);
  const [taskNotif, setTaskNotif] = useState(true);

  // Appearance
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark';
  });

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTheme = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    const resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('ca_theme', mode);
    showSaved();
  };

  const handlePasswordChange = async () => {
    setPassError('');
    if (newPass.length < 6) { setPassError('Password must be at least 6 characters'); return; }
    if (newPass !== confirmPass) { setPassError('Passwords do not match'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      if (res.ok) {
        setCurrentPass(''); setNewPass(''); setConfirmPass('');
        showSaved();
      } else {
        const data = await res.json();
        setPassError(data.message || 'Password change failed');
      }
    } catch {
      setPassError('Server error. Try again.');
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Lock },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="settings-page">
      <header className="dashboard-header">
        <div>
          <h1>Settings</h1>
          <p className="text-muted">Manage your account, security, and preferences</p>
        </div>
      </header>

      {/* Saved toast */}
      {saved && (
        <motion.div className="settings-toast" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <CheckCircle size={16} /> Changes saved successfully
        </motion.div>
      )}

      <div className="settings-layout">
        {/* Sidebar tabs */}
        <nav className="settings-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="settings-content">
          {/* ---- Profile ---- */}
          {activeTab === 'profile' && (
            <motion.div className="settings-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3>Profile Information</h3>
              <p className="text-muted">Update your personal details</p>

              <div className="settings-avatar">
                <div className="avatar-circle">{name.charAt(0).toUpperCase() || 'U'}</div>
                <div>
                  <strong>{name || 'User'}</strong>
                  <span className="text-muted">{user?.role || 'Client'}</span>
                </div>
              </div>

              <div className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Email (read-only)</label>
                    <input type="email" value={email} disabled />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Firm / Company Name</label>
                    <input type="text" placeholder="Your CA Firm" value={firm} onChange={e => setFirm(e.target.value)} />
                  </div>
                </div>
                <button className="btn-primary" onClick={showSaved}><Save size={16} /> Save Profile</button>
              </div>
            </motion.div>
          )}

          {/* ---- Security ---- */}
          {activeTab === 'security' && (
            <motion.div className="settings-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3><Shield size={20} /> Security & Password</h3>
              <p className="text-muted">Keep your account secure</p>

              {passError && <div className="auth-error" style={{ marginTop: '1rem' }}>{passError}</div>}

              <div className="settings-form" style={{ maxWidth: 400 }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={16} />
                    <input type={showCurrent ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Enter current password" />
                    <button type="button" className="eye-btn" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={16} />
                    <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" />
                    <button type="button" className="eye-btn" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={16} />
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Re-enter new password" />
                  </div>
                </div>
                <button className="btn-primary" onClick={handlePasswordChange}><Shield size={16} /> Update Password</button>
              </div>

              <div className="security-info">
                <h4>Account Security</h4>
                <div className="security-item"><span className="security-dot green" /> Password set</div>
                <div className="security-item"><span className="security-dot green" /> JWT authentication active</div>
                <div className="security-item"><span className="security-dot yellow" /> Two-factor authentication — Coming soon</div>
              </div>
            </motion.div>
          )}

          {/* ---- Notifications ---- */}
          {activeTab === 'notifications' && (
            <motion.div className="settings-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3><Bell size={20} /> Notification Preferences</h3>
              <p className="text-muted">Control what alerts and updates you receive</p>

              <div className="toggle-list">
                {[
                  { label: 'Email Notifications', desc: 'Receive important updates via email', value: emailNotif, setter: setEmailNotif },
                  { label: 'Deadline Alerts', desc: 'Get notified 3 days before deadlines', value: deadlineNotif, setter: setDeadlineNotif },
                  { label: 'Regulatory News', desc: 'RBI, SEBI, Tax Dept updates', value: newsNotif, setter: setNewsNotif },
                  { label: 'Task Assignments', desc: 'Notify when tasks are assigned to you', value: taskNotif, setter: setTaskNotif },
                ].map((item) => (
                  <div key={item.label} className="toggle-item">
                    <div>
                      <strong>{item.label}</strong>
                      <span className="text-muted">{item.desc}</span>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={item.value} onChange={() => { item.setter(!item.value); showSaved(); }} />
                      <span className="slider" />
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---- Appearance ---- */}
          {activeTab === 'appearance' && (
            <motion.div className="settings-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3><Palette size={20} /> Appearance</h3>
              <p className="text-muted">Customize the look and feel of the platform</p>

              <div className="theme-selector">
                {[
                  { id: 'light' as const, label: 'Light', icon: Sun, desc: 'Clean and bright' },
                  { id: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                  { id: 'system' as const, label: 'System', icon: Monitor, desc: 'Follow OS setting' },
                ].map(t => (
                  <button key={t.id} className={`theme-card ${themeMode === t.id ? 'active' : ''}`} onClick={() => handleTheme(t.id)}>
                    <div className={`theme-preview ${t.id}`}>
                      <t.icon size={24} />
                    </div>
                    <strong>{t.label}</strong>
                    <span>{t.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
