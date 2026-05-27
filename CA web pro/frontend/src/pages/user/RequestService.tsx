import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './UserLayout.css';

const services = [
  { id: 'itr-salaried', name: 'ITR Filing (Salaried)', icon: '💼', desc: 'Income tax return for salaried individuals.', price: '₹1,500', color: '#5e5ce6', priority: 'Medium', requiredDocs: ['Form 16', 'PAN Card', 'Aadhar Card', 'Bank Statements'] },
  { id: 'itr-business', name: 'ITR Filing (Business)', icon: '📈', desc: 'Income tax return for business/professionals.', price: '₹3,500', color: '#32d74b', priority: 'High', requiredDocs: ['P&L Statement', 'Balance Sheet', 'GST Returns', 'Bank Statements'] },
  { id: 'gst-reg', name: 'GST Registration', icon: '📝', desc: 'New GST registration for your business.', price: '₹2,000', color: '#ff9f0a', priority: 'Medium', requiredDocs: ['PAN Card', 'Aadhar Card', 'Electricity Bill', 'Cancel Cheque'] },
  { id: 'gst-return', name: 'GST Return Filing', icon: '📊', desc: 'Monthly/Quarterly GST return filing.', price: '₹1,000', color: '#ff453a', priority: 'Medium', requiredDocs: ['Purchase Invoices', 'Sales Invoices', 'GST Portal Credentials'] },
  { id: 'company-reg', name: 'Company Registration', icon: '🏢', desc: 'Private Limited or OPC registration.', price: '₹7,500', color: '#bf5af2', priority: 'High', requiredDocs: ['PAN & Aadhar of Directors', 'Passport Photos', 'Address Proof', 'NOC'] },
  { id: 'audit', name: 'Statutory Audit', icon: '🔍', desc: 'Mandatory annual audit for companies.', price: '₹15,000', color: '#64d2ff', priority: 'High', requiredDocs: ['Books of Accounts', 'Vouchers', 'Bank Statements', 'Previous Year Audit Report'] },
  { id: 'tds-return', name: 'TDS Return Filing', icon: '✂️', desc: 'Quarterly TDS return submission.', price: '₹1,500', color: '#ff375f', priority: 'Medium', requiredDocs: ['TDS Challans', 'Deductee Details', 'PAN of Deductees'] },
  { id: 'tan-reg', name: 'TAN Registration', icon: '🆔', desc: 'New Tax Deduction Account Number.', price: '₹1,000', color: '#0a84ff', priority: 'Low', requiredDocs: ['PAN Card', 'Aadhar Card', 'Company Incorporation Proof'] },
  { id: 'msme', name: 'MSME / Udyam', icon: '🛡️', desc: 'Get MSME registration for benefits.', price: '₹1,000', color: '#30d158', priority: 'Low', requiredDocs: ['Aadhar Card', 'PAN Card', 'Bank Details'] },
  { id: 'dsc', name: 'Digital Signature (DSC)', icon: '🔑', desc: 'Class 3 DSC for e-filing/tenders.', price: '₹2,500', color: '#ffd60a', priority: 'Medium', requiredDocs: ['Aadhar Card', 'PAN Card', 'Live Photo Verification'] },
  { id: 'fssai', name: 'FSSAI License', icon: '🍕', desc: 'Food license for your food business.', price: '₹3,000', color: '#ff9f0a', priority: 'Medium', requiredDocs: ['Address Proof', 'Photo ID', 'Food Category List'] },
  { id: 'trademark', name: 'Trademark Filing', icon: '™️', desc: 'Protect your brand name or logo.', price: '₹6,000', color: '#5e5ce6', priority: 'Medium', requiredDocs: ['Logo Image', 'User Affidavit', 'Power of Attorney'] },
  { id: 'accounting', name: 'Bookkeeping', icon: '📖', desc: 'Monthly accounting & bookkeeping.', price: '₹5,000', color: '#32d74b', priority: 'Medium', requiredDocs: ['Sales & Purchase Vouchers', 'Bank Statements', 'Expense Receipts'] },
  { id: 'advisory', name: 'Financial Advisory', icon: '💡', desc: 'Investment & tax planning advice.', price: '₹2,000', color: '#bf5af2', priority: 'Medium', requiredDocs: ['Current Investment Portfolio', 'Income Details', 'Financial Goals'] },
];

