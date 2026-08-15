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
  Layers
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
  PieChart,
  Pie,
  Cell,
  Legend
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
  const { customers, leads, tasks, employees, settings, currentUser } = useCrm();

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

  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const highPriorityTasksCount = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

  // Real pipeline stage distribution calculated from actual leads
  const pipelineStagesData = [
    {
      stage: 'New',
      count: leads.filter(l => l.status === 'New').length,
      value: leads.filter(l => l.status === 'New').reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      fill: '#38bdf8'
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
      fill: '#f43f5e'
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
      id: 'kpi-customers',
      title: 'Total Customers',
      value: totalCustomersCount.toLocaleString('en-IN'),
      change: `${activeCustomersCount} Active`,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400',
      action: () => onNavigate('customers')
    },
    {
      id: 'kpi-leads',
      title: 'Total Leads',
      value: totalLeadsCount.toLocaleString('en-IN'),
      change: `${wonLeadsCount} Converted`,
      trend: 'up',
      icon: Target,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      action: () => onNavigate('leads')
    },
    {
      id: 'kpi-employees',
      title: 'Active Employees',
      value: activeEmployeesCount.toString(),
      change: `${totalEmployeesCount} Total`,
      trend: 'up',
      icon: UserCheck,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
      action: () => onNavigate('employees')
    },
    {
      id: 'kpi-revenue',
      title: 'Revenue (INR)',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: `${customers.length} Accounts`,
      trend: 'up',
      icon: IndianRupee,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      action: () => onNavigate('reports')
    },
    {
      id: 'kpi-tasks',
      title: 'Pending Tasks',
      value: pendingTasksCount.toString(),
      change: `${highPriorityTasksCount} High Pri`,
      trend: 'neutral',
      icon: Clock,
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
      action: () => onNavigate('tasks')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-cyan-500/30 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold tracking-wider uppercase">
                Enterprise Dashboard
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {currentUser.displayName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              TRISHUL CRM is synchronized with live Firestore. All sales funnels, pipeline stages, and staff performance metrics are operating at peak efficiency.
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddLead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </button>

            <button
              onClick={onOpenAddTask}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>

            <button
              onClick={onOpenAddCustomer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - 5 Cards Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              onClick={kpi.action}
              className="group relative p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-cyan-500/40 transition-all cursor-pointer overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color} border shadow-inner`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{kpi.change}</span>
                  <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold mt-0.5 flex items-center justify-between">
                  <span>{kpi.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section: Live Pipeline Stages + Customer Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real Pipeline Stages Chart (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Pipeline Stages</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Real-time lead counts and deal values across stages</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-lg">
                {leads.length} Total Leads
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStagesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} Leads` : `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'count' ? 'Active Leads' : 'Estimated Value'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                  {pipelineStagesData.map((entry, index) => (
                    <Cell key={`pipe-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Accounts by Status (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Portfolio</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Distribution by client account status</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {customers.length} Accounts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} Clients` : `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'count' ? 'Client Count' : 'Total Contract Value'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {customerStatusData.map((entry, index) => (
                    <Cell key={`cust-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Columns: Latest Customers & New Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Latest Customers (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Latest Customers</h3>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-900 to-blue-900 text-cyan-300 font-bold flex items-center justify-center text-xs">
                    {c.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</h4>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{c.company} • {c.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">
                    ₹{c.value.toLocaleString('en-IN')}
                  </span>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Leads Feed (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Inbound Leads</h3>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Pipeline View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {leads.slice(0, 4).map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-900 to-orange-900 text-amber-300 font-bold flex items-center justify-center text-xs">
                    {l.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{l.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {l.source}
                      </span>
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">
                        {l.company}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    ₹{l.estimatedValue.toLocaleString('en-IN')}
                  </span>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    l.status === 'Won'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : l.status === 'Interested'
                      ? 'bg-purple-500/10 text-purple-400'
                      : l.status === 'Contacted'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-cyan-500/10 text-cyan-400'
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
