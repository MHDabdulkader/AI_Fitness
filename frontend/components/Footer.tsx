'use client';

import React from 'react';
import { Flame, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">NutriFit.AI</div>
            <div className="text-[11px] text-slate-500">Junior AI Engineer Portfolio Project</div>
          </div>
        </div>

        {/* Dataset Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>McDonald&apos;s Menu Dataset</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Starbucks Menu Dataset</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Food Facts</span>
          </span>
        </div>

        <div className="text-slate-500 text-center md:text-right">
          Next.js 14 &bull; Django REST Framework &bull; Google Gemini &bull; Stripe Billing
        </div>
      </div>
    </footer>
  );
}
