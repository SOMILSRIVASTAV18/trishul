import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  CheckSquare,
  Briefcase,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  User,
  Sparkles,
  Lock
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { TrishulLogo } from './TrishulLogo';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onToggle
}) => {
  const { currentUser, tasks, leads } = useCrm();

  if (!currentUser) return null;

  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  const isAdmin = currentUser.role === 'admin';
  const isSupervisor = currentUser.role === 'supervisor' || isAdmin;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowed: true,
      badge: null
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      allowed: true,
      badge: null
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Target,
      allowed: true,
      badge: newLeadsCount > 0 ? `${newLeadsCount} New` : null,
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      allowed: true,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Briefcase,
      allowed: isSupervisor,
      tag: isAdmin ? 'Admin' : 'Team',
      locked: !isSupervisor
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      allowed: true,
      badge: null
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: Bot,
      allowed: true,
      tag: 'Admin Only',
      locked: !isAdmin,
      sparkle: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      allowed: true,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-white dark:bg-black border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
          <div className="overflow-hidden cursor-pointer" onClick={() => onSelectPage('dashboard')}>
            <TrishulLogo size="sm" showText={isOpen} />
          </div>

          <button
            onClick={onToggle}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isRestricted = item.locked;

            return (
              <button
                key={item.id}
                disabled={isRestricted}
                onClick={() => {
                  if (!isRestricted) {
                    onSelectPage(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }
                }}
                className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white shadow-md shadow-cyan-500/20'
                    : isRestricted
                    ? 'opacity-40 cursor-not-allowed text-slate-400 hover:bg-transparent'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
                title={item.label}
              >
                {/* Icon with glow indicator */}
                <div className="relative flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.sparkle && (
                    <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute -top-1.5 -right-1.5 animate-pulse" />
                  )}
                </div>

                {/* Label & Badges (Visible when expanded) */}
                {isOpen && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {item.tag && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          item.tag.includes('Admin')
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                      {isRestricted && (
                        <Lock className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </div>
                )}

                {/* Tooltip in collapsed mode */}
                {!isOpen && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                    {item.label} {isRestricted && '(Admin Only)'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card at Sidebar Bottom */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 ${!isOpen && 'justify-center'}`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.displayName.charAt(0)}
            </div>

            {isOpen && (
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.displayName}
                </p>
                <div className="flex items-center gap-1">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-3 h-3 text-rose-500" />
                  ) : currentUser.role === 'supervisor' ? (
                    <UserCheck className="w-3 h-3 text-amber-500" />
                  ) : (
                    <User className="w-3 h-3 text-cyan-500" />
                  )}
                  <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
