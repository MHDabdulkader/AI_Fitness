'use client';

import React, { useState } from 'react';
import { Flame, Zap, Info } from 'lucide-react';

interface Props {
  proteinG: number;
  carbsG: number;
  fatG: number;
  totalCalories: number;
  title?: string;
  subtitle?: string;
}

export default function MacroPieChart({
  proteinG,
  carbsG,
  fatG,
  totalCalories,
  title = "Macro Energy Distribution",
  subtitle = "Caloric ratio derived from scientific macronutrient breakdown"
}: Props) {
  const [hoveredMacro, setHoveredMacro] = useState<string | null>(null);

  // Energy in kcal from each macro
  const pCals = Math.round(proteinG * 4);
  const cCals = Math.round(carbsG * 4);
  const fCals = Math.round(fatG * 9);
  const calculatedTotal = pCals + cCals + fCals || totalCalories || 2000;

  const pPct = Math.round((pCals / calculatedTotal) * 100);
  const cPct = Math.round((cCals / calculatedTotal) * 100);
  const fPct = Math.max(0, 100 - pPct - cPct); // ensures exact 100%

  // SVG Donut calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.25

  const pDash = (pPct / 100) * circumference;
  const cDash = (cPct / 100) * circumference;
  const fDash = (fPct / 100) * circumference;

  const pOffset = 0;
  const cOffset = -pDash;
  const fOffset = -(pDash + cDash);

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center sm:text-left mb-6">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Zap className="w-3.5 h-3.5" />
          <span>Interactive Energy Chart</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* SVG Donut / Pie Chart */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 180 180"
            >
              {/* Background Track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-slate-900"
                strokeWidth="20"
                fill="none"
              />

              {/* Protein Arc (Sky Blue) */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-sky-400 transition-all duration-700 ease-out cursor-pointer hover:stroke-sky-300"
                strokeWidth={hoveredMacro === 'protein' ? '24' : '20'}
                strokeDasharray={`${pDash} ${circumference}`}
                strokeDashoffset={pOffset}
                fill="none"
                strokeLinecap="round"
                onMouseEnter={() => setHoveredMacro('protein')}
                onMouseLeave={() => setHoveredMacro(null)}
              />

              {/* Carbs Arc (Amber Gold) */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-amber-400 transition-all duration-700 ease-out cursor-pointer hover:stroke-amber-300"
                strokeWidth={hoveredMacro === 'carbs' ? '24' : '20'}
                strokeDasharray={`${cDash} ${circumference}`}
                strokeDashoffset={cOffset}
                fill="none"
                strokeLinecap="round"
                onMouseEnter={() => setHoveredMacro('carbs')}
                onMouseLeave={() => setHoveredMacro(null)}
              />

              {/* Fats Arc (Emerald Green) */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-emerald-400 transition-all duration-700 ease-out cursor-pointer hover:stroke-emerald-300"
                strokeWidth={hoveredMacro === 'fat' ? '24' : '20'}
                strokeDasharray={`${fDash} ${circumference}`}
                strokeDashoffset={fOffset}
                fill="none"
                strokeLinecap="round"
                onMouseEnter={() => setHoveredMacro('fat')}
                onMouseLeave={() => setHoveredMacro(null)}
              />
            </svg>

            {/* Donut Center Display */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
                <Flame className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-3xl font-black text-white tracking-tight">
                {totalCalories.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                KCAL ENERGY
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Hover over slices to see macro energy</span>
          </div>
        </div>

        {/* Legend & Energy Stats */}
        <div className="md:col-span-6 space-y-3.5">
          {/* Protein Energy Card */}
          <div
            onMouseEnter={() => setHoveredMacro('protein')}
            onMouseLeave={() => setHoveredMacro(null)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hoveredMacro === 'protein'
                ? 'bg-sky-500/20 border-sky-400 scale-102 shadow-lg shadow-sky-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-md shadow-sky-400/40" />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Protein Energy</span>
                    <span className="text-[11px] text-sky-400">({proteinG}g)</span>
                  </span>
                  <div className="text-[11px] text-slate-400">Muscle synthesis &amp; recovery</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-sky-400">{pCals} kcal</div>
                <div className="text-[10px] font-bold text-slate-400">{pPct}% of energy</div>
              </div>
            </div>
          </div>

          {/* Carbs Energy Card */}
          <div
            onMouseEnter={() => setHoveredMacro('carbs')}
            onMouseLeave={() => setHoveredMacro(null)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hoveredMacro === 'carbs'
                ? 'bg-amber-500/20 border-amber-400 scale-102 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/40" />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Carbohydrate Fuel</span>
                    <span className="text-[11px] text-amber-400">({carbsG}g)</span>
                  </span>
                  <div className="text-[11px] text-slate-400">Workout glycogen &amp; brain energy</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-amber-400">{cCals} kcal</div>
                <div className="text-[10px] font-bold text-slate-400">{cPct}% of energy</div>
              </div>
            </div>
          </div>

          {/* Fat Energy Card */}
          <div
            onMouseEnter={() => setHoveredMacro('fat')}
            onMouseLeave={() => setHoveredMacro(null)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hoveredMacro === 'fat'
                ? 'bg-emerald-500/20 border-emerald-400 scale-102 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/40" />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Healthy Fats</span>
                    <span className="text-[11px] text-emerald-400">({fatG}g)</span>
                  </span>
                  <div className="text-[11px] text-slate-400">Hormonal balance &amp; satiety</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-emerald-400">{fCals} kcal</div>
                <div className="text-[10px] font-bold text-slate-400">{fPct}% of energy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
