import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Sparkles, User, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member'); // Choose role easily for demo!
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Please input all fields');
    if (password.length < 6) return setError('Password decrypt key must be at least 6 characters');

    setError('');
    setLoading(true);

    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registry node rejection: Try another email');
      }
    } catch (err) {
      setError('Connection failure. Check if api is booted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background Halos */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl animate-pulse-slow" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center shadow-glow-teal animate-float mb-3">
            <Sparkles className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent uppercase font-sans">
            Aether Network
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Uplink Core Registry Node</p>
        </div>

        {/* Signup Card */}
        <div className="glass-panel glass-panel-glow rounded-3xl p-8 border border-slate-800/80">
          <h3 className="text-xl font-bold text-slate-100 font-sans">Provision Account</h3>
          <p className="text-xs text-slate-500 mt-1">Create your secure authorization node</p>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-rose-450">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* Display Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input border text-sm"
                  placeholder="e.g. Sakshi Sharma"
                  required
                  disabled={loading}
                />
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Email Matrix</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input border text-sm"
                  placeholder="name@aether.com"
                  required
                  disabled={loading}
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Decrypt Key (Min 6 chars)</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input border text-sm"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Choose Grid Role
              </label>
              
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setRole('Member')}
                  className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all duration-300 ${
                    role === 'Member'
                      ? 'bg-violet-500/15 border-violet-500/40 text-violet-400 shadow-sm'
                      : 'bg-slate-900/60 border-slate-850 text-slate-500 hover:text-slate-300'
                  }`}
                  disabled={loading}
                >
                  Member Node
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all duration-300 ${
                    role === 'Admin'
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-glow-teal'
                      : 'bg-slate-900/60 border-slate-850 text-slate-500 hover:text-slate-300'
                  }`}
                  disabled={loading}
                >
                  Admin Authority
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-extrabold text-sm shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 mt-6"
              disabled={loading}
            >
              {loading ? 'Initializing Registration...' : 'Register Grid Node'}
            </button>

          </form>

        </div>

        {/* Link back */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already established on the network?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In to Core
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
