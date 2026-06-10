import Link from 'next/link';
import { Shield, Users, QrCode, PhoneCall, BarChart3, ChevronRight, Activity, ArrowRight, Bot } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#09090b] selection:bg-emerald-500/30 text-white overflow-hidden relative font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-lg tracking-tighter shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              A
            </div>
            <span className="font-bold tracking-wide text-lg">Attendee</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link 
                href="/dashboard"
                className="text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                href="/login"
                className="text-sm font-medium bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded-full transition-all flex items-center gap-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium mb-8 uppercase tracking-widest backdrop-blur-sm">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Next-Gen Institute Management
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Perfect Attendance. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Zero Effort.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-light mb-12 leading-relaxed">
            Automate tracking, manage batches, and deploy AI voice agents to notify parents instantly. Attendee is the all-in-one operating system for modern educational institutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={session ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </Link>
            <a 
              href="#modules"
              className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900/50 border border-zinc-800 text-white font-medium rounded-full hover:bg-zinc-800 transition-all flex items-center justify-center backdrop-blur-sm"
            >
              Explore Modules
            </a>
          </div>
        </section>

        {/* Modules Section */}
        <section id="modules" className="py-24 border-t border-white/5 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need. <span className="text-zinc-500">All in one place.</span></h2>
              <p className="text-zinc-400 font-light">A comprehensive suite of modules designed to streamline institute operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Module 1 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Users className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Student Directory</h3>
                <p className="text-zinc-400 font-light text-sm leading-relaxed">
                  Manage comprehensive student profiles, parent contact details, and course enrollments in a centralized, secure database.
                </p>
              </div>

              {/* Module 2 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Batch Management</h3>
                <p className="text-zinc-400 font-light text-sm leading-relaxed">
                  Organize students into academic batches. Set specific time slots, associate courses, and track performance on a per-batch basis.
                </p>
              </div>

              {/* Module 3 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <QrCode className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">QR ID Cards</h3>
                <p className="text-zinc-400 font-light text-sm leading-relaxed">
                  Automatically generate scannable QR code ID cards for every registered student for frictionless daily attendance logging.
                </p>
              </div>

              {/* Module 4 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-orange-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(249,115,22,0.1)] relative overflow-hidden lg:col-span-2">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <PhoneCall className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">AI Voice Call Center</h3>
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] uppercase font-bold rounded">Game Changer</span>
                    </div>
                    <p className="text-zinc-400 font-light text-sm leading-relaxed mb-4 max-w-xl">
                      Stop dialing manually. Our AI system detects absentees and automatically initiates human-like voice calls to parents, providing natural conversational updates and logging transcripts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Module 5 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Analytics & Reports</h3>
                <p className="text-zinc-400 font-light text-sm leading-relaxed">
                  Gain visual insights into daily attendance rates, batch performance, and absentee trends with real-time graphs and downloadable reports.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/20" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <Bot className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to upgrade your institute?</h2>
            <p className="text-zinc-300 mb-10 font-light text-lg">
              Join the future of education management. Ditch the spreadsheets and let AI handle the repetitive tasks.
            </p>
            <Link 
              href={session ? "/dashboard" : "/login"}
              className="inline-flex px-8 py-4 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105"
            >
              Access the Platform <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-extrabold text-xs tracking-tighter">
              A
            </div>
            <span className="font-bold text-sm">Attendee</span>
          </div>
          <p className="text-zinc-500 text-sm font-light">
            &copy; {new Date().getFullYear()} Attendee MVP. Powered by advanced agentic AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
