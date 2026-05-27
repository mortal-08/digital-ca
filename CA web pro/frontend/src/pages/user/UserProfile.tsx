import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Clock, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './UserLayout.css';

const statusMap: Record<string, string> = { 'Completed':'done', 'In Progress':'progress', 'Pending':'pending', 'Rejected':'rejected' };

export default function UserProfile() {
  const { user, login } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/requests/my`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) setRequests(await res.json());
      } catch { }
    };
    if (user?.token) fetchRequests();
  }, [user]);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || '',
    pan: user?.pan || '',
    gstin: user?.gstin || '',
    caEmail: user?.caEmail || '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || '',
        pan: user.pan || '',
        gstin: user.gstin || '',
        caEmail: user.caEmail || '',
      });
    }
  }, [user]);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setSaved(false);
    try {
      const res = await apiFetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          company: profile.company,
          address: profile.address,
          pan: profile.pan,
          gstin: profile.gstin,
          caEmail: user?.role === 'user' ? profile.caEmail : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update profile');
        return;
      }

      const updatedUser = {
        ...user,
        ...data,
        token: user?.token
      };
      login(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <h1 className="user-page-title"><User size={22} color="#10b981" /> My Profile</h1>
      <p className="user-page-sub">Manage your personal information and view your service history.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Profile form */}
        <div className="user-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, flexShrink: 0 }}>
              {profile.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontWeight: 800, margin: '0 0 0.15rem' }}>{profile.name}</h3>
              <small style={{ color: '#10b981', fontWeight: 600 }}>Client Account</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[
              { key: 'name', label: 'Full Name', icon: User, type: 'text' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email', disabled: true },
              { key: 'phone', label: 'Phone', icon: Phone, type: 'tel' },
              { key: 'company', label: 'Company', icon: Building2, type: 'text' },
              { key: 'pan', label: 'PAN Number', icon: User, type: 'text' },
              { key: 'gstin', label: 'GSTIN', icon: User, type: 'text' },
              ...(user?.role === 'user' ? [{ key: 'caEmail', label: 'CA Email Address', icon: Mail, type: 'email' }] : [])
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: '#6b7280' }}>
                  <f.icon size={11} style={{ display: 'inline', marginRight: 4 }} />{f.label}
                </label>
                <input type={f.type} value={(profile as any)[f.key] || ''}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.label}
                  disabled={(f as any).disabled}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: 9, background: (f as any).disabled ? '#f3f4f6' : '#f9fafb', color: (f as any).disabled ? '#9ca3af' : '#111827', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: '#6b7280' }}>Address</label>
            <textarea value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} rows={2} placeholder="Your full address"
              style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: 9, background: '#f9fafb', color: '#111827', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.85rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button className="user-btn user-btn-primary" style={{ marginTop: '1.1rem' }} onClick={handleSave}>
            <Save size={15} /> {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Service history */}
        <div>
          <motion.div className="user-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={17} color="#10b981" /> Service History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                  No service requests found.
                </div>
              ) : (
                requests.map((r, i) => (
                  <motion.div key={r._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f9fafb', borderRadius: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} color="#059669" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.88rem' }}>{r.serviceType}</p>
                      <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.88rem', color: '#059669' }}>
                        {r.amount > 0 ? `₹${r.amount.toLocaleString('en-IN')}` : '₹0'}
                      </p>
                      <span className={`user-badge ${statusMap[r.status] || 'pending'}`} style={{ fontSize: '0.7rem' }}>{r.status}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600, margin: '0 0 0.3rem' }}>Total Services Used</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', margin: 0 }}>{requests.length}</p>
              <small style={{ color: '#16a34a' }}>
                Total Spent: ₹{requests
                  .filter(r => r.status === 'Completed' || r.paymentStatus === 'Paid')
                  .reduce((sum, r) => sum + (r.amount || 0), 0)
                  .toLocaleString('en-IN')}
              </small>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
