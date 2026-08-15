import React, { useState } from 'react';
import logoPng from '../assets/logo.png';

interface TrishulLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
    sm: { icon: 'w-8 h-8', title: 'text-sm', tag: 'text-[7.5px]' },
    md: { icon: 'w-10 h-10', title: 'text-base', tag: 'text-[8.5px]' },
    lg: { icon: 'w-14 h-14', title: 'text-xl', tag: 'text-[10px]' },
    xl: { icon: 'w-20 h-20', title: 'text-2xl', tag: 'text-xs' },
    '2xl': { icon: 'w-28 h-28', title: 'text-4xl', tag: 'text-sm' }
  };

  const current = sizeMap[size];

  const titleColorClass =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-white';

  const subtitleColorClass =
    theme === 'dark'
      ? 'text-slate-300'
      : theme === 'light'
      ? 'text-slate-600'
      : 'text-slate-600 dark:text-slate-300';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Logo Image using bundled logo asset with SVG fallback */}
      <div className={`relative flex items-center justify-center ${current.icon} shrink-0`}>
        {!imgError ? (
          <img
            src={logoPng}
            alt="Trishul Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center p-1.5 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            >
              {/* Trishul Trident Vector Fallback */}
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
        <div className="flex flex-col">
          <div className={`flex items-baseline tracking-wider font-black ${titleColorClass} leading-none`}>
            <span className={`${current.title} font-extrabold tracking-[0.18em]`}>T</span>
            {/* Distinctive 'R' with gold slash */}
            <span className={`relative ${current.title} font-extrabold tracking-[0.18em]`}>
              R
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-amber-500 transform rotate-45 translate-y-[2px]" />
            </span>
            <span className={`${current.title} font-extrabold tracking-[0.18em]`}>ISHUL</span>
          </div>

          <div className={`flex items-center gap-1 mt-1 ${subtitleColorClass} font-semibold tracking-[0.22em] uppercase leading-none`}>
            <span className={current.tag}>INNOVATE</span>
            <span className="text-amber-500 text-[6px]">◆</span>
            <span className={current.tag}>EMPOWER</span>
            <span className="text-amber-500 text-[6px]">◆</span>
            <span className={current.tag}>EXCEL</span>
          </div>
        </div>
      )}
    </div>
  );
};
