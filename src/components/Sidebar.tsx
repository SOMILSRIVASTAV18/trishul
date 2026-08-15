import React, { useState, useRef, useEffect } from 'react';
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
  Lock,
  Zap,
  LogOut,
  Mail,
  Sun,
  Moon,
  ChevronUp
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { TrishulLogo } from './TrishulLogo';
import type { UserRole } from '../types';

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
  const { currentUser, tasks, leads, logout } = useCrm();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  const isAdmin = currentUser.role === 'admin';
  const isSupervisor = currentUser.role === 'supervisor' || isAdmin;

  const navSections = [
    {
      title: 'Workspace',
      items: [
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
          label: 'Leads Pipeline',
          icon: Target,
          allowed: true,
          badge: newLeadsCount > 0 ? `${newLeadsCount} New` : null,
          badgeColor: 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
        },
        {
          id: 'tasks',
          label: 'Tasks & Sprints',
          icon: CheckSquare,
          allowed: true,
          badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
          badgeColor: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
        }
      ]
    },
    {
      title: 'Management & AI',
      items: [
        {
          id: 'employees',
          label: 'Team Directory',
          icon: Briefcase,
          allowed: isSupervisor,
          tag: isAdmin ? 'Admin' : 'Team',
          locked: !isSupervisor
        },
        {
          id: 'reports',
          label: 'Analytics & Reports',
          icon: BarChart3,
          allowed: true,
          badge: null
        },
        {
          id: 'ai-assistant',
          label: 'AI Sales Copilot',
          icon: Bot,
          allowed: true,
          tag: 'Pro AI',
          sparkle: true
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          allowed: true,
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-white dark:bg-[#090d16] border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ease-in-out select-none ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ${
          isOpen ? 'px-4 justify-between' : 'px-2 justify-center'
        }`}>
          <div
            className="flex items-center justify-center cursor-pointer min-w-0"
            onClick={() => onSelectPage('dashboard')}
            title="Trishul CRM"
          >
            <TrishulLogo size={isOpen ? 'sm' : 'xs'} showText={isOpen} />
          </div>

          {isOpen && (
            <button
              onClick={onToggle}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shrink-0"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {!isOpen && (
            <button
              onClick={onToggle}
              className="hidden lg:flex absolute right-[-11px] top-5 z-20 w-5 h-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-cyan-500 items-center justify-center shadow-md transition-transform hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {isOpen && (
                <p className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
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
                    className={`w-full group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold'
                        : isRestricted
                        ? 'opacity-40 cursor-not-allowed text-slate-400 hover:bg-transparent'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                    title={item.label}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-cyan-600 dark:bg-cyan-400" />
                    )}

                    {/* Icon */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>

                    {/* Label & Badges (Visible when expanded) */}
                    {isOpen && (
                      <div className="flex-1 flex items-center justify-between truncate">
                        <span className={`truncate ${isActive ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                          {item.label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.tag && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {item.tag}
                            </span>
                          )}
                          {item.badge && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {item.badge}
                            </span>
                          )}
                          {isRestricted && (
                            <Lock className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tooltip in collapsed mode */}
                    {!isOpen && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 border border-slate-700">
                        {item.label} {isRestricted && '(Admin Only)'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile Card at Sidebar Bottom */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-black/40 relative" ref={profileMenuRef}>
          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className={`absolute bottom-full mb-2 ${isOpen ? 'left-3 right-3' : 'left-3 w-64'} rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2`}>
              {/* Profile Summary Header */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800/80 mb-2">
                <div className="flex items-center gap-2.5">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.displayName}
                      className="w-9 h-9 rounded-lg object-cover shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{currentUser.email}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Role</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : currentUser.role === 'supervisor'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                  }`}>
                    {currentUser.role === 'admin' && <Shield className="w-3 h-3" />}
                    {currentUser.role === 'supervisor' && <UserCheck className="w-3 h-3" />}
                    {currentUser.role === 'user' && <User className="w-3 h-3" />}
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                <button
                  onClick={() => {
                    onSelectPage('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-cyan-500 transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                  <span>User Profile & Settings</span>
                </button>

                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await logout();
                    onSelectPage('auth');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Profile Bar Card */}
          <div className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs ${!isOpen && 'justify-center'}`}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="relative group shrink-0 cursor-pointer"
              title="User profile settings & options"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-lg object-cover shadow-xs group-hover:ring-2 group-hover:ring-cyan-500/40 transition-all"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs group-hover:ring-2 group-hover:ring-cyan-500/40 transition-all">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c121e]" />
            </button>

            {isOpen && (
              <>
                <div
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex-1 min-w-0 cursor-pointer text-left"
                  title="Click to view profile options"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.displayName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      currentUser.role === 'admin'
                        ? 'bg-rose-500/10 text-rose-500'
                        : currentUser.role === 'supervisor'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-cyan-500/10 text-cyan-500'
                    }`}>
                      {currentUser.role === 'admin' && <Shield className="w-2.5 h-2.5" />}
                      {currentUser.role === 'supervisor' && <UserCheck className="w-2.5 h-2.5" />}
                      {currentUser.role === 'user' && <User className="w-2.5 h-2.5" />}
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons: Profile Settings & Logout */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onSelectPage('settings')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="User Profile Settings"
                    aria-label="User Profile Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={async () => {
                      await logout();
                      onSelectPage('auth');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Sign Out / Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
