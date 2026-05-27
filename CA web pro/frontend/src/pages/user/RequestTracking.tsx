import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import PaymentModal from '../../components/PaymentModal';
import './UserLayout.css';

// Timeline based on current status

const timeline: Record<string, string[]> = {
  'Pending': ['Request Received', 'Under Initial Review', 'Assigned to CA', 'Work in Progress', 'Completed'],
  'In Progress': ['Request Received', 'Under Initial Review', 'Assigned to CA', 'Work in Progress', 'Completed'],
  'Completed': ['Request Received', 'Under Initial Review', 'Assigned to CA', 'Work in Progress', 'Completed'],
  'Rejected': ['Request Received', 'Under Initial Review', 'Rejected'],
};

const statusIdx: Record<string, number> = { 'Pending':1, 'In Progress':2, 'Completed':3, 'Rejected':2 };
const statusMap: Record<string, string> = { 'Pending':'pending', 'In Progress':'progress', 'Completed':'done', 'Rejected':'rejected' };

export default function RequestTracking() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [paymentReq, setPaymentReq] = useState<any | null>(null);

  const fetch_ = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/requests/my`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch { }
  };

  useEffect(() => {
    if (user?.token) fetch_();
  }, [user]);

  const onPaymentSuccess = () => {
    setPaymentReq(null);
    fetch_();
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Completed') return <CheckCircle size={18} color="#059669" />;
    if (status === 'Rejected') return <XCircle size={18} color="#dc2626" />;
    if (status === 'In Progress') return <RefreshCw size={18} color="#7c3aed" />;
    return <AlertCircle size={18} color="#d97706" />;
  };

  return (
    <div>
      <h1 className="user-page-title"><Clock size={22} color="#10b981" /> Request Tracking</h1>
      <p className="user-page-sub">Track the real-time status of all your service requests.</p>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:'1rem' }}>
        {/* Request list */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          {requests.map((r, i) => (
            <motion.div key={r._id} className="user-card" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              onClick={() => setSelected(selected===r._id ? null : r._id)}
              style={{ cursor:'pointer', border: selected===r._id ? '2px solid #10b981' : '1px solid #e8ecf0', padding:'1rem 1.2rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'0.85rem' }}>
                <StatusIcon status={r.status} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.35rem' }}>
                    <h3 style={{ fontWeight:700, fontSize:'0.95rem', margin:0 }}>{r.serviceType}</h3>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      {r.paymentStatus === 'Paid' ? (
                        <span className="user-badge done" style={{ fontSize:'0.7rem' }}>Paid</span>
                      ) : r.amount > 0 && (
                        <span className="user-badge pending" style={{ fontSize:'0.7rem' }}>Payment Due</span>
                      )}
                      <span className={`user-badge ${statusMap[r.status]}`}>{r.status}</span>
                    </div>
                  </div>
                  <p style={{ fontSize:'0.82rem', color:'#9ca3af', margin:'0 0 0.35rem' }}>{r.description}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                    <small style={{ fontSize:'0.75rem', color:'#d1d5db' }}>
                      Submitted: {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </small>
                    {r.paymentStatus !== 'Paid' && r.amount > 0 && (
                      <button 
                        className="ca-btn ca-btn-primary ca-btn-sm" 
                        onClick={(e) => { e.stopPropagation(); setPaymentReq(r); }}
                        style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}
                      >
                        <CreditCard size={12} /> Pay ₹{r.amount}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {requests.length === 0 && (
            <div className="user-card" style={{ textAlign:'center', padding:'3rem' }}>
              <Clock size={48} color="#d1d5db" style={{ marginBottom:'1rem' }} />
              <p style={{ color:'#9ca3af', margin:0 }}>No requests yet.</p>
            </div>
          )}
        </div>

        {/* Timeline detail */}
        {selected && (() => {
          const req = requests.find(r => r._id === selected);
          if (!req) return null;
          const steps = timeline[req.status] || timeline['Pending'];
          const currentIdx = statusIdx[req.status] ?? 1;

          return (
            <motion.div className="user-card" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
              <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'1.5rem' }}>
                Timeline — {req.serviceType}
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                {steps.map((step, i) => {
                  const done = i < currentIdx;
                  const active = i === currentIdx - 1 && req.status !== 'Completed';
                  return (
                    <div key={i} style={{ display:'flex', gap:'1rem' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background: done || req.status==='Completed' ? '#059669' : active ? '#10b981' : '#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.3s' }}>
                          {done || req.status==='Completed' ? <CheckCircle size={14} color="white" /> : <span style={{ width:10, height:10, borderRadius:'50%', background: active ? 'white' : '#d1d5db' }} />}
                        </div>
                        {i < steps.length-1 && <div style={{ width:2, height:40, background: done ? '#059669' : '#e5e7eb', transition:'background 0.3s' }} />}
                      </div>
                      <div style={{ paddingBottom:'1.5rem' }}>
                        <p style={{ margin:0, fontWeight: active ? 700 : 500, fontSize:'0.88rem', color: done || req.status==='Completed' ? '#059669' : active ? 'var(--text-main)' : '#9ca3af' }}>{step}</p>
                        {active && <small style={{ color:'#10b981', fontSize:'0.75rem' }}>● Currently here</small>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
                <div style={{ flex:1, padding:'0.85rem', background:'var(--bg-body)', borderRadius:10, border:'1px solid var(--border-color)' }}>
                  <p style={{ margin:'0 0 0.25rem', fontSize:'0.82rem', color:'var(--text-muted)' }}>Priority</p>
                  <span className={`user-badge ${req.priority === 'High' ? 'rejected' : req.priority === 'Medium' ? 'pending' : 'done'}`}>{req.priority}</span>
                </div>
                <div style={{ flex:1, padding:'0.85rem', background:'var(--bg-body)', borderRadius:10, border:'1px solid var(--border-color)' }}>
                  <p style={{ margin:'0 0 0.25rem', fontSize:'0.82rem', color:'var(--text-muted)' }}>Payment</p>
                  <span className={`user-badge ${req.paymentStatus === 'Paid' ? 'done' : 'pending'}`}>
                    {req.paymentStatus === 'Paid' ? 'Completed' : `Due: ₹${req.amount || 0}`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </div>
      <PaymentModal 
        isOpen={!!paymentReq}
        requestId={paymentReq?._id}
        amount={paymentReq?.amount}
        onSuccess={onPaymentSuccess}
        onCancel={() => setPaymentReq(null)}
      />
    </div>
  );
}
