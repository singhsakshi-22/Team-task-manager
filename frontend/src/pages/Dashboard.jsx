import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Hourglass, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import TaskModal from '../components/TaskModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/dashboard/summary');
      if (res.success) {
        setSummary(res.summary);
      } else {
        setError('Failed to query grid analytics.');
      }
    } catch (err) {
      console.error(err);
      setError('Uplink disruption: Server not responding.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-t-2 border-cyan-500 border-r-2 border-r-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest font-mono text-slate-500">Retrieving Grid Data...</p>
        </div>
      </div>
    );
  }

  const {
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    inProgressTasks = 0,
    overdueTasks = 0,
    upcomingTasks = [],
    projectProgress = []
  } = summary || {};

  // Compute active projects count
  const activeProjectsCount = projectProgress.length;

  // Calculate generic performance index (Completion rate)
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Dynamic Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl font-black font-sans tracking-wide text-slate-200">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Core systems nominal. Here is the team's diagnostic workspace for today.
          </p>
        </div>

        {/* Quick Action Task Button */}
        <button
          onClick={() => setTaskModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300 transform active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch Task Node</span>
        </button>
      </div>

      {/* Critical System Warnings (Overdue Alert) */}
      {overdueTasks > 0 && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-450">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-400">Milestone Delinquency Detected</h4>
              <p className="text-xs text-slate-400">There are {overdueTasks} urgent tasks that have slipped past their specified due date thresholds.</p>
            </div>
          </div>
          <a 
            href="#/kanban" 
            className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all duration-300 shrink-0"
          >
            Inspect Logs
          </a>
        </div>
      )}

      {/* Grid Analytics StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Consolidated Projects" 
          value={activeProjectsCount}
          icon={Briefcase} 
          description={`${projectProgress.filter(p => p.percentage === 100).length} Projects Completed`}
          glowColor="violet" 
        />
        <StatCard 
          title="Assigned Tasks" 
          value={totalTasks} 
          icon={Layers} 
          description={`${pendingTasks} Pending | ${inProgressTasks} Active`}
          glowColor="teal" 
        />
        <StatCard 
          title="Completed Nodes" 
          value={completedTasks} 
          icon={CheckCircle2} 
          description={`System Efficiency: ${completionRate}%`}
          glowColor="emerald" 
        />
        <StatCard 
          title="Overdue Timelines" 
          value={overdueTasks} 
          icon={Hourglass} 
          description="Requires immediate dispatch"
          glowColor={overdueTasks > 0 ? 'rose' : 'emerald'}
          pulse={overdueTasks > 0} 
        />
      </div>

      {/* Main Content Grid: Chart + Split Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Interactive Progress Chart (Custom SVG Design) */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between overflow-hidden relative" hoverGlow glowColor="teal">
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-200">System Output Analytics</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Consolidated task workflow overview</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-900/50 px-2.5 py-1 rounded-xl">
              <TrendingUp className="w-3.5 h-3.5" /> Optimal
            </span>
          </div>

          {/* Majestic Custom SVG Line-Area Chart with Glowing Filters */}
          <div className="relative h-60 w-full flex items-center justify-center">
            {/* SVG Elements */}
            <svg viewBox="0 0 500 200" className="w-full h-full">
              <defs>
                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Area Gradient */}
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="10" y1="20" x2="490" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="10" y1="65" x2="490" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="10" y1="110" x2="490" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="10" y1="155" x2="490" y2="155" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Area Under the curve */}
              <path 
                d="M 10 155 Q 120 70 200 120 T 350 45 T 490 80 L 490 155 L 10 155 Z" 
                fill="url(#areaGrad)" 
              />

              {/* Smooth Glowing Line */}
              <path 
                d="M 10 155 Q 120 70 200 120 T 350 45 T 490 80" 
                fill="none" 
                stroke="url(#glowTealViolet)" 
                strokeWidth="4" 
                filter="url(#glow)"
              />

              {/* Interactive Nodes */}
              <circle cx="120" cy="98" r="5" fill="#06B6D4" stroke="#0B0F19" strokeWidth="2" />
              <circle cx="200" cy="120" r="5" fill="#8B5CF6" stroke="#0B0F19" strokeWidth="2" />
              <circle cx="350" cy="45" r="5" fill="#06B6D4" stroke="#0B0F19" strokeWidth="2" />
              <circle cx="490" cy="80" r="5" fill="#10B981" stroke="#0B0F19" strokeWidth="2" />

              {/* Gradients definition */}
              <linearGradient id="glowTealViolet" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </svg>

            {/* Labels overlay */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              <span>Q1 Initialization</span>
              <span>Q2 Integration</span>
              <span>Q3 Edge Deployment</span>
              <span>Present State</span>
            </div>
          </div>

          <div className="grid grid-cols-3 text-center border-t border-slate-800/40 pt-4 mt-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Completion Rate</p>
              <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{completionRate}%</p>
            </div>
            <div className="border-x border-slate-800/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Overdue Threshold</p>
              <p className="text-xl font-bold font-mono text-rose-400 mt-0.5">{overdueTasks}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Active Collaborators</p>
              <p className="text-xl font-bold font-mono text-violet-400 mt-0.5">4 Nodes</p>
            </div>
          </div>
        </GlassCard>

        {/* Project Progress Side List */}
        <GlassCard hoverGlow glowColor="violet" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-200 font-sans">Project Status Index</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Milestone accomplishment tracking</p>
              </div>
              <Briefcase className="w-4 h-4 text-violet-400" />
            </div>

            {projectProgress.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No projects assigned to your grid node yet.
              </div>
            ) : (
              <div className="space-y-4">
                {projectProgress.map((proj) => (
                  <div key={proj._id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-350 dark:text-slate-350 light:text-slate-700 truncate max-w-[150px]">{proj.name}</span>
                      <span className="text-violet-400 font-mono">{proj.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 dark:bg-slate-950/60 overflow-hidden border border-slate-850">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${proj.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono uppercase">
                      <span>Tasks: {proj.totalTasks}</span>
                      <span>Completed: {proj.completedTasks}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <a 
            href="#/projects" 
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors mt-6 pt-4 border-t border-slate-800/40"
          >
            <span>Navigate Project Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </GlassCard>

      </div>

      {/* Lower Row: Upcoming Milestones (Due 48-72 hrs) */}
      <GlassCard hoverGlow glowColor="rose">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-450 animate-pulse" />
            <div>
              <h4 className="text-base font-bold text-slate-200 font-sans">Upcoming Milestones (72h Threshold)</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Action items requiring execution priority</p>
            </div>
          </div>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No critical task milestones due within the next 72 hours.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTasks.map((t) => {
              const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              
              return (
                <div 
                  key={t._id} 
                  className="p-4 rounded-2xl bg-slate-900/60 dark:bg-slate-950/45 border border-slate-800/60 flex flex-col justify-between gap-3 transition-all duration-300 hover:border-slate-700"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="text-xs font-bold text-slate-200 truncate">{t.title}</h5>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-widest ${
                        t.priority === 'High' ? 'priority-high' :
                        t.priority === 'Medium' ? 'priority-medium' : 'priority-low'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{t.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800/40 pt-2 text-[9px] text-slate-500 font-mono uppercase">
                    <span className="text-cyan-400 truncate max-w-[100px]">{t.project?.name}</span>
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <Clock className="w-3 h-3" />
                      {daysLeft === 0 ? 'Due Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Global Task Creation Modal */}
      <TaskModal 
        isOpen={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        onSave={() => {
          fetchDashboardData();
        }} 
      />
      
    </div>
  );
};

export default Dashboard;
