'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { createTrialCheckoutSession } from '@/lib/api';

export default function PricingSection() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    setLoadingTier(tier);
    try {
      const res = await createTrialCheckoutSession(tier);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err) {
      console.error('Error starting checkout:', err);
      alert('Could not initialize checkout. Please ensure backend is running.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>FLEXIBLE PLANS &amp; FREE TRIALS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Start Free Today. Upgrade with Zero Risk.
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Experience full AI nutrition coaching with a 3-day or 7-day free trial. Powered by Stripe security. Cancel anytime with one click.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Plan 1: Free Guest */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Guest Visitor</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                No Login Needed
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-slate-400 text-xs">/ forever</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Instant access to core macro math and fast food nutrition optimizers.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited TDEE &amp; BMR calculation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>McDonald&apos;s &amp; Starbucks macro search</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>1-Day sample AI meal plan preview</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">&times;</span>
                <span>Multi-day 7-day rolling meal plans</span>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <a
              href="#calculator"
              className="w-full block text-center py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
            >
              Use Free Tools
            </a>
          </div>
        </div>

        {/* Plan 2: 7-Day Free Trial (Highlighted) */}
        <div className="glass-card p-8 rounded-3xl border-2 border-emerald-500 relative flex flex-col justify-between shadow-2xl shadow-emerald-500/10 scale-105 z-10 bg-slate-950/90">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md">
            Most Popular &bull; 7-Day Trial
          </div>
          <div>
            <div className="flex justify-between items-center mb-4 mt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pro Trial</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                $0 Due Today
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-slate-400 text-xs">for 7 days</span>
            </div>
            <div className="text-[11px] text-slate-400 mb-4">then $9.99/mo (cancel anytime)</div>
            <p className="text-xs text-slate-300 mb-6">
              Complete fitness coaching with continuous 7-day rolling plans and AI ingredient replacements.
            </p>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full 7-Day personalized AI meal plans</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AI conversational meal swapping &amp; adjustments</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Automated weekly grocery shopping list</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited restaurant combos &amp; macro search</span>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <button
              onClick={() => handleSubscribe('trial_7day')}
              disabled={loadingTier === 'trial_7day'}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-102"
            >
              {loadingTier === 'trial_7day' ? (
                <span>Starting Stripe Checkout...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start 7-Day Free Trial</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Plan 3: 3-Day Quick Trial */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Trial</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                3 Days Free
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-slate-400 text-xs">for 3 days</span>
            </div>
            <div className="text-[11px] text-slate-400 mb-4">then $9.99/mo (cancel anytime)</div>
            <p className="text-xs text-slate-400 mb-6">
              Short on time? Test drive the full AI planner for 3 days.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full access to 7-Day meal plans</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AI meal customization</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Stripe secure billing &amp; instant cancel</span>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <button
              onClick={() => handleSubscribe('trial_3day')}
              disabled={loadingTier === 'trial_3day'}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs border border-cyan-500/30 hover:border-cyan-500 transition-all flex items-center justify-center gap-2"
            >
              {loadingTier === 'trial_3day' ? (
                <span>Starting Stripe Checkout...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Start 3-Day Free Trial</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
