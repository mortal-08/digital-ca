import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './UserLayout.css';

export default function UserDocuments() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/documents`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.token) fetchDocs();
  }, [user]);

  const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFiles = (incomingFiles: File[]) => {
    const valid: File[] = [];
    for (const file of incomingFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
      
      if (!isValidExt) {
        alert(`File type not allowed: ${file.name}. Only PDF, JPG, JPEG, PNG, Word, and Excel files are supported.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large: ${file.name}. Maximum size allowed is 10MB.`);
        continue;
      }
      valid.push(file);
    }
    return valid;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      const validFiles = validateFiles(Array.from(e.dataTransfer.files));
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;
    setUploading(true);
    
    let successCount = 0;
    let failCount = 0;
    let lastError = '';

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'General');
      
      try {
        const res = await apiFetch(`${API_BASE}/api/documents/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user?.token}` },
          body: formData
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
          const errData = await res.json();
          lastError = errData.message || 'Upload failed';
        }
      } catch (err: any) { 
        failCount++;
        lastError = err.message || 'Network error';
        console.error(err); 
      }
    }
    
    if (failCount > 0) {
      alert(`Uploaded ${successCount} file(s). ${failCount} file(s) failed. Last error: ${lastError}`);
    } else {
      alert('All files uploaded successfully!');
    }
    
    setFiles([]);
    fetchDocs();
    setUploading(false);
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



  return (
    <div>
      <h1 className="user-page-title"><Upload size={22} color="#10b981" /> My Documents</h1>
      <p className="user-page-sub">Upload and manage your financial documents securely.</p>

      {/* Upload zone */}
      <motion.div className="user-card" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:'1.5rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'1rem' }}>Upload New Document</h3>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('doc-file-input')?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#10b981' : '#d1d5db'}`,
            borderRadius: 14, padding: '2.5rem', textAlign: 'center',
            background: dragOver ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Upload size={40} color={dragOver ? '#10b981' : '#d1d5db'} style={{ marginBottom: '0.75rem' }} />
          <p style={{ fontWeight: 700, margin: '0 0 0.3rem', color: dragOver ? '#10b981' : '#374151' }}>
            Drag & drop files here
          </p>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: 0 }}>PDF, JPG, PNG, XLSX supported</p>
          <input id="doc-file-input" type="file" multiple style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files) {
                const validFiles = validateFiles(Array.from(e.target.files));
                setFiles(prev => [...prev, ...validFiles]);
              }
            }} />
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ready to upload ({files.length})</p>
            {files.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.55rem 0.75rem', background:'#f9fafb', borderRadius:9, marginBottom:'0.4rem', fontSize:'0.83rem' }}>
                <File size={14} color="#10b981" />
                <span style={{ flex:1 }}>{f.name}</span>
                <span style={{ color:'#9ca3af' }}>{(f.size/1024).toFixed(1)} KB</span>
                <button onClick={() => setFiles(prev => prev.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button className="user-btn user-btn-primary" style={{ marginTop:'0.5rem' }}
              onClick={handleUploadAll} disabled={uploading}>
              <Upload size={15} /> {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Document history */}
      <motion.div className="user-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}>
        <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'1rem' }}>Document History</h3>
        {loading ? (
          <p style={{ textAlign:'center', padding:'1rem', color:'#9ca3af' }}>Loading history...</p>
        ) : history.length === 0 ? (
          <p style={{ textAlign:'center', padding:'1rem', color:'#9ca3af' }}>No documents uploaded yet.</p>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['File Name','Uploaded By','Size','Uploaded','Status','Action'].map(h => (
                  <th key={h} style={{ textAlign:'left', fontSize:'0.72rem', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', padding:'0.5rem 0.75rem', borderBottom:'1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((d, i) => {
                const statusColor: Record<string, { bg: string; text: string; border: string }> = {
                  'Approved': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
                  'Rejected': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                  'Pending':  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                };
                const st = statusColor[d.status] || statusColor['Pending'];

                return (
                <motion.tr key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}>
                  <td style={{ padding:'0.8rem 0.75rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', fontWeight:700, color:'#6b7280' }}>
                        {d.format?.toUpperCase() || 'FILE'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <a href={d.url} target="_blank" rel="noreferrer" style={{ fontSize:'0.85rem', fontWeight:600, color:'inherit', textDecoration:'none', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.originalName || d.name}</a>
                        {d.category && d.category !== 'General' && (
                          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{d.category}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.82rem', fontWeight:500, color:'#374151', padding:'0 0.75rem' }}>
                    {d.uploadedBy?._id === user?._id ? 'Me' : d.uploadedBy?.name || 'My CA'}
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'#9ca3af', padding:'0 0.75rem' }}>{(d.size/1024).toFixed(1)} KB</td>
                  <td style={{ fontSize:'0.82rem', color:'#9ca3af', padding:'0 0.75rem' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding:'0 0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 20,
                        background: st.bg, color: st.text, border: `1px solid ${st.border}`, width: 'fit-content'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.text }}></span>
                        {d.status || 'Pending'}
                      </span>
                      {d.statusNote && (
                        <span style={{ fontSize: '0.72rem', color: '#6b7280', fontStyle: 'italic', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.statusNote}>
                          "{d.statusNote}"
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding:'0 0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <a href={d.url} target="_blank" rel="noreferrer" className="user-btn user-btn-sm user-btn-outline">View</a>
                      <button onClick={() => handleDownload(d._id, d.originalName)} className="user-btn user-btn-sm user-btn-outline" style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}>Download</button>
                    </div>
                  </td>
                </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
