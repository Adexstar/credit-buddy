'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Sidebar } from '@/components/common/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/apps': 'Connected Apps',
    '/credits': 'Credits',
    '/settings': 'Settings',
  };

  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition relative">
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user?.planType === 'premium' ? 'Premium' : 'Free Plan'}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}