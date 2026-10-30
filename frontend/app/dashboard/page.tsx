'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingCart, 
  Bot
} from 'lucide-react';
import { 
  get7DayMealPlan, 
  swapMealWithAI, 
  DayPlanContainer, 
  Meal 
} from '@/lib/api';
import MacroPieChart from '@/components/MacroPieChart';

export default function DashboardPage() {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(7);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [sevenDayPlans, setSevenDayPlans] = useState<DayPlanContainer[]>([]);
  
  // Custom Swap Modal State
  const [activeMealToSwap, setActiveMealToSwap] = useState<Meal | null>(null);
  const [swapInstruction, setSwapInstruction] = useState<string>('');
  const [swapLoading, setSwapLoading] = useState<boolean>(false);
  const [swapSuccessMsg, setSwapSuccessMsg] = useState<string>('');

  // Active view: 'meals' | 'pie' | 'grocery'
  const [activeTab, setActiveTab] = useState<'meals' | 'grocery'>('meals');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const days = params.get('days');
      if (days) setTrialDaysLeft(Number(days));
    }

    loadFull7DayPlan();
  }, []);

  const loadFull7DayPlan = async () => {
    setLoading(true);
    try {
      const res = await get7DayMealPlan({
        target_calories: 2200,
        target_protein_g: 165,
        target_carbs_g: 225,
        target_fat_g: 65,
        goal: 'lose_weight',
        is_trial: true,
      });
      setSevenDayPlans(res.days);
    } catch (err) {
      console.error('Failed to load 7-day plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentDayData = sevenDayPlans.find((d) => d.day === selectedDay)?.plan;

  const handleAISwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMealToSwap || !swapInstruction.trim()) return;

    setSwapLoading(true);
    try {
      const res = await swapMealWithAI({
        meal_name: activeMealToSwap.meal_name,
        calorie_target: activeMealToSwap.calories,
        protein_target: activeMealToSwap.protein_g,
        instruction: swapInstruction,
      });

      // Update state locally
      setSevenDayPlans((prev) =>
        prev.map((dayObj) => {
          if (dayObj.day !== selectedDay) return dayObj;
          const updatedMeals = dayObj.plan.meals.map((m) =>
            m.meal_name === activeMealToSwap.meal_name ? res.swapped_meal : m
          );
          const newTotalCals = updatedMeals.reduce((acc, m) => acc + m.calories, 0);
          const newTotalP = updatedMeals.reduce((acc, m) => acc + m.protein_g, 0);
          const newTotalC = updatedMeals.reduce((acc, m) => acc + m.carbs_g, 0);
          const newTotalF = updatedMeals.reduce((acc, m) => acc + m.fat_g, 0);
          return {
            ...dayObj,
            plan: {
              ...dayObj.plan,
              meals: updatedMeals,
              total_calories: Math.round(newTotalCals),
              total_protein_g: Math.round(newTotalP),
              total_carbs_g: Math.round(newTotalC),
              total_fat_g: Math.round(newTotalF),
            },
          };
        })
      );

      setSwapSuccessMsg('Meal successfully customized by AI!');
      setTimeout(() => {
        setSwapSuccessMsg('');
        setActiveMealToSwap(null);
        setSwapInstruction('');
      }, 1500);
    } catch (err) {
      console.error('Swap failed:', err);
      alert('Could not swap meal. Please try again.');
    } finally {
      setSwapLoading(false);
    }
  };

  // Helper images for meals
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

  // Compile Grocery List from all meals
  const allIngredients = sevenDayPlans.flatMap((d) =>
    d.plan.meals.flatMap((m) =>
      m.items.map((i) => `${i.name} (${i.serving_size || i.brand})`)
    )
  );
  const uniqueGroceries = Array.from(new Set(allIngredients));

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">
                NutriFit<span className="text-emerald-400">.AI Pro Dashboard</span>
              </span>
            </div>
          </div>

          {/* Trial Status Badge */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{trialDaysLeft}-Day Trial Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Trial Welcome Banner */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-teal-950/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-500/5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>FULL 7-DAY AI ACCESS UNLOCKED</span>
            </div>
            <h1 className="text-2xl font-black text-white">Your 7-Day Precision Fitness Blueprint</h1>
            <p className="text-xs text-slate-400 max-w-xl">
              All 7 days are calibrated to hit your macro deficit/surplus. Use the AI Meal Customizer on any meal to swap in McDonald&apos;s, Starbucks, or custom dietary preferences anytime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('meals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'meals'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              Meal Planner (7 Days)
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'grocery'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Grocery Checklist ({uniqueGroceries.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'meals' ? (
          <>
            {/* Day Selector Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    selectedDay === d
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 scale-102'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Day {d}</span>
                  {selectedDay === d && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                </button>
              ))}
            </div>

            {/* Macro Pie Chart for Current Selected Day */}
            {currentDayData && (
              <MacroPieChart
                proteinG={currentDayData.total_protein_g}
                carbsG={currentDayData.total_carbs_g}
                fatG={currentDayData.total_fat_g}
                totalCalories={currentDayData.total_calories}
                title={`Day ${selectedDay} Energy & Macronutrient Pie Chart`}
                subtitle={`Total Caloric Budget: ${currentDayData.total_calories} kcal`}
              />
            )}

            {/* Meals Grid with Visual Photos */}
            {loading ? (
              <div className="text-center py-20 text-slate-400">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Generating full 7-day nutritional plans...</span>
              </div>
            ) : currentDayData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentDayData.meals.map((meal, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Meal Photo */}
                      <div className="relative h-36 w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getMealImage(meal.meal_name)}
                          alt={meal.meal_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-slate-950 font-black text-xs shadow-md">
                          {meal.calories} kcal
                        </div>

                        <div className="absolute bottom-2 left-3 right-3">
                          <h4 className="text-sm font-bold text-white line-clamp-1">{meal.meal_name}</h4>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {meal.notes && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-2">
                            &quot;{meal.notes}&quot;
                          </p>
                        )}

                        {/* Food Items */}
                        <div className="space-y-1.5">
                          {meal.items.map((it, i) => (
                            <div
                              key={i}
                              className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 text-xs flex justify-between items-center"
                            >
                              <div className="truncate mr-2">
                                <div className="font-semibold text-slate-200 truncate">{it.name}</div>
                                <div className="text-[10px] text-slate-400">{it.serving_size || it.brand}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-xs font-black text-white">{it.calories}</span>
                                <span className="text-[10px] text-sky-400 font-semibold block">{it.protein_g}g P</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Swap With AI Button */}
                    <div className="p-4 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-2.5">
                        <span>P: {meal.protein_g}g</span>
                        <span>C: {meal.carbs_g}g</span>
                        <span>F: {meal.fat_g}g</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveMealToSwap(meal);
                          setSwapInstruction('');
                        }}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Swap Meal With AI</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          /* Grocery List Tab */
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  <span>Aggregated 7-Day Grocery List</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Everything you need to buy for your 7-day fitness meal plan.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
              >
                Print / Save PDF
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {uniqueGroceries.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-700 accent-emerald-500 cursor-pointer"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AI Meal Swapper Modal */}
      {activeMealToSwap && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-slate-700 bg-slate-950 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  AI Meal Customizer
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Swap {activeMealToSwap.meal_name} ({activeMealToSwap.calories} kcal)
                </h3>
              </div>
              <button
                onClick={() => setActiveMealToSwap(null)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1"
              >
                &times;
              </button>
            </div>

            {swapSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs text-center font-bold">
                {swapSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleAISwap} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    What would you like to swap this for?
                  </label>
                  <textarea
                    rows={3}
                    value={swapInstruction}
                    onChange={(e) => setSwapInstruction(e.target.value)}
                    placeholder="e.g. 'Replace with McDonald's high-protein option', 'Make it a plant-based vegan meal with 25g protein', or 'Give me a salmon and sweet potato combo'"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    "McDonald's Combo",
                    'Starbucks Beverage & Snack',
                    'Vegetarian High-Protein',
                    'Wild Salmon & Greens',
                  ].map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setSwapInstruction(pill)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveMealToSwap(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={swapLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    {swapLoading ? (
                      <span>Synthesizing Swap...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Confirm AI Swap</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
