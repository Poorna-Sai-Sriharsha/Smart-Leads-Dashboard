import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // track screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col md:flex-row transition-colors duration-300">
      {/* mobile top bar */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 glass-card-solid sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              SmartLeads
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-gray-100 dark:bg-surface-800 rounded-lg text-gray-600 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      )}

      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        isMobile={isMobile}
      />
      
      <main
        className="flex-1 transition-all duration-300 w-full"
        style={{ paddingLeft: isMobile ? '0px' : (sidebarCollapsed ? '80px' : '260px') }}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {isMobile && <div className="h-4" />}
          <Outlet />
        </div>
      </main>

      {/* backdrop overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
