import React, { useState, useEffect } from 'react';
import { 
  Trello, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Trash2, 
  Edit, 
  Clock, 
  AlertCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import GlassCard from '../components/GlassCard';
import TaskModal from '../components/TaskModal';

export const KanbanBoard = () => {
  const { user } = useAuth();
  
  // Selection & State
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDateAsc');

  // Modal controls
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/api/projects');
        if (res.success) {
          setProjects(res.projects);
          if (res.projects.length > 0) {
            setActiveProjectId(res.projects[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to list workspace projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const fetchTasks = async (projectId) => {
    if (!projectId) return;
    setTasksLoading(true);
    try {
      const res = await api.get(`/api/tasks/project/${projectId}`);
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error(err);
      setError('Uplink disruption: Failed to sync tasks.');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(activeProjectId);
  }, [activeProjectId]);

  // DRAG & DROP IMPLEMENTATION
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Find original task to check if status is actually changing
    const originalTask = tasks.find(t => t._id === taskId);
    if (!originalTask || originalTask.status === targetStatus) return;

    // Optimistically update frontend state for buttery smooth performance!
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: targetStatus } : t));

    try {
      const res = await api.patch(`/api/tasks/${taskId}/status`, { status: targetStatus });
      if (!res.success) {
        // Revert on failure
        setTasks(previousTasks);
        alert(res.message || 'Status update rejected');
      }
    } catch (err) {
      console.error(err);
      setTasks(previousTasks);
      alert('Uplink error: Status change failed.');
    }
  };

  // DELETE TASK
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Destroy this task node? Confirm command.')) return;

    try {
      const res = await api.delete(`/api/tasks/${id}`);
      if (res.success) {
        setTasks(tasks.filter(t => t._id !== id));
      } else {
        alert(res.message || 'Deletion rejected');
      }
    } catch (err) {
      console.error(err);
      alert('Deletion command failed');
    }
  };

  // OPEN EDIT TASK MODAL
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  // OPEN CREATE TASK MODAL
  const handleCreateClick = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  // FILTER & SORT LOGIC
  const getFilteredAndSortedTasks = () => {
    let result = [...tasks];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      }
      if (sortBy === 'dueDateDesc') {
        return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
      }
      if (sortBy === 'priorityHighToLow') {
        const priorities = { High: 3, Medium: 2, Low: 1 };
        return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  const columns = [
    { name: 'Pending', status: 'Pending', style: 'border-amber-500/10 hover:border-amber-500/20' },
    { name: 'In Progress', status: 'In Progress', style: 'border-violet-500/10 hover:border-violet-500/20' },
    { name: 'Completed', status: 'Completed', style: 'border-emerald-500/10 hover:border-emerald-500/20' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-t-2 border-cyan-500 border-r-2 border-r-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest font-mono text-slate-500">Initializing Kanban Desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-slate-200">Collaborative Kanban</h1>
          <p className="text-xs text-slate-400 mt-1">Drag and drop cards to update statuses dynamically.</p>
        </div>

        {/* Project Selector & Add Button */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Workspace</span>
            <select
              value={activeProjectId}
              onChange={e => setActiveProjectId(e.target.value)}
              className="px-4 py-2.5 rounded-xl glass-input border text-xs cursor-pointer min-w-[200px]"
            >
              {projects.map(p => (
                <option key={p._id} value={p._id} className="bg-slate-900 text-slate-250">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {activeProjectId && (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300 transform active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input border text-xs"
            placeholder="Search tasks..."
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl glass-input border text-xs cursor-pointer"
          >
            <option value="All" className="bg-slate-900">All Priorities</option>
            <option value="Low" className="bg-slate-900">Low Priority</option>
            <option value="Medium" className="bg-slate-900">Medium Priority</option>
            <option value="High" className="bg-slate-900">High Priority</option>
          </select>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl glass-input border text-xs cursor-pointer"
          >
            <option value="dueDateAsc" className="bg-slate-900">Due Date (Soonest)</option>
            <option value="dueDateDesc" className="bg-slate-900">Due Date (Furthest)</option>
            <option value="priorityHighToLow" className="bg-slate-900">Priority (High to Low)</option>
            <option value="alphabetical" className="bg-slate-900">Alphabetical</option>
          </select>
        </div>

      </div>

      {/* Main Board Columns */}
      {!activeProjectId ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center gap-4">
          <FolderOpen className="w-12 h-12 text-slate-600 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-slate-350">Workspace Offline</h3>
            <p className="text-xs text-slate-500 mt-1">Please create a project node in the Project Hub to enable Kanban boards.</p>
          </div>
        </div>
      ) : tasksLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-t-2 border-cyan-500 border-r-2 border-r-transparent animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Syncing task configurations...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            
            return (
              <div 
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`glass-panel rounded-3xl p-5 border flex flex-col min-h-[500px] transition-all duration-300 ${col.style}`}
              >
                {/* Column header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/40">
                  <h3 className="text-sm font-bold text-slate-200 tracking-wide font-sans">{col.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    col.status === 'Completed' ? 'status-completed' :
                    col.status === 'In Progress' ? 'status-progress' : 'status-pending'
                  }`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards stack */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-full border border-dashed border-slate-800/50 rounded-2xl flex items-center justify-center py-10 text-center text-slate-650 text-[10px] font-mono uppercase tracking-wider">
                      Drop Tasks Here
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const assigneeName = task.assignee?.name || 'Assignee';
                      const isOverdue = col.status !== 'Completed' && new Date(task.dueDate) < new Date();
                      
                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task._id)}
                          className="group p-4.5 rounded-2xl bg-slate-900/60 dark:bg-slate-950/45 border border-slate-800/60 hover:border-slate-700/80 shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-98 cursor-grab flex flex-col justify-between gap-3 relative overflow-hidden"
                        >
                          {/* Top Tag Row */}
                          <div className="flex justify-between items-start gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-widest ${
                              task.priority === 'High' ? 'priority-high' :
                              task.priority === 'Medium' ? 'priority-medium' : 'priority-low'
                            }`}>
                              {task.priority}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => handleEditClick(task)}
                                className="p-1 rounded bg-slate-900 border border-slate-850 hover:text-cyan-400 transition-all"
                                title="Edit Task"
                              >
                                <Edit className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="p-1 rounded bg-slate-900 border border-slate-850 hover:text-rose-400 transition-all"
                                title="Destroy Task"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 line-clamp-1">{task.title}</h4>
                            <p className="text-[10px] text-slate-450 mt-1 line-clamp-2">{task.description || 'No description provided.'}</p>
                          </div>

                          {/* Date and Assignee Footer */}
                          <div className="flex justify-between items-center border-t border-slate-800/40 pt-3 mt-1.5 text-[9px] text-slate-500 font-mono uppercase">
                            <span className={`flex items-center gap-1 font-bold truncate max-w-[120px] ${isOverdue ? 'text-rose-450 animate-pulse' : ''}`}>
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                              {isOverdue && ' (Overdue)'}
                            </span>

                            <div 
                              className={`w-5.5 h-5.5 rounded-full bg-gradient-to-tr ${task.assignee?.avatarColor || 'from-cyan-500 to-blue-500'} flex items-center justify-center font-bold text-[7px] text-slate-950 cursor-help shrink-0`}
                              title={`Assignee: ${assigneeName}`}
                            >
                              {assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal Editor Dialog */}
      <TaskModal 
        isOpen={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        task={selectedTask}
        projectId={activeProjectId}
        onSave={() => {
          fetchTasks(activeProjectId);
        }} 
      />

    </div>
  );
};

export default KanbanBoard;
