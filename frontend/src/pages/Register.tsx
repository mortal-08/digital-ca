import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, User, Eye, EyeOff, Shield, TrendingUp, Calculator, FileText } from 'lucide-react';
import API_BASE from '../config/api';
import './Auth.css';

const features = [
  { icon: Shield, title: 'Bank-Grade Security', desc: 'AES-256 encryption for all your data' },
  { icon: TrendingUp, title: 'Real-Time Analytics', desc: 'Live dashboards and financial insights' },
  { icon: Calculator, title: 'Smart Calculators', desc: 'Tax, GST, EMI & HRA tools built-in' },
  { icon: FileText, title: 'Cloud Documents', desc: 'Secure uploads powered by Cloudinary' },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'client' })
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
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
            <span key={i} className="auth-particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + Math.random() * 4}s` }} />
          ))}
        </div>
        <div className="auth-hero-content">
          <div className="auth-brand">
            <div className="brand-logo" style={{ width: 56, height: 56 }}>CA</div>
            <h1>Digital CA Platform</h1>
          </div>
          <p className="auth-hero-tagline">Join 500+ businesses who trust us with their financial management and compliance needs.</p>
          <div className="auth-features-grid">
            {features.map((f, i) => (
              <motion.div key={f.title} className="auth-feature" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
                <div className="auth-feature-icon"><f.icon size={20} /></div>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </motion.div>
            ))}
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

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? 'Creating Account...' : 'Get Started Free'} <ArrowRight size={18}/>
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
