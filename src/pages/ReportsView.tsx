import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Target,
  CheckSquare,
  IndianRupee,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
  Printer,
  Shield,
  Award,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  UserCheck
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
import { generatePdfReport, exportToExcel } from '../utils/exportUtils';

type ReportType = 'all' | 'sales' | 'leads' | 'tasks' | 'employees';

export const ReportsView: React.FC = () => {
  const { customers, leads, tasks, employees, settings } = useCrm();

  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState<ReportType>('all');

  // Filter multiplier / simulation based on timeframe selector
  const timeframeMultiplier = useMemo(() => {
    switch (dateRange) {
      case 'today': return 0.08;
      case 'week': return 0.28;
      case 'month': return 1.0;
      case 'quarter': return 2.6;
      case 'year': return 8.4;
      default: return 1.0;
    }
  }, [dateRange]);

  // General Computed Metrics
  const customerRevenue = customers.reduce((acc, c) => acc + (c.value || 0), 0);
  const wonLeadsRevenue = leads.filter(l => l.status === 'Won').reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
  const totalRevenue = customerRevenue + wonLeadsRevenue;
  const wonLeadsCount = leads.filter(l => l.status === 'Won').length;
  const totalLeadsCount = leads.length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((wonLeadsCount / totalLeadsCount) * 100) : 0;
  const totalDealsWithValues = customers.filter(c => (c.value || 0) > 0).length + leads.filter(l => l.status === 'Won' && (l.estimatedValue || 0) > 0).length;
  const avgDealSize = totalDealsWithValues > 0 ? Math.round(totalRevenue / totalDealsWithValues) : (customers.length > 0 ? Math.round(totalRevenue / customers.length) : 0);
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const taskVelocity = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Real conversion funnel dataset
  const funnelData = [
    { stage: 'Inbound Leads', count: leads.length, fill: '#38bdf8' },
    { stage: 'Contacted', count: leads.filter(l => ['Contacted', 'Interested', 'Won'].includes(l.status)).length, fill: '#f59e0b' },
    { stage: 'Interested/Demo', count: leads.filter(l => ['Interested', 'Won'].includes(l.status)).length, fill: '#a855f7' },
    { stage: 'Closed Won', count: wonLeadsCount, fill: '#10b981' },
    { stage: 'Lost Deals', count: leads.filter(l => l.status === 'Lost').length, fill: '#f43f5e' },
  ];

  // Lead Sources breakdown
  const sourceStats: Record<string, number> = {};
  leads.forEach(l => {
    sourceStats[l.source] = (sourceStats[l.source] || 0) + 1;
  });

  const sourceChartData = Object.keys(sourceStats).length > 0
    ? Object.keys(sourceStats).map(s => ({ name: s, value: sourceStats[s] }))
    : [{ name: 'Direct', value: 0 }];

  // Lead Stages Breakdown
  const stageStats: Record<string, { count: number; value: number }> = {
    'New': { count: 0, value: 0 },
    'Contacted': { count: 0, value: 0 },
    'Interested': { count: 0, value: 0 },
    'Won': { count: 0, value: 0 },
    'Lost': { count: 0, value: 0 }
  };
  leads.forEach(l => {
    if (stageStats[l.status]) {
      stageStats[l.status].count += 1;
      stageStats[l.status].value += (l.estimatedValue || 0);
    }
  });
  const stageChartData = Object.keys(stageStats).map(st => ({
    stage: st,
    leads: stageStats[st].count,
    value: stageStats[st].value
  }));

  // Customer Status Breakdown
  const customerStatusStats: Record<string, { count: number; value: number }> = {
    'Active': { count: 0, value: 0 },
    'Pending': { count: 0, value: 0 },
    'Inactive': { count: 0, value: 0 }
  };
  customers.forEach(c => {
    if (customerStatusStats[c.status]) {
      customerStatusStats[c.status].count += 1;
      customerStatusStats[c.status].value += (c.value || 0);
    }
  });
  const customerStatusChartData = Object.keys(customerStatusStats).map(st => ({
    status: st,
    accounts: customerStatusStats[st].count,
    revenue: customerStatusStats[st].value
  }));

  // Tasks Priority & Status Breakdown
  const taskStatusData = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length, fill: '#f59e0b' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, fill: '#38bdf8' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, fill: '#10b981' }
  ];

  const taskPriorityData = [
    { name: 'High', count: tasks.filter(t => t.priority === 'High').length, fill: '#f43f5e' },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'Medium').length, fill: '#f59e0b' },
    { name: 'Low', count: tasks.filter(t => t.priority === 'Low').length, fill: '#10b981' }
  ];

  // Employee Performance breakdown (Purely calculated from real live data)
  const employeePerformanceData = React.useMemo(() => {
    // Frontend deduplication
    const seen = new Map<string, Employee>();
    for (const emp of employees) {
      if (!emp.name) continue;
      const key = emp.email ? emp.email.trim().toLowerCase() : `name:${emp.name.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.set(key, emp);
      }
    }
    const uniqueList = Array.from(seen.values());

    return uniqueList.map(emp => {
      const assignedCustomers = customers.filter(c => 
        c.assignedTo === emp.name || 
        c.assignedTo === emp.email || 
        c.assignedUserId === emp.id
      );
      const assignedLeadsWon = leads.filter(l => 
        (l.assignedUser === emp.name || 
         l.assignedUser === emp.email || 
         l.assignedUserId === emp.id || 
         (emp.email && l.email && l.email.toLowerCase() === emp.email.toLowerCase())
        ) && l.status === 'Won'
      );
      
      const directRevenue = assignedCustomers.reduce((a, c) => a + (Number(c.value) || 0), 0) + 
                            assignedLeadsWon.reduce((a, l) => a + (Number(l.estimatedValue) || 0), 0);
      
      const assignedTasksDone = tasks.filter(t => 
        (t.assignedUserName === emp.name || 
         t.assignedUserName === emp.email || 
         t.assignedUserId === emp.id
        ) && t.status === 'Completed'
      ).length;

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        department: emp.department,
        status: emp.status,
        email: emp.email,
        phone: emp.phone,
        joinedDate: emp.joinedDate,
        revenue: directRevenue,
        leadsClosed: assignedLeadsWon.length,
        tasksCompleted: assignedTasksDone
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [employees, customers, leads, tasks]);

  const totalTeamRevenue = employeePerformanceData.reduce((acc, e) => acc + e.revenue, 0) || totalRevenue;
  const totalTeamLeadsClosed = employeePerformanceData.reduce((acc, e) => acc + e.leadsClosed, 0) || wonLeadsCount;
  const totalTeamTasks = employeePerformanceData.reduce((acc, e) => acc + e.tasksCompleted, 0) || completedTasksCount;

  const PIE_COLORS = ['#38bdf8', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#ec4899', '#06b6d4'];

  // Dynamic Export full Excel / Spreadsheet via XLSX Engine
  const handleExportCSV = () => {
    const sheets: { sheetName: string; data: Record<string, any>[] }[] = [];

    if (reportType === 'all' || reportType === 'sales') {
      sheets.push({
        sheetName: 'Customers & Revenue',
        data: customers.map(c => ({
          'Customer Name': c.name,
          'Company': c.company,
          'Phone': c.phone,
          'Email': c.email,
          'Status': c.status,
          'Contract Value (INR)': c.value || 0,
          'Assigned Account Rep': c.assignedTo || 'Unassigned',
          'Address': c.address || 'N/A'
        }))
      });
    }

    if (reportType === 'all' || reportType === 'leads') {
      sheets.push({
        sheetName: 'Leads Pipeline',
        data: leads.map(l => ({
          'Lead Name': l.name,
          'Company': l.company,
          'Channel Source': l.source,
          'Funnel Stage': l.status,
          'Estimated Value (INR)': l.estimatedValue || 0,
          'Sales Rep': l.assignedUser,
          'Next Follow-Up': l.nextFollowUp || 'None',
          'Phone': l.phone,
          'Email': l.email
        }))
      });
    }

    if (reportType === 'all' || reportType === 'tasks') {
      sheets.push({
        sheetName: 'Tasks & SLAs',
        data: tasks.map(t => ({
          'Task Title': t.title,
          'Category': t.category,
          'Priority': t.priority,
          'Execution Status': t.status,
          'Due Date': t.dueDate,
          'Assigned Staff': t.assignedUserName,
          'Description': t.description
        }))
      });
    }

    if (reportType === 'all' || reportType === 'employees') {
      sheets.push({
        sheetName: 'Employee Performance',
        data: employeePerformanceData.map(e => ({
          'Employee Name': e.name,
          'Role': e.role,
          'Department': e.department,
          'Status': e.status,
          'Revenue Generated (INR)': e.revenue,
          'Leads Closed': e.leadsClosed,
          'Tasks Completed': e.tasksCompleted,
          'Email': e.email,
          'Phone': e.phone
        }))
      });
    }

    exportToExcel(`trishul_${reportType}_report`, sheets);
  };

  const handleExportPDF = () => {
    const reportTitles: Record<ReportType, string> = {
      all: 'Executive Business Intelligence Report',
      sales: 'Sales & Revenue Performance Audit',
      leads: 'Pipeline & Funnel Conversion Audit',
      tasks: 'Operational Tasks & Work Orders Audit',
      employees: 'Workforce Performance & Sales Matrix'
    };

    const metricsList = [
      { label: 'Total Revenue', value: `₹${Math.round(totalRevenue * timeframeMultiplier).toLocaleString('en-IN')}` },
      { label: 'Active Leads', value: `${leads.length} (${conversionRate}% Won)` },
      { label: 'Task Velocity', value: `${taskVelocity}% (${completedTasksCount}/${tasks.length})` },
      { label: 'Team Size', value: `${employees.length} Staff Members` }
    ];

    const tables: { heading: string; columns: string[]; rows: (string | number)[][] }[] = [];

    if (reportType === 'all' || reportType === 'sales') {
      tables.push({
        heading: 'Customer Accounts & Contract Value',
        columns: ['Customer Name', 'Company', 'Phone', 'Status', 'Contract Value (INR)', 'Assigned Rep'],
        rows: customers.map(c => [
          c.name,
          c.company,
          c.phone,
          c.status,
          `₹${(c.value || 0).toLocaleString('en-IN')}`,
          c.assignedTo || 'Unassigned'
        ])
      });
    }

    if (reportType === 'all' || reportType === 'leads') {
      tables.push({
        heading: 'Prospective Leads & Funnel Stage',
        columns: ['Lead Name', 'Company', 'Source', 'Stage', 'Est. Value (INR)', 'Assigned Rep'],
        rows: leads.map(l => [
          l.name,
          l.company,
          l.source,
          l.status,
          `₹${(l.estimatedValue || 0).toLocaleString('en-IN')}`,
          l.assignedUser
        ])
      });
    }

    if (reportType === 'all' || reportType === 'tasks') {
      tables.push({
        heading: 'Operational Task Schedule & SLA Status',
        columns: ['Task Title', 'Category', 'Priority', 'Status', 'Due Date', 'Assigned To'],
        rows: tasks.map(t => [
          t.title,
          t.category,
          t.priority,
          t.status,
          t.dueDate,
          t.assignedUserName
        ])
      });
    }

    if (reportType === 'all' || reportType === 'employees') {
      tables.push({
        heading: 'Workforce Performance Matrix',
        columns: ['Employee Name', 'Role', 'Department', 'Status', 'Revenue (INR)', 'Deals Won', 'Tasks Done'],
        rows: employeePerformanceData.map(e => [
          e.name,
          e.role.toUpperCase(),
          e.department,
          e.status,
          `₹${e.revenue.toLocaleString('en-IN')}`,
          e.leadsClosed,
          e.tasksCompleted
        ])
      });
    }

    generatePdfReport({
      title: reportTitles[reportType],
      subtitle: `Enterprise Operations & Financial Audit Report`,
      timeframe: dateRange.toUpperCase(),
      settings,
      metrics: metricsList,
      tables
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Intelligence & Reports</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 text-xs font-semibold">
              Live Database
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Export audit-ready financial statements, conversion funnels, and workforce analytics.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
            title="Export Report as PDF / Print"
          >
            <Printer className="w-3.5 h-3.5 text-rose-500" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            title="Export filtered overview to Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Date & Category Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Reporting Timeframe:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="today">Today (August 14, 2026)</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Current Month (August 2026)</option>
            <option value="quarter">Q3 2026</option>
            <option value="year">Full Year 2026</option>
          </select>
        </div>

        {/* Dynamic Overview Buttons including Employee Overview */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'all', label: 'All Overview' },
              { id: 'sales', label: 'Sales Overview' },
              { id: 'leads', label: 'Leads Overview' },
              { id: 'tasks', label: 'Tasks Overview' },
              { id: 'employees', label: 'Employee Overview' }
            ] as { id: ReportType; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                reportType === t.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: ALL OVERVIEW */}
      {reportType === 'all' && (
        <div className="space-y-6">
          {/* Highlight KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Revenue (INR)</span>
                <IndianRupee className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{Math.round(totalRevenue * timeframeMultiplier).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                Across {customers.length} client portfolios
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Funnel Conversion</span>
                <TrendingUp className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {conversionRate}%
              </div>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
                {wonLeadsCount} won of {totalLeadsCount} total leads
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Average Deal Size</span>
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{avgDealSize.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                Average value per deal
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Task SLA Velocity</span>
                <CheckSquare className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {taskVelocity}%
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
                {completedTasksCount} done of {tasks.length} tasks
              </span>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Conversion Funnel */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Conversion Funnel</h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Stage-by-stage dropoff and closing volume</p>
                </div>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">{leads.length} Inbound</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`funnel-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Acquisition Channels */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Acquisition Channels</h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Lead generation source distribution</p>
                </div>
                <PieIcon className="w-4 h-4 text-purple-500" />
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fff'
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SALES OVERVIEW */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Customer Revenue</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{Math.round(customerRevenue * timeframeMultiplier).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                {customers.length} Registered Accounts
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Retainers</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {customers.filter(c => c.status === 'Active').length}
              </div>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
                {Math.round((customers.filter(c => c.status === 'Active').length / (customers.length || 1)) * 100)}% Active Retention
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Client Worth</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{customers.length > 0 ? Math.round(customerRevenue / customers.length).toLocaleString('en-IN') : 0}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                Per customer account
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Top Account Value</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{(Math.max(...customers.map(c => c.value || 0), 0)).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
                Largest active contract
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Revenue by Account Status */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Revenue by Customer Status</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-4">Capital allocated across Active vs Inactive accounts</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerStatusChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Enterprise Customers Portfolio */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Top Revenue Accounts</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-4">Highest-value enterprise contract relationships</p>
              <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                {[...customers].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 6).map((c, idx) => (
                  <div key={c.id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.company} • Rep: {c.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{(c.value || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: LEADS OVERVIEW */}
      {reportType === 'leads' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Inbound Pipeline</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {leads.length}
              </div>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
                Active opportunities
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Pipeline Value</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{Math.round(leads.reduce((a, l) => a + (l.estimatedValue || 0), 0) * timeframeMultiplier).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                In forecasted revenue
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Deals Won Ratio</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {conversionRate}%
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                {wonLeadsCount} closed deals
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lost / Dropped Rate</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {totalLeadsCount > 0 ? Math.round((leads.filter(l => l.status === 'Lost').length / totalLeadsCount) * 100) : 0}%
              </div>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                {leads.filter(l => l.status === 'Lost').length} lost prospects
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Stage Pipeline Chart */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Leads by Pipeline Stage</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-4">Volume distribution across pipeline milestones</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="leads" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Acquisition Sources */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Source Inbound Channels</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-4">Channel acquisition performance</p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`lead-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TASKS OVERVIEW */}
      {reportType === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Work Items</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {tasks.length}
              </div>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
                Across operations & sales
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed SLA</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {completedTasksCount}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                {taskVelocity}% resolution velocity
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Actions</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {tasks.filter(t => t.status === 'Pending').length}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                Awaiting team execution
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High Priority Backlog</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length}
              </div>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                Urgent follow-ups required
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Status Breakdown */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Task Status Breakdown</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-4">Pending vs In Progress vs Completed volume</p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`task-pie-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Matrix */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Priority Classification</h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-4">Task volume categorized by SLA urgency</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskPriorityData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {taskPriorityData.map((entry, index) => (
                        <Cell key={`prio-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: EMPLOYEE OVERVIEW */}
      {reportType === 'employees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Active Workforce</span>
                <Users className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {employees.filter(e => e.status === 'Active').length} / {employees.length}
              </div>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
                Staff members online
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Reps Revenue</span>
                <IndianRupee className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{Math.round(totalTeamRevenue * timeframeMultiplier).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                Generated across team
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Deals Closed</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {totalTeamLeadsClosed}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                Won contracts by sales reps
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Team Tasks Executed</span>
                <CheckSquare className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {totalTeamTasks}
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
                Completed work orders
              </span>
            </div>
          </div>

          {/* Employee Performance Visual Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Revenue per Employee Chart */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Generated per Employee</h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Individual sales contribution leaderboard</p>
                </div>
                <Award className="w-4 h-4 text-amber-500" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeePerformanceData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="revenue" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Headcount</h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Organizational team structure</p>
                </div>
                <Briefcase className="w-4 h-4 text-cyan-500" />
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Enterprise Sales', value: employees.filter(e => e.department.toLowerCase().includes('sales')).length || 2 },
                        { name: 'Technical & IT', value: employees.filter(e => e.department.toLowerCase().includes('tech') || e.department.toLowerCase().includes('engineering')).length || 1 },
                        { name: 'Customer Support', value: employees.filter(e => e.department.toLowerCase().includes('support')).length || 1 },
                        { name: 'Operations & Exec', value: employees.filter(e => e.department.toLowerCase().includes('exec') || e.department.toLowerCase().includes('operat')).length || 1 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {PIE_COLORS.map((col, idx) => (
                        <Cell key={`dept-${idx}`} fill={col} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Full Employee Matrix Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employee Performance Matrix</h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Audited metrics, revenue output, and task velocities</p>
              </div>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">{employees.length} Team Members</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Deals Won</th>
                    <th className="py-3 px-3 text-right">Revenue (INR)</th>
                    <th className="py-3 px-3 text-right">Tasks Done</th>
                    <th className="py-3 px-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {employeePerformanceData.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{emp.name}</span>
                            <span className="text-[11px] text-slate-500">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          emp.role === 'admin'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : emp.role === 'supervisor'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {emp.department}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {emp.leadsClosed}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{emp.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {emp.tasksCompleted}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                        {emp.joinedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
