import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Globe, Calendar, User as UserIcon } from 'lucide-react';
import { ILead } from '../types';
import { statusColors, sourceColors } from '../utils/helpers';

interface LeadDetailModalProps {
  lead: ILead | null;
  isOpen: boolean;
  onClose: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose }) => {
  if (!lead) return null;

  const statusConfig = statusColors[lead.status];
  const sourceConfig = sourceColors[lead.source];
  const assignee = typeof lead.assignedTo === 'object' ? lead.assignedTo : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-surface-800 bg-gray-50/50 dark:bg-surface-850/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Details</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-surface-800 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Lead Identity */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{lead.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-surface-850 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</p>
                  <span className={`badge ${statusConfig.bg} ${statusConfig.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot}`} />
                    {lead.status}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-surface-850 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Source</p>
                  <span className={`badge ${sourceConfig.bg} ${sourceConfig.text}`}>
                    <Globe className="w-3 h-3 mr-1.5" />
                    {lead.source}
                  </span>
                </div>
              </div>

              {/* Assigned To */}
              <div className="bg-gray-50 dark:bg-surface-850 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Assigned To</p>
                {assignee ? (
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{assignee.name}</span>
                    <span className="text-gray-400">({assignee.email})</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Unassigned</p>
                )}
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Added on {new Date(lead.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-surface-800 bg-gray-50/50 dark:bg-surface-850/50 flex justify-end">
              <button onClick={onClose} className="btn-secondary text-sm">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LeadDetailModal;
