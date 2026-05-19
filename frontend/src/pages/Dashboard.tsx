import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, CheckCircle, TrendingUp } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { IApiResponse, ILead } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, qualified: 0, won: 0, conversion: 0 });
  const [recentLeads, setRecentLeads] = useState<ILead[]>([]);
  const [chartData, setChartData] = useState<{name: string, count: number, fill: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get<IApiResponse<ILead[]>>('/leads?limit=50&sortBy=latest');
        const leads = data.data || [];
        
        const total = leads.length;
        const newCount = leads.filter(l => l.status === 'New').length;
        const contacted = leads.filter(l => l.status === 'Contacted').length;
        const qualified = leads.filter(l => l.status === 'Qualified').length;
        const lost = leads.filter(l => l.status === 'Lost').length;
        const won = contacted; // Using Contacted as 'Active Contacts'
        
        setStats({
          total: data.meta?.total || total,
          qualified,
          won,
          conversion: total > 0 ? Math.round((qualified / total) * 100) : 0
        });

        setRecentLeads(leads.slice(0, 5));
        setChartData([
          { name: 'New', count: newCount, fill: '#3b82f6' }, // blue
          { name: 'Contacted', count: contacted, fill: '#f59e0b' }, // amber
          { name: 'Qualified', count: qualified, fill: '#10b981' }, // emerald
          { name: 'Lost', count: lost, fill: '#ef4444' } // red
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Leads', value: stats.total, icon: Users, color: 'text-blue-500', gradient: 'from-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:to-blue-600/10' },
    { title: 'Qualified Leads', value: stats.qualified, icon: Target, color: 'text-brand-500', gradient: 'from-brand-500/20 to-brand-600/20 dark:from-brand-500/10 dark:to-brand-600/10' },
    { title: 'Active Contacts', value: stats.won, icon: CheckCircle, color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-emerald-600/20 dark:from-emerald-500/10 dark:to-emerald-600/10' },
    { title: 'Conversion Rate', value: `${stats.conversion}%`, icon: TrendingUp, color: 'text-amber-500', gradient: 'from-amber-500/20 to-amber-600/20 dark:from-amber-500/10 dark:to-amber-600/10' },
  ];

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your leads today.
          </p>
        </motion.div>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={isLoading ? '...' : stat.value as any}
            icon={stat.icon}
            color={stat.color}
            gradient={stat.gradient}
            delay={i * 0.1}
          />
        ))}
      </div>

      {/* charts and activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6 h-[400px] flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pipeline Distribution</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current status of all leads</p>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            {isLoading ? (
               <div className="w-full h-full animate-pulse bg-gray-100 dark:bg-surface-850 rounded-xl" />
            ) : chartData.every(d => d.count === 0) ? (
               <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-surface-800 rounded-xl">
                 <p className="text-sm text-gray-500">No leads to display</p>
               </div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-colors-gray-200)" opacity={0.1} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                   <Tooltip 
                     cursor={{ fill: 'transparent' }}
                     contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                     itemStyle={{ color: '#fff', fontWeight: 600 }}
                   />
                   <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card p-6 h-[400px] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Latest pipeline additions</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
             {isLoading ? (
               [...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-surface-850 rounded-xl animate-pulse" />)
             ) : recentLeads.length === 0 ? (
               <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-surface-800 rounded-xl">
                 <p className="text-sm text-gray-500">No recent activity</p>
               </div>
             ) : (
               recentLeads.map((lead, i) => {
                 const colors: Record<string, string> = {
                    New: 'bg-blue-500/10 text-blue-500',
                    Contacted: 'bg-amber-500/10 text-amber-500',
                    Qualified: 'bg-emerald-500/10 text-emerald-500',
                    Lost: 'bg-red-500/10 text-red-500'
                 };
                 return (
                   <motion.div 
                     key={lead.id}
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                     className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-850 transition-colors cursor-default border border-transparent dark:hover:border-surface-800"
                   >
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colors[lead.status] || 'bg-gray-100 text-gray-500'}`}>
                       {lead.name.charAt(0).toUpperCase()}
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lead.name}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Added to <span className="font-medium text-gray-700 dark:text-gray-300">{lead.status}</span></p>
                     </div>
                     <span className="text-[10px] text-gray-400 font-medium flex-shrink-0 bg-gray-100 dark:bg-surface-800 px-2 py-1 rounded-md">
                       {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                   </motion.div>
                 );
               })
             )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
