'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MacroCalculatorSection from '@/components/MacroCalculatorSection';
import VisualMealTimeline from '@/components/VisualMealTimeline';
import FastFoodSection from '@/components/FastFoodSection';
import MealPlanSection from '@/components/MealPlanSection';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import { MacroResult } from '@/lib/api';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Database } from 'lucide-react';

export default function Home() {
  const [currentMacros, setCurrentMacros] = useState<MacroResult | null>(null);
  const [currentGoal, setCurrentGoal] = useState<string>('lose_weight');
  const [showTrialNotification, setShowTrialNotification] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock_trial_activated') === 'true') {
      setShowTrialNotification(true);
      setTimeout(() => setShowTrialNotification(false), 8000);
    }
  }, []);

  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Trial Notification Banner */}
      {showTrialNotification && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold py-2.5 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>🎉 Free Trial Activated! All 7-Day meal plans and AI customization are now unlocked.</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar onStartTrial={scrollToPricing} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Visual Fitness Nutrition Intelligence with Free Public Tools</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Fuel Your Fitness With{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Visual AI Nutrition
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          See exactly what your daily foods look like — from morning poached eggs &amp; green tea to high-protein lunches, 
          healthy fats, and intelligent fast food optimization for{' '}
          <span className="text-white font-semibold">McDonald&apos;s</span> and{' '}
          <span className="text-white font-semibold">Starbucks</span>.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-xs font-semibold text-slate-300">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Interactive Macro Pie Chart
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            3 Real Datasets (535+ Items)
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            3 &amp; 7-Day Free Trials with Stripe
          </span>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#calculator"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Calculate My Macros &amp; View Chart</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={scrollToPricing}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-800 transition-all"
          >
            Explore 7-Day Free Trial
          </button>
        </div>
      </section>

      {/* Main Feature Sections */}
      <main className="flex-1 space-y-12">
        {/* 1. Macro Calculator with Interactive Pie Chart */}
        <MacroCalculatorSection
          onMacrosCalculated={(macros, goal) => {
            setCurrentMacros(macros);
            setCurrentGoal(goal);
          }}
        />

        {/* 2. Visual Food Timeline: Morning Eggs & Tea to Dinner with Energy Badges */}
        <VisualMealTimeline targetCalories={currentMacros?.target_calories ?? 2000} />

        {/* 3. Fast Food Macro Optimizer (McDonald's & Starbucks) */}
        <FastFoodSection />

        {/* 4. AI Meal Planner (1-Day Free preview + 7-Day Pro) */}
        <MealPlanSection
          macros={currentMacros}
          goal={currentGoal}
          onStartTrial={scrollToPricing}
        />

        {/* 5. Pricing & Free Trials with Stripe */}
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
