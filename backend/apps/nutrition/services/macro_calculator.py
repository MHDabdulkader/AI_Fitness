"""
Deterministic Scientific Macro & Calorie Calculator
====================================================
Uses the Mifflin-St Jeor equation (scientifically validated gold standard)
to calculate BMR, TDEE, and optimal macronutrient distribution.
"""

def calculate_bmr_and_tdee(age: int, gender: str, height_cm: float, weight_kg: float, activity_level: str):
    """
    Calculates Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
    """
    # Mifflin-St Jeor Equation:
    # Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
    # Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
    if gender.lower() == 'female':
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5

    activity_multipliers = {
        'sedentary': 1.2,       # Little or no exercise, desk job
        'light': 1.375,         # Light exercise 1-3 days/week
        'moderate': 1.55,       # Moderate exercise 3-5 days/week
        'very': 1.725,          # Hard exercise 6-7 days/week
        'extra': 1.9,           # Very hard exercise, physical job or 2x/day training
    }

    multiplier = activity_multipliers.get(activity_level.lower(), 1.55)
    tdee = bmr * multiplier

    return round(bmr, 1), round(tdee, 1)


def calculate_personalized_macros(
    age: int,
    gender: str,
    height_cm: float,
    weight_kg: float,
    activity_level: str,
    fitness_goal: str
):
    """
    Computes exact daily target calories and macro splits (Protein, Carbs, Fats)
    based on the fitness goal (Cut, Maintain, Bulk).
    """
    bmr, tdee = calculate_bmr_and_tdee(age, gender, height_cm, weight_kg, activity_level)

    goal = fitness_goal.lower()

    if 'lose' in goal or 'cut' in goal:
        # 20% deficit (safe, sustainable fat loss preserving lean mass)
        target_calories = tdee * 0.80
        # High protein during a cut to spare muscle mass (2.2g per kg)
        protein_g = min(weight_kg * 2.2, target_calories * 0.35 / 4)
        # Moderate dietary fats (25% of calories)
        fat_calories = target_calories * 0.25
        fat_g = fat_calories / 9
        # Remainder in carbs for workout energy
        carb_calories = target_calories - (protein_g * 4) - fat_calories
        carbs_g = max(50.0, carb_calories / 4)

    elif 'gain' in goal or 'bulk' in goal:
        # 12% surplus (lean bulk, minimizes unwanted fat accumulation)
        target_calories = tdee * 1.12
        # Optimal muscle hypertrophy protein (2.0g per kg)
        protein_g = weight_kg * 2.0
        # Fats (25% of calories)
        fat_calories = target_calories * 0.25
        fat_g = fat_calories / 9
        # High carbs to fuel progressive overload and glycogen recovery
        carb_calories = target_calories - (protein_g * 4) - fat_calories
        carbs_g = carb_calories / 4

    else:
        # Maintenance
        target_calories = tdee
        protein_g = weight_kg * 1.8
        fat_calories = target_calories * 0.28
        fat_g = fat_calories / 9
        carb_calories = target_calories - (protein_g * 4) - fat_calories
        carbs_g = carb_calories / 4

    return {
        "bmr": round(bmr, 1),
        "tdee": round(tdee, 1),
        "target_calories": round(target_calories, 0),
        "target_protein_g": round(protein_g, 1),
        "target_carbs_g": round(carbs_g, 1),
        "target_fat_g": round(fat_g, 1),
        "macro_calories_breakdown": {
            "protein_kcal": round(protein_g * 4, 1),
            "carbs_kcal": round(carbs_g * 4, 1),
            "fat_kcal": round(fat_g * 9, 1),
        },
        "percentages": {
            "protein": round((protein_g * 4 / target_calories) * 100, 1),
            "carbs": round((carbs_g * 4 / target_calories) * 100, 1),
            "fat": round((fat_g * 9 / target_calories) * 100, 1),
        }
    }

