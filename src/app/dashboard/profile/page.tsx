'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Mail, Key, User, Calendar, Award } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Profile</h1>
        <p className="text-zinc-400 mt-1 font-light text-sm">
          Manage your account preferences and view your authorization credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details Card */}
        <div className="lg:col-span-2 border border-zinc-800 bg-zinc-900/20 rounded-xl p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl select-none">
                {session?.user?.name ? session.user.name.charAt(0) : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">{session?.user?.name || 'Account User'}</h2>
              </div>
            </div>
          </div>

          <hr className="border-zinc-800" />

          {/* Form Rows */}
          <div className="space-y-4 font-light text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1 items-center">
              <span className="text-zinc-500 font-mono uppercase text-xs">User ID</span>
              <span className="md:col-span-2 text-zinc-900 font-mono select-all text-xs bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-850 truncate max-w-full inline-block">
                {(session?.user as any)?.id || 'undefined_id'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1 items-center">
              <span className="text-zinc-500 font-mono uppercase text-xs">Email Address</span>
              <div className="md:col-span-2 flex items-center gap-2 text-zinc-900">
                <Mail className="h-4 w-4 text-zinc-500" />
                <span>{session?.user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / System Card */}
        <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl p-8 space-y-6">
          <h3 className="text-sm font-semibold text-zinc-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Security & Controls
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            Accounts are managed by the database seed environment. In production, password updates are dispatched to verified parent phone numbers and admin email servers.
          </p>

          <hr className="border-zinc-800" />

          <div className="space-y-3">
            <button
              disabled
              className="w-full bg-zinc-800/50 text-zinc-500 border border-zinc-850 font-medium text-xs py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Key className="h-3.5 w-3.5" />
              Change Password
            </button>
            <p className="text-[10px] text-zinc-600 text-center leading-normal">
              Password configurations are locked in evaluation mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
