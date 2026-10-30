'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, Utensils, Sparkles, Filter, Award, ChevronRight } from 'lucide-react';
import { getFastFoodRecommendations, RestaurantRecommendation } from '@/lib/api';

export default function FastFoodSection() {
  const [brand, setBrand] = useState<string>("McDonald's");
  const [calorieBudget, setCalorieBudget] = useState<number>(500);
  const [proteinTarget, setProteinTarget] = useState<number>(25);
  const [mealType, setMealType] = useState<string>('any');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RestaurantRecommendation | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await getFastFoodRecommendations({
        brand,
        calorie_budget: calorieBudget,
        protein_target: proteinTarget,
        meal_type: mealType,
      });
      setData(res);
    } catch (err) {
      console.error('Error loading restaurant items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, calorieBudget, proteinTarget, mealType]);

  return (
    <section id="fast-food" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Utensils className="w-3.5 h-3.5" />
          <span>DATASET POWERED — MCDONALD&apos;S & STARBUCKS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          &quot;Eat Out &amp; Stay On Track&quot; Optimizer
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Ever found yourself at McDonald&apos;s or Starbucks wondering what fits your daily macros? Set your remaining calorie budget and our AI finds the highest-protein menu items and combos.
        </p>
      </div>

      {/* Brand Tabs & Filters */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 mb-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Brand Switcher */}
          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setBrand("McDonald's")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                brand === "McDonald's"
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>McDonald&apos;s</span>
            </button>
            <button
              onClick={() => setBrand('Starbucks')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                brand === 'Starbucks'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Starbucks</span>
            </button>
          </div>

          {/* Meal Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="any">All Menu Items</option>
              <option value="breakfast">Breakfast Specials</option>
              <option value="beverage">Beverages &amp; Drinks</option>
            </select>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Remaining Calorie Budget</span>
              <span className="text-cyan-400 font-bold">{calorieBudget} kcal</span>
            </div>
            <input
              type="range"
              min="150"
              max="900"
              step="25"
              value={calorieBudget}
              onChange={(e) => setCalorieBudget(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Minimum Protein Target</span>
              <span className="text-cyan-400 font-bold">{proteinTarget}g Protein</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={proteinTarget}
              onChange={(e) => setProteinTarget(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Searching menu items matching your budget...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Singles */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Highest Protein Standalone Options (&le; {calorieBudget} kcal)</span>
            </h3>
            {data?.top_single_items && data.top_single_items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.top_single_items.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card p-4 rounded-xl border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.brand}
                        </span>
                        {item.protein_density_score && item.protein_density_score >= 30 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            High Efficiency
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-2">{item.name}</h4>
                      {item.serving_size && (
                        <p className="text-[11px] text-slate-500 mt-0.5">Size: {item.serving_size}</p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-black text-sm">{item.calories}</span>
                        <span className="text-slate-400 text-[10px] ml-1">kcal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sky-400 font-bold text-sm">{item.protein_g}g</span>
                        <span className="text-slate-400 text-[10px] ml-1">Protein</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-sm glass-card rounded-xl border border-slate-800">
                No single menu items matched this exact calorie and protein target. Try raising your calorie budget or lower protein threshold.
              </div>
            )}
          </div>

          {/* Smart Combos */}
          {data?.recommended_combos && data.recommended_combos.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>AI Recommended 2-Item Combos (Main + Low-Cal Drink/Side)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.recommended_combos.map((combo, idx) => (
                  <div
                    key={idx}
                    className="glass-card p-5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-cyan-300">Combo #{idx + 1}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold">
                        {combo.protein_density_score}% Protein Cals
                      </span>
                    </div>
                    <div className="space-y-1">
                      {combo.items.map((subItem, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="line-clamp-1">{subItem.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                      <span className="text-white">{combo.total_calories} kcal</span>
                      <span className="text-emerald-400">{combo.total_protein_g}g Protein</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
