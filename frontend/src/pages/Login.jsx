import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please input all fields');

    setError('');
    setLoading(true);
    
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Access Denied: Invalid credentials');
      }
    } catch (err) {
      setError('Connection failure. Is the API server online?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Cyber Halo Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl animate-pulse-slow" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Hub */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center shadow-glow-teal animate-float mb-4">
            <Sparkles className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent uppercase font-sans">
            Aether Space
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Unified Command & Task Ledger</p>
        </div>

        {/* Credentials Form Card */}
        <div className="glass-panel glass-panel-glow rounded-3xl p-8 border border-slate-800/80">
          <h3 className="text-xl font-bold text-slate-100 font-sans">Establish Uplink</h3>
          <p className="text-xs text-slate-500 mt-1">Authenticate using your Aether grid credentials</p>

          {error && (
            <div className="mt-5 p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-rose-450 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Access Decrypt Key</label>
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

            {/* Launch Action */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-extrabold text-sm shadow-glow-teal hover:shadow-cyan-400/40 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 mt-8"
              disabled={loading}
            >
              {loading ? 'Decrypting Uplink...' : 'Establish Connection'}
            </button>
          </form>

          {/* Quick seeded demo cards helper */}
          <div className="mt-6 border-t border-slate-800/40 pt-4 text-center">
            <p className="text-xs text-slate-500">Need to seed workspace? Run `npm run seed` in your CLI.</p>
            <div className="flex flex-wrap justify-center gap-2.5 mt-3">
              <button 
                onClick={() => { setEmail('admin@aether.com'); setPassword('password123'); }}
                className="text-[10px] font-bold font-mono px-2.5 py-1 rounded bg-slate-950/60 border border-slate-850 hover:border-cyan-500/35 hover:text-cyan-400 text-slate-400 transition-all"
              >
                Demo Admin
              </button>
              <button 
                onClick={() => { setEmail('sakshi@aether.com'); setPassword('password123'); }}
                className="text-[10px] font-bold font-mono px-2.5 py-1 rounded bg-slate-950/60 border border-slate-850 hover:border-violet-500/35 hover:text-violet-400 text-slate-400 transition-all"
              >
                Demo Member
              </button>
            </div>
          </div>

        </div>

        {/* Link to register */}
        <p className="text-center text-xs text-slate-500 mt-6">
          New to the Aether Network?{' '}
          <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">
            Provision New Core Grid
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
