import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Download, Trash2, Edit2 } from 'lucide-react';
import api from '../api/axios';
import { ILead, ILeadFilters, IPaginationMeta } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { statusColors, sourceColors } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import LeadForm from '../components/LeadForm';
import LeadDetailModal from '../components/LeadDetailModal';
import toast from 'react-hot-toast';

const LeadsPage: React.FC = () => {
  const { user } = useAuth();
  
  // State
  const [leads, setLeads] = useState<ILead[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Search
  const [filters, setFilters] = useState<ILeadFilters>({
    status: '',
    source: '',
    search: '',
    sortBy: 'latest',
    page: 1,
  });
  const debouncedSearch = useDebounce(filters.search, 300);
  
  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ILead | null>(null);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);

  // Fetch leads
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),
        ...(debouncedSearch && { search: debouncedSearch }),
        sortBy: filters.sortBy,
      });

      const { data } = await api.get(`/leads?${params}`);
      const normalized = (data.data || []).map((lead: any) => ({
        ...lead,
        id: lead.id || lead._id,
      }));
      setLeads(normalized);
      setMeta(data.meta);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when filters (except search string) or debouncedSearch changes
  useEffect(() => {
    fetchLeads();
  }, [filters.page, filters.status, filters.source, filters.sortBy, debouncedSearch]);

  // Handlers
  const handleFilterChange = (key: keyof ILeadFilters, value: any) => {
    setFilters((prev) => ({ 
      ...prev, 
      [key]: value, 
      ...(key !== 'page' ? { page: 1 } : {}) 
    }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      
      const { data } = await api.get(`/leads/export/csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleSaveLead = async (leadData: Partial<ILead>) => {
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead.id}`, leadData);
        toast.success('Lead updated');
      } else {
        await api.post('/leads', leadData);
        toast.success('Lead created');
      }
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
      throw err;
    }
  };

  const openForm = (lead?: ILead) => {
    setEditingLead(lead || null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track your prospective clients.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card-solid p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="input-field py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={filters.source}
          onChange={(e) => handleFilterChange('source', e.target.value)}
          className="input-field py-2 text-sm"
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Instagram">Instagram</option>
          <option value="Referral">Referral</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="input-field py-2 text-sm"
        >
          <option value="latest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Data View */}
      <div className="glass-card-solid overflow-hidden flex flex-col">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 dark:bg-surface-850 border-b border-gray-200 dark:border-surface-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Lead</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Source</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Assigned To</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Added</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 dark:divide-surface-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6">
                    <SkeletonLoader rows={5} />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState 
                      action={<button onClick={() => openForm()} className="btn-primary">Create First Lead</button>}
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {leads.map((lead, i) => {
                    const statusConfig = statusColors[lead.status];
                    const sourceConfig = sourceColors[lead.source];
                    const assignee = typeof lead.assignedTo === 'object' ? lead.assignedTo : null;

                    return (
                      <motion.tr 
                        key={lead.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-gray-50/50 dark:hover:bg-surface-850/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-sm">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p
                                onClick={() => setSelectedLead(lead)}
                                className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              >
                                {lead.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${statusConfig.bg} ${statusConfig.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot}`} />
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${sourceConfig.bg} ${sourceConfig.text}`}>
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openForm(lead)}
                              className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user?.role === 'admin' && (
                              <button 
                                onClick={() => handleDelete(lead.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-surface-800">
          {isLoading ? (
            <div className="p-4"><SkeletonLoader rows={4} /></div>
          ) : leads.length === 0 ? (
             <EmptyState action={<button onClick={() => openForm()} className="btn-primary">Create First Lead</button>} />
          ) : (
            <AnimatePresence mode="popLayout">
              {leads.map((lead, i) => {
                const statusConfig = statusColors[lead.status];
                const sourceConfig = sourceColors[lead.source];
                
                return (
                  <motion.div 
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 dark:hover:bg-surface-850/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            onClick={() => setSelectedLead(lead)}
                            className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                          >
                            {lead.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openForm(lead)} className="p-1.5 text-gray-400 hover:text-brand-500 bg-gray-50 dark:bg-surface-800 rounded-md">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-surface-800 rounded-md">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`badge text-[10px] ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`} />
                        {lead.status}
                      </span>
                      <span className={`badge text-[10px] ${sourceConfig.bg} ${sourceConfig.text}`}>
                        {lead.source}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && meta && meta.totalPages > 1 && (
          <Pagination meta={meta} onPageChange={(p) => handleFilterChange('page', p)} />
        )}
      </div>

      {/* Form Modal */}
      <LeadForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingLead}
        onSubmit={handleSaveLead}
      />

      {/* Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
};

export default LeadsPage;
