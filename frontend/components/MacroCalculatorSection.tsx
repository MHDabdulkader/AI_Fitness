'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Dumbbell, TrendingDown, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { calculateMacros, MacroResult } from '@/lib/api';
import MacroPieChart from '@/components/MacroPieChart';

interface Props {
  onMacrosCalculated: (macros: MacroResult, goal: string) => void;
}

export default function MacroCalculatorSection({ onMacrosCalculated }: Props) {
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('lose_weight');
  const [results, setResults] = useState<MacroResult | null>(null);

  const performCalculation = async () => {
    try {
      const data = await calculateMacros({
        age,
        gender,
        height_cm: heightCm,
        weight_kg: weightKg,
        activity_level: activity,
        fitness_goal: goal,
      });
      setResults(data);
      onMacrosCalculated(data, goal);
    } catch {
      const isFemale = gender === 'female';
      const bmr = isFemale
        ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
        : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
      const mult = activity === 'sedentary' ? 1.2 : activity === 'light' ? 1.375 : 1.55;
      const tdee = bmr * mult;
      const targetCals = goal === 'lose_weight' ? tdee * 0.8 : goal === 'gain_weight' ? tdee * 1.12 : tdee;
      const pG = weightKg * 2.0;
      const fG = (targetCals * 0.25) / 9;
      const cG = (targetCals - pG * 4 - fG * 9) / 4;

      const fallback: MacroResult = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        target_calories: Math.round(targetCals),
        target_protein_g: Math.round(pG),
        target_carbs_g: Math.round(cG),
        target_fat_g: Math.round(fG),
        percentages: {
          protein: Math.round((pG * 4 / targetCals) * 100),
          carbs: Math.round((cG * 4 / targetCals) * 100),
          fat: Math.round((fG * 9 / targetCals) * 100),
        },
      };
      setResults(fallback);
      onMacrosCalculated(fallback, goal);
    }
  };

  useEffect(() => {
    performCalculation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age, gender, heightCm, weightKg, activity, goal]);

  return (
    <section id="calculator" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Activity className="w-3.5 h-3.5" />
          <span>FREE PUBLIC TOOL — NO LOGIN REQUIRED</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Precision Macro &amp; TDEE Calculator
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Calculates your exact metabolic rate using the clinical Mifflin-St Jeor formula and visualizes your caloric energy split.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Controls */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Your Body Metrics</span>
            </h3>
            <span className="text-xs text-slate-400">Updates dynamically</span>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Primary Fitness Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lose_weight', label: 'Lose Fat', icon: TrendingDown },
                { id: 'maintain', label: 'Maintain', icon: Dumbbell },
                { id: 'gain_weight', label: 'Lean Bulk', icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                const active = goal === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age ({age} yrs)</label>
              <input
                type="range"
                min="16"
                max="80"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Height: <span className="text-emerald-400 font-bold">{heightCm} cm</span>
              </label>
              <input
                type="range"
                min="130"
                max="220"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Weight: <span className="text-emerald-400 font-bold">{weightKg} kg</span>
              </label>
              <input
                type="range"
                min="40"
                max="160"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Multiplier</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="sedentary">Sedentary (Desk job, little to no workout)</option>
              <option value="light">Lightly Active (1-3 gym days/week)</option>
              <option value="moderate">Moderately Active (3-5 training sessions/week)</option>
              <option value="very">Very Active (6-7 intense training sessions/week)</option>
              <option value="extra">Extra Active (Labor job + double workouts)</option>
            </select>
          </div>
        </div>

        {/* Results Card with Pie Chart Visualization */}
        <div className="lg:col-span-7 space-y-6">
          {results && (
            <div className="space-y-6">
              {/* Macro Pie Chart Component */}
              <MacroPieChart
                proteinG={results.target_protein_g}
                carbsG={results.target_carbs_g}
                fatG={results.target_fat_g}
                totalCalories={results.target_calories}
                title="Your Daily Energy &amp; Macro Distribution"
                subtitle={`Maintenance: ${results.tdee} kcal • Caloric Target: ${results.target_calories} kcal`}
              />

              {/* Action Banner */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Energy targets ready for your daily meals.</span>
                </div>
                <a
                  href="#meal-plan"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Daily Foods</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
