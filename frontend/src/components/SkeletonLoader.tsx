import React from 'react';

const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 animate-fade-in">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="glass-card-solid p-4 flex items-center gap-4"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-surface-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/50 dark:via-surface-850/50 to-transparent animate-shimmer" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-surface-800 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/50 dark:via-surface-850/50 to-transparent animate-shimmer" />
            </div>
            <div className="h-3 w-1/2 bg-gray-100 dark:bg-surface-850 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 dark:via-surface-800/50 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 dark:bg-surface-800 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/50 dark:via-surface-850/50 to-transparent animate-shimmer" />
            </div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-surface-800 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/50 dark:via-surface-850/50 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
