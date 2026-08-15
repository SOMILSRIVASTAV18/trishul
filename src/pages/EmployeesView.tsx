import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Plus,
  Search,
  Shield,
  UserCheck,
  User,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import type { Employee, UserRole, EmployeeStatus } from '../types';
import { generatePdfReport, exportToExcel } from '../utils/exportUtils';
import { Download, Printer } from 'lucide-react';

interface EmployeesViewProps {
  onOpenAddModal: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ onOpenAddModal }) => {
  const { employees, updateEmployee, deleteEmployee, currentUser, settings } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState<Partial<Employee>>({});

  const isAdmin = currentUser.role === 'admin';

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditFormData(emp);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, editFormData);
    setIsEditing(false);
    setSelectedEmployee(null);
  };

  const handleDelete = async (id: string) => {
    await deleteEmployee(id);
    setDeleteConfirmId(null);
  };

  const roleTags: Record<UserRole, { label: string; bg: string; text: string; border: string; icon: any }> = {
    admin: { label: 'Admin', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', icon: Shield },
    supervisor: { label: 'Supervisor', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: UserCheck },
    user: { label: 'Staff / User', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', icon: User }
  };

  // Export Handlers
  const handleExportExcel = () => {
    exportToExcel('trishul_employees_directory', [{
      sheetName: 'Employees',
      data: filteredEmployees.map(e => ({
        'Employee Name': e.name,
        'Role': e.role.toUpperCase(),
        'Department': e.department,
        'Email': e.email,
        'Phone': e.phone,
        'Status': e.status,
        'Monthly Sales Target (INR)': e.salesTarget || 0,
        'Supervisor / Manager': e.supervisor || 'None'
      }))
    }]);
  };

  const handleExportPDF = () => {
    generatePdfReport({
      title: 'Workforce & Staff Directory Report',
      subtitle: `${filteredEmployees.length} Registered Team Members`,
      settings,
      metrics: [
        { label: 'Total Staff', value: `${filteredEmployees.length}` },
        { label: 'Active Status', value: `${filteredEmployees.filter(e => e.status === 'Active').length}` },
        { label: 'Departments', value: `${Array.from(new Set(filteredEmployees.map(e => e.department))).length}` }
      ],
      tables: [{
        heading: 'Employee Register & Access Matrix',
        columns: ['Name', 'Role', 'Department', 'Email', 'Phone', 'Status', 'Supervisor'],
        rows: filteredEmployees.map(e => [
          e.name,
          e.role.toUpperCase(),
          e.department,
          e.email,
          e.phone,
          e.status,
          e.supervisor || 'None'
        ])
      }]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee & Team Management</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
              {filteredEmployees.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Assign supervisors, monitor performance quotas, and manage staff access tiers.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
            title="Export Employees as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Export Employees to Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excel / CSV</span>
          </button>

          {isAdmin && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee by name, department, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'admin', 'supervisor', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                roleFilter === r
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const rTag = roleTags[emp.role] || roleTags.user;
          const RoleIcon = rTag.icon;

          return (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800/90 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-900 text-purple-300 font-black text-sm flex items-center justify-center border border-purple-500/30 shadow-inner">
                      {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{emp.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{emp.department}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${rTag.border} ${rTag.bg} ${rTag.text}`}>
                    <RoleIcon className="w-3 h-3" />
                    {rTag.label}
                  </span>
                </div>

                {/* Contact and Hierarchy */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  {emp.supervisorName && (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Reports to: {emp.supervisorName}</span>
                    </div>
                  )}
                </div>

                {/* Performance Metrics Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold block uppercase">Won Deals</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">{emp.leadsClosed || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold block uppercase">Revenue</span>
                    <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                      ₹{((emp.revenueGenerated || 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold block uppercase">Tasks</span>
                    <span className="text-xs font-bold text-cyan-400 mt-0.5 block">{emp.tasksCompleted || 0}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Joined: {emp.joinedDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditClick(emp)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-500/10 text-slate-600 dark:text-slate-300 hover:text-purple-400 transition-colors"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {emp.id !== currentUser.id && (
                      <button
                        onClick={() => setDeleteConfirmId(emp.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-600 dark:text-slate-300 hover:text-rose-400 transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {isEditing && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Employee Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <input
                    type="text"
                    required
                    value={editFormData.department || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Access Role</label>
                  <select
                    value={editFormData.role || 'user'}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="user">User / Sales Rep</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Supervisor Assignment</label>
                  <select
                    value={editFormData.supervisorName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, supervisorName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">None (Executive)</option>
                    {employees.filter(e => e.role !== 'user').map(sup => (
                      <option key={sup.id} value={sup.name}>{sup.name}</option>
                    ))}
                  </select>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-500"
                >
                  Save Changes
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Remove Employee</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Are you sure you want to permanently delete this team member?
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
