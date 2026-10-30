import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

client = Client()

print("🧪 1. Testing Health Check...")
res = client.get('/api/health/')
assert res.status_code == 200, f"Health check failed: {res.status_code}"
print("   ✅ Health check OK:", res.json()["status"])

print("🧪 2. Testing Macro Calculator (Public/Guest)...")
res = client.post('/api/nutrition/calculate-macros/', data=json.dumps({
    "age": 24,
    "gender": "male",
    "height_cm": 180,
    "weight_kg": 78,
    "activity_level": "moderate",
    "fitness_goal": "lose_weight"
}), content_type="application/json")
assert res.status_code == 200, f"Calculate macros failed: {res.status_code}"
macro_data = res.json()
print(f"   ✅ BMR: {macro_data['bmr']} kcal, TDEE: {macro_data['tdee']} kcal, Target: {macro_data['target_calories']} kcal")

print("🧪 3. Testing McDonald's Fast Food Optimizer...")
res = client.get('/api/nutrition/fast-food-recommendation/?brand=McDonald\'s&calorie_budget=500&protein_target=25')
assert res.status_code == 200, f"Fast food optimizer failed: {res.status_code}"
data = res.json()
print(f"   ✅ Found {len(data['top_single_items'])} top singles and {len(data['recommended_combos'])} smart combos")

print("🧪 4. Testing Public 1-Day Sample Meal Plan Preview...")
res = client.post('/api/nutrition/public-sample-plan/', data=json.dumps({
    "target_calories": macro_data['target_calories'],
    "target_protein_g": macro_data['target_protein_g'],
    "target_carbs_g": macro_data['target_carbs_g'],
    "target_fat_g": macro_data['target_fat_g'],
    "goal": "cut"
}), content_type="application/json")
assert res.status_code == 200, f"Sample plan failed: {res.status_code}"
plan_data = res.json()
print(f"   ✅ Generated plan with {len(plan_data['plan']['meals'])} meals!")

print("🧪 5. Testing Full 7-Day Meal Plan Generation...")
res = client.post('/api/nutrition/generate-7day-plan/', data=json.dumps({
    "target_calories": macro_data['target_calories'],
    "target_protein_g": macro_data['target_protein_g'],
    "target_carbs_g": macro_data['target_carbs_g'],
    "target_fat_g": macro_data['target_fat_g'],
    "goal": "lose_weight",
    "is_trial": True
}), content_type="application/json")
assert res.status_code == 200, f"7-day plan failed: {res.status_code}"
sevenday_data = res.json()
print(f"   ✅ Successfully generated all {sevenday_data['total_days']} days!")

print("🧪 6. Testing AI Meal Swap (Conversational Customizer)...")
res = client.post('/api/nutrition/ai-swap-meal/', data=json.dumps({
    "meal_name": "Lunch",
    "calorie_target": 550,
    "protein_target": 35,
    "instruction": "Swap with McDonald's high-protein option"
}), content_type="application/json")
assert res.status_code == 200, f"AI swap failed: {res.status_code}"
swap_res = res.json()
print(f"   ✅ AI Swapped Meal: {swap_res['swapped_meal']['meal_name']} ({swap_res['swapped_meal']['calories']} kcal, {swap_res['swapped_meal']['protein_g']}g P)")

print("🧪 7. Testing Stripe 7-Day Trial Checkout Simulation...")
res = client.post('/api/billing/checkout-trial/', data=json.dumps({
    "plan_tier": "trial_7day"
}), content_type="application/json")
assert res.status_code == 200, f"Stripe checkout failed: {res.status_code}"
print("   ✅ Checkout URL:", res.json()["checkout_url"])

print("\n🎉 ALL BACKEND AI & MACRO TESTS PASSED WITH 100% SUCCESS!")
