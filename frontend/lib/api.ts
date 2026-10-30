const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export interface MacroResult {
  bmr: number;
  tdee: number;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  percentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface FoodItemData {
  id: string;
  name: string;
  brand: string;
  category?: string;
  serving_size?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  protein_density_score?: number;
}

export interface RestaurantCombo {
  combo_name: string;
  items: FoodItemData[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  protein_density_score: number;
}

export interface RestaurantRecommendation {
  brand: string;
  calorie_budget: number;
  protein_target: number;
  top_single_items: FoodItemData[];
  recommended_combos: RestaurantCombo[];
}

export interface MealItem {
  name: string;
  brand: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  meal_name: string;
  notes?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  items: MealItem[];
}

export interface MealPlanData {
  engine?: string;
  goal?: string;
  day?: number;
  summary?: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  calorie_accuracy_percentage?: number;
  meals: Meal[];
}

export interface DayPlanContainer {
  day: number;
  plan: MealPlanData;
}

export async function calculateMacros(data: {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  fitness_goal: string;
}): Promise<MacroResult> {
  const res = await fetch(`${API_BASE_URL}/api/nutrition/calculate-macros/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to calculate macros');
  return res.json();
}

export async function getFastFoodRecommendations(params: {
  brand: string;
  calorie_budget: number;
  protein_target: number;
  meal_type?: string;
}): Promise<RestaurantRecommendation> {
  const query = new URLSearchParams({
    brand: params.brand,
    calorie_budget: params.calorie_budget.toString(),
    protein_target: params.protein_target.toString(),
    meal_type: params.meal_type || 'any',
  });
  const res = await fetch(`${API_BASE_URL}/api/nutrition/fast-food-recommendation/?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch restaurant recommendations');
  return res.json();
}

export async function getPublicSamplePlan(data: {
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  goal: string;
}): Promise<{ plan: MealPlanData; is_trial_preview: boolean; upsell_message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/nutrition/public-sample-plan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to generate sample plan');
  return res.json();
}

export async function get7DayMealPlan(data: {
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  goal: string;
  is_trial?: boolean;
}): Promise<{ total_days: number; is_trial_active: boolean; days: DayPlanContainer[] }> {
  const res = await fetch(`${API_BASE_URL}/api/nutrition/generate-7day-plan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, is_trial: true }),
  });
  if (!res.ok) throw new Error('Failed to generate 7-day meal plan');
  return res.json();
}

export async function swapMealWithAI(data: {
  meal_name: string;
  calorie_target: number;
  protein_target: number;
  instruction: string;
}): Promise<{ status: string; swapped_meal: Meal }> {
  const res = await fetch(`${API_BASE_URL}/api/nutrition/ai-swap-meal/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to swap meal');
  return res.json();
}

export async function createTrialCheckoutSession(plan_tier: string): Promise<{ checkout_url: string; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/billing/checkout-trial/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_tier }),
  });
  if (!res.ok) throw new Error('Failed to create trial checkout session');
  return res.json();
}
