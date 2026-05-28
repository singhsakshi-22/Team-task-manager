import React from 'react';

export const GlassCard = ({ children, className = '', onClick, hoverGlow = false, glowColor = 'teal' }) => {
  const glowClasses = {
    teal: 'hover:shadow-glow-teal',
    violet: 'hover:shadow-glow-violet',
    rose: 'hover:shadow-glow-rose',
    emerald: 'hover:shadow-glow-emerald',
  };

  const glowStyle = hoverGlow ? glowClasses[glowColor] || glowClasses.teal : '';

  return (
    <div 
      onClick={onClick}
      className={`glass-panel glass-panel-glow rounded-2xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${glowStyle} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
