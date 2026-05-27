import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, CheckCircle, Clock, Shield, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './UserLayout.css';

export default function FindCA() {
  const { user } = useAuth();
  const [cas, setCAs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [requesting, setRequesting] = useState<string | null>(null);
  const [linkedCA, setLinkedCA] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    if (user?.token) {
      fetchCAs();
      // Check if already linked
      if (user.caId) {
        setLinkedCA({ id: user.caId, status: user.status || 'approved' });
      }
    }
  }, [user]);

  const fetchCAs = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/ca/list`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCAs(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLinkRequest = async (caId: string) => {
    setRequesting(caId);
    try {
      const res = await apiFetch(`${API_BASE}/api/ca/link-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ caId })
      });
      const data = await res.json();
      if (res.ok) {
        setLinkedCA({ id: caId, status: 'pending' });
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send request');
    }
    setRequesting(null);
  };

  const filteredCAs = cas.filter(ca =>
    ca.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ca.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="user-page-title"><Shield size={22} color="#5e5ce6" /> Find a Chartered Accountant</h1>
      <p className="user-page-sub">Browse available CAs and send a link request to get started with your financial services.</p>

      {/* Current CA Status */}
      {linkedCA && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="user-card"
          style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${linkedCA.status === 'approved' ? '#10b981' : '#f59e0b'}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {linkedCA.status === 'approved' ? (
              <CheckCircle size={20} color="#10b981" />
            ) : (
              <Clock size={20} color="#f59e0b" />
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem' }}>
                {linkedCA.status === 'approved' 
                  ? `You are linked to: ${cas.find(c => c._id === linkedCA.id)?.name || user?.caName || 'Your CA'}`
                  : 'Your link request is pending approval'}
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af' }}>
                {linkedCA.status === 'approved' 
                  ? 'You can use all services. To switch CA, send a new request below.'
                  : 'Your CA will review and approve your request shortly.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="user-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={18} color="#9ca3af" />
        <input
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: 'var(--text-main)', fontFamily: 'inherit', flex: 1 }}
          placeholder="Search CAs by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {filteredCAs.length} CA{filteredCAs.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* CA Cards */}
      {loading ? (
        <div className="user-card" style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
          Loading available CAs...
        </div>
      ) : filteredCAs.length === 0 ? (
        <div className="user-card" style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
          No Chartered Accountants found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filteredCAs.map((ca, idx) => {
            const isLinked = linkedCA?.id === ca._id && linkedCA?.status === 'approved';
            const isPending = linkedCA?.id === ca._id && linkedCA?.status === 'pending';
            
            return (
              <motion.div
                key={ca._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="user-card"
                style={{
                  padding: '1.5rem',
                  border: isLinked ? '2px solid #10b981' : isPending ? '2px solid #f59e0b' : '1px solid #e8ecf0',
                  background: isLinked ? '#f0fdf4' : isPending ? '#fffbeb' : undefined,
                  position: 'relative',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Status badge */}
                {(isLinked || isPending) && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20,
                    background: isLinked ? '#d1fae5' : '#fef3c7',
                    color: isLinked ? '#059669' : '#d97706'
                  }}>
                    {isLinked ? <><CheckCircle size={12} /> Linked</> : <><Clock size={12} /> Pending</>}
                  </div>
                )}

                {/* CA Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'linear-gradient(135deg, #5e5ce6, #818cf8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '1.1rem', fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(94, 92, 230, 0.3)'
                  }}>
                    {ca.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{ca.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={12} /> {ca.email}
                    </p>
                  </div>
                </div>

                {/* Info row */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: '#f9fafb', borderRadius: 10 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#5e5ce6' }}>{ca.clientCount}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>Clients</div>
                  </div>
                  <div style={{ width: 1, background: '#e5e7eb' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                      <Shield size={14} style={{ verticalAlign: 'middle', marginRight: 3 }} />Verified
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>Status</div>
                  </div>
                  <div style={{ width: 1, background: '#e5e7eb' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>
                      {new Date(ca.joinedAt).getFullYear()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>Joined</div>
                  </div>
                </div>

                {/* Action button */}
                {isLinked ? (
                  <button className="user-btn user-btn-sm" disabled
                    style={{ width: '100%', background: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 700, cursor: 'default' }}>
                    <CheckCircle size={15} /> Currently Linked
                  </button>
                ) : isPending ? (
                  <button className="user-btn user-btn-sm" disabled
                    style={{ width: '100%', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', fontWeight: 700, cursor: 'default' }}>
                    <Clock size={15} /> Request Pending
                  </button>
                ) : (
                  <button
                    className="user-btn user-btn-primary"
                    style={{ width: '100%' }}
                    disabled={requesting === ca._id}
                    onClick={() => handleLinkRequest(ca._id)}
                  >
                    <Send size={15} /> {requesting === ca._id ? 'Sending...' : 'Request to Link'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
