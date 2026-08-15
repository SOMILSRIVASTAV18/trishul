import React, { useState, useEffect } from 'react';
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
  Plus,
  Target,
  Users,
  CheckSquare,
  Sparkles,
  KeyRound,
  ChevronRight
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
  onOpenAddCustomer?: () => void;
  onOpenAddLead?: () => void;
  onOpenAddTask?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onSelectNav,
  onNavigate,
  currentPage = 'dashboard',
  onOpenAuthModal,
  onReplayIntro,
  onOpenAddCustomer,
  onOpenAddLead,
  onOpenAddTask
}) => {
  const navigate = onNavigate || onSelectNav || (() => {});
  const {
    currentUser,
    setCurrentUserRole,
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
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Cmd+K keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    admin: { label: 'Admin (Full Access)', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: Shield },
    supervisor: { label: 'Supervisor (Team Lead)', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: UserCheck },
    user: { label: 'User (Assigned Staff)', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30', icon: UserIcon }
  };

  const currentBadge = roleBadges[currentUser.role] || roleBadges.admin;
  const RoleIcon = currentBadge.icon;

  const pageNames: Record<string, string> = {
    dashboard: 'Executive Dashboard',
    customers: 'Customer Directory',
    leads: 'Leads Pipeline',
    tasks: 'Tasks & Sprints',
    employees: 'Team Directory',
    reports: 'Analytics & Reports',
    'ai-assistant': 'AI Sales Copilot',
    settings: 'Company Settings'
  };

  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="lg:hidden shrink-0">
          <TrishulLogo size="xs" showText={false} />
        </div>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer font-medium" onClick={() => navigate('dashboard')}>
            TRISHUL
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {pageNames[currentPage] || currentPage}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div
          onClick={() => setShowSearchModal(true)}
          className="relative flex items-center w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-all group"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          <span className="flex-1 font-normal text-slate-500 dark:text-slate-400">Search customers, leads, tasks...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Quick Action Create Button */}
        {(onOpenAddLead || onOpenAddCustomer || onOpenAddTask) && (
          <div className="relative">
            <button
              onClick={() => setShowQuickCreate(!showQuickCreate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {showQuickCreate && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                {onOpenAddLead && (
                  <button
                    onClick={() => {
                      setShowQuickCreate(false);
                      onOpenAddLead();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors text-left"
                  >
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    <span>New Lead</span>
                  </button>
                )}
                {onOpenAddCustomer && (
                  <button
                    onClick={() => {
                      setShowQuickCreate(false);
                      onOpenAddCustomer();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors text-left"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-500" />
                    <span>New Customer</span>
                  </button>
                )}
                {onOpenAddTask && (
                  <button
                    onClick={() => {
                      setShowQuickCreate(false);
                      onOpenAddTask();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors text-left"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>New Task</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-colors"
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
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500"></span>
              </>
            )}
          </button>

          {/* Dynamic Notification Panel */}
          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onNavigate={(page) => {
              navigate(page);
              setShowNotifications(false);
            }}
          />
        </div>

        
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, leads, tasks... (Press ESC to close)"
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
                              navigate('customers');
                              setShowSearchModal(false);
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-cyan-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                              <p className="text-[11px] text-slate-400">{c.company} • {c.phone}</p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-400">₹{(c.value || 0).toLocaleString('en-IN')}</span>
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
                              navigate('leads');
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
                              navigate('tasks');
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
