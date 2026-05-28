import React, { useState } from 'react';
import { Sparkles, KeyRound, Mail, User, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const AVATAR_GRADIENTS = [
  { name: 'Cyber Neon Teal', value: 'from-cyan-500 to-blue-500' },
  { name: 'Cyber Neon Violet', value: 'from-violet-500 to-purple-500' },
  { name: 'Cyber Neon Emerald', value: 'from-emerald-500 to-teal-500' },
  { name: 'Cyber Neon Rose', value: 'from-rose-500 to-red-500' },
  { name: 'Cyber Neon Amber', value: 'from-amber-500 to-orange-500' }
];

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'from-cyan-500 to-blue-500');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const payload = { name, email, avatarColor };
      if (password) payload.password = password;

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccess('Aether Identity successfully synchronized.');
        setPassword('');
      } else {
        setError(res.message || 'Synchronization failure.');
      }
    } catch (err) {
      setError(err.message || 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-800/40 pb-5">
        <h1 className="text-2xl font-black tracking-wide text-slate-200">Aether Identity Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure security credentials and customize avatar styling signatures.</p>
      </div>

      {/* Sync Status Notifications */}
      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-450">
          <Check className="w-4 h-4 shrink-0" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center gap-2.5 text-xs text-rose-450">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Side Avatar Preview */}
        <GlassCard hoverGlow glowColor="violet" className="flex flex-col items-center py-8 border border-slate-800/60 md:col-span-1">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center font-extrabold text-3xl text-slate-950 shadow-glow-violet animate-float`}>
            {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          
          <h3 className="text-base font-bold text-slate-200 mt-5 text-center truncate w-full">{name}</h3>
          
          <div className="flex items-center gap-1.5 mt-2">
            {user?.role === 'Admin' ? (
              <span className="flex items-center text-[10px] text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded-md uppercase font-mono tracking-widest shadow-glow-teal">
                <ShieldCheck className="w-3 h-3 mr-0.5" /> Admin Authority
              </span>
            ) : (
              <span className="flex items-center text-[10px] text-violet-400 font-bold bg-violet-950/40 border border-violet-800/50 px-2 py-0.5 rounded-md uppercase font-mono tracking-widest">
                Member Node
              </span>
            )}
          </div>
        </GlassCard>

        {/* Right Side Settings Form */}
        <GlassCard hoverGlow glowColor="teal" className="md:col-span-2 border border-slate-800/60">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-cyan-400" /> Identity Matrix Configuration
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">Secure profile data editor</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Profile Handle</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input border text-sm"
                  required
                  disabled={loading}
                />
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Email Destination</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input border text-sm"
                  required
                  disabled={loading}
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Avatar Color choices */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Avatar Color Gradient</label>
              <div className="flex flex-wrap gap-3">
                {AVATAR_GRADIENTS.map((grad) => (
                  <button
                    key={grad.value}
                    type="button"
                    onClick={() => setAvatarColor(grad.value)}
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${grad.value} transition-all duration-300 transform active:scale-95 flex items-center justify-center border-2 ${
                      avatarColor === grad.value ? 'border-slate-100 shadow-glow-teal scale-105' : 'border-transparent hover:scale-102 hover:border-slate-700'
                    }`}
                    title={grad.name}
                  >
                    {avatarColor === grad.value && (
                      <Check className="w-4.5 h-4.5 text-slate-950 font-bold" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Password edit */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">New Password (Leave blank to keep current)</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input border text-sm"
                  disabled={loading}
                />
                <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Submit btn */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Synchronizing...' : 'Save Identity Changes'}
              </button>
            </div>

          </form>

        </GlassCard>

      </div>

    </div>
  );
};

export default Profile;
