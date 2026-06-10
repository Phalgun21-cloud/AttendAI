'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Shield, User as UserIcon, BookOpen, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState('superadmin@attendai.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-400 font-mono">Initializing AttendAI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-[#09090b]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/15 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            ATTENDAI MVP V1.0
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AttendAI</h1>
          <p className="text-zinc-400 mt-2 text-sm font-light">
            Every Absence Triggers Action.
          </p>
        </div>

        {/* Form Container */}
        <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fields */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-light"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 hover:text-emerald-400 transition-all font-light"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-light"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-zinc-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Activity className="h-4 w-4 animate-spin text-zinc-900" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Setup Hint */}
          <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-500 leading-normal">
              For evaluation: official demo account is pre-populated. Run <span className="font-mono text-emerald-400">/api/seed</span> in browser first if database is empty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
