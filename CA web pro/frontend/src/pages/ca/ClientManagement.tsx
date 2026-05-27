import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Mail, Phone, Building2, MoreVertical, FileText, UploadCloud, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './CALayout.css';

// Clients fetched from API

export default function ClientManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [pendingClients, setPendingClients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name:'', email:'', phone:'', company:'' });
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/clients`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) { console.error(err) }
  };

  const fetchPending = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/clients/pending`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingClients(data);
      }
    } catch (err) { console.error(err) }
  };

  useEffect(() => {
    if (user?.token) {
      fetchClients();
      fetchPending();
    }
  }, [user]);

  const handleApprove = async (id: string, isApprove: boolean) => {
    try {
      const endpoint = isApprove ? 'approve' : 'reject';
      const res = await apiFetch(`${API_BASE}/api/clients/${id}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        fetchClients();
        fetchPending();
      }
    } catch (err) { console.error(err) }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedClient) return;
    setUploading(true);
    const file = e.target.files[0];

    const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
    
    if (!isValidExt) {
      alert(`File type not allowed: ${file.name}. Only PDF, JPG, JPEG, PNG, Word, and Excel files are supported.`);
      setUploading(false);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large: ${file.name}. Maximum size allowed is 10MB.`);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'Report');
    formData.append('clientId', selectedClient._id);

    try {
      const res = await apiFetch(`${API_BASE}/api/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
        body: formData
      });
      if (res.ok) {
        alert('Report uploaded successfully!');
      } else {
        const errData = await res.json();
        alert(`Upload failed: ${errData.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message || 'Network error'}`);
    } finally {
      setUploading(false);
    }
  };

  const currentList = activeTab === 'active' ? clients : pendingClients;
  
  const filtered = currentList.filter(c =>
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="ca-page-header">
        <div>
          <h1><Users size={22} /> Client Management</h1>
          <p>Manage and track all your clients from one place.</p>
        </div>
        <button className="ca-btn ca-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="ca-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('active')}
              style={{ background: 'transparent', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              Active Clients
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              style={{ background: 'transparent', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'pending' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              Pending Approvals {pendingClients.length > 0 && `(${pendingClients.length})`}
            </button>
          </div>

          {/* Search bar */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', background:'var(--bg-body)', border:'1px solid var(--border-color)', borderRadius:'10px', padding:'0.55rem 1rem', maxWidth:340 }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.88rem', color:'var(--text-main)', fontFamily:'inherit', flex:1 }}
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="ca-table">
          <thead>
            <tr>
              <th>Name</th><th>Contact</th><th>Company</th><th>Requests</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <motion.tr key={c._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }} 
                onClick={() => {
                  if (activeTab === 'active') {
                    setSelectedClient(c);
                  }
                }}
                style={{ cursor: activeTab === 'active' ? 'pointer' : 'default' }}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#5e5ce6,#818cf8)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight:600 }}>{c.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.15rem' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.82rem' }}><Mail size={12} /> {c.email}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.82rem', color:'var(--text-muted)' }}><Phone size={12} /> {c.phone}</span>
                  </div>
                </td>
                <td><span style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}><Building2 size={14} /> {c.company || 'N/A'}</span></td>
                <td><span className="ca-badge progress">{c.requests || 0} Requests</span></td>
                <td>
                  <span className={`ca-badge ${c.status === 'approved' ? 'done' : 'rejected'}`}>
                    {c.status === 'approved' ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {activeTab === 'pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="ca-btn ca-btn-primary ca-btn-sm" onClick={() => handleApprove(c._id, true)}>Approve</button>
                      <button className="ca-btn ca-btn-ghost ca-btn-sm" onClick={() => handleApprove(c._id, false)}>Reject</button>
                    </div>
                  ) : (
                    <button className="ca-btn ca-btn-ghost ca-btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedClient(c); }}>View Details <MoreVertical size={14} /></button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}>
          <motion.div initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
            style={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:16, padding:'2rem', width:'100%', maxWidth:600, maxHeight:'85vh', overflowY:'auto' }}>
            
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#5e5ce6,#818cf8)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.4rem' }}>
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin:0, fontWeight:800, fontSize:'1.25rem', color:'var(--text-main)' }}>{selectedClient.name}</h2>
                  <p style={{ margin:0, color:'var(--text-muted)', fontSize:'0.9rem' }}>{selectedClient.email} • {selectedClient.company || 'Individual Client'}</p>
                </div>
              </div>
              <button className="ca-btn ca-btn-ghost" style={{ padding: '0.4rem' }} onClick={() => setSelectedClient(null)}><X size={20} /></button>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:'0.75rem', marginBottom:'2rem' }}>
              <button className="ca-btn ca-btn-primary" style={{ flex:1 }} onClick={() => navigate('/ca/messages', { state: { activeClient: selectedClient._id } })}>
                <MessageSquare size={16} /> Direct Message
              </button>
              <button className="ca-btn ca-btn-outline" style={{ flex:1 }} onClick={() => navigate('/ca/documents', { state: { activeClient: selectedClient._id } })}>
                <FileText size={16} /> Browse All Client Docs
              </button>
            </div>

            {/* Quick Metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'2rem' }}>
              <div style={{ background:'var(--bg-body)', padding:'1rem', borderRadius:12, border:'1px solid var(--border-color)' }}>
                <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>Uploaded Documents</span>
                <p style={{ fontSize:'1.5rem', fontWeight:800, margin:'0.3rem 0 0', color:'var(--text-main)' }}>4 <span style={{ fontSize:'0.82rem', fontWeight:400, color:'#10b981' }}>Recent</span></p>
              </div>
              <div style={{ background:'var(--bg-body)', padding:'1rem', borderRadius:12, border:'1px solid var(--border-color)' }}>
                <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>Pending Reports</span>
                <p style={{ fontSize:'1.5rem', fontWeight:800, margin:'0.3rem 0 0', color:'var(--text-main)' }}>1 <span style={{ fontSize:'0.82rem', fontWeight:400, color:'#f59e0b' }}>Action Needed</span></p>
              </div>
            </div>

            {/* Send Report Section */}
            <div>
              <h4 style={{ fontWeight:700, margin:'0 0 0.75rem', fontSize:'0.95rem' }}>Send Approved Report</h4>
              <div 
                style={{ border:'2px dashed var(--border-color)', background:'var(--bg-body)', padding:'1.5rem', borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.5rem', cursor:'pointer' }}
                onClick={() => document.getElementById('report-upload')?.click()}
              >
                <UploadCloud size={28} color="var(--text-muted)" />
                <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-main)' }}>
                  {uploading ? 'Uploading...' : 'Click to upload Final Report / Receipt'}
                </span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>PDF, Excel formats explicitly</span>
                <input type="file" id="report-upload" hidden onChange={handleFileUpload} accept=".pdf,.xlsx,.xls,.doc,.docx" />
              </div>
            </div>

          </motion.div>
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}>
          <motion.div initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
            style={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:16, padding:'1.75rem', width:'100%', maxWidth:440 }}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>Add New Client</h3>
            {['name','email','phone','company'].map(field => (
              <div key={field} style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.82rem', fontWeight:600, display:'block', marginBottom:'0.35rem', textTransform:'capitalize' }}>{field}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={(newClient as any)[field]}
                  onChange={e => setNewClient(p => ({ ...p, [field]: e.target.value }))}
                  style={{ width:'100%', padding:'0.7rem 0.9rem', border:'1.5px solid var(--border-color)', borderRadius:9, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                />
              </div>
            ))}
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
              <button className="ca-btn ca-btn-primary" style={{ flex:1 }}
                onClick={() => {
                  if (newClient.name) {
                    setClients(p => [...p, { _id: Date.now().toString(), ...newClient, status:'active', requests: 0 }]);
                    setNewClient({ name:'', email:'', phone:'', company:'' });
                    setShowModal(false);
                  }
                }}>
                Add Client
              </button>
              <button className="ca-btn ca-btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
