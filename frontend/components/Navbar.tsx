'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Sparkles, LayoutDashboard } from 'lucide-react';

export default function Navbar({ onStartTrial }: { onStartTrial: () => void }) {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              NutriFit<span className="text-emerald-400">.AI</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              FREE GUEST MODE
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-300">
          <a href="#calculator" className="hover:text-emerald-400 transition-colors">
            Macro Calculator
          </a>
          <a href="#fast-food" className="hover:text-emerald-400 transition-colors">
            Fast Food Optimizer
          </a>
          <a href="#meal-plan" className="hover:text-emerald-400 transition-colors">
            AI Meal Planner
          </a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">
            Free Trials &amp; Plans
          </a>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-xs font-semibold"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pro Dashboard</span>
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onStartTrial}
            className="flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Start 7-Day Free Trial</span>
          </button>
        </div>
      </div>
    </header>
  );
}
