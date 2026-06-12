import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Sidebar from '@/components/dashboard/sidebar';
import AutomationEngine from '@/components/dashboard/AutomationEngine';
import React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <main className="flex-1 p-8 md:p-10 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>
      
      {/* Background Automation Engine */}
      <AutomationEngine />
    </div>
  );
}
