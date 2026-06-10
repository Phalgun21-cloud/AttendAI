'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-[#09090b]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] z-10">
        <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all font-mono uppercase tracking-wider mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">Reset Password</h2>
                <p className="text-zinc-400 text-sm mt-1 font-light">
                  We'll send you link instructions to reset your password.
                </p>
              </div>

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

              <button
                type="submit"
                className="w-full bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4 text-zinc-900" />
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Check your email</h2>
                <p className="text-zinc-400 text-sm mt-2 font-light leading-relaxed">
                  We sent a simulated recovery link to <span className="font-mono text-zinc-200">{email}</span>. Click the link inside the email to configure your credentials.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-block w-full bg-zinc-800 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-zinc-750 transition-all"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
