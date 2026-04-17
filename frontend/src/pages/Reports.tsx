import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Download, BarChart3, Activity, Target } from 'lucide-react';
import './Reports.css';

type Tab = 'overview' | 'trends' | 'compliance';

// ---- DATA ----
const monthlyRevenue = [
  { month: 'Jan', revenue: 320000, expenses: 180000, profit: 140000, clients: 12 },
  { month: 'Feb', revenue: 380000, expenses: 200000, profit: 180000, clients: 15 },
  { month: 'Mar', revenue: 450000, expenses: 220000, profit: 230000, clients: 18 },
  { month: 'Apr', revenue: 410000, expenses: 250000, profit: 160000, clients: 14 },
  { month: 'May', revenue: 490000, expenses: 210000, profit: 280000, clients: 22 },
  { month: 'Jun', revenue: 530000, expenses: 280000, profit: 250000, clients: 19 },
  { month: 'Jul', revenue: 480000, expenses: 240000, profit: 240000, clients: 16 },
  { month: 'Aug', revenue: 560000, expenses: 300000, profit: 260000, clients: 21 },
  { month: 'Sep', revenue: 520000, expenses: 270000, profit: 250000, clients: 17 },
  { month: 'Oct', revenue: 610000, expenses: 320000, profit: 290000, clients: 25 },
  { month: 'Nov', revenue: 580000, expenses: 290000, profit: 290000, clients: 20 },
  { month: 'Dec', revenue: 650000, expenses: 350000, profit: 300000, clients: 28 },
];

const taxBreakdown = [
  { name: 'Income Tax', value: 420000, fill: '#5e5ce6' },
  { name: 'GST Paid', value: 280000, fill: '#32d74b' },
  { name: 'TDS Deducted', value: 150000, fill: '#ff9f0a' },
  { name: 'Prof. Tax', value: 24000, fill: '#ff453a' },
  { name: 'Advance Tax', value: 95000, fill: '#bf5af2' },
];

const servicePerformance = [
  { service: 'Tax Filing', revenue: 85, satisfaction: 92, efficiency: 88 },
  { service: 'GST Returns', revenue: 78, satisfaction: 88, efficiency: 95 },
  { service: 'Audit', revenue: 90, satisfaction: 85, efficiency: 72 },
  { service: 'Advisory', revenue: 65, satisfaction: 95, efficiency: 80 },
  { service: 'Payroll', revenue: 72, satisfaction: 90, efficiency: 92 },
  { service: 'Registration', revenue: 55, satisfaction: 88, efficiency: 85 },
];

// Historical macro trends
const inflationData = [
  { year: '2018', cpi: 3.4, repo: 6.5, gdp: 6.5 },
  { year: '2019', cpi: 4.8, repo: 5.15, gdp: 3.7 },
  { year: '2020', cpi: 6.2, repo: 4.0, gdp: -6.6 },
  { year: '2021', cpi: 5.1, repo: 4.0, gdp: 8.7 },
  { year: '2022', cpi: 6.7, repo: 6.25, gdp: 7.2 },
  { year: '2023', cpi: 5.4, repo: 6.5, gdp: 7.8 },
  { year: '2024', cpi: 4.9, repo: 6.5, gdp: 6.5 },
  { year: '2025', cpi: 4.2, repo: 6.0, gdp: 6.8 },
  { year: '2026*', cpi: 4.0, repo: 6.0, gdp: 7.0 },
];

const taxCollectionTrend = [
  { year: 'FY19', direct: 11.37, indirect: 9.16, total: 20.53 },
  { year: 'FY20', direct: 10.50, indirect: 9.54, total: 20.04 },
  { year: 'FY21', direct: 9.45, indirect: 10.71, total: 20.16 },
  { year: 'FY22', direct: 14.10, indirect: 12.90, total: 27.00 },
  { year: 'FY23', direct: 16.61, indirect: 13.82, total: 30.43 },
  { year: 'FY24', direct: 19.58, indirect: 14.52, total: 34.10 },
  { year: 'FY25', direct: 22.00, indirect: 15.80, total: 37.80 },
  { year: 'FY26*', direct: 24.50, indirect: 17.00, total: 41.50 },
];

