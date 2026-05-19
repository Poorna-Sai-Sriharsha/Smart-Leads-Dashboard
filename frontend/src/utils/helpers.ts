import { ILead, LeadStatus, LeadSource } from '../types';

export const exportToCSV = (leads: ILead[], filename?: string): void => {
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];

  const rows = leads.map((lead) => [
    `"${lead.name}"`,
    `"${lead.email}"`,
    lead.status,
    lead.source,
    new Date(lead.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `leads_export_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Status color mapping
export const statusColors: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  New: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  Contacted: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  Qualified: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Lost: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

// Source color mapping
export const sourceColors: Record<LeadSource, { bg: string; text: string }> = {
  Website: { bg: 'bg-sky-500/10 dark:bg-sky-500/20', text: 'text-sky-700 dark:text-sky-300' },
  Instagram: { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-700 dark:text-pink-300' },
  Referral: { bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-700 dark:text-violet-300' },
};
