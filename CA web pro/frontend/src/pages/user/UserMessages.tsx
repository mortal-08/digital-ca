import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE, { apiFetch } from '../../config/api';
import './UserLayout.css';

export default function UserMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchChat = async () => {
      if (!user?.caId) return;
      try {
        const res = await apiFetch(`${API_BASE}/api/chat/${user.caId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) { console.error(err); }
    };
    fetchChat();
    // Simple polling
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const send = async () => {
    console.log('Sending message:', { input, caId: user?.caId, user });
    if (!input.trim() || !user?.caId) {
      console.warn('Cannot send: input or caId missing', { input, caId: user?.caId });
      return;
    }
    const msg = input.trim();
    setInput('');
    try {
      const res = await apiFetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ receiverId: user.caId, message: msg })
      });
      if (res.ok) {
        setMessages(prev => [...prev, { senderId: user._id, text: msg, message: msg, timestamp: new Date() }]);
      } else {
        const errorData = await res.json();
        console.error('Failed to send message:', errorData);
      }
    } catch (err) { console.error('Error sending message:', err); }
  };

  return (
    <div>
      <h1 className="user-page-title"><MessageSquare size={22} color="#10b981" /> Messages</h1>
      <p className="user-page-sub">Chat directly with your assigned Chartered Accountant.</p>

      <div className="user-card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column' }}>
        {!user?.caId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: '#10b981' }} />
            <h3 style={{ fontWeight: 700, color: '#4b5563', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>No CA Assigned</h3>
            <p style={{ fontSize: '0.88rem', maxWidth: '320px', margin: 0, lineHeight: 1.5 }}>
              You don't have an assigned Chartered Accountant (CA) yet. Please register with a CA email or contact support to link a CA to your account.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#5e5ce6,#818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>CA</div>
              <div>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem' }}>{user?.caName || 'Your CA'}</p>
                <small style={{ color: '#10b981', fontSize: '0.75rem' }}>● Online</small>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map((m, i) => {
                const isUser = m.senderId === user?._id;
                const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    {!isUser && (
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#5e5ce6,#818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', marginRight: '0.5rem', flexShrink: 0, alignSelf: 'flex-end' }}>CA</div>
                    )}
                    <div style={{
                      maxWidth: '65%', padding: '0.65rem 0.95rem',
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isUser ? '#10b981' : 'white',
                      border: !isUser ? '1px solid #e8ecf0' : 'none',
                      color: isUser ? 'white' : '#111827',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>{m.message}</p>
                      <small style={{ fontSize: '0.7rem', opacity: 0.65, marginTop: '0.2rem', display: 'block' }}>{time}</small>
                    </div>
                    {isUser && (
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', marginLeft: '0.5rem', flexShrink: 0, alignSelf: 'flex-end' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); send(); }} style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '0.6rem' }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="Type your message…"
                style={{ flex: 1, padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#f9fafb', color: '#111827', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }} />
              <button type="submit" className="user-btn user-btn-primary"><Send size={16} /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
