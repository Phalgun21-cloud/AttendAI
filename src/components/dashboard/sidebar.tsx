'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Users, 
  Barcode, 
  Cpu, 
  PhoneCall, 
  FileBarChart, 
  User, 
  LogOut,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Student Directory', href: '/dashboard/students', icon: Users },
    { name: 'Batch Directory', href: '/dashboard/batches', icon: Layers },
    { name: 'Barcode ID Card Gen', href: '/dashboard/qr-generator', icon: Barcode },
    { name: 'Simulators', href: '/dashboard/simulator', icon: Cpu },
    { name: 'AI Call Center', href: '/dashboard/calling', icon: PhoneCall },
    { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-lg tracking-tighter">
            A
          </div>
          <div>
            <span className="font-bold text-white tracking-wide text-base">AttendAI</span>
            <span className="block text-[9px] font-mono text-emerald-400 uppercase tracking-widest leading-none mt-0.5">
              MVP V1.0
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white font-medium border border-zinc-850'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-3">
        {session?.user && (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm select-none shrink-0">
              {session.user.name ? session.user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {session.user.name}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 py-2 border border-zinc-800 hover:border-red-500/30 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer font-medium"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
