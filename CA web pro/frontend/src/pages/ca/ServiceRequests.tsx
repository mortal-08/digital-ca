import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, Clock, Filter, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './CALayout.css';

// Service requests fetched from API

const allStatuses = ['All', 'Pending', 'In Progress', 'Completed', 'Rejected'];

export default function ServiceRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clientDocs, setClientDocs] = useState<Record<string, any[]>>({});
  const [loadingDocs, setLoadingDocs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/requests`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch { }
    };
    if (user?.token) fetch_();
  }, [user]);

  const toggleDocs = async (clientId: string) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
      return;
    }
    setExpandedClientId(clientId);
    
    if (!clientDocs[clientId]) {
      setLoadingDocs(prev => ({ ...prev, [clientId]: true }));
      try {
        const res = await apiFetch(`${API_BASE}/api/documents/client/${clientId}`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClientDocs(prev => ({ ...prev, [clientId]: data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDocs(prev => ({ ...prev, [clientId]: false }));
      }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      }
    } catch {
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    }
  };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  const statusMap: Record<string, string> = {
    'Pending': 'pending', 'In Progress': 'progress', 'Completed': 'done', 'Rejected': 'rejected'
  };

  return (
    <div>
      <div className="ca-page-header">
        <div>
          <h1><ClipboardList size={22} /> Service Requests</h1>
          <p>Review and manage incoming client requests.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          {allStatuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`ca-btn ca-btn-sm ${filter === s ? 'ca-btn-primary' : 'ca-btn-ghost'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="ca-card">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Client</th><th>Service</th><th>Priority</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <motion.tr key={r._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                <td>
                  <div>
                    <p style={{ fontWeight:600, margin:0 }}>{r.userId?.name || 'Unknown Client'}</p>
                    <small style={{ color:'var(--text-muted)' }}>{r.userId?.email || ''}</small>
                    
                    {r.userId && (
                      <>
                        <div style={{ marginTop: '0.4rem' }}>
                          <button 
                            onClick={() => toggleDocs(r.userId._id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: 'var(--color-primary, #10b981)',
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              outline: 'none',
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            📁 View Documents
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {expandedClientId === r.userId._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              {loadingDocs[r.userId._id] ? (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.2rem 0' }}>
                                  Loading documents...
                                </div>
                              ) : !clientDocs[r.userId._id] || clientDocs[r.userId._id].length === 0 ? (
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', padding: '0.2rem 0' }}>
                                  No documents uploaded
                                </div>
                              ) : (
                                <div style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '0.4rem', 
                                  background: '#f9fafb', 
                                  border: '1px solid #f3f4f6', 
                                  borderRadius: '8px', 
                                  padding: '0.5rem', 
                                  minWidth: '200px',
                                  maxWidth: '280px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                  marginTop: '0.3rem'
                                }}>
                                  {clientDocs[r.userId._id].map((doc: any) => (
                                    <div key={doc._id} style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between', 
                                      gap: '0.5rem',
                                      fontSize: '0.78rem',
                                      padding: '0.25rem 0',
                                      borderBottom: '1px solid #f3f4f6'
                                    }}>
                                      <span style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.3rem', 
                                        fontWeight: 500, 
                                        color: '#374151',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '120px'
                                      }} title={doc.name}>
                                        <FileText size={12} style={{ color: '#10b981', flexShrink: 0 }} /> {doc.name}
                                      </span>
                                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                                        <a 
                                          href={doc.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          style={{
                                            padding: '0.15rem 0.4rem',
                                            borderRadius: '4px',
                                            background: '#e0f2fe',
                                            color: '#0369a1',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.7rem'
                                          }}
                                        >
                                          View
                                        </a>
                                        <a 
                                          href={doc.url} 
                                          download={doc.name}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            padding: '0.15rem 0.4rem',
                                            borderRadius: '4px',
                                            background: '#f3f4f6',
                                            color: '#4b5563',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.7rem'
                                          }}
                                        >
                                          Download
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </td>
                <td><strong>{r.serviceType}</strong><br /><small style={{ color:'var(--text-muted)' }}>{r.description}</small></td>
                <td><span className={`ca-badge ${r.priority.toLowerCase()}`}>{r.priority}</span></td>
                <td><span className={`ca-badge ${statusMap[r.status] || 'pending'}`}>{r.status}</span></td>
                <td>
                  {r.paymentStatus === 'Paid' ? (
                    <span className="ca-badge done">Paid</span>
                  ) : r.amount > 0 ? (
                    <span className="ca-badge pending" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                      <span>Due</span>
                      <small style={{ fontSize: '0.68rem', opacity: 0.85 }}>₹{r.amount}</small>
                    </span>
                  ) : (
                    <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>—</span>
                  )}
                </td>
                <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                </td>
                <td>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    {r.status === 'Pending' && (
                      <>
                        <button className="ca-btn ca-btn-ghost ca-btn-sm" onClick={() => updateStatus(r._id, 'In Progress')}>
                          <Clock size={13} /> Accept
                        </button>
                        <button className="ca-btn ca-btn-danger ca-btn-sm" onClick={() => updateStatus(r._id, 'Rejected')}>
                          <XCircle size={13} />
                        </button>
                      </>
                    )}
                    {r.status === 'In Progress' && (
                      <button className="ca-btn ca-btn-ghost ca-btn-sm" style={{ color:'#32d74b' }} onClick={() => updateStatus(r._id, 'Completed')}>
                        <CheckCircle size={13} /> Done
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No requests found.</div>
        )}
      </div>
    </div>
  );
}
