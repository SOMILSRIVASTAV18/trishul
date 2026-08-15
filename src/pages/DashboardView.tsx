import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Target,
  UserCheck,
  IndianRupee,
  Clock,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  CheckSquare,
  AlertCircle,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useCrm } from '../context/CrmContext';

interface DashboardViewProps {
  onNavigate: (page: string) => void;
  onOpenAddCustomer: () => void;
  onOpenAddLead: () => void;
  onOpenAddTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddCustomer,
  onOpenAddLead,
  onOpenAddTask,
}) => {
  const { customers, leads, tasks, employees, currentUser, toggleTaskComplete } = useCrm();

  // Real Metric Computations directly from active database state
  const totalCustomersCount = customers.length;
  const activeCustomersCount = customers.filter(c => c.status === 'Active').length;
  const totalLeadsCount = leads.length;
  const wonLeadsCount = leads.filter(l => l.status === 'Won').length;
  const activeEmployeesCount = employees.filter(e => e.status === 'Active').length;
  const totalEmployeesCount = employees.length;

  // Calculate live revenue strictly from actual client contracts and won deals
  const customerRevenue = customers.reduce((acc, c) => acc + (c.value || 0), 0);
  const wonLeadsRevenue = leads.filter(l => l.status === 'Won').reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
  const totalRevenue = customerRevenue + wonLeadsRevenue;

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed');

  // Real pipeline stage distribution calculated from actual leads
  const pipelineStagesData = [
    {
      stage: 'New',
      count: leads.filter(l => l.status === 'New').length,
      value: leads.filter(l => l.status === 'New').reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      fill: '#0ea5e9'
    },
    {
      stage: 'Contacted',
      count: leads.filter(l => l.status === 'Contacted').length,
      value: leads.filter(l => l.status === 'Contacted').reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      fill: '#f59e0b'
    },
    {
      stage: 'Interested',
      count: leads.filter(l => l.status === 'Interested').length,
      value: leads.filter(l => l.status === 'Interested').reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      fill: '#8b5cf6'
    },
    {
      stage: 'Won',
      count: leads.filter(l => l.status === 'Won').length,
      value: leads.filter(l => l.status === 'Won').reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      fill: '#10b981'
    },
    {
      stage: 'Lost',
      count: leads.filter(l => l.status === 'Lost').length,
      value: leads.filter(l => l.status === 'Lost').reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      fill: '#ef4444'
    },
  ];

  // Real customer status dataset calculated directly from customers state
  const customerStatusData = [
    {
      name: 'Active',
      count: customers.filter(c => c.status === 'Active').length,
      value: customers.filter(c => c.status === 'Active').reduce((acc, c) => acc + (c.value || 0), 0),
      fill: '#10b981'
    },
    {
      name: 'Pending',
      count: customers.filter(c => c.status === 'Pending').length,
      value: customers.filter(c => c.status === 'Pending').reduce((acc, c) => acc + (c.value || 0), 0),
      fill: '#f59e0b'
    },
    {
      name: 'Inactive',
      count: customers.filter(c => c.status === 'Inactive').length,
      value: customers.filter(c => c.status === 'Inactive').reduce((acc, c) => acc + (c.value || 0), 0),
      fill: '#64748b'
    },
  ];

  const kpis = [
    {
      id: 'kpi-revenue',
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: `${customers.length} Accounts`,
      trend: 'up',
      icon: IndianRupee,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      action: () => onNavigate('reports')
    },
    {
      id: 'kpi-customers',
      title: 'Total Customers',
      value: totalCustomersCount.toLocaleString('en-IN'),
      change: `${activeCustomersCount} Active`,
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      action: () => onNavigate('customers')
    },
    {
      id: 'kpi-leads',
      title: 'Pipeline Leads',
      value: totalLeadsCount.toLocaleString('en-IN'),
      change: `${wonLeadsCount} Converted`,
      trend: 'up',
      icon: Target,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      action: () => onNavigate('leads')
    },
    {
      id: 'kpi-tasks',
      title: 'Pending Tasks',
      value: pendingTasks.length.toString(),
      change: `${highPriorityTasks.length} Urgent`,
      trend: 'neutral',
      icon: Clock,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      action: () => onNavigate('tasks')
    },
    {
      id: 'kpi-employees',
      title: 'Active Team',
      value: activeEmployeesCount.toString(),
      change: `${totalEmployeesCount} Total`,
      trend: 'up',
      icon: UserCheck,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      action: () => onNavigate('employees')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header / Executive Briefing */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Executive Overview
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.displayName}</span> • All pipelines synchronized
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddLead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Customer</span>
          </button>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => onNavigate('ai-assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - 5 Cards Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              onClick={kpi.action}
              className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.5 rounded">
                  <span>{kpi.change}</span>
                  <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center justify-between">
                  <span>{kpi.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section: Live Pipeline Stages + Customer Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real Pipeline Stages Chart (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pipeline Stages & Deal Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Real-time lead counts and estimated deal values</p>
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              {leads.length} Total Leads
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStagesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} Leads` : `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'count' ? 'Active Leads' : 'Estimated Value'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {pipelineStagesData.map((entry, index) => (
                    <Cell key={`pipe-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Accounts by Status (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Portfolio</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Distribution by client account status</p>
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              {customers.length} Accounts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} Clients` : `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'count' ? 'Client Count' : 'Total Contract Value'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {customerStatusData.map((entry, index) => (
                    <Cell key={`cust-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Three Columns: Pending Urgent Tasks, Latest Customers & New Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Urgent Tasks Quick Action (1 Col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Actionable Tasks</h3>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All tasks are currently completed!
              </div>
            ) : (
              pendingTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(t.id)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0 cursor-pointer"
                      title="Mark Complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{t.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {t.assignedUserName} • Due {t.dueDate}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase shrink-0 ${
                    t.priority === 'High'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Customers (1 Col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Customers</h3>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {customers.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('customers')}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-300 dark:border-slate-700">
                    {c.company ? c.company.substring(0, 2).toUpperCase() : 'CU'}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{c.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{c.company} • {c.phone}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    ₹{(c.value || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Leads Feed (1 Col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pipeline Opportunities</h3>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {leads.slice(0, 4).map((l) => (
              <div
                key={l.id}
                onClick={() => onNavigate('leads')}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-300 dark:border-slate-700">
                    {l.name ? l.name.charAt(0).toUpperCase() : 'L'}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{l.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {l.company} • {l.source}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    ₹{(l.estimatedValue || 0).toLocaleString('en-IN')}
                  </span>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${
                    l.status === 'Won'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                      : l.status === 'Interested'
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                  }`}>
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
