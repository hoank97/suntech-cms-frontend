'use client';

import React from "react"

import { Sidebar } from '@/components/admin/sidebar';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('suntech-x-atk');
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-background p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
