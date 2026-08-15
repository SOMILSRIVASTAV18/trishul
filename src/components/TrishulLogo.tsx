import React from 'react';

interface TrishulLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export const TrishulLogo: React.FC<TrishulLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', title: 'text-sm', tag: 'text-[7.5px]' },
    md: { icon: 'w-10 h-10', title: 'text-base', tag: 'text-[8.5px]' },
    lg: { icon: 'w-14 h-14', title: 'text-xl', tag: 'text-[10px]' },
    xl: { icon: 'w-20 h-20', title: 'text-2xl', tag: 'text-xs' },
    '2xl': { icon: 'w-28 h-28', title: 'text-4xl', tag: 'text-sm' }
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Logo Image using logo.png */}
      <div className={`relative flex items-center justify-center ${current.icon} shrink-0`}>
        <img
          src="/logo.png"
          alt="Trishul Logo"
          className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline tracking-wider font-black text-slate-900 dark:text-white leading-none">
            <span className={`${current.title} font-extrabold tracking-[0.18em]`}>T</span>
            {/* Distinctive 'R' with gold slash */}
            <span className={`relative ${current.title} font-extrabold tracking-[0.18em]`}>
              R
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-amber-500 transform rotate-45 translate-y-[2px]" />
            </span>
            <span className={`${current.title} font-extrabold tracking-[0.18em]`}>ISHUL</span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400 font-semibold tracking-[0.22em] uppercase leading-none">
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
