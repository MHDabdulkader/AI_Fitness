'use client';

import React from 'react';
import { 
  Flame, 
  Clock, 
  BatteryCharging 
} from 'lucide-react';

interface Props {
  targetCalories?: number;
}

export default function VisualMealTimeline({ targetCalories = 2000 }: Props) {
  // Scaling multiplier so meals scale dynamically if user changes their metrics
  const scale = targetCalories / 2000;

  const timelineMeals = [
    {
      time: "08:00 AM",
      mealName: "Morning Ignition",
      energyKcal: Math.round(353 * scale),
      proteinG: Math.round(31 * scale),
      carbsG: Math.round(33 * scale),
      fatG: Math.round(11 * scale),
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
      description: "2 Poached Eggs, Green Tea & Rolled Oats",
      purpose: "Activates morning metabolism with zero glycemic spikes.",
      items: [
        { icon: "🥚", name: "2 Large Whole Eggs", qty: "2 eggs", kcal: Math.round(144 * scale), p: "12.6g" },
        { icon: "🍵", name: "Japanese Green Tea", qty: "1 mug (250ml)", kcal: 2, p: "0.2g (EGCG)" },
        { icon: "🥣", name: "Rolled Oats + Blueberries", qty: "45g oats + 50g berries", kcal: Math.round(207 * scale), p: "6.2g" },
      ]
    },
    {
      time: "01:00 PM",
      mealName: "Midday Performance Lunch",
      energyKcal: Math.round(449 * scale),
      proteinG: Math.round(52 * scale),
      carbsG: Math.round(42 * scale),
      fatG: Math.round(8 * scale),
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      description: "Grilled Chicken Breast, Brown Rice & Broccoli",
      purpose: "Sustained workout glycogen replenishment and anabolic support.",
      items: [
        { icon: "🍗", name: "Grilled Herb Chicken Breast", qty: "160g cooked", kcal: Math.round(248 * scale), p: "46.5g" },
        { icon: "🍚", name: "Steamed Jasmine Brown Rice", qty: "150g (1 cup)", kcal: Math.round(166 * scale), p: "3.5g" },
        { icon: "🥦", name: "Steamed Fresh Broccoli", qty: "100g florets", kcal: Math.round(35 * scale), p: "2.4g" },
      ]
    },
    {
      time: "04:30 PM",
      mealName: "Afternoon Metabolic Snack",
      energyKcal: Math.round(269 * scale),
      proteinG: Math.round(24 * scale),
      carbsG: Math.round(13 * scale),
      fatG: Math.round(14 * scale),
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
      description: "0% Greek Yogurt, Almonds & Starbucks Cold Brew",
      purpose: "Prevents energy slumps and provides slow-digesting casein protein.",
      items: [
        { icon: "🥛", name: "Plain Non-Fat Greek Yogurt", qty: "170g container", kcal: Math.round(100 * scale), p: "18.0g" },
        { icon: "🥜", name: "Whole Raw Almonds", qty: "28g (1 oz)", kcal: Math.round(164 * scale), p: "6.0g" },
        { icon: "☕", name: "Starbucks Iced Black Coffee", qty: "Tall (354ml)", kcal: 5, p: "0.3g" },
      ]
    },
    {
      time: "07:30 PM",
      mealName: "Nocturnal Recovery Dinner",
      energyKcal: Math.round(529 * scale),
      proteinG: Math.round(36 * scale),
      carbsG: Math.round(41 * scale),
      fatG: Math.round(19 * scale),
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80",
      description: "Atlantic Salmon, Sweet Potato & Asparagus",
      purpose: "Omega-3s promote overnight muscle repair and reduce inflammation.",
      items: [
        { icon: "🐟", name: "Wild Atlantic Salmon Fillet", qty: "150g grilled", kcal: Math.round(312 * scale), p: "30.6g" },
        { icon: "🍠", name: "Baked Sweet Potato", qty: "150g medium", kcal: Math.round(135 * scale), p: "3.0g" },
        { icon: "🌱", name: "Tender Green Asparagus + EVOO", qty: "100g spears + 1 tsp oil", kcal: Math.round(82 * scale), p: "2.4g" },
      ]
    }
  ];

  const totalDailyEnergy = timelineMeals.reduce((acc, m) => acc + m.energyKcal, 0);
  const totalDailyProtein = timelineMeals.reduce((acc, m) => acc + m.proteinG, 0);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Visual Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <BatteryCharging className="w-3.5 h-3.5" />
          <span>VISUAL DAILY NUTRITION TIMELINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          What Your Body Fuel Looks Like
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          From morning eggs and green tea to mid-day chicken and salmon dinner — see exact foods, high-definition imagery, and energy release.
        </p>

        {/* Energy Banner */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 mt-6 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Total Daily Energy: {totalDailyEnergy.toLocaleString()} kcal</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 text-xs font-bold">
            <span>💪 Total Daily Protein: {totalDailyProtein}g</span>
          </span>
        </div>
      </div>

      {/* Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {timelineMeals.map((meal, idx) => (
          <div
            key={idx}
            className="glass-card rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
          >
            <div>
              {/* Food Image with Energy Pill */}
              <div className="relative h-48 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meal.image}
                  alt={meal.mealName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Time Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{meal.time}</span>
                </div>

                {/* Energy Pill */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-slate-950 font-black text-xs shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{meal.energyKcal} kcal</span>
                </div>

                {/* Meal Title overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-bold text-white leading-tight">
                    {meal.mealName}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-semibold line-clamp-1">
                    {meal.description}
                  </p>
                </div>
              </div>

              {/* Food Items with Icons */}
              <div className="p-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>Included Foods</span>
                </div>

                {meal.items.map((it, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0">{it.icon}</span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{it.name}</div>
                        <div className="text-[10px] text-slate-400">{it.qty}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-black text-white text-xs">{it.kcal} kcal</div>
                      <div className="text-[10px] text-sky-400 font-semibold">{it.p} P</div>
                    </div>
                  </div>
                ))}

                {/* Purpose Note */}
                <p className="text-[11px] text-slate-400 italic pt-2">
                  &quot;{meal.purpose}&quot;
                </p>
              </div>
            </div>

            {/* Macro Summary Footer */}
            <div className="p-4 pt-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[11px] font-bold">
              <span className="text-sky-400">P: {meal.proteinG}g</span>
              <span className="text-amber-400">C: {meal.carbsG}g</span>
              <span className="text-emerald-400">F: {meal.fatG}g</span>
              <span className="text-emerald-300 font-black flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-emerald-400" />
                {meal.energyKcal} kcal
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
