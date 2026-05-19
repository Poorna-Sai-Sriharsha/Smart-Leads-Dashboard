import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { IPaginationMeta } from '../types';

interface PaginationProps {
  meta: IPaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { page, totalPages, hasNextPage, hasPrevPage } = meta;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-surface-800 bg-gray-50/50 dark:bg-surface-850/50 rounded-b-2xl">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{(page - 1) * meta.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * meta.limit, meta.total)}
            </span>{' '}
            of <span className="font-medium">{meta.total}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrevPage}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {getPageNumbers().map((p, i) => (
              p === '...' ? (
                <span
                  key={`dots-${i}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                    ${p === page
                      ? 'z-10 bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-400'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-surface-800 dark:border-surface-700 dark:text-gray-400 dark:hover:bg-surface-850'
                    }`}
                >
                  {p}
                </button>
              )
            ))}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
