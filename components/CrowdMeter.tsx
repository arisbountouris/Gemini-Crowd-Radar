import React from 'react';
import clsx from 'clsx';

interface CrowdMeterProps {
  level: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

const CrowdMeter: React.FC<CrowdMeterProps> = ({ level, size = 'md' }) => {
  // Determine color theme based on level
  const getTheme = (lvl: number) => {
    if (lvl >= 80) return { color: 'bg-red-500', glow: 'shadow-red-500/50', text: 'text-red-400' };
    if (lvl >= 60) return { color: 'bg-orange-500', glow: 'shadow-orange-500/50', text: 'text-orange-400' };
    if (lvl >= 30) return { color: 'bg-yellow-400', glow: 'shadow-yellow-400/50', text: 'text-yellow-300' };
    return { color: 'bg-emerald-400', glow: 'shadow-emerald-400/50', text: 'text-emerald-300' };
  };

  const theme = getTheme(level);
  const totalSegments = 10;
  const activeSegments = Math.ceil(level / 10);

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-500">
        <span>Sensor Reading</span>
        <span className={clsx(theme.text, "font-bold")}>{level}% DENSITY</span>
      </div>
      
      <div className="flex gap-1 h-2">
        {Array.from({ length: totalSegments }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "flex-1 rounded-sm transition-all duration-500",
              i < activeSegments 
                ? clsx(theme.color, "shadow-[0_0_8px_rgba(0,0,0,0.3)]", theme.glow) 
                : "bg-slate-800/50"
            )}
            style={{
              opacity: i < activeSegments ? 1 : 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CrowdMeter;