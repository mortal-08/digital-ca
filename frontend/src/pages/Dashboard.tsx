import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Briefcase, Bell, Clock, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import './Dashboard.css';

const COLORS = ['#5e5ce6', '#32d74b', '#ff9f0a', '#ff453a'];

const recentActivity = [
  { icon: FileText, text: 'ITR filed for Mehta Industries', time: '2 hours ago', color: 'var(--color-primary)' },
  { icon: Bell, text: 'GST Return deadline in 5 days', time: '3 hours ago', color: 'var(--status-warning)' },
  { icon: Users, text: 'New client registered: UrbanCraft Ltd', time: '5 hours ago', color: 'var(--status-success)' },
  { icon: AlertCircle, text: 'TDS payment overdue for client XYZ', time: '1 day ago', color: 'var(--status-danger)' },
  { icon: TrendingUp, text: 'Monthly report generated for March', time: '2 days ago', color: 'var(--color-primary)' },
];

const upcomingDeadlines = [
  { task: 'GSTR-3B Filing — March 2026', date: 'Apr 20', urgent: true },
  { task: 'Advance Tax — Q1 Installment', date: 'Jun 15', urgent: false },
  { task: 'TDS Return — Q4 (Form 24Q)', date: 'May 31', urgent: false },
  { task: 'Annual ROC Filing — Form AOC-4', date: 'May 30', urgent: false },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        // Fallback data if server is unreachable
        setDashboardData({
          performanceData: [
            { name: 'Jan', revenue: 4000, expenses: 2400 },
            { name: 'Feb', revenue: 3000, expenses: 1398 },
            { name: 'Mar', revenue: 5000, expenses: 2800 },
            { name: 'Apr', revenue: 2780, expenses: 3908 },
            { name: 'May', revenue: 1890, expenses: 4800 },
            { name: 'Jun', revenue: 2390, expenses: 3800 },
            { name: 'Jul', revenue: 3490, expenses: 2900 },
          ],
          expenseData: [
            { name: 'Payroll', value: 4500 },
            { name: 'Marketing', value: 1200 },
            { name: 'Software', value: 800 },
            { name: 'Office', value: 500 },
          ],
          stats: [
            { title: "Total Revenue", value: "₹45.2L", trend: "+20.1%", iconType: "dollar", isPositive: true },
            { title: "Active Clients", value: "240", trend: "+12.5%", iconType: "user", isPositive: true },
            { title: "Active Projects", value: "45", trend: "-2.4%", iconType: "briefcase", isPositive: false },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading || !dashboardData) {
    return (
      <div className="dashboard" style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted">Welcome back {user?.name} 👋 Here's what's happening today.</p>
        </div>
      </header>

      {/* Stats */}
      <motion.div className="stats-grid" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        {dashboardData.stats.map((stat: any, i: number) => (
          <motion.div key={stat.title} className="stat-card card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1+(i*0.1)}}>
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-icon">
                {stat.iconType === 'dollar' ? <DollarSign size={20}/> : stat.iconType === 'user' ? <Users size={20}/> : <Briefcase size={20}/>}
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-trend ${stat.isPositive?'positive':'negative'}`}>
              {stat.isPositive ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
              <span>{stat.trend} from last month</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="charts-grid">
        <motion.div className="chart-card card" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.4}}>
          <div className="chart-header"><h3>Revenue vs Expenses</h3></div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.performanceData} margin={{top:10,right:30,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--status-danger)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--status-danger)" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}`}/>
                <Tooltip contentStyle={{backgroundColor:'var(--bg-surface)',border:'1px solid var(--border-color)',borderRadius:'8px'}}/>
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorRev)"/>
                <Area type="monotone" dataKey="expenses" stroke="var(--status-danger)" fillOpacity={1} fill="url(#colorExp)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div className="chart-card card" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.5}}>
          <div className="chart-header"><h3>Expense Breakdown</h3></div>
          <div className="chart-body" style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={dashboardData.expenseData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                {dashboardData.expenseData.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie><Tooltip contentStyle={{backgroundColor:'var(--bg-surface)',border:'1px solid var(--border-color)',borderRadius:'8px'}}/></PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {dashboardData.expenseData.map((entry:any,i:number)=>(
                <div key={entry.name} className="legend-item"><div className="legend-color" style={{backgroundColor:COLORS[i%COLORS.length]}}/><span>{entry.name}</span></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row — Activity + Deadlines */}
      <div className="bottom-grid">
        <motion.div className="card" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.6}}>
          <h3 style={{marginBottom:'1.25rem'}}>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((item, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{color: item.color}}><item.icon size={16}/></div>
                <div className="activity-text">
                  <span>{item.text}</span>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="card" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.7}}>
          <h3 style={{marginBottom:'1.25rem'}}>Upcoming Deadlines</h3>
          <div className="deadlines-list">
            {upcomingDeadlines.map((d, i) => (
              <div key={i} className={`deadline-item ${d.urgent ? 'urgent' : ''}`}>
                <Clock size={16}/>
                <div className="deadline-text">
                  <span>{d.task}</span>
                  <small>{d.date}</small>
                </div>
                {d.urgent && <span className="urgent-badge">Urgent</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
