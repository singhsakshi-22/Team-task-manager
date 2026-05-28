import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export const TaskModal = ({ isOpen, onClose, task = null, projectId = null, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch projects and users on load
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [projRes, userRes] = await Promise.all([
            api.get('/api/projects'),
            api.get('/api/auth/users')
          ]);
          
          if (projRes.success) setProjectsList(projRes.projects);
          if (userRes.success) setUsersList(userRes.users);
        } catch (err) {
          console.error('Error fetching list selectors:', err);
          setError('Failed to load selection drop-downs');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen]);

  // Prepopulate task data if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setProject(task.project && (task.project._id || task.project) || '');
      setAssignee(task.assignee && (task.assignee._id || task.assignee) || '');
      setStatus(task.status || 'Pending');
      setPriority(task.priority || 'Medium');
      
      if (task.dueDate) {
        // Format YYYY-MM-DD
        const d = new Date(task.dueDate);
        const formatted = d.toISOString().split('T')[0];
        setDueDate(formatted);
      } else {
        setDueDate('');
      }
    } else {
      // Default creation state
      setTitle('');
      setDescription('');
      setProject(projectId || '');
      setAssignee('');
      setStatus('Pending');
      setPriority('Medium');
      setDueDate('');
    }
    setError('');
  }, [task, projectId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Task title is required');
    if (!project) return setError('Please select a project');
    if (!assignee) return setError('Please assign this task to a member');
    if (!dueDate) return setError('Please specify a due date');

    try {
      const taskPayload = {
        title,
        description,
        project,
        assignee,
        status,
        priority,
        dueDate
      };

      let result;
      if (task) {
        // Edit Task
        result = await api.put(`/api/tasks/${task._id}`, taskPayload);
      } else {
        // Create Task
        result = await api.post('/api/tasks', taskPayload);
      }

      if (result.success) {
        onSave(result.task);
        onClose();
      } else {
        setError(result.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during submission');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel glass-panel-glow rounded-3xl p-6 md:p-8 animate-float-up max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-rose-400 hover:border-rose-500/30 transition-all duration-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent font-sans pr-10">
          {task ? 'Edit Collaborative Task' : 'Provision New Task'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">
          {task ? 'Update properties and save changes' : 'Assign goals and schedule milestone timelines'}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-650 uppercase tracking-widest font-mono mb-1.5">Task Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl glass-input border text-sm"
              placeholder="e.g. Design Ledger Authentication Block"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-650 uppercase tracking-widest font-mono mb-1.5">Detailed Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl glass-input border text-sm h-24 resize-none"
              placeholder="Provide context and notes for the assignee..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Project Select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-650 uppercase tracking-widest font-mono mb-1.5">Associated Project *</label>
              <select
                value={project}
                onChange={e => setProject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input border text-sm cursor-pointer"
                disabled={loading || projectId !== null}
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Select Project --</option>
                {projectsList.map(p => (
                  <option key={p._id} value={p._id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-650 uppercase tracking-widest font-mono mb-1.5">Assign Task To *</label>
              <select
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input border text-sm cursor-pointer"
                disabled={loading}
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Choose Member --</option>
                {usersList.map(u => (
                  <option key={u._id} value={u._id} className="bg-slate-900 text-slate-200">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-650 uppercase tracking-widest font-mono mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input border text-sm cursor-pointer"
                disabled={loading}
              >
                <option value="Low" className="bg-slate-900 text-slate-200">Low Priority</option>
                <option value="Medium" className="bg-slate-900 text-slate-200">Medium Priority</option>
                <option value="High" className="bg-slate-900 text-slate-200">High Priority</option>
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-650 uppercase tracking-widest font-mono mb-1.5">Workflow Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input border text-sm cursor-pointer"
                disabled={loading}
              >
                <option value="Pending" className="bg-slate-900 text-slate-200">Pending</option>
                <option value="In Progress" className="bg-slate-900 text-slate-200">In Progress</option>
                <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
              </select>
            </div>

          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-650 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Due Date Milestone *
            </label>
            <input 
              type="date" 
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl glass-input border text-sm cursor-pointer"
              disabled={loading}
            />
          </div>

          {/* Footer controls */}
          <div className="flex justify-end gap-3 border-t border-slate-800/40 pt-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/40 hover:text-slate-200 transition-all duration-300 text-sm font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : task ? 'Save Changes' : 'Launch Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TaskModal;