const steps = ['Select Service', 'Enter Details', 'Upload Docs', 'Submit'];

export default function RequestService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const service = services.find(s => s.id === selected);
      const amount = parseInt(service?.price.replace(/[^\d]/g, '') || '0');
      const res = await apiFetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${user?.token}` },
        body: JSON.stringify({ 
          serviceType: service?.name || selected, 
          description: desc, 
          priority,
          amount 
        })
      });
      await res.json();
    } catch { }
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setStep(0); setSelected(''); setDesc(''); setFiles([]); navigate('/user/tracking'); }, 2000);
  };

  if (submitted) return (
    <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:'1rem', textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <CheckCircle size={36} color="#059669" />
      </div>
      <h2 style={{ fontWeight:800, color:'var(--text-main)' }}>Request Submitted!</h2>
      <p style={{ color:'#9ca3af' }}>Your CA will review your request and get back to you shortly.</p>
    </motion.div>
  );

  return (
    <div>
      <h1 className="user-page-title"><PlusCircle size={22} color="#10b981" /> Request a Service</h1>
      <p className="user-page-sub">Tell us what you need and your CA will get back to you within 24 hours.</p>

      {/* Progress bar */}
      <div style={{ display:'flex', alignItems:'center', gap:'0', marginBottom:'2rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', flex: i < steps.length-1 ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background: i <= step ? '#10b981' : '#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', color: i <= step ? 'white' : '#9ca3af', transition:'all 0.3s' }}>
                {i < step ? <CheckCircle size={16} /> : i+1}
              </div>
              <span style={{ fontSize:'0.72rem', fontWeight:600, color: i <= step ? '#10b981' : '#9ca3af', whiteSpace:'nowrap' }}>{s}</span>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:2, background: i < step ? '#10b981' : '#e5e7eb', marginBottom:'1.2rem', transition:'background 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Select service */}
      {step === 0 && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
            {services.map(svc => (
              <motion.div key={svc.id} className="user-card" whileHover={{ y:-4 }} onClick={() => setSelected(svc.id)}
                style={{ cursor:'pointer', border: selected===svc.id ? `2px solid ${svc.color}` : '1px solid #e8ecf0', background: selected===svc.id ? `${svc.color}08` : undefined, padding:'1.25rem' }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.6rem' }}>{svc.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', margin:'0 0 0.3rem' }}>{svc.name}</h3>
                <p style={{ fontSize:'0.8rem', color:'#9ca3af', margin:'0 0 0.75rem' }}>{svc.desc}</p>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:svc.color }}>{svc.price}</span>
                {selected===svc.id && <div style={{ position:'absolute', top:10, right:10 }}><CheckCircle size={18} color={svc.color} /></div>}
              </motion.div>
            ))}
          </div>
          <button className="user-btn user-btn-primary" style={{ marginTop:'1.5rem' }} disabled={!selected} onClick={() => {
            const svc = services.find(s=>s.id===selected);
            if (svc) setPriority(svc.priority);
            setStep(1);
          }}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <div className="user-card" style={{ maxWidth:540 }}>
          <h3 style={{ fontWeight:700, marginBottom:'1rem' }}>{services.find(s=>s.id===selected)?.name}</h3>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'0.4rem', color:'#374151' }}>Describe your requirement</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="e.g. I need to file ITR for FY 2025-26, salaried income with HRA…"
              style={{ width:'100%', padding:'0.75rem', border:'1.5px solid #e5e7eb', borderRadius:10, background:'#f9fafb', fontSize:'0.88rem', fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'0.4rem', color:'#374151' }}>Priority</label>
            <div style={{ display:'flex', gap:'0.6rem' }}>
              {['Low','Medium','High'].map(p => (
                <button key={p} onClick={()=>setPriority(p)}
                  className={`user-btn user-btn-sm ${priority===p ? 'user-btn-primary' : 'user-btn-outline'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button className="user-btn user-btn-primary" onClick={() => setStep(2)}>Next <ArrowRight size={16} /></button>
            <button className="user-btn user-btn-outline" onClick={() => setStep(0)}>Back</button>
          </div>
        </div>
      )}

      {/* Step 2 — Upload */}
      {step === 2 && (
        <div className="user-card" style={{ maxWidth:540 }}>
          <h3 style={{ fontWeight:700, marginBottom:'0.5rem' }}>Upload Documents</h3>
          
          <div style={{ background:'#fffbeb', border:'1px solid #fde68a', padding:'0.85rem 1.1rem', borderRadius:10, marginBottom:'1.25rem' }}>
            <h4 style={{ margin:'0 0 0.4rem', fontSize:'0.85rem', color:'#d97706', fontWeight:700 }}>Required Documents for {services.find(s=>s.id===selected)?.name}:</h4>
            <ul style={{ margin:0, paddingLeft:'1.2rem', color:'#b45309', fontSize:'0.82rem', lineHeight:1.6 }}>
              {services.find(s=>s.id===selected)?.requiredDocs.map(doc => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>
          
          <p style={{ fontSize:'0.85rem', color:'#9ca3af', marginBottom:'1rem' }}>Upload required files below:</p>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ border:`2px dashed ${dragOver ? '#10b981' : '#d1d5db'}`, borderRadius:14, padding:'2.5rem', textAlign:'center', background: dragOver ? '#f0fdf4' : '#f9fafb', cursor:'pointer', marginBottom:'1rem', transition:'all 0.2s' }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload size={36} color={dragOver ? '#10b981' : '#9ca3af'} style={{ marginBottom:'0.75rem' }} />
            <p style={{ fontWeight:600, margin:'0 0 0.25rem', color: dragOver ? '#10b981' : '#374151' }}>Drag & drop files here</p>
            <p style={{ fontSize:'0.8rem', color:'#9ca3af', margin:0 }}>or click to browse</p>
            <input id="file-input" type="file" multiple style={{ display:'none' }}
              onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
          </div>
          {files.length > 0 && (
            <div style={{ marginBottom:'1rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              {files.map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.5rem 0.75rem', background:'#f9fafb', borderRadius:8, fontSize:'0.83rem' }}>
                  <CheckCircle size={14} color="#059669" />{f.name}
                  <span style={{ marginLeft:'auto', color:'#9ca3af' }}>{(f.size/1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button 
              className="user-btn user-btn-primary" 
              onClick={() => {
                const requiredCount = services.find(s=>s.id===selected)?.requiredDocs.length || 0;
                if (files.length < requiredCount) {
                  alert(`Strict Requirement: You must upload all ${requiredCount} required documents to proceed.`);
                  return;
                }
                setStep(3);
              }}
            >
              Next <ArrowRight size={16} />
            </button>
            <button className="user-btn user-btn-outline" onClick={() => setStep(1)}>Back</button>
          </div>
        </div>
      )}

      {/* Step 3 — Review & Submit */}
      {step === 3 && (
        <div className="user-card" style={{ maxWidth:540 }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem' }}>Review & Submit</h3>
          {[
            { label:'Service', value:services.find(s=>s.id===selected)?.name },
            { label:'Description', value:desc || '—' },
            { label:'Priority', value:priority },
            { label:'Documents', value: files.length > 0 ? `${files.length} file(s)` : 'None' },
          ].map(row => (
            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'0.65rem 0', borderBottom:'1px solid #f3f4f6' }}>
              <span style={{ fontSize:'0.85rem', color:'#6b7280', fontWeight:500 }}>{row.label}</span>
              <span style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text-main)' }}>{row.value}</span>
            </div>
          ))}
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
            <button className="user-btn user-btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex:1 }}>
              {loading ? 'Submitting…' : '✓ Submit Request'}
            </button>
            <button className="user-btn user-btn-outline" onClick={() => setStep(2)}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
