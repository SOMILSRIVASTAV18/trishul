import React, { useState } from 'react';
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
  const [imgError, setImgError] = useState<boolean>(false);

  const sizeMap = {
    xs: { h: 'h-6', icon: 'w-6 h-6', title: 'text-xs', tag: 'text-[7px]' },
    sm: { h: 'h-8', icon: 'w-8 h-8', title: 'text-sm', tag: 'text-[8px]' },
    md: { h: 'h-10', icon: 'w-10 h-10', title: 'text-base', tag: 'text-[9px]' },
    lg: { h: 'h-12', icon: 'w-12 h-12', title: 'text-lg', tag: 'text-[10px]' },
    xl: { h: 'h-16', icon: 'w-16 h-16', title: 'text-2xl', tag: 'text-xs' },
    '2xl': { h: 'h-24', icon: 'w-24 h-24', title: 'text-3xl', tag: 'text-sm' }
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
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Real logo.png brand asset */}
      <div className={`relative flex items-center justify-center shrink-0 ${current.h}`}>
        {!imgError ? (
          <img
            src={logoPng}
            alt="Trishul Logo"
            onError={() => setImgError(true)}
            className={`${current.h} w-auto max-w-none object-contain drop-shadow-md`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`${current.icon} rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center p-1.5 shadow-sm`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            >
              <path d="M12 2v20" />
              <path d="M12 2l-3 4c0 3.5 2 6 3 8" />
              <path d="M12 2l3 4c0 3.5-2 6-3 8" />
              <path d="M5 8c0 4.5 3 8 7 8s7-3.5 7-8" />
              <path d="M5 6v3" />
              <path d="M19 6v3" />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col justify-center whitespace-nowrap min-w-0">
          <div className={`flex items-center tracking-[0.16em] font-extrabold ${titleColorClass} leading-tight`}>
            <span className={`${current.title} font-black`}>TRISHUL</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-normal bg-gradient-to-r from-rose-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30">
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
