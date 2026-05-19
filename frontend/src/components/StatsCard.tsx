import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  gradient: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card-solid p-6 group cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <motion.p
            className="text-3xl font-bold text-gray-900 dark:text-white mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: delay + 0.3 }}
          >
            {value}
          </motion.p>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {/* Decorative bar */}
      <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-surface-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(100, Math.max(10, value * 3))}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
          className={`h-full rounded-full ${gradient}`}
        />
      </div>
    </motion.div>
  );
};

export default StatsCard;
