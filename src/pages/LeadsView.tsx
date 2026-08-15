import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Search,
  Filter,
  Columns,
  List,
  Phone,
  Mail,
  Building,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  Edit2,
  Trash2,
  Download,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  AlertCircle
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import type { Lead, LeadStatus } from '../types';
import { generatePdfReport, exportToExcel } from '../utils/exportUtils';
import { Printer } from 'lucide-react';

interface LeadsViewProps {
  onOpenAddModal: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onOpenAddModal }) => {
  const { leads, updateLead, deleteLead, convertLeadToCustomer, employees, settings } = useCrm();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState<Partial<Lead>>({});

  const stages: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Won', 'Lost'];

  const stageConfig: Record<LeadStatus, { title: string; color: string; bg: string; border: string }> = {
    New: { title: 'New Leads', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    Contacted: { title: 'Contacted', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    Interested: { title: 'Interested / Demo', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    Won: { title: 'Deals Won 🎉', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    Lost: { title: 'Lost', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);

    const matchesSource = selectedSource === 'all' || l.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const handleStageChange = async (leadId: string, newStatus: LeadStatus) => {
    if (newStatus === 'Won') {
      // Fire celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      await convertLeadToCustomer(leadId);
    } else {
      await updateLead(leadId, { status: newStatus });
    }
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditFormData(lead);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    await updateLead(selectedLead.id, editFormData);
    setIsEditing(false);
    setSelectedLead(null);
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
    setDeleteConfirmId(null);
  };

  // Export Handlers
  const handleExportExcel = () => {
    exportToExcel('trishul_leads_pipeline', [{
      sheetName: 'Leads',
      data: filteredLeads.map(l => ({
        'Lead Name': l.name,
        'Company': l.company,
        'Phone': l.phone,
        'Email': l.email,
        'Channel Source': l.source,
        'Funnel Stage': l.status,
        'Estimated Value (INR)': l.estimatedValue || 0,
        'Assigned Sales Rep': l.assignedUser,
        'Next Follow-Up': l.nextFollowUp || 'None',
        'Notes': l.notes || ''
      }))
    }]);
  };

  const handleExportPDF = () => {
    const totalPipelineValue = filteredLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
    const wonCount = filteredLeads.filter(l => l.status === 'Won').length;

    generatePdfReport({
      title: 'Leads Pipeline & Opportunities Report',
      subtitle: `${filteredLeads.length} Total Opportunities`,
      settings,
      metrics: [
        { label: 'Total Leads', value: `${filteredLeads.length}` },
        { label: 'Pipeline Value', value: `₹${totalPipelineValue.toLocaleString('en-IN')}` },
        { label: 'Won Conversions', value: `${wonCount} Deals` }
      ],
      tables: [{
        heading: 'Prospective Client Leads Register',
        columns: ['Lead Name', 'Company', 'Phone', 'Source', 'Stage', 'Est. Value (INR)', 'Assigned Rep'],
        rows: filteredLeads.map(l => [
          l.name,
          l.company,
          l.phone,
          l.source,
          l.status,
          `₹${(l.estimatedValue || 0).toLocaleString('en-IN')}`,
          l.assignedUser
        ])
      }]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leads Pipeline</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
              {filteredLeads.length} Leads
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Track and convert prospective client opportunities through the sales funnel.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
            title="Export Leads as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Export Leads to Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
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
            placeholder="Search leads by contact name, company, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider shrink-0 mr-1">Source:</span>
          {['all', 'Website', 'Referral', 'Advertisement', 'Cold Call', 'Social Media'].map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSource === src
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {stages.map((st) => {
            const config = stageConfig[st];
            const stageLeads = filteredLeads.filter(l => l.status === st);
            const totalStageValue = stageLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

            return (
              <div
                key={st}
                className="flex flex-col rounded-2xl bg-white dark:bg-[#090e21] border border-slate-200 dark:border-slate-800/90 shadow-sm overflow-hidden min-h-[500px]"
              >
                {/* Stage Header */}
                <div className={`p-3.5 border-b ${config.border} ${config.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-bold ${config.color} uppercase tracking-wider`}>
                      {config.title}
                    </h3>
                    <span className="w-5 h-5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                    ₹{(totalStageValue / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Stage Lead Cards */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[700px]">
                  {stageLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d142d] border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/40 hover:shadow-md transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {lead.name}
                          </h4>
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">
                            {lead.company}
                          </span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                          {lead.source}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">Assigned: {lead.assignedUser}</span>
                        </div>
                        {lead.nextFollowUp && (
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>Follow-up: {lead.nextFollowUp}</span>
                          </div>
                        )}
                      </div>

                      {/* Value & Actions */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-400">
                          ₹{lead.estimatedValue.toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Quick Convert / Next Stage */}
                          {lead.status !== 'Won' && (
                            <button
                              onClick={() => {
                                const nextMap: Record<LeadStatus, LeadStatus> = {
                                  New: 'Contacted',
                                  Contacted: 'Interested',
                                  Interested: 'Won',
                                  Won: 'Won',
                                  Lost: 'New'
                                };
                                handleStageChange(lead.id, nextMap[lead.status]);
                              }}
                              className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1"
                              title="Advance to Next Stage"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => handleEditClick(lead)}
                            className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(lead.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-600 italic">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-3">Lead Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Assigned User</th>
                <th className="px-4 py-3">Est. Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLeads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {l.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {l.company}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{l.phone}</div>
                    <div className="text-[10px] text-slate-400">{l.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-400">
                      {l.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                    {l.assignedUser}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-400 font-mono">
                    ₹{l.estimatedValue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stageConfig[l.status]?.bg} ${stageConfig[l.status]?.color}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {l.status !== 'Won' && (
                        <button
                          onClick={() => handleStageChange(l.id, 'Won')}
                          className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold border border-emerald-500/30"
                          title="Convert to Won Deal"
                        >
                          Convert
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(l)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(l.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Lead Modal */}
      {isEditing && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b1023] border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Lead Details</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lead Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company</label>
                  <input
                    type="text"
                    required
                    value={editFormData.company || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Stage</label>
                  <select
                    value={editFormData.status || 'New'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as LeadStatus })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Source</label>
                  <select
                    value={editFormData.source || 'Website'}
                    onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Est. Value (₹)</label>
                  <input
                    type="number"
                    value={editFormData.estimatedValue || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, estimatedValue: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assigned Staff</label>
                  <select
                    value={editFormData.assignedUser || 'Rahul Verma'}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedUser: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={editFormData.nextFollowUp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nextFollowUp: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400"
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Lead</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Are you sure you want to remove this lead from the pipeline?
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
