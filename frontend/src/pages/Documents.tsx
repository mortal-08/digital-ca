import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, File, Trash2, Download, Search, Filter, CheckCircle, AlertCircle, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';
import './Documents.css';

interface Doc {
  _id: string;
  name: string;
  url: string;
  format: string;
  size: number;
  category: string;
  uploadedBy: { name: string } | string;
  createdAt: string;
}

const categories = ['All', 'Tax Returns', 'Invoices', 'Reports', 'Audit', 'KYC', 'General'];

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadCategory, setUploadCategory] = useState('General');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from backend
  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (err) {
      console.error('Failed to fetch documents');
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadMsg(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', uploadCategory);

      try {
        const res = await fetch(`${API_BASE}/api/documents/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user?.token}` },
          body: formData,
        });

        if (res.ok) {
          setUploadMsg({ type: 'success', text: `${file.name} uploaded successfully!` });
          fetchDocs(); // Refresh list
        } else {
          const data = await res.json();
          setUploadMsg({ type: 'error', text: data.message || 'Upload failed' });
        }
      } catch (err) {
        setUploadMsg({ type: 'error', text: `Failed to upload ${file.name}` });
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      setDocs(docs.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getFileIcon = (format: string) => {
    if (['pdf'].includes(format)) return <FileText size={20} className="file-icon pdf" />;
    if (['xlsx', 'xls', 'csv'].includes(format)) return <File size={20} className="file-icon xlsx" />;
    if (['png', 'jpg', 'jpeg', 'webp'].includes(format)) return <Image size={20} className="file-icon img" />;
    return <File size={20} className="file-icon" />;
  };

  const filtered = docs
    .filter(d => category === 'All' || d.category === category)
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="documents-page">
      <header className="dashboard-header">
        <h1>Document Management</h1>
        <p className="text-muted">Upload to Cloudinary, organize, and access all your documents securely.</p>
      </header>

      {/* Upload Message */}
      <AnimatePresence>
        {uploadMsg && (
          <motion.div
            className={`upload-msg ${uploadMsg.type}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {uploadMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {uploadMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Zone */}
      <motion.div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.webp,.doc,.docx"
          style={{ display: 'none' }}
          onChange={e => handleUpload(e.target.files)}
        />
        {uploading ? (
          <>
            <div className="loading-spinner" />
            <h3>Uploading to Cloudinary...</h3>
          </>
        ) : (
          <>
            <Upload size={40} />
            <h3>Drop files here to upload</h3>
            <p>PDF, Excel, Images supported — uploaded to Cloudinary (Max 10MB)</p>
            <div className="upload-options">
              <select value={uploadCategory} onChange={e => { e.stopPropagation(); setUploadCategory(e.target.value); }} onClick={e => e.stopPropagation()}>
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn-primary" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <Upload size={16} /> Choose Files
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Search & Filters */}
      <div className="doc-controls">
        <div className="doc-search">
          <Search size={18} />
          <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="doc-filters">
          <Filter size={16} />
          {categories.map(cat => (
            <button key={cat} className={`filter-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="doc-list">
        <div className="doc-list-header">
          <span>File Name</span><span>Category</span><span>Size</span><span>Uploaded</span><span>Actions</span>
        </div>
        <AnimatePresence>
          {filtered.map((doc, i) => (
            <motion.div
              key={doc._id}
              className="doc-row"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="doc-name">
                {getFileIcon(doc.format)}
                <div>
                  <a href={doc.url} target="_blank" rel="noreferrer" className="doc-filename">{doc.name}</a>
                  <small>by {typeof doc.uploadedBy === 'object' ? doc.uploadedBy.name : 'User'}</small>
                </div>
              </div>
              <span className="doc-category-badge">{doc.category}</span>
              <span className="text-muted">{formatSize(doc.size)}</span>
              <span className="text-muted">{new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <div className="doc-actions">
                <a href={doc.url} target="_blank" rel="noreferrer" className="icon-btn" title="Download/View"><Download size={16} /></a>
                <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(doc._id)}><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && <div className="doc-empty">{docs.length === 0 ? 'No documents uploaded yet. Drop a file above to get started!' : 'No documents match your search.'}</div>}
      </div>
    </div>
  );
}
