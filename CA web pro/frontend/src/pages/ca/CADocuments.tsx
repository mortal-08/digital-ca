import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, CheckCircle, XCircle, Eye, MessageSquare, ArrowLeft, Search, Folder, Calendar, Building2, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './CALayout.css';

export default function CADocuments() {
  const { user } = useAuth();
  const location = useLocation();
  
  const [docs, setDocs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openClientId, setOpenClientId] = useState<string | null>(location.state?.activeClient || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [comment, setComment] = useState<{ id:string; text:string } | null>(null);

  const fetchClientsAndDocs = async () => {
    try {
      setLoading(true);
      
      // Fetch clients first
      const clientRes = await apiFetch(`${API_BASE}/api/clients`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      let clientList = [];
      if (clientRes.ok) {
        clientList = await clientRes.json();
        setClients(clientList);
      }

      // Fetch documents next
      const docRes = await apiFetch(`${API_BASE}/api/documents`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (docRes.ok) {
        const docList = await docRes.json();
        setDocs(docList);
      }
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchClientsAndDocs();
    }
  }, [user]);

  // Keep open client synchronized if routing state changes
  useEffect(() => {
    if (location.state?.activeClient) {
      setOpenClientId(location.state.activeClient);
    }
  }, [location.state]);

  const setStatus = async (id: string, status: string, note?: string) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/documents/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, statusNote: note || '' })
      });
      if (res.ok) {
        setDocs(prev => prev.map(d => d._id === id ? { ...d, status, statusNote: note || '' } : d));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update document status');
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/documents/download/${docId}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (!response.ok) {
        alert('Failed to download file');
        return;
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert('Error downloading file');
    }
  };

  const getClientDocCount = (clientId: string) => {
    return docs.filter(d => (d.client?._id || d.client) === clientId).length;
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentClientDocs = docs.filter(d => (d.client?._id || d.client) === openClientId);
  const selectedClient = clients.find(c => c._id === openClientId);

  const statusMap: Record<string, string> = { 'Pending':'pending', 'Approved':'done', 'Rejected':'rejected' };

  return (
    <div>
      <style>{`
        .ca-folder-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .ca-folder-card:hover {
          transform: translateY(-4px);
          border-color: #5e5ce6 !important;
          box-shadow: 0 12px 24px -6px rgba(94, 92, 230, 0.15), 0 8px 16px -8px rgba(94, 92, 230, 0.15) !important;
        }
        .ca-folder-card:hover .ca-folder-icon {
          transform: scale(1.08) rotate(-3deg);
          color: #818cf8 !important;
        }
      `}</style>

      {/* Header section */}
      <div className="ca-page-header">
        <div>
          <h1 style={{ cursor: openClientId ? 'pointer' : 'default' }} onClick={() => setOpenClientId(null)}>
            <FolderOpen size={22} color="var(--primary)" /> 
            {openClientId ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ opacity: 0.5 }}>Documents</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/</span>
                <span>{selectedClient?.name || 'Client Folder'}</span>
              </span>
            ) : 'Document Management'}
          </h1>
          <p>
            {openClientId 
              ? `Reviewing stored and uploaded documents in ${selectedClient?.name}'s directory.` 
              : 'Secure client document vault. Stored and grouped systematically by registered client.'}
          </p>
        </div>

        {openClientId && (
          <button className="ca-btn ca-btn-ghost ca-btn-sm" onClick={() => setOpenClientId(null)}>
            <ArrowLeft size={14} /> Back to Client Directories
          </button>
        )}
      </div>

      {/* Folder Root View */}
      {!openClientId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search Folder Bar */}
          <div className="ca-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.55rem 1rem', flex: 1, maxWidth: 380 }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', color: 'var(--text-main)', fontFamily: 'inherit', flex: 1 }}
                placeholder="Search folders by client or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {filteredClients.length} client directories
            </span>
          </div>

          {loading ? (
            <div className="ca-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading directories...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="ca-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No client directories found matching the search criteria.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {filteredClients.map((client, idx) => (
                <motion.div
                  key={client._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setOpenClientId(client._id)}
                  className="ca-folder-card"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div 
                      className="ca-folder-icon"
                      style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '12px', 
                        background: 'rgba(94, 92, 230, 0.08)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        transition: 'transform 0.25s ease'
                      }}
                    >
                      <Folder size={24} fill="var(--primary)" fillOpacity={0.15} />
                    </div>
                    <span className="ca-badge progress" style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}>
                      {getClientDocCount(client._id)} {getClientDocCount(client._id) === 1 ? 'File' : 'Files'}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {client.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={13} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {client.company || 'Individual Account'}
                      </span>
                    </p>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.email}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Folder Details View */}
      {openClientId && (
        <div className="ca-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              <Folder size={18} color="var(--primary)" fill="var(--primary)" fillOpacity={0.1} /> 
              {selectedClient?.name || 'Client Folder'}
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({selectedClient?.company || 'Individual Client'})
              </span>
            </h3>
            <span className="ca-badge progress">
              {currentClientDocs.length} Stored Documents
            </span>
          </div>

          {loading ? (
            <div style={{ padding:'3rem', textAlign:'center' }}>Loading documents...</div>
          ) : currentClientDocs.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)' }}>
              No documents have been uploaded in this client directory yet.
            </div>
          ) : (
            <table className="ca-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Uploader</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClientDocs.map((d, i) => (
                  <motion.tr key={d._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <div style={{ width:34, height:34, borderRadius:8, background:'hsla(246,80%,60%,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#5e5ce6', fontSize:'0.65rem', fontWeight:700 }}>
                          {d.format?.toUpperCase() || 'FILE'}
                        </div>
                        <a href={d.url} target="_blank" rel="noreferrer" style={{ fontWeight:600, fontSize:'0.84rem', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'inherit', textDecoration:'none' }}>
                          {d.name}
                        </a>
                      </div>
                    </td>
                    <td>{d.uploadedBy?._id === openClientId ? 'Client' : d.uploadedBy?.name || 'CA (You)'}</td>
                    <td><span className="ca-badge progress" style={{ fontSize:'0.72rem' }}>{d.category}</span></td>
                    <td style={{ color:'var(--text-muted)' }}>{(d.size / 1024).toFixed(1)} KB</td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} /> {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className={`ca-badge ${statusMap[d.status] || 'pending'}`}>{d.status || 'Pending'}</span>
                        {d.statusNote && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.statusNote}>
                            "{d.statusNote}"
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <a href={d.url} target="_blank" rel="noreferrer" className="ca-btn ca-btn-ghost ca-btn-sm" title="Preview"><Eye size={13} /></a>
                        <button onClick={() => handleDownload(d._id, d.originalName)} className="ca-btn ca-btn-ghost ca-btn-sm" title="Download"><Download size={13} /></button>
                        {d.status !== 'Approved' && (
                          <button className="ca-btn ca-btn-ghost ca-btn-sm" style={{ color:'#32d74b' }} onClick={() => setStatus(d._id, 'Approved')} title="Approve">
                            <CheckCircle size={13} />
                          </button>
                        )}
                        {d.status !== 'Rejected' && (
                          <button className="ca-btn ca-btn-danger ca-btn-sm" onClick={() => setStatus(d._id, 'Rejected')} title="Reject">
                            <XCircle size={13} />
                          </button>
                        )}
                        <button className="ca-btn ca-btn-ghost ca-btn-sm" onClick={() => setComment({ id:d._id, text:d.statusNote || '' })} title="Add Note">
                          <MessageSquare size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Comment Modal */}
      {comment && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter: 'blur(3px)' }}>
          <motion.div initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
            style={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:14, padding:'1.5rem', width:380 }}>
            <h3 style={{ fontWeight:700, marginBottom:'1rem' }}>Add Note</h3>
            <textarea
              value={comment.text}
              onChange={e => setComment(p => p ? { ...p, text:e.target.value } : null)}
              placeholder="Enter a note or feedback for the client (visible on their end)…"
              rows={4}
              style={{ width:'100%', padding:'0.75rem', border:'1.5px solid var(--border-color)', borderRadius:9, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', resize:'vertical', outline:'none', boxSizing:'border-box' }}
            />
            <div style={{ display:'flex', gap:'0.7rem', marginTop:'1rem' }}>
              <button className="ca-btn ca-btn-primary" style={{ flex:1 }} onClick={async () => {
                if (comment) {
                  const doc = docs.find(d => d._id === comment.id);
                  await setStatus(comment.id, doc?.status || 'Pending', comment.text);
                }
                setComment(null);
              }}>Save Note</button>
              <button className="ca-btn ca-btn-ghost" style={{ flex:1 }} onClick={() => setComment(null)}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
