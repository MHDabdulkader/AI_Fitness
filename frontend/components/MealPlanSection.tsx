'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Lock, RefreshCw, ArrowRight, Flame } from 'lucide-react';
import { getPublicSamplePlan, MealPlanData, MacroResult } from '@/lib/api';

interface Props {
  macros: MacroResult | null;
  goal: string;
  onStartTrial: () => void;
}

export default function MealPlanSection({ macros, goal, onStartTrial }: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [planData, setPlanData] = useState<MealPlanData | null>(null);

  const fetchMealPlan = async () => {
    if (!macros) return;
    setLoading(true);
    try {
      const res = await getPublicSamplePlan({
        target_calories: macros.target_calories,
        target_protein_g: macros.target_protein_g,
        target_carbs_g: macros.target_carbs_g,
        target_fat_g: macros.target_fat_g,
        goal: goal,
      });
      setPlanData(res.plan);
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (macros) {
      fetchMealPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [macros?.target_calories, goal]);

  const getMealImage = (mealName: string) => {
    const nameLower = mealName.toLowerCase();
    if (nameLower.includes('breakfast')) {
      return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80';
    }
    if (nameLower.includes('lunch')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
    }
    if (nameLower.includes('dinner')) {
      return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80';
  };

  return (
    <section id="meal-plan" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI AGENT &amp; RAG ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Personalized Daily Food Plan
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Crafted to match your exact {macros?.target_calories ?? 2000} kcal target using clean whole foods, lean proteins, and balanced micronutrients.
        </p>
      </div>

      {/* 7-Day Tabs */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4 mb-8">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const isDay1 = day === 1;
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => {
                if (isDay1) {
                  setSelectedDay(1);
                } else {
                  onStartTrial();
                }
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDay1 && isActive
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : !isDay1
                  ? 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <span>Day {day}</span>
              {isDay1 ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-normal">
                  Free
                </span>
              ) : (
                <Lock className="w-3 h-3 text-amber-500/80" />
              )}
            </button>
          );
        })}
      </div>

      {/* Plan Body */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Synthesizing balanced meals with nutrition RAG...</span>
        </div>
      ) : planData ? (
        <div className="space-y-6">
          {/* Day 1 Macro Summary Banner */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/20">
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Day 1 Plan Summary</div>
              <div className="text-sm text-slate-200 mt-0.5">
                Target: <span className="text-white font-bold">{macros?.target_calories} kcal</span> | Generated:{' '}
                <span className="text-emerald-400 font-bold">{planData.total_calories} kcal</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-sky-400">{planData.total_protein_g}g Protein</span>
              <span className="text-amber-400">{planData.total_carbs_g}g Carbs</span>
              <span className="text-emerald-400">{planData.total_fat_g}g Fat</span>
              <button
                onClick={fetchMealPlan}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Regenerate Meal Plan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meals Grid with Visual Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planData.meals.map((meal, idx) => (
              <div
                key={idx}
                className="glass-card rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all overflow-hidden group"
              >
                <div>
                  {/* Photo header */}
                  <div className="relative h-36 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMealImage(meal.meal_name)}
                      alt={meal.meal_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-slate-950 font-black text-xs shadow-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{meal.calories} kcal</span>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{meal.meal_name}</h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    {meal.notes && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">&quot;{meal.notes}&quot;</p>
                    )}
                    {/* Items */}
                    <div className="space-y-1.5">
                      {meal.items.map((item, i) => (
                        <div key={i} className="text-xs bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between">
                          <div className="truncate mr-2">
                            <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-400">{item.serving_size || item.brand}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-black text-white">{item.calories} kcal</div>
                            <div className="text-[10px] text-sky-400 font-semibold">{item.protein_g}g P</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2.5 border-t border-slate-800/80 flex justify-between text-[11px] font-semibold text-slate-400">
                  <span className="text-sky-400">P: {meal.protein_g}g</span>
                  <span className="text-amber-400">C: {meal.carbs_g}g</span>
                  <span className="text-emerald-400">F: {meal.fat_g}g</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trial Upsell Card for Days 2-7 */}
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Unlock Days 2–7 &amp; Conversational Meal Swapping
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  Get full 7-day rolling plans, automated grocery shopping lists, and live chat to swap ingredients or request restaurant substitutions.
                </p>
              </div>
            </div>
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 flex-shrink-0"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
