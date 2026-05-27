import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Briefcase, IndianRupee, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CALayout.css';

const services = [
  { name:'Tax Filing', price:2500, enabled:true },
  { name:'GST Return', price:1500, enabled:true },
  { name:'Audit',      price:8000, enabled:true },
  { name:'Advisory',   price:3000, enabled:false },
  { name:'Company Registration', price:5000, enabled:true },
  { name:'Bookkeeping', price:1200, enabled:false },
];

export default function CASettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone:'', bio:'Expert CA with 10+ years experience', company:'CA & Associates' });
  const [svcList, setSvcList] = useState(services);
  const [available, setAvailable] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleService = (i: number) =>
    setSvcList(prev => prev.map((s, idx) => idx===i ? { ...s, enabled:!s.enabled } : s));

  const updatePrice = (i: number, price: number) =>
    setSvcList(prev => prev.map((s, idx) => idx===i ? { ...s, price } : s));

  return (
    <div>
      <div className="ca-page-header">
        <div>
          <h1><Settings size={22} /> Settings</h1>
          <p>Manage your profile, services, and availability.</p>
        </div>
        <button className="ca-btn ca-btn-primary" onClick={handleSave}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        {/* Profile */}
        <div className="ca-card">
          <div className="ca-card-header"><h3><User size={17} /> Profile</h3></div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Avatar */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ width:60, height:60, borderRadius:14, background:'linear-gradient(135deg,#5e5ce6,#818cf8)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800 }}>
                {profile.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight:700, margin:0 }}>{profile.name}</p>
                <small style={{ color:'var(--text-muted)' }}>Chartered Accountant</small>
              </div>
            </div>
            {[
              { key:'name', label:'Full Name', type:'text' },
              { key:'email', label:'Email', type:'email' },
              { key:'phone', label:'Phone', type:'tel' },
              { key:'company', label:'Firm Name', type:'text' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:'0.8rem', fontWeight:600, display:'block', marginBottom:'0.3rem', color:'var(--text-muted)' }}>{f.label}</label>
                <input type={f.type} value={(profile as any)[f.key]}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid var(--border-color)', borderRadius:9, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize:'0.8rem', fontWeight:600, display:'block', marginBottom:'0.3rem', color:'var(--text-muted)' }}>Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio:e.target.value }))} rows={3}
                style={{ width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid var(--border-color)', borderRadius:9, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Availability */}
          <div className="ca-card">
            <div className="ca-card-header"><h3><Briefcase size={17} /> Availability</h3></div>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <button onClick={() => setAvailable(!available)} style={{ background:'none', border:'none', cursor:'pointer', color: available ? '#32d74b' : 'var(--text-muted)' }}>
                {available ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
              <div>
                <p style={{ fontWeight:600, margin:0 }}>{available ? 'Available for new clients' : 'Not accepting new clients'}</p>
                <small style={{ color:'var(--text-muted)' }}>Toggle your availability status</small>
              </div>
            </div>
          </div>

          {/* Services & Pricing */}
          <div className="ca-card">
            <div className="ca-card-header"><h3><IndianRupee size={17} /> Service Pricing</h3></div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {svcList.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}
                  style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 0.8rem', background:'var(--bg-body)', borderRadius:10, border:'1px solid var(--border-color)', opacity: s.enabled ? 1 : 0.5 }}>
                  <button onClick={() => toggleService(i)} style={{ background:'none', border:'none', cursor:'pointer', color: s.enabled ? '#32d74b' : 'var(--text-muted)', padding:0 }}>
                    {s.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <span style={{ flex:1, fontSize:'0.88rem', fontWeight:600 }}>{s.name}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
                    <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>₹</span>
                    <input type="number" value={s.price} onChange={e => updatePrice(i, parseInt(e.target.value))}
                      style={{ width:70, padding:'0.3rem 0.5rem', border:'1px solid var(--border-color)', borderRadius:7, background:'var(--bg-surface)', color:'var(--text-main)', fontSize:'0.85rem', fontFamily:'inherit', outline:'none', textAlign:'right' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
