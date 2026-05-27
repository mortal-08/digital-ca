import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import './CALayout.css';

type Task = { id: string; title: string; assignedTo: string; deadline: string; status: 'Pending' | 'In Progress' | 'Completed'; priority: 'High' | 'Medium' | 'Low' };

const initialTasks: Task[] = [
  { id:'t1', title:'File ITR for Sharma Enterprises', assignedTo:'Rahul Sharma', deadline:'2026-07-31', status:'In Progress', priority:'High' },
  { id:'t2', title:'Prepare GST Return for April', assignedTo:'Priya Patel', deadline:'2026-05-20', status:'Pending', priority:'High' },
  { id:'t3', title:'Audit documentation for ABC Textiles', assignedTo:'Internal', deadline:'2026-06-15', status:'Pending', priority:'Medium' },
  { id:'t4', title:'Send TDS certificates to clients', assignedTo:'Internal', deadline:'2026-05-31', status:'Completed', priority:'Low' },
];

const statusCols: Task['status'][] = ['Pending', 'In Progress', 'Completed'];
const colColors: Record<string, string> = { 'Pending':'#ff9f0a', 'In Progress':'#5e5ce6', 'Completed':'#32d74b' };

export default function CATaskManager() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ priority:'Medium', status:'Pending' });

  const addTask = () => {
    if (!newTask.title) return;
    setTasks(p => [...p, { id: Date.now().toString(), title: newTask.title!, assignedTo: newTask.assignedTo || 'Internal', deadline: newTask.deadline || '', status: newTask.status as Task['status'] || 'Pending', priority: newTask.priority as Task['priority'] || 'Medium' }]);
    setNewTask({ priority:'Medium', status:'Pending' });
    setShowAdd(false);
  };

  const moveTask = (id: string, status: Task['status']) =>
    setTasks(p => p.map(t => t.id === id ? { ...t, status } : t));

  const deleteTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));

  return (
    <div>
      <div className="ca-page-header">
        <div>
          <h1><CheckSquare size={22} /> Task Manager</h1>
          <p>Create, assign, and track tasks and deadlines.</p>
        </div>
        <button className="ca-btn ca-btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Kanban columns */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
        {statusCols.map(col => (
          <div key={col}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:colColors[col] }} />
              <span style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-main)' }}>{col}</span>
              <span style={{ marginLeft:'auto', fontSize:'0.78rem', color:'var(--text-muted)' }}>
                {tasks.filter(t => t.status === col).length}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {tasks.filter(t => t.status === col).map((t, i) => (
                <motion.div key={t.id} className="ca-card"
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                  style={{ padding:'0.9rem', borderLeft:`3px solid ${colColors[t.status]}` }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.6rem' }}>
                    <p style={{ fontWeight:600, fontSize:'0.88rem', margin:0, flex:1 }}>{t.title}</p>
                    <button className="ca-btn ca-btn-danger ca-btn-sm" onClick={() => deleteTask(t.id)} style={{ padding:'0.25rem' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.65rem' }}>
                    <span className={`ca-badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.25rem' }}>
                      <Calendar size={11} /> {t.deadline || 'No deadline'}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:'0.35rem' }}>
                    {statusCols.filter(s => s !== col).map(s => (
                      <button key={s} className="ca-btn ca-btn-ghost ca-btn-sm" onClick={() => moveTask(t.id, s)}
                        style={{ fontSize:'0.72rem', padding:'0.2rem 0.5rem' }}>
                        → {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
              {tasks.filter(t => t.status === col).length === 0 && (
                <div style={{ border:'2px dashed var(--border-color)', borderRadius:12, padding:'1.5rem', textAlign:'center', color:'var(--text-muted)', fontSize:'0.83rem' }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <motion.div initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
            style={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:16, padding:'1.75rem', width:420 }}>
            <h3 style={{ fontWeight:700, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <AlertCircle size={18} /> New Task
            </h3>
            {[
              { key:'title', label:'Task Title', type:'text', placeholder:'e.g. File GST Return for May' },
              { key:'assignedTo', label:'Assigned To', type:'text', placeholder:'Client name or Internal' },
              { key:'deadline', label:'Deadline', type:'date', placeholder:'' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.82rem', fontWeight:600, display:'block', marginBottom:'0.35rem' }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(newTask as any)[f.key] || ''}
                  onChange={e => setNewTask(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.7rem 0.9rem', border:'1.5px solid var(--border-color)', borderRadius:9, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
              <div>
                <label style={{ fontSize:'0.82rem', fontWeight:600, display:'block', marginBottom:'0.35rem' }}>Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as any }))}
                  style={{ width:'100%', padding:'0.7rem 0.9rem', border:'1.5px solid var(--border-color)', borderRadius:9, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', outline:'none' }}>
                  {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:'0.82rem', fontWeight:600, display:'block', marginBottom:'0.35rem' }}>Status</label>
                <select value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value as any }))}
                  style={{ width:'100%', padding:'0.7rem 0.9rem', border:'1.5px solid var(--border-color)', borderRadius:9, background:'var(--bg-body)', color:'var(--text-main)', fontSize:'0.88rem', fontFamily:'inherit', outline:'none' }}>
                  {statusCols.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.7rem' }}>
              <button className="ca-btn ca-btn-primary" style={{ flex:1 }} onClick={addTask}>Create Task</button>
              <button className="ca-btn ca-btn-ghost" style={{ flex:1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
