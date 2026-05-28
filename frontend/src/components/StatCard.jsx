import React from 'react';
import GlassCard from './GlassCard';

export const StatCard = ({ title, value, icon: Icon, description, glowColor = 'teal', pulse = false }) => {
  const accentColors = {
    teal: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  const selectedAccent = accentColors[glowColor] || accentColors.teal;

  return (
    <GlassCard hoverGlow glowColor={glowColor} className="relative overflow-hidden group">
      {/* Decorative pulse blur inside background */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 transition-all duration-500 group-hover:scale-150 ${
        glowColor === 'teal' ? 'bg-cyan-400' :
        glowColor === 'violet' ? 'bg-violet-400' :
        glowColor === 'rose' ? 'bg-rose-400' : 'bg-emerald-400'
      }`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-400 light:text-slate-600 transition-colors uppercase tracking-wider">{title}</p>
          <h3 className={`text-4xl font-extrabold font-mono mt-2 tracking-tight transition-all duration-300 ${pulse ? 'animate-pulse' : ''} ${
            glowColor === 'teal' ? 'text-cyan-400' :
            glowColor === 'violet' ? 'text-violet-400' :
            glowColor === 'rose' ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {value}
          </h3>
        </div>
        <div className={`p-3.5 rounded-xl border ${selectedAccent} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 border-t border-slate-800/40 pt-3 flex items-center gap-1.5 font-medium">
          {description}
        </p>
      )}
    </GlassCard>
  );
};

export default StatCard;
