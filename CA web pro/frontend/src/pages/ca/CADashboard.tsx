import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, CheckCircle, Activity, Bell, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './CALayout.css';

const COLORS = ['#5e5ce6', '#32d74b', '#ff9f0a', '#ff453a'];

const revenueData = [
  { month: 'Apr', rev: 42.5 }, { month: 'May', rev: 48.2 }, { month: 'Jun', rev: 45.8 },
  { month: 'Jul', rev: 56.4 }, { month: 'Aug', rev: 54.1 }, { month: 'Sep', rev: 59.8 },
];

const serviceData = [
  { name: 'Tax Filing', value: 35 },
  { name: 'GST', value: 25 },
  { name: 'Audit', value: 25 },
  { name: 'Advisory', value: 15 },
];

const recentActivity = [
  { text: 'Accepted Audit request from RK Exports', time: '10 mins ago', color: '#5e5ce6' },
  { text: 'Completed GST filing for Sun Pvt Ltd', time: '1 hour ago', color: '#32d74b' },
  { text: 'New query from Rahul Sharma', time: '3 hours ago', color: '#ff9f0a' },
];

const upcomingDeadlines = [
  { title: 'TDS Deposit Q3', date: 'Oct 07, 2026', urgency: 'high' },
  { title: 'GST GSTR-1', date: 'Oct 11, 2026', urgency: 'high' },
  { title: 'Income Tax Audit', date: 'Oct 31, 2026', urgency: 'medium' },
];

export default function CADashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalClients: 156, pending: 12, completed: 84, inProgress: 23 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/requests/stats/ca`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch { /* use fallback */ }
    };
    if (user?.token) fetchStats();
  }, [user]);

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: '#5e5ce6', bg: 'hsla(246,80%,60%,0.08)' },
    { label: 'Pending Requests', value: stats.pending, icon: ClipboardList, color: '#ff9f0a', bg: 'hsla(35,92%,48%,0.08)' },
    { label: 'In Progress', value: stats.inProgress, icon: Activity, color: '#bf5af2', bg: 'hsla(280,67%,64%,0.08)' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#32d74b', bg: 'hsla(145,65%,42%,0.08)' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="ca-page-header">
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p>Here's what's happening with your practice today.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem', color:'var(--text-muted)' }}>
          <Calendar size={15} />
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="ca-stat-grid">
        {statCards.map((s, i) => (
          <motion.div key={s.label} className="ca-stat-card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ background: s.bg, borderColor: `${s.color}22` }}
          >
            <span className="ca-stat-label">{s.label}</span>
            <span className="ca-stat-value">{s.value}</span>
            <div className="ca-stat-icon"><s.icon size={52} color={s.color} /></div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 0.6fr', gap:'1rem', marginBottom:'1rem' }}>
        <motion.div className="ca-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
          <div className="ca-card-header">
            <h3><TrendingUp size={17} /> Revenue Trend</h3>
            <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>FY 2025-26</span>
          </div>
          <div style={{ width: '100%', height: 220, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="caRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5e5ce6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
                <Tooltip contentStyle={{ backgroundColor:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:'8px', fontSize:'0.82rem' }} formatter={(v: any) => [`₹${v}L`, 'Revenue']} />
                <Area type="monotone" dataKey="rev" stroke="#5e5ce6" strokeWidth={2.5} fill="url(#caRevGrad)" dot={{ fill:'#5e5ce6', r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="ca-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}>
          <div className="ca-card-header">
            <h3><Activity size={17} /> Service Mix</h3>
          </div>
          <div style={{ width: '100%', height: 140, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serviceData} innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {serviceData.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:'8px', fontSize:'0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', marginTop:'0.5rem' }}>
            {serviceData.map((s,i) => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.78rem', color:'var(--text-muted)' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i], display:'inline-block', flexShrink:0 }} />
                {s.name} <span style={{ marginLeft:'auto', color:'var(--text-main)', fontWeight:600 }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        {/* Activity */}
        <motion.div className="ca-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
          <div className="ca-card-header">
            <h3><Bell size={17} /> Recent Activity</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, marginTop:'0.35rem', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'0.85rem', color:'var(--text-main)', margin:0 }}>{a.text}</p>
                  <small style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{a.time}</small>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Deadlines */}
        <motion.div className="ca-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}>
          <div className="ca-card-header">
            <h3><AlertCircle size={17} /> Upcoming Deadlines</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {upcomingDeadlines.map((d, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem', background:'var(--bg-body)', borderRadius:'10px' }}>
                <div style={{ width:4, height:36, borderRadius:2, background: d.urgency==='high' ? '#ff453a' : '#ff9f0a', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'0.85rem', fontWeight:600, margin:0, color:'var(--text-main)' }}>{d.title}</p>
                  <small style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{d.date}</small>
                </div>
                <span className={`ca-badge ${d.urgency}`}>{d.urgency}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
