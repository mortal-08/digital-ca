import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Circle, Clock, User, Calendar, X, AlertCircle, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TaskManager.css';

interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'progress' | 'done';
  description: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'File ITR for Mehta Industries', assignee: 'Rahul K.', deadline: '2026-04-30', priority: 'high', status: 'progress', description: 'Complete ITR-6 filing for FY 2025-26.' },
  { id: '2', title: 'Quarterly GST Return — Q4', assignee: 'Priya S.', deadline: '2026-05-15', priority: 'high', status: 'todo', description: 'GSTR-3B and GSTR-1 for Jan–Mar quarter.' },
  { id: '3', title: 'TDS Certificate — Form 16', assignee: 'Amit P.', deadline: '2026-06-15', priority: 'medium', status: 'todo', description: 'Generate Form 16 for all employees of client XYZ Corp.' },
  { id: '4', title: 'Audit Report — Urban Craft Ltd', assignee: 'Rahul K.', deadline: '2026-04-25', priority: 'high', status: 'progress', description: 'Statutory audit report under Section 143.' },
  { id: '5', title: 'ROC Annual Filing', assignee: 'Priya S.', deadline: '2026-05-30', priority: 'low', status: 'done', description: 'AOC-4 and MGT-7 for FY 2025-26.' },
  { id: '6', title: 'Bookkeeping — March Entries', assignee: 'Amit P.', deadline: '2026-04-10', priority: 'medium', status: 'done', description: 'Monthly journal entries and ledger reconciliation.' },
];

const staffMembers = ['Rahul K.', 'Priya S.', 'Amit P.', 'Neha G.'];

export default function TaskManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'todo' | 'progress' | 'done'>('all');
  const [newTask, setNewTask] = useState({ title: '', assignee: staffMembers[0], deadline: '', priority: 'medium' as Task['priority'], description: '' });

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const addTask = () => {
    if (!newTask.title || !newTask.deadline) return;
    setTasks([{ ...newTask, id: Date.now().toString(), status: 'todo' }, ...tasks]);
    setNewTask({ title: '', assignee: staffMembers[0], deadline: '', priority: 'medium', description: '' });
    setShowForm(false);
  };

  const updateStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getStatusIcon = (status: Task['status']) => {
    if (status === 'done') return <CheckCircle size={18} className="status-done" />;
    if (status === 'progress') return <Clock size={18} className="status-progress" />;
    return <Circle size={18} className="status-todo" />;
  };

  const getPriorityClass = (p: string) => `priority-${p}`;

  const isOverdue = (deadline: string) => new Date(deadline) < new Date() && true;

  return (
    <div className="task-manager">
      <header className="task-header">
        <div>
          <h1>Task Management</h1>
          <p className="text-muted">Track assignments, deadlines, and team workload.</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18}/> New Task
          </button>
        )}
      </header>

      {/* Task Creation Form (Admin Only) */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="task-form card" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
            <div className="task-form-grid">
              <div className="form-group"><label>Task Title</label><input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="E.g., File GST returns for Q1" /></div>
              <div className="form-group"><label>Assign To</label>
                <select value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                  {staffMembers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Deadline</label><input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} /></div>
              <div className="form-group"><label>Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as Task['priority']})}>
                  <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{marginTop: '1rem'}}><label>Description</label>
              <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Details about this task..." rows={2}/>
            </div>
            <div className="task-form-actions">
              <button className="btn-primary" onClick={addTask}>Create Task</button>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="task-filters">
        <Filter size={16} />
        {(['all', 'todo', 'progress', 'done'] as const).map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : f === 'progress' ? 'In Progress' : 'Completed'}
            <span className="filter-count">{f === 'all' ? tasks.length : tasks.filter(t => t.status === f).length}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-list">
        <AnimatePresence>
          {filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              className={`task-card card ${task.status}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: i * 0.05 }}
              layout
            >
              <div className="task-card-left">
                <button className="status-btn" onClick={() => updateStatus(task.id, task.status === 'todo' ? 'progress' : task.status === 'progress' ? 'done' : 'todo')}>
                  {getStatusIcon(task.status)}
                </button>
                <div className="task-info">
                  <h4 className={task.status === 'done' ? 'completed' : ''}>{task.title}</h4>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <div className="task-meta">
                    <span className="task-assignee"><User size={14}/> {task.assignee}</span>
                    <span className={`task-deadline ${isOverdue(task.deadline) && task.status !== 'done' ? 'overdue' : ''}`}>
                      <Calendar size={14}/> {new Date(task.deadline).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}
                      {isOverdue(task.deadline) && task.status !== 'done' && <AlertCircle size={14}/>}
                    </span>
                    <span className={`task-priority ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <button className="delete-btn" onClick={() => deleteTask(task.id)} title="Delete task"><X size={16}/></button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
