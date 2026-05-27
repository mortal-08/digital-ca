import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, FileText, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './UserLayout.css';

const notifications = [
  { text: 'ITR filing deadline is approaching (July 31st)', time: '2 days ago', color: '#ef4444' },
  { text: 'New GST circular on input tax credit', time: '1 week ago', color: '#3b82f6' },
  { text: 'CA assigned to your Audit request', time: '3 hours ago', color: '#10b981' },
];

export default function UserDashboard() {
  const { user } = useAuth();
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

  const pending   = requests.filter(r => r.status === 'Pending').length;
  const progress  = requests.filter(r => r.status === 'In Progress').length;
  const completed = requests.filter(r => r.status === 'Completed').length;

  const statCards = [
    { label: 'Active Requests', value: pending + progress, icon: Clock, bg: '#f5f3ff', iconBg: '#7c3aed', color: '#7c3aed' },
    { label: 'In Progress', value: progress, icon: FileText, bg: '#fef3c7', iconBg: '#d97706', color: '#d97706' },
    { label: 'Completed', value: completed, icon: CheckCircle, bg: '#d1fae5', iconBg: '#059669', color: '#059669' },
  ];

  const statusMap: Record<string, string> = { 'Pending':'pending', 'In Progress':'progress', 'Completed':'done', 'Rejected':'rejected' };

  return (
    <div>
      <h1 className="user-page-title">My Dashboard</h1>
      <p className="user-page-sub">Track your financial services and documents at a glance.</p>

      {/* Stat cards */}
      <div className="user-stat-grid">
        {statCards.map((s, i) => (
          <motion.div key={s.label} className="user-stat-card"
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            style={{ background: s.bg, borderColor: `${s.color}30` }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:s.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <s.icon size={20} color="white" />
              </div>
              <span style={{ fontSize:'0.82rem', fontWeight:600, color: s.color }}>{s.label}</span>
            </div>
            <p style={{ fontSize:'2rem', fontWeight:800, margin:0, color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick action CTA */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
        style={{ background:'linear-gradient(135deg,#10b981,#059669)', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
        <div>
          <h3 style={{ color:'white', fontWeight:800, fontSize:'1.1rem', margin:'0 0 0.3rem' }}>Need help with a service?</h3>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.88rem', margin:0 }}>Submit a request and our CA will get back to you shortly.</p>
        </div>
        <Link to="/user/services" className="user-btn" style={{ background:'white', color:'#059669', whiteSpace:'nowrap', textDecoration:'none', fontWeight:700 }}>
          Request Service <ArrowRight size={16} />
        </Link>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:'1rem' }}>
        {/* Recent requests */}
        <motion.div className="user-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h3 style={{ fontWeight:700, fontSize:'0.95rem', margin:0 }}>Recent Requests</h3>
            <Link to="/user/tracking" style={{ fontSize:'0.8rem', color:'#10b981', fontWeight:600, textDecoration:'none' }}>View all →</Link>
          </div>
          {requests.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'#9ca3af' }}>
              <Clock size={40} style={{ marginBottom:'0.75rem', opacity:0.4 }} />
              <p style={{ margin:0 }}>No requests yet. <Link to="/user/services" style={{ color:'#10b981' }}>Request a service →</Link></p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {requests.slice(0,4).map((r) => (
                <div key={r._id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'#f9fafb', borderRadius:10 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <FileText size={18} color="#7c3aed" />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:'0.88rem' }}>{r.serviceType}</p>
                    <small style={{ color:'#9ca3af', fontSize:'0.75rem' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</small>
                  </div>
                  <span className={`user-badge ${statusMap[r.status] || 'pending'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div className="user-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}>
          <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Bell size={17} color="#10b981" /> Notifications
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {notifications.map((n, i) => (
              <div key={i} style={{ display:'flex', gap:'0.7rem' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:n.color, marginTop:5, flexShrink:0 }} />
                <div>
                  <p style={{ margin:0, fontSize:'0.83rem', color:'var(--text-main)' }}>{n.text}</p>
                  <small style={{ color:'#9ca3af', fontSize:'0.73rem' }}>{n.time}</small>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
