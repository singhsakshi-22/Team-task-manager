import React, { useState, useEffect } from 'react';
import { Users, Clock, ShieldCheck, Mail, Sparkles, Terminal } from 'lucide-react';
import { api } from '../utils/api';
import GlassCard from '../components/GlassCard';

export const Team = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [userRes, logRes] = await Promise.all([
        api.get('/api/auth/users'),
        api.get('/api/dashboard/activity')
      ]);

      if (userRes.success) setUsers(userRes.users);
      if (logRes.success) setLogs(res => logRes.logs);
    } catch (err) {
      console.error(err);
      setError('Uplink disruption: Failed to query team states.');
    } finally {
      setLoading(false);
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-t-2 border-cyan-500 border-r-2 border-r-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest font-mono text-slate-500">Syncing Team Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-2xl font-black tracking-wide text-slate-200">Team Stream</h1>
        <p className="text-xs text-slate-400 mt-1">Review team nodes and inspect the collaborative activity feed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Team Directory Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-350 dark:text-slate-350 light:text-slate-700 flex items-center gap-1.5 font-sans">
              <Users className="w-4.5 h-4.5 text-cyan-400" /> Active Grid Collaborators
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{users.length} Nodes Online</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map((u) => {
              const uName = u.name || 'Member Node';
              const avatarInitials = uName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

              return (
                <GlassCard 
                  key={u._id} 
                  hoverGlow 
                  glowColor="teal" 
                  className="p-5 border border-slate-800/60 flex items-center gap-4 relative overflow-hidden group"
                >
                  {/* Glowing card border helper */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${u.avatarColor || 'from-cyan-500 to-blue-500'} flex items-center justify-center font-bold text-lg text-slate-950 shadow-md shrink-0`}>
                    {avatarInitials}
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                      {uName}
                    </h4>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <p className="text-[11px] text-slate-450 truncate">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {u.role === 'Admin' ? (
                        <span className="flex items-center text-[8px] text-cyan-400 font-extrabold bg-cyan-950/40 border border-cyan-800/50 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest shadow-sm">
                          <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center text-[8px] text-violet-400 font-extrabold bg-violet-950/40 border border-violet-800/50 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live Activity Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-350 dark:text-slate-350 light:text-slate-700 flex items-center gap-1.5 font-sans">
              <Terminal className="w-4.5 h-4.5 text-violet-400" /> Collaborative Feed
            </h3>
            <span className="flex items-center gap-1 text-[9px] text-violet-400 font-mono bg-violet-950/40 border border-violet-900/50 px-2 py-0.5 rounded-full">
              <Clock className="w-2.5 h-2.5 animate-pulse" /> Real-time
            </span>
          </div>

          <GlassCard hoverGlow glowColor="violet" className="border border-slate-800/60 p-5 h-[480px] overflow-y-auto flex flex-col justify-start">
            {logsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-t-2 border-violet-500 rounded-full animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-xs text-slate-550 py-12">
                No activity registers online.
              </div>
            ) : (
              <div className="space-y-5 border-l border-slate-800/50 ml-3 pl-5 relative">
                {logs.map((log) => {
                  const initials = log.userName ? log.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';
                  
                  return (
                    <div key={log._id} className="relative group/item">
                      {/* Timeline dot */}
                      <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse-slow group-hover/item:bg-cyan-400" />
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5 text-xs text-slate-350">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-200 group-hover/item:text-cyan-400 transition-colors">
                            {log.userName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        <p className="text-slate-400 font-medium">
                          {log.action}{' '}
                          {log.projectName && (
                            <span className="text-violet-400 font-bold">
                              {log.projectName}
                            </span>
                          )}
                          {log.taskTitle && (
                            <span className="text-cyan-400 font-bold block mt-0.5">
                              ↳ "{log.taskTitle}"
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default Team;
