import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Bell, Clock, FileText, TrendingUp, AlertCircle, Calendar, IndianRupee, Activity, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import './Dashboard.css';

const COLORS = ['#5e5ce6', '#32d74b', '#ff9f0a', '#ff453a'];

const revenueData = [
  { month: 'Jan', rev: 32 }, { month: 'Feb', rev: 38 }, { month: 'Mar', rev: 45 },
  { month: 'Apr', rev: 41 }, { month: 'May', rev: 49 }, { month: 'Jun', rev: 53 },
  { month: 'Jul', rev: 48 }, { month: 'Aug', rev: 56 }, { month: 'Sep', rev: 52 },
  { month: 'Oct', rev: 61 }, { month: 'Nov', rev: 58 }, { month: 'Dec', rev: 65 },
];

const serviceData = [
  { name: 'Tax Filing', value: 35 }, { name: 'GST Returns', value: 28 },
  { name: 'Audit', value: 22 }, { name: 'Advisory', value: 15 },
];

const activities = [
  { icon: FileText, text: 'ITR filed for Sharma Enterprises', time: '2 hours ago', color: '#5e5ce6' },
  { icon: Users, text: 'New client onboarded — Patel Industries', time: '5 hours ago', color: '#32d74b' },
  { icon: IndianRupee, text: 'GST Return Q4 submitted', time: 'Yesterday', color: '#ff9f0a' },
  { icon: Calendar, text: 'Audit scheduled — ABC Textiles', time: '2 days ago', color: '#bf5af2' },
];

const deadlines = [
  { title: 'ITR Filing (Individuals)', date: 'Jul 31, 2026', urgency: 'high' },
  { title: 'TDS Q1 Return', date: 'Jul 31, 2026', urgency: 'high' },
  { title: 'GST Annual Return', date: 'Dec 31, 2026', urgency: 'medium' },
  { title: 'Advance Tax - 2nd Installment', date: 'Sep 15, 2026', urgency: 'medium' },
];

const quickActions = [
  { icon: FileText, label: 'New ITR', gradient: 'linear-gradient(135deg, #5e5ce6, #818cf8)' },
  { icon: IndianRupee, label: 'GST Return', gradient: 'linear-gradient(135deg, #32d74b, #6dd5fa)' },
  { icon: Users, label: 'Add Client', gradient: 'linear-gradient(135deg, #ff9f0a, #fbbf24)' },
  { icon: Target, label: 'New Task', gradient: 'linear-gradient(135deg, #bf5af2, #a78bfa)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalClients: 156, activeReturns: 42, pendingTasks: 8, revenue: 65.4 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (err) { /* use fallback data */ }
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, trend: '+12%', positive: true, gradient: 'linear-gradient(135deg, hsla(246, 80%, 60%, 0.12), hsla(246, 80%, 60%, 0.04))' },
    { label: 'Active Returns', value: stats.activeReturns, icon: FileText, trend: '+8', positive: true, gradient: 'linear-gradient(135deg, hsla(145, 65%, 52%, 0.12), hsla(145, 65%, 52%, 0.04))' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: Clock, trend: '-3', positive: true, gradient: 'linear-gradient(135deg, hsla(35, 92%, 48%, 0.12), hsla(35, 92%, 48%, 0.04))' },
    { label: 'Revenue (₹L)', value: stats.revenue, icon: IndianRupee, trend: '+18.2%', positive: true, gradient: 'linear-gradient(135deg, hsla(280, 67%, 64%, 0.12), hsla(280, 67%, 64%, 0.04))' },
  ];

  return (
    <div className="dashboard-elite">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-greeting">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {greeting}, <span className="text-gradient">{user?.name?.split(' ')[0] || 'User'}</span> 👋
          </motion.h1>
          <p className="text-muted">Here's what's happening with your practice today.</p>
        </div>
        <div className="dash-header-actions">
          <div className="dash-date">
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((qa, i) => (
          <motion.button key={qa.label} className="quick-action-btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="qa-icon" style={{ background: qa.gradient }}><qa.icon size={18} /></div>
            {qa.label}
          </motion.button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((s, i) => (
          <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ background: s.gradient }}>
            <div className="stat-card-header">
              <span className="stat-label">{s.label}</span>
              <div className={`stat-trend ${s.positive ? 'up' : 'down'}`}>
                {s.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {s.trend}
              </div>
            </div>
            <div className="stat-value">{typeof s.value === 'number' && s.value > 100 ? s.value.toLocaleString() : s.value}</div>
            <div className="stat-icon-bg"><s.icon size={40} /></div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dash-charts-row">
        <motion.div className="dash-chart-card card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="chart-card-header">
            <h3><Activity size={18} /> Revenue Trend</h3>
            <span className="chart-badge">FY 2025-26</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5e5ce6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }} formatter={(v: any) => [`₹${v}L`, 'Revenue']} />
              <Area type="monotone" dataKey="rev" stroke="#5e5ce6" strokeWidth={2.5} fill="url(#dashGrad)" dot={{ fill: '#5e5ce6', r: 3 }} activeDot={{ r: 5, fill: '#5e5ce6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="dash-chart-card card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="chart-card-header">
            <h3><TrendingUp size={18} /> Service Mix</h3>
            <span className="chart-badge">This Quarter</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={serviceData} innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" fontSize={11}>
                {serviceData.map((_entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {serviceData.map((s, i) => (
              <span key={s.name}><span className="legend-dot" style={{ background: COLORS[i] }} />{s.name}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="dash-bottom-row">
        {/* Activity Feed */}
        <motion.div className="dash-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3><Bell size={18} /> Recent Activity</h3>
          <div className="activity-feed">
            {activities.map((a, i) => (
              <motion.div key={i} className="activity-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                <div className="activity-icon" style={{ background: `${a.color}15`, color: a.color }}><a.icon size={16} /></div>
                <div className="activity-text">
                  <span>{a.text}</span>
                  <small className="text-muted">{a.time}</small>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Deadlines */}
        <motion.div className="dash-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h3><AlertCircle size={18} /> Upcoming Deadlines</h3>
          <div className="deadline-list">
            {deadlines.map((d, i) => (
              <motion.div key={i} className="deadline-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
                <div className={`deadline-urgency ${d.urgency}`} />
                <div className="deadline-text">
                  <span>{d.title}</span>
                  <small className="text-muted">{d.date}</small>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
