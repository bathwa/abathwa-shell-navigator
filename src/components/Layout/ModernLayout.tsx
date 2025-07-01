
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ModernHeader } from './ModernHeader';
import { ModernSidebar } from './ModernSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {!isMobile && (
        <div className="flex-shrink-0">
          <ModernSidebar collapsed={sidebarCollapsed} />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && !sidebarCollapsed && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarCollapsed(true)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <ModernSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <ModernHeader />
        
        {/* Mobile menu toggle */}
        {isMobile && (
          <div className="p-4 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
