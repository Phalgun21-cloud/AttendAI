'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export default function AutomationEngine() {
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Initial check
    runCron();

    // Check every 60 seconds
    const interval = setInterval(() => {
      runCron();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const runCron = async () => {
    try {
      const res = await fetch('/api/cron/absentees');
      const data = await res.json();
      if (data.success) {
        setLastCheck(new Date());
        if (data.absenteesMarked > 0) {
          console.log(`[Automation Engine] Checked ${data.batchesProcessed} batches. Marked ${data.absenteesMarked} absentees and dispatched AI calls.`);
        }
      }
    } catch (err) {
      console.error('[Automation Engine] Failed to run cron:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg z-50 pointer-events-none">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </div>
      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
        <Activity className="w-3 h-3 text-emerald-500" />
        Automation Active
      </span>
    </div>
  );
}
