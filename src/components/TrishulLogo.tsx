import React from 'react';
import logoPng from '../assets/logo.png';

interface TrishulLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only';
  theme?: 'dark' | 'light' | 'auto';
}

export const TrishulLogo: React.FC<TrishulLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  theme = 'auto'
}) => {
  const sizeMap = {
    xs: { h: 'h-8', img: 'h-8 max-w-[48px]', title: 'text-xs', tag: 'text-[7px]' },
    sm: { h: 'h-9', img: 'h-9 max-w-[54px]', title: 'text-sm', tag: 'text-[8px]' },
    md: { h: 'h-11', img: 'h-11 max-w-[66px]', title: 'text-base', tag: 'text-[9px]' },
    lg: { h: 'h-14', img: 'h-14 max-w-[84px]', title: 'text-lg', tag: 'text-[10px]' },
    xl: { h: 'h-18', img: 'h-18 max-w-[110px]', title: 'text-2xl', tag: 'text-xs' },
    '2xl': { h: 'h-24', img: 'h-24 max-w-[150px]', title: 'text-3xl', tag: 'text-sm' }
  };

  const current = sizeMap[size] || sizeMap.md;

  const titleColorClass =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-white';

  const subtitleColorClass =
    theme === 'dark'
      ? 'text-slate-400'
      : theme === 'light'
      ? 'text-slate-500'
      : 'text-slate-500 dark:text-slate-400';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official logo.png Brand Emblem */}
      <img
        src={logoPng}
        alt="Trishul Logo"
        onError={(e) => {
          // Robust fallback to public root path if module bundle URL differs
          if ((e.currentTarget as HTMLImageElement).src !== window.location.origin + '/logo.png') {
            (e.currentTarget as HTMLImageElement).src = '/logo.png';
          }
        }}
        className={`${current.img} w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]`}
        referrerPolicy="no-referrer"
      />

      {showText && (
        <div className="flex flex-col justify-center whitespace-nowrap min-w-0">
          <div className={`flex items-center tracking-[0.14em] font-extrabold ${titleColorClass} leading-tight`}>
            <span className={`${current.title} font-black`}>TRISHUL</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 text-amber-400 border border-amber-500/30">
              CRM
            </span>
          </div>
          <div className={`flex items-center gap-1 mt-0.5 ${subtitleColorClass} font-medium tracking-[0.14em] uppercase leading-none`}>
            <span className={current.tag}>Innovate</span>
            <span className="text-amber-500 text-[5px]">◆</span>
            <span className={current.tag}>Empower</span>
            <span className="text-amber-500 text-[5px]">◆</span>
            <span className={current.tag}>Excel</span>
          </div>
        </div>
      )}
    </div>
  );
};

