from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from apps.nutrition.models import FoodItem, UserProfile, MealPlan
from apps.nutrition.services.macro_calculator import calculate_personalized_macros
from apps.nutrition.services.food_recommender import search_foods, recommend_restaurant_meal
from apps.nutrition.services.ai_meal_planner import generate_ai_meal_plan
import json
import os

class CalculateMacrosView(APIView):
    """
    Public Endpoint: Computes BMR, TDEE, and macro breakdown without authentication.
    """
    permission_classes = []

    def post(self, request):
        try:
            age = int(request.data.get("age", 25))
            gender = str(request.data.get("gender", "male"))
            height_cm = float(request.data.get("height_cm", 175))
            weight_kg = float(request.data.get("weight_kg", 75))
            activity_level = str(request.data.get("activity_level", "moderate"))
            fitness_goal = str(request.data.get("fitness_goal", "lose_weight"))

            macros = calculate_personalized_macros(
                age=age,
                gender=gender,
                height_cm=height_cm,
                weight_kg=weight_kg,
                activity_level=activity_level,
                fitness_goal=fitness_goal
            )
            return Response(macros, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PublicSamplePlanView(APIView):
    """
    Public Endpoint: Free 1-Day Sample Meal Plan preview for guests.
    """
    permission_classes = []

    def post(self, request):
        try:
            cals = float(request.data.get("target_calories", 2000))
            protein = float(request.data.get("target_protein_g", 150))
            carbs = float(request.data.get("target_carbs_g", 200))
            fat = float(request.data.get("target_fat_g", 65))
            goal = str(request.data.get("goal", "cut"))

            plan = generate_ai_meal_plan(cals, protein, carbs, fat, goal=goal, day=1)
            return Response({
                "plan": plan,
                "is_trial_preview": True,
                "upsell_message": "Enjoy this free 1-day preview! Start a 7-day free trial to unlock your personalized 7-Day Plan and AI Meal Replacements."
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class FastFoodRecommenderView(APIView):
    """
    Public Endpoint: McDonald's and Starbucks Macro & Calorie Optimizer.
    """
    permission_classes = []

    def get(self, request):
        try:
            brand = request.query_params.get("brand", "McDonald's")
            calorie_budget = float(request.query_params.get("calorie_budget", 500))
            protein_target = float(request.query_params.get("protein_target", 20))
            meal_type = request.query_params.get("meal_type", "any")

            recommendations = recommend_restaurant_meal(
                brand=brand,
                calorie_budget=calorie_budget,
                protein_target=protein_target,
                meal_type=meal_type
            )
            return Response(recommendations, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class FoodCatalogSearchView(APIView):
    """
    Search and filter the 535+ nutrition items database.
    """
    permission_classes = []

    def get(self, request):
        query = request.query_params.get("q", "")
        brand = request.query_params.get("brand", "")
        category = request.query_params.get("category", "")
        max_cals = request.query_params.get("max_calories")
        min_prot = request.query_params.get("min_protein")
        tag = request.query_params.get("tag", "")

        max_cals = float(max_cals) if max_cals else None
        min_prot = float(min_prot) if min_prot else None

        items = search_foods(
            query=query,
            brand=brand,
            category=category,
            max_calories=max_cals,
            min_protein=min_prot,
            dietary_tag=tag,
            limit=40
        )

        data = [
            {
                "id": i.external_id,
                "name": i.name,
                "brand": i.brand,
                "category": i.category,
                "serving_size": i.serving_size,
                "calories": i.calories,
                "protein_g": i.protein_g,
                "carbs_g": i.carbs_g,
                "fat_g": i.fat_g,
                "fiber_g": i.fiber_g,
                "dietary_tags": i.dietary_tags
            }
            for i in items
        ]
        return Response({"count": len(data), "results": data}, status=status.HTTP_200_OK)


class Generate7DayPlanView(APIView):
    """
    Pro / Trial Feature: Generates full multi-day meal plan.
    Unlocked during 3/7-day trial or pro subscription.
    """
    permission_classes = []

    def post(self, request):
        user = request.user
        is_authorized = False
        if user.is_authenticated:
            sub = getattr(user, 'subscription', None)
            if sub and sub.is_premium_active:
                is_authorized = True

        # Trial mode or demo mode active
        is_trial = request.data.get("is_trial", True)
        if not is_authorized and not is_trial:
            return Response({
                "upgrade_required": True,
                "message": "Start your 3-day or 7-day free trial to unlock full 7-day meal plans and AI meal swapping!",
                "checkout_plans": ["trial_3day", "trial_7day", "pro_monthly"]
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        cals = float(request.data.get("target_calories", 2200))
        protein = float(request.data.get("target_protein_g", 160))
        carbs = float(request.data.get("target_carbs_g", 220))
        fat = float(request.data.get("target_fat_g", 70))
        goal = str(request.data.get("goal", "lose_weight"))

        days_plan = []
        for d in range(1, 8):
            day_plan = generate_ai_meal_plan(cals, protein, carbs, fat, goal=goal, day=d)
            days_plan.append({"day": d, "plan": day_plan})

        return Response({
            "status": "success",
            "total_days": 7,
            "is_trial_active": True,
            "days": days_plan
        }, status=status.HTTP_200_OK)


class AISwapMealView(APIView):
    """
    Trial & Pro Feature: AI Meal Customizer / Swapper.
    Users can ask: "Swap this with a vegetarian option with 25g protein",
    "Replace lunch with McDonald's", or "Change snack to Starbucks drink".
    """
    permission_classes = []

    def post(self, request):
        meal_name = request.data.get("meal_name", "Lunch")
        calorie_target = float(request.data.get("calorie_target", 500))
        protein_target = float(request.data.get("protein_target", 30))
        swap_instruction = request.data.get("instruction", "Make it vegetarian high-protein")

        inst_lower = swap_instruction.lower()

        # Check if restaurant swap is requested
        if "mcdonald" in inst_lower:
            rec = recommend_restaurant_meal("McDonald's", calorie_target, protein_target)
            if rec["recommended_combos"]:
                best_combo = rec["recommended_combos"][0]
                new_items = [
                    {
                        "name": it["name"],
                        "brand": "McDonald's",
                        "serving_size": "1 serving",
                        "calories": it["calories"],
                        "protein_g": it["protein_g"],
                        "carbs_g": it["carbs_g"],
                        "fat_g": it["fat_g"],
                    }
                    for it in best_combo["items"]
                ]
            else:
                top = rec["top_single_items"][:2]
                new_items = [
                    {
                        "name": it["name"],
                        "brand": "McDonald's",
                        "serving_size": it.get("serving_size", "1 serving"),
                        "calories": it["calories"],
                        "protein_g": it["protein_g"],
                        "carbs_g": it["carbs_g"],
                        "fat_g": it["fat_g"],
                    }
                    for it in top
                ]
            new_meal = {
                "meal_name": f"{meal_name} (McDonald's AI Swap)",
                "notes": f"AI swapped to McDonald's items fitting {calorie_target:.0f} kcal.",
                "calories": round(sum(i["calories"] for i in new_items), 1),
                "protein_g": round(sum(i["protein_g"] for i in new_items), 1),
                "carbs_g": round(sum(i["carbs_g"] for i in new_items), 1),
                "fat_g": round(sum(i["fat_g"] for i in new_items), 1),
                "items": new_items
            }
            return Response({"status": "success", "swapped_meal": new_meal}, status=status.HTTP_200_OK)

        elif "starbucks" in inst_lower:
            rec = recommend_restaurant_meal("Starbucks", calorie_target, min(15.0, protein_target), meal_type="beverage")
            top = rec["top_single_items"][:2]
            new_items = [
                {
                    "name": it["name"],
                    "brand": "Starbucks",
                    "serving_size": it.get("serving_size", "Tall/Grande"),
                    "calories": it["calories"],
                    "protein_g": it["protein_g"],
                    "carbs_g": it["carbs_g"],
                    "fat_g": it["fat_g"],
                }
                for it in top
            ]
            new_meal = {
                "meal_name": f"{meal_name} (Starbucks AI Swap)",
                "notes": f"AI swapped to Starbucks options fitting your macro budget.",
                "calories": round(sum(i["calories"] for i in new_items), 1),
                "protein_g": round(sum(i["protein_g"] for i in new_items), 1),
                "carbs_g": round(sum(i["carbs_g"] for i in new_items), 1),
                "fat_g": round(sum(i["fat_g"] for i in new_items), 1),
                "items": new_items
            }
            return Response({"status": "success", "swapped_meal": new_meal}, status=status.HTTP_200_OK)

        elif "vegetarian" in inst_lower or "vegan" in inst_lower:
            tofu = FoodItem.objects.filter(name__icontains="tofu").first()
            lentils = FoodItem.objects.filter(name__icontains="lentil").first()
            rice = FoodItem.objects.filter(name__icontains="rice").first()
            broccoli = FoodItem.objects.filter(name__icontains="broccoli").first()

            items = [i for i in [tofu, lentils, rice, broccoli] if i]
            new_items = [
                {
                    "name": it.name,
                    "brand": it.brand,
                    "serving_size": it.serving_size,
                    "calories": it.calories,
                    "protein_g": it.protein_g,
                    "carbs_g": it.carbs_g,
                    "fat_g": it.fat_g,
                }
                for it in items
            ]
            new_meal = {
                "meal_name": f"{meal_name} (Plant-Based Swap)",
                "notes": f"Plant-based protein rich swap: Tofu & Lentils with complex carbs.",
                "calories": round(sum(i["calories"] for i in new_items), 1),
                "protein_g": round(sum(i["protein_g"] for i in new_items), 1),
                "carbs_g": round(sum(i["carbs_g"] for i in new_items), 1),
                "fat_g": round(sum(i["fat_g"] for i in new_items), 1),
                "items": new_items
            }
            return Response({"status": "success", "swapped_meal": new_meal}, status=status.HTTP_200_OK)

        else:
            # General lean protein swap (Salmon / Turkey / Sweet Potato)
            salmon = FoodItem.objects.filter(name__icontains="salmon").first()
            sp = FoodItem.objects.filter(name__icontains="sweet potato").first()
            asparagus = FoodItem.objects.filter(name__icontains="asparagus").first()

            items = [i for i in [salmon, sp, asparagus] if i]
            new_items = [
                {
                    "name": it.name,
                    "brand": it.brand,
                    "serving_size": it.serving_size,
                    "calories": it.calories,
                    "protein_g": it.protein_g,
                    "carbs_g": it.carbs_g,
                    "fat_g": it.fat_g,
                }
                for it in items
            ]
            new_meal = {
                "meal_name": f"{meal_name} (Omega-3 Lean Swap)",
                "notes": f"Custom swap: {swap_instruction}",
                "calories": round(sum(i["calories"] for i in new_items), 1),
                "protein_g": round(sum(i["protein_g"] for i in new_items), 1),
                "carbs_g": round(sum(i["carbs_g"] for i in new_items), 1),
                "fat_g": round(sum(i["fat_g"] for i in new_items), 1),
                "items": new_items
            }
            return Response({"status": "success", "swapped_meal": new_meal}, status=status.HTTP_200_OK)
