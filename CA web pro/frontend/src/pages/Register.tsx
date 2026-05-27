import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, User, Eye, EyeOff, Briefcase, UserCheck } from 'lucide-react';
import API_BASE, { apiFetch } from '../config/api';
import './Auth.css';

export default function Register() {
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [caEmail, setCaEmail]             = useState('');
  const [role, setRole]                   = useState<'ca' | 'user'>('user');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const navigate  = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = { name, email, password, role };
      if (role === 'user' && caEmail) payload.caEmail = caEmail;

      const res = await apiFetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate(data.role === 'ca' ? '/ca/dashboard' : '/user/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Server disconnected. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <motion.div className="auth-hero" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="auth-hero-particles">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="auth-particle" style={{ left: `${(i * 8.3) % 100}%`, top: `${(i * 7.7) % 100}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + (i % 4)}s` }} />
          ))}
        </div>
        <div className="auth-hero-content">
          <div className="auth-brand">
            <div className="brand-logo" style={{ width: 56, height: 56 }}>CA</div>
            <h1>Digital CA Platform</h1>
          </div>
          <p className="auth-hero-tagline">Join 500+ businesses who trust us with their financial management and compliance needs.</p>

          {/* Role preview cards */}
          <div className="role-preview-cards">
            <div className={`role-preview-card ${role === 'ca' ? 'active' : ''}`} onClick={() => setRole('ca')}>
              <Briefcase size={22} />
              <div>
                <strong>Chartered Accountant</strong>
                <span>Manage clients, filings & deadlines</span>
              </div>
            </div>
            <div className={`role-preview-card ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>
              <UserCheck size={22} />
              <div>
                <strong>Client / Individual</strong>
                <span>File taxes, track requests & chat with CA</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-stats">
            <div><strong>500+</strong><span>Active Clients</span></div>
            <div><strong>15+</strong><span>Years Experience</span></div>
            <div><strong>99.9%</strong><span>Uptime</span></div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div className="auth-form-panel" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2>Create an Account</h2>
            <p className="text-muted">Get started free — no credit card required</p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle-group">
            <button
              type="button"
              id="role-ca-btn"
              className={`role-toggle-btn ${role === 'ca' ? 'active' : ''}`}
              onClick={() => setRole('ca')}
            >
              <Briefcase size={16} />
              I'm a CA
            </button>
            <button
              type="button"
              id="role-user-btn"
              className={`role-toggle-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              <UserCheck size={16} />
              I'm a Client
            </button>
          </div>

          <motion.div
            key={role}
            className={`role-badge-strip ${role}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {role === 'ca'
              ? '🏢 You will get access to the CA professional dashboard'
              : '👤 You will get access to the client dashboard'}
          </motion.div>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {role === 'user' && (
              <div className="form-group">
                <label>CA Email (Optional, to link profile)</label>
                <div className="input-wrapper">
                  <Briefcase className="input-icon" size={18} />
                  <input type="email" placeholder="ca@example.com" value={caEmail} onChange={(e) => setCaEmail(e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" id="register-submit-btn" className="btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? 'Creating Account...' : `Create ${role === 'ca' ? 'CA' : 'Client'} Account`} <ArrowRight size={18}/>
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in here →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
