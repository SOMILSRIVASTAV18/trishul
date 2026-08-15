import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit2,
  Trash2,
  Flag,
  Tag,
  X
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import type { Task, TaskPriority, TaskStatus } from '../types';
import { generatePdfReport, exportToExcel } from '../utils/exportUtils';
import { Download, Printer } from 'lucide-react';

interface TasksViewProps {
  onOpenAddModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenAddModal }) => {
  const { tasks, updateTask, deleteTask, toggleTaskComplete, employees, currentUser, settings } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState<Partial<Task>>({});

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.assignedUserName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || t.assignedUserName === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setEditFormData(task);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    await updateTask(selectedTask.id, editFormData);
    setIsEditing(false);
    setSelectedTask(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setDeleteConfirmId(null);
  };

  const priorityColors: Record<TaskPriority, { text: string; bg: string; border: string }> = {
    High: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
    Medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    Low: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
  };

  // Export Handlers
  const handleExportExcel = () => {
    exportToExcel('trishul_tasks_register', [{
      sheetName: 'Tasks',
      data: filteredTasks.map(t => ({
        'Task Title': t.title,
        'Category': t.category,
        'Priority': t.priority,
        'Execution Status': t.status,
        'Due Date': t.dueDate,
        'Assigned Staff': t.assignedUserName,
        'Description': t.description || '',
        'Created Date': t.createdAt
      }))
    }]);
  };

  const handleExportPDF = () => {
    generatePdfReport({
      title: 'Operational Tasks & Milestones Report',
      subtitle: `${filteredTasks.length} Assigned Work Items`,
      settings,
      metrics: [
        { label: 'Total Tasks', value: `${filteredTasks.length}` },
        { label: 'Completed', value: `${completedCount} (${progressPercent}%)` },
        { label: 'Pending / In Progress', value: `${pendingCount} Tasks` }
      ],
      tables: [{
        heading: 'Assigned Work Orders & Deadlines',
        columns: ['Title', 'Category', 'Priority', 'Status', 'Due Date', 'Assigned To'],
        rows: filteredTasks.map(t => [
          t.title,
          t.category,
          t.priority,
          t.status,
          t.dueDate,
          t.assignedUserName
        ])
      }]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Task Management</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
              {pendingCount} Pending / {tasks.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Coordinate team activities, deadlines, client meetings, and proposal milestones.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
            title="Export Tasks as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Export Tasks to Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/20">
            {progressPercent}%
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Team Completion Rate</h4>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{completedCount} tasks completed of {tasks.length} total assigned</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full sm:w-64 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title, description, or assigned staff..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'Pending', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none font-semibold"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'Completed';
          const pConfig = priorityColors[task.priority];

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDone
                  ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/40 opacity-75'
                  : 'bg-white dark:bg-[#0b1023] border-slate-200 dark:border-slate-800/90 shadow-sm hover:border-cyan-500/40'
              }`}
            >
              {/* Left: Checkbox & Details */}
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className={`mt-0.5 p-1 rounded-lg transition-colors ${
                    isDone
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-xs sm:text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${pConfig.border} ${pConfig.bg} ${pConfig.text}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {task.category || 'General'}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700 dark:text-slate-300 pt-1 font-medium">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-cyan-400" />
                      <span>{task.assignedUserName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>Due: {task.dueDate}</span>
                    </div>

                    {isDone && task.completedAt && (
                      <span className="text-emerald-400 font-medium text-[10px]">
                        ✓ Completed {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleEditClick(task)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 text-slate-600 dark:text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Edit Task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(task.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 p-8">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Tasks Match Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All assigned tasks are clear or no tasks match your search query.
          </p>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditing && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Task</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description & Deliverables</label>
                <textarea
                  rows={2}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assigned Team Member</label>
                  <select
                    value={editFormData.assignedUserName || 'Rahul Verma'}
                    onChange={(e) => {
                      const found = employees.find(emp => emp.name === e.target.value);
                      setEditFormData({
                        ...editFormData,
                        assignedUserName: e.target.value,
                        assignedUserId: found?.id || 'emp-1'
                      });
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editFormData.dueDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={editFormData.priority || 'Medium'}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as TaskPriority })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={editFormData.status || 'Pending'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as TaskStatus })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <input
                    type="text"
                    value={editFormData.category || 'Sales'}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold shadow-md hover:bg-cyan-400"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Task</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Are you sure you want to remove this task?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
