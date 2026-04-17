import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending to backend
    setTimeout(() => {
      setSent(true);
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="page-container">
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1>Contact Support & CA Queries</h1>
        <p className="text-muted">Send a direct message to your CA firm partner.</p>
      </header>

      <motion.div 
        className="card" 
        style={{ maxWidth: '600px' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="avatar"><MessageSquare size={18} /></div>
            <div>
               <h3 style={{fontSize: '1.1rem'}}>New Message</h3>
               <span className="text-muted" style={{fontSize: '0.85rem'}}>From: {user?.email}</span>
            </div>
        </div>

        {sent ? (
          <div className="auth-error" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
            Your message has been sent successfully. The CA team will reply shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Subject</label>
              <div className="input-wrapper">
                 <input 
                   type="text" 
                   required
                   value={subject}
                   onChange={e => setSubject(e.target.value)}
                   style={{ paddingLeft: '1rem' }}
                   placeholder="E.g., Query regarding FY24 Tax Returns"
                 />
              </div>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea 
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your detailed query here..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
              <Send size={18}/> Send Query
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