const complianceScore = [
  { metric: 'ITR Filing', score: 98, target: 100 },
  { metric: 'GST Returns', score: 95, target: 100 },
  { metric: 'TDS Deposits', score: 100, target: 100 },
  { metric: 'Audit Reports', score: 92, target: 100 },
  { metric: 'ROC Filing', score: 88, target: 100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? `₹${(entry.value / 100000).toFixed(1)}L` : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <h1>Financial Reports & Analytics</h1>
          <p className="text-muted">FY 2025-26 — Advanced financial intelligence dashboard</p>
        </div>
        <button className="btn-primary"><Download size={16} /> Export PDF</button>
      </header>

      {/* Tabs */}
      <div className="report-tabs">
        {([
          { id: 'overview', label: 'Business Overview', icon: BarChart3 },
          { id: 'trends', label: 'Macro Economic Trends', icon: Activity },
          { id: 'compliance', label: 'Compliance Scorecard', icon: Target },
        ] as const).map(tab => (
          <button key={tab.id} className={`report-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== OVERVIEW TAB ===================== */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="report-content">
          {/* Summary Cards */}
          <div className="report-summary">
            {[
              { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, trend: '+18.2%', positive: true },
              { label: 'Total Expenses', value: `₹${(totalExpenses / 100000).toFixed(1)}L`, icon: TrendingDown, trend: '+12.4%', positive: false },
              { label: 'Net Profit', value: `₹${(netProfit / 100000).toFixed(1)}L`, icon: TrendingUp, trend: '+24.1%', positive: true },
            ].map((s, i) => (
              <motion.div key={s.label} className="summary-card card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="summary-icon"><s.icon size={20} /></div>
                <div><small className="text-muted">{s.label}</small><h3>{s.value}</h3><span className={`trend ${s.positive ? 'positive' : 'negative'}`}>{s.trend} YoY</span></div>
              </motion.div>
            ))}
          </div>

          {/* Composed Chart — Revenue + Expenses + Profit */}
          <motion.div className="chart-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3>Monthly Performance — Revenue, Expenses & Profit</h3>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5e5ce6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem' }} />
                <Area type="monotone" dataKey="revenue" fill="url(#gradRevenue)" stroke="#5e5ce6" strokeWidth={2} name="Revenue" />
                <Bar dataKey="expenses" fill="#ff453a" opacity={0.7} radius={[4, 4, 0, 0]} barSize={20} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#32d74b" strokeWidth={3} dot={{ fill: '#32d74b', r: 4 }} activeDot={{ r: 6 }} name="Profit" />
                <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#ff9f0a" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#ff9f0a', r: 3 }} name="New Clients" />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="charts-layout">
            {/* Tax Donut */}
            <motion.div className="chart-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <h3>Tax Obligation Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={taxBreakdown} innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {taxBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Radar — Service Performance */}
            <motion.div className="chart-panel card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <h3>Service Performance Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={servicePerformance}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="service" stroke="var(--text-muted)" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} />
                  <Radar name="Revenue %" dataKey="revenue" stroke="#5e5ce6" fill="#5e5ce6" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Satisfaction %" dataKey="satisfaction" stroke="#32d74b" fill="#32d74b" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="Efficiency %" dataKey="efficiency" stroke="#ff9f0a" fill="#ff9f0a" fillOpacity={0.1} strokeWidth={2} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ===================== MACRO TRENDS TAB ===================== */}
      {activeTab === 'trends' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="report-content">
          <motion.div className="chart-panel card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <h3>🇮🇳 India Macro Indicators — CPI Inflation, Repo Rate & GDP Growth</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>Auto-graphed from historical RBI/MoSPI data. * = projected.</p>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={inflationData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCPI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff453a" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ff453a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[-8, 10]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} formatter={(v: any) => [`${v}%`, '']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem' }} />
                <Area type="monotone" dataKey="cpi" fill="url(#gradCPI)" stroke="#ff453a" strokeWidth={2} name="CPI Inflation (%)" />
                <Line type="monotone" dataKey="repo" stroke="#5e5ce6" strokeWidth={3} dot={{ fill: '#5e5ce6', r: 4 }} name="RBI Repo Rate (%)" />
                <Bar dataKey="gdp" fill="#32d74b" opacity={0.6} radius={[4, 4, 0, 0]} barSize={24} name="GDP Growth (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="chart-panel card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h3>📊 India Tax Collections — Direct vs Indirect (₹ Lakh Crore)</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>Source: CBDT & CBIC annual reports. * = budget estimate.</p>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={taxCollectionTrend} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L Cr`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} formatter={(v: any) => [`₹${v} Lakh Cr`, '']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem' }} />
                <Bar dataKey="direct" stackId="tax" fill="#5e5ce6" radius={[0, 0, 0, 0]} name="Direct Tax" />
                <Bar dataKey="indirect" stackId="tax" fill="#bf5af2" radius={[4, 4, 0, 0]} name="Indirect Tax" />
                <Line type="monotone" dataKey="total" stroke="#ff9f0a" strokeWidth={3} dot={{ fill: '#ff9f0a', r: 4 }} name="Total Collection" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      )}

      {/* ===================== COMPLIANCE TAB ===================== */}
      {activeTab === 'compliance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="report-content">
          <div className="compliance-grid">
            {complianceScore.map((item, i) => (
              <motion.div key={item.metric} className="compliance-card card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="compliance-header">
                  <h4>{item.metric}</h4>
                  <span className={`compliance-score ${item.score >= 95 ? 'excellent' : item.score >= 85 ? 'good' : 'warning'}`}>
                    {item.score}%
                  </span>
                </div>
                <div className="compliance-bar">
                  <motion.div className="compliance-fill" initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    style={{ background: item.score >= 95 ? 'var(--status-success)' : item.score >= 85 ? 'var(--status-warning)' : 'var(--status-danger)' }}
                  />
                </div>
                <div className="compliance-meta">
                  <span>Target: {item.target}%</span>
                  <span>{item.score >= item.target ? '✅ On Track' : '⚠️ Needs Attention'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
