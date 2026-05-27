import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './CALayout.css';

export default function CAMessages() {
  const { user } = useAuth();
  const location = useLocation();
  const [clients, setClients] = useState<any[]>([]);
  const [active, setActive] = useState(location.state?.activeClient || '');
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/clients`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClients(data);
          // If no active client yet, select first
          if (data.length > 0 && !active && !location.state?.activeClient) {
            setActive(data[0]._id);
          }
        }
      } catch (err) { console.error(err); }
    };
    if (user?.token) fetchClients();
  }, [user, active, location.state]);

  // Fetch messages for active client
  useEffect(() => {
    const fetchChat = async () => {
      if (!active) return;
      try {
        const res = await apiFetch(`${API_BASE}/api/chat/${active}`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => ({ ...prev, [active]: data }));
        }
      } catch (err) { console.error(err); }
    };
    if (user?.token) {
      fetchChat();
      const interval = setInterval(fetchChat, 5000);
      return () => clearInterval(interval);
    }
  }, [active, user]);

  const send = async () => {
    if (!input.trim() || !active) return;
    const msg = input.trim();
    setInput('');
    try {
      const res = await apiFetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({ receiverId: active, message: msg })
      });
      if (res.ok) {
        // Optimistic update
        setMessages(prev => {
          const existing = prev[active] || [];
          return { ...prev, [active]: [...existing, { senderId: user?._id, message: msg, timestamp: new Date() }] };
        });
      }
    } catch (err) { console.error(err); }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="ca-page-header">
        <div>
          <h1><MessageSquare size={22} /> Messages</h1>
          <p>Real-time chat with your clients.</p>
        </div>
      </div>

      <div className="ca-card" style={{ padding:0, overflow:'hidden', height:'calc(100vh - 220px)', display:'flex' }}>
        {/* Sidebar */}
        <div style={{ width:260, borderRight:'1px solid var(--border-color)', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'0.85rem', borderBottom:'1px solid var(--border-color)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-body)', border:'1px solid var(--border-color)', borderRadius:9, padding:'0.45rem 0.75rem' }}>
              <Search size={14} color="var(--text-muted)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.84rem', color:'var(--text-main)', fontFamily:'inherit', flex:1 }} />
            </div>
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {filtered.map(c => (
              <div key={c._id} onClick={() => setActive(c._id)}
                style={{ padding:'0.9rem 1rem', cursor:'pointer', borderBottom:'1px solid var(--border-color)', background: active===c._id ? 'var(--color-primary-light)' : 'transparent', transition:'background 0.15s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.2rem' }}>
                  <span style={{ fontWeight:active===c._id ? 700 : 600, fontSize:'0.88rem', color: active===c._id ? 'var(--color-primary)' : 'var(--text-main)' }}>{c.name}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{c.company || 'Client'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'0.9rem 1.2rem', borderBottom:'1px solid var(--border-color)', background:'var(--bg-body)' }}>
            <p style={{ fontWeight:700, margin:0 }}>{clients.find(c=>c._id===active)?.name || 'Select a client'}</p>
            <small style={{ color:'var(--text-muted)' }}>Client</small>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.2rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {(messages[active] || []).map((m, i) => {
              const isCa = m.senderId === user?._id;
              const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : '';
              return (
                <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  style={{ display:'flex', justifyContent: isCa ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'68%', padding:'0.65rem 0.95rem', borderRadius: isCa ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isCa ? 'var(--color-primary)' : 'var(--bg-body)',
                    border: !isCa ? '1px solid var(--border-color)' : 'none',
                    color: isCa ? 'white' : 'var(--text-main)',
                  }}>
                    <p style={{ margin:0, fontSize:'0.88rem' }}>{m.message}</p>
                    <small style={{ fontSize:'0.7rem', opacity:0.7 }}>{time}</small>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding:'0.85rem 1.2rem', borderTop:'1px solid var(--border-color)', display:'flex', gap:'0.6rem' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && send()}
              placeholder="Type a message…"
              style={{ flex:1, padding:'0.7rem 1rem', border:'1.5px solid var(--border-color)', borderRadius:10, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', outline:'none' }} />
            <button className="ca-btn ca-btn-primary" onClick={send}><Send size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
