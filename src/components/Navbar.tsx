import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Shield,
  UserCheck,
  User as UserIcon,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  LogIn,
  KeyRound
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { TrishulLogo } from './TrishulLogo';
import { NotificationPanel } from './notifications/NotificationPanel';
import type { UserRole } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onSelectNav?: (page: string) => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onOpenAuthModal?: () => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onSelectNav,
  onNavigate,
  currentPage = 'dashboard',
  onOpenAuthModal,
  onReplayIntro
}) => {
  const navigate = onNavigate || onSelectNav || (() => {});
  const {
    currentUser,
    setCurrentUserRole,
    switchUserAccount,
    employees,
    theme,
    toggleTheme,
    logout,
    customers,
    leads,
    tasks,
    unreadNotificationsCount
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filtered search results
  const filteredCustomers = searchQuery.trim()
    ? customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredLeads = searchQuery.trim()
    ? leads.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.company.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredTasks = searchQuery.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const totalResults = filteredCustomers.length + filteredLeads.length + filteredTasks.length;

  if (!currentUser) return null;

  const roleBadges: Record<UserRole, { label: string; color: string; icon: any }> = {
    admin: { label: 'Admin (Full Access)', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30', icon: Shield },
    supervisor: { label: 'Supervisor (Team Lead)', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30', icon: UserCheck },
    user: { label: 'User (Assigned Staff)', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30', icon: UserIcon }
  };

  const currentBadge = roleBadges[currentUser.role] || roleBadges.admin;
  const RoleIcon = currentBadge.icon;

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <TrishulLogo size="sm" showText={false} />
        </div>

        <div className="hidden sm:flex flex-col">
          <h1 className="text-base font-bold text-slate-900 dark:text-white capitalize">
            {currentPage === 'ai-assistant' ? 'AI Assistant' : currentPage}
          </h1>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
            Live Workspace • Role: <strong className="text-slate-900 dark:text-white">{currentUser.role.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div
          onClick={() => setShowSearchModal(true)}
          className="relative flex items-center w-full px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs cursor-pointer hover:border-cyan-500/50 transition-all group"
        >
          <Search className="w-4 h-4 mr-2.5 text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
          <span className="flex-1 font-medium text-slate-600 dark:text-slate-300">Search customers, leads, tasks...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-mono font-bold">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Icon & Real Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Toggle notifications"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500"></span>
              </>
            )}
          </button>

          {/* Real Dynamic Notification Panel */}
          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onNavigate={(page) => {
              navigate(page);
              setShowNotifications(false);
            }}
          />
        </div>

        {/* Active Role Selector & Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser.displayName.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser.displayName}
              </span>
              <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold uppercase">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu & Role Switcher Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-2xl p-3.5 z-50">
              {/* Current Profile Summary */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 mb-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${currentBadge.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {currentBadge.label}
                  </span>
                </div>
              </div>

              {/* Quick Auth Portal Link */}
              <div className="mb-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenAuthModal) onOpenAuthModal();
                    else navigate('auth');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-cyan-500/20 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                  <span>Login / Switch Account</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    if (onOpenAuthModal) onOpenAuthModal();
                    else navigate('auth');
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-cyan-400 mr-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search customers, leads, tasks..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Container */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Search across leads, customers, team tasks, and accounts.
                </div>
              ) : totalResults === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matches found for "{searchQuery}".
                </div>
              ) : (
                <>
                  {/* Customers Section */}
                  {filteredCustomers.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                        Customers ({filteredCustomers.length})
                      </div>
                      <div className="space-y-1.5">
                        {filteredCustomers.map(c => (
                          <div
                            key={c.id}
                            onClick={() => {
                              onSelectNav('customers');
                              setShowSearchModal(false);
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-cyan-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                              <p className="text-[11px] text-slate-400">{c.company} • {c.phone}</p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-400">₹{c.value.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leads Section */}
                  {filteredLeads.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                        Leads ({filteredLeads.length})
                      </div>
                      <div className="space-y-1.5">
                        {filteredLeads.map(l => (
                          <div
                            key={l.id}
                            onClick={() => {
                              onSelectNav('leads');
                              setShowSearchModal(false);
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{l.name}</p>
                              <p className="text-[11px] text-slate-400">{l.company} • {l.source}</p>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-semibold">{l.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks Section */}
                  {filteredTasks.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">
                        Tasks ({filteredTasks.length})
                      </div>
                      <div className="space-y-1.5">
                        {filteredTasks.map(t => (
                          <div
                            key={t.id}
                            onClick={() => {
                              onSelectNav('tasks');
                              setShowSearchModal(false);
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</p>
                              <p className="text-[11px] text-slate-400">Assigned: {t.assignedUserName} • Due: {t.dueDate}</p>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-amber-400">{t.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
