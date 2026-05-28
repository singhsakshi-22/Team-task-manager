import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  Briefcase, 
  UserPlus, 
  FolderGit2, 
  AlertCircle,
  FolderLock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import GlassCard from '../components/GlassCard';

export const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Creation Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Edit / Membership Form State
  const [memberAddOpen, setMemberAddOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [memberToAdd, setMemberToAdd] = useState('');

  const fetchProjectsAndUsers = async () => {
    try {
      const projRes = await api.get('/api/projects');
      if (projRes.success) setProjects(projRes.projects);

      const userRes = await api.get('/api/auth/users');
      if (userRes.success) setUsersList(userRes.users);
    } catch (err) {
      console.error(err);
      setError('Uplink disruption: Failed to query projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndUsers();
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return setError('Please fill out name and description');

    setFormLoading(true);
    setError('');

    try {
      const res = await api.post('/api/projects', {
        name,
        description,
        members: selectedMembers
      });

      if (res.success) {
        setProjects([res.project, ...projects]);
        setName('');
        setDescription('');
        setSelectedMembers([]);
        setCreateOpen(false);
      } else {
        setError(res.message || 'Failed to construct project node');
      }
    } catch (err) {
      setError(err.message || 'Creation error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('WARNING: Deleting this project will wipe all associated task nodes forever. Confirm execution?')) return;

    try {
      const res = await api.delete(`/api/projects/${id}`);
      if (res.success) {
        setProjects(projects.filter(p => p._id !== id));
      } else {
        alert(res.message || 'Deletion rejected');
      }
    } catch (err) {
      console.error(err);
      alert('Delete request failed');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberToAdd) return;

    try {
      const res = await api.post(`/api/projects/${activeProjectId}/members`, { userId: memberToAdd });
      if (res.success) {
        // Update local projects array
        setProjects(projects.map(p => p._id === activeProjectId ? res.project : p));
        setMemberAddOpen(false);
        setMemberToAdd('');
      } else {
        alert(res.message || 'Failed to add member');
      }
    } catch (err) {
      console.error(err);
      alert('Membership update failed');
    }
  };

  const handleMemberToggle = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-t-2 border-cyan-500 border-r-2 border-r-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest font-mono text-slate-500">Scanning Project Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header and triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl font-black font-sans tracking-wide text-slate-200">Project Hub</h1>
          <p className="text-xs text-slate-400 mt-1">Configure workspace clusters and direct team memberships.</p>
        </div>

        <button
          onClick={() => setCreateOpen(!createOpen)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300 transform active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>{createOpen ? 'Collapse Controls' : 'Provision Project'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Provision Form */}
      {createOpen && (
        <GlassCard glowColor="teal" hoverGlow className="animate-float-up max-w-2xl border border-cyan-500/20">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <FolderGit2 className="w-4.5 h-4.5 text-cyan-400" /> Provision New Project Node
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">Establish database registry details</p>

          <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Project Title</label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input border text-sm"
                placeholder="e.g. Chronos AI Scheduler"
                required
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Mission Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input border text-sm h-20 resize-none"
                placeholder="Detail the scope and goals of this project node..."
                required
                disabled={formLoading}
              />
            </div>

            {/* Members Selector list */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Enroll Founding Members</label>
              
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-850">
                {usersList.filter(u => u._id !== user.id).map(member => (
                  <button
                    type="button"
                    key={member._id}
                    onClick={() => handleMemberToggle(member._id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedMembers.includes(member._id)
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{member.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 text-xs font-semibold"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300"
                disabled={formLoading}
              >
                {formLoading ? 'Provisioning...' : 'Provision Node'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Projects Grid Display */}
      {projects.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
          <FolderLock className="w-12 h-12 text-slate-600 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-slate-300">No project nodes online.</h3>
            <p className="text-xs text-slate-500 mt-1">Provision a project node above to initialize workflow networks.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const totalMembers = proj.members ? proj.members.length : 0;
            const ownerName = proj.owner?.name || 'Aether Admin';

            return (
              <GlassCard 
                key={proj._id} 
                hoverGlow 
                glowColor="violet" 
                className="flex flex-col justify-between h-72 border border-slate-800/60"
              >
                <div>
                  {/* Top line with controls */}
                  <div className="flex justify-between items-start gap-4">
                    <span className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
                      <Briefcase className="w-4.5 h-4.5" />
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActiveProjectId(proj._id);
                          setMemberAddOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/35 transition-all"
                        title="Add Member Node"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj._id)}
                        className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-rose-455 hover:border-rose-500/35 transition-all"
                        title="Destroy Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 truncate">{proj.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 font-medium h-12">
                      {proj.description}
                    </p>
                  </div>
                </div>

                {/* Footer details */}
                <div className="border-t border-slate-800/40 pt-4 flex items-center justify-between mt-4">
                  {/* Members list avatars */}
                  <div className="flex items-center -space-x-2">
                    {/* Owner First */}
                    <div 
                      className={`w-7.5 h-7.5 rounded-full border-2 border-slate-950 bg-gradient-to-tr ${proj.owner?.avatarColor || 'from-cyan-500 to-blue-500'} flex items-center justify-center font-bold text-[8px] text-slate-950 shrink-0 cursor-help`}
                      title={`Owner: ${ownerName}`}
                    >
                      {ownerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    {/* Members */}
                    {proj.members && proj.members.slice(0, 3).map((m, idx) => (
                      <div 
                        key={idx}
                        className={`w-7.5 h-7.5 rounded-full border-2 border-slate-950 bg-gradient-to-tr ${m.avatarColor || 'from-violet-500 to-purple-500'} flex items-center justify-center font-bold text-[8px] text-slate-950 shrink-0 cursor-help`}
                        title={m.name}
                      >
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {totalMembers > 3 && (
                      <div className="w-7.5 h-7.5 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center font-mono font-bold text-[8px] text-slate-500 shrink-0">
                        +{totalMembers - 3}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    {totalMembers === 0 ? 'No Enrolled Nodes' : `${totalMembers + 1} System Nodes`}
                  </span>
                </div>

              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Member Modal Dialog */}
      {memberAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel glass-panel-glow rounded-3xl p-6 border border-slate-850 animate-float-up">
            <h3 className="text-base font-bold text-slate-200">Enroll New Team Member</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">Attach identity to project cluster</p>

            <form onSubmit={handleAddMember} className="mt-5 space-y-4">
              <select
                value={memberToAdd}
                onChange={e => setMemberToAdd(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input border text-sm cursor-pointer"
                required
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Choose Member --</option>
                {usersList.map(u => (
                  <option key={u._id} value={u._id} className="bg-slate-900 text-slate-200">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setMemberAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800/40 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300"
                >
                  Enroll Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;
