import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  TrendingUp,
  CheckSquare,
  Building2,
  UserPlus,
  Shield,
  Sparkles,
  Search,
  ExternalLink,
  X,
  Clock,
  Circle,
  Check,
  AlertCircle,
  Filter
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import type { CrmNotification, NotificationType } from '../../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

type TabFilter = 'all' | 'unread' | 'lead' | 'task' | 'customer' | 'system';

// Relative time formatting
function formatRelativeTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications,
    soundEnabled,
    setSoundEnabled,
    playNotificationSound
  } = useCrm();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      lead: notifications.filter(n => n.type === 'lead').length,
      task: notifications.filter(n => n.type === 'task').length,
      customer: notifications.filter(n => n.type === 'customer').length,
      system: notifications.filter(n => n.type === 'system' || n.type === 'employee').length
    };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Tab filter
      if (activeTab === 'unread' && n.read) return false;
      if (activeTab === 'lead' && n.type !== 'lead') return false;
      if (activeTab === 'task' && n.type !== 'task') return false;
      if (activeTab === 'customer' && n.type !== 'customer') return false;
      if (activeTab === 'system' && n.type !== 'system' && n.type !== 'employee') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchMessage = n.message.toLowerCase().includes(q);
        if (!matchTitle && !matchMessage) return false;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  if (!isOpen) return null;

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'lead':
        return {
          icon: TrendingUp,
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
        };
      case 'task':
        return {
          icon: CheckSquare,
          bg: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
        };
      case 'customer':
        return {
          icon: Building2,
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
        };
      case 'employee':
        return {
          icon: UserPlus,
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
        };
      case 'ai':
        return {
          icon: Sparkles,
          bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
        };
      default:
        return {
          icon: Shield,
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
        };
    }
  };

  const handleItemClick = (notif: CrmNotification) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    if (notif.targetPage) {
      onNavigate(notif.targetPage);
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      id="crm-notification-panel"
      className="absolute right-0 top-full mt-2.5 w-[380px] sm:w-[440px] max-w-[calc(100vw-24px)] max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Panel Header */}
      <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              Live Notifications
            </h2>
            {unreadNotificationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500 text-white shadow-sm animate-pulse">
                {unreadNotificationsCount} unread
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playNotificationSound();
              }}
              title={soundEnabled ? 'Sound alerts enabled' : 'Sound alerts muted'}
              className={`p-1.5 rounded-lg transition-colors ${
                soundEnabled
                  ? 'text-cyan-500 hover:bg-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Mark all as read */}
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyan-400 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}

            {/* Clear all */}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                title="Clear all notifications"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative mt-2.5">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts, leads, clients..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none pb-0.5 text-[11px]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'unread'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unread ({counts.unread})
          </button>
          <button
            onClick={() => setActiveTab('lead')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'lead'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Leads ({counts.lead})
          </button>
          <button
            onClick={() => setActiveTab('task')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'task'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tasks ({counts.task})
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'customer'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Clients ({counts.customer})
          </button>
        </div>
      </div>

      {/* Notification Items List */}
      <div className="flex-1 overflow-y-auto max-h-[50vh] p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/40">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/70 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-cyan-500" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              No new notifications
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[260px] mx-auto leading-relaxed">
              {searchQuery
                ? `No notifications found matching "${searchQuery}".`
                : 'Your notification inbox is up to date. Incoming lead events, customer updates, and task assignments will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const typeStyle = getIconForType(notif.type);
            const Icon = typeStyle.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`pt-2.5 first:pt-0 group relative p-3 rounded-xl transition-all cursor-pointer border ${
                  notif.read
                    ? 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    : 'bg-cyan-500/[0.04] dark:bg-cyan-500/[0.07] border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/[0.08]'
                }`}
              >
                {/* Priority accent border bar if high priority */}
                {notif.priority === 'high' && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-rose-500 rounded-r-full" />
                )}

                <div className="flex items-start gap-3 pl-1">
                  {/* Type Icon Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${typeStyle.bg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 shadow-sm" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatRelativeTime(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2">
                      {notif.message}
                    </p>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between pt-1">
                      {notif.targetPage ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 group-hover:underline">
                          <span>View in {notif.targetPage.toUpperCase()}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* Item Quick Actions */}
                      <div
                        className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            if (notif.read) {
                              // Toggle back or leave as read
                            } else {
                              markNotificationAsRead(notif.id);
                            }
                          }}
                          title={notif.read ? 'Read' : 'Mark as read'}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => clearNotification(notif.id)}
                          title="Dismiss"
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Showing {filteredNotifications.length} of {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'}
        </span>
        {notifications.length > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>
    </div>
  );
};
