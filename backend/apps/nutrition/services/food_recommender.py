"""
Smart Food & Restaurant Macro Recommender
=========================================
Powers the "Eat Out & Stay on Track" feature using McDonald's, Starbucks,
and Whole Food datasets.
"""

from django.db.models import Q, F
from apps.nutrition.models import FoodItem

def search_foods(
    query="",
    brand="",
    category="",
    max_calories=None,
    min_protein=None,
    max_carbs=None,
    max_fat=None,
    dietary_tag="",
    limit=30
):
    queryset = FoodItem.objects.all()

    if brand:
        queryset = queryset.filter(brand__iexact=brand)

    if category:
        queryset = queryset.filter(category__icontains=category)

    if max_calories is not None:
        queryset = queryset.filter(calories__lte=max_calories)

    if min_protein is not None:
        queryset = queryset.filter(protein_g__gte=min_protein)

    if max_carbs is not None:
        queryset = queryset.filter(carbs_g__lte=max_carbs)

    if max_fat is not None:
        queryset = queryset.filter(fat_g__lte=max_fat)

    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) |
            Q(search_text__icontains=query) |
            Q(category__icontains=query)
        )

    if dietary_tag:
        queryset = queryset.filter(dietary_tags__icontains=dietary_tag)

    # Order by protein efficiency (protein per calorie)
    items = list(queryset[:100])

    def protein_density(item):
        if item.calories > 0:
            return (item.protein_g * 4) / item.calories
        return 0.0

    items.sort(key=protein_density, reverse=True)
    return items[:limit]


def recommend_restaurant_meal(
    brand: str, # "McDonald's" or "Starbucks"
    calorie_budget: float,
    protein_target: float = 20.0,
    meal_type: str = "any" # "breakfast", "lunch/dinner", "snack/beverage"
):
    """
    Intelligently finds best individual items or 2-item combo combinations 
    within the user's remaining calorie budget while maximizing protein.
    """
    queryset = FoodItem.objects.filter(brand__iexact=brand, calories__lte=calorie_budget)

    if meal_type == "breakfast":
        queryset = queryset.filter(Q(category__icontains="breakfast") | Q(dietary_tags__icontains="breakfast"))
    elif meal_type == "beverage":
        queryset = queryset.filter(Q(category__icontains="beverage") | Q(category__icontains="coffee") | Q(category__icontains="tea"))

    items = list(queryset)

    # 1. Best single items
    singles = [
        item for item in items 
        if item.calories <= calorie_budget and item.protein_g >= (protein_target * 0.7)
    ]
    singles.sort(key=lambda x: (x.protein_g, -x.calories), reverse=True)

    # 2. Smart Combos (Main Item + Low-Cal Drink/Side)
    combos = []
    mains = [i for i in items if i.calories >= 120 and i.protein_g >= 12]
    sides_or_drinks = [i for i in items if i.calories <= 180 and i.id not in [m.id for m in mains]]

    for main in mains[:12]:
        for side in sides_or_drinks[:15]:
            total_cals = main.calories + side.calories
            total_protein = main.protein_g + side.protein_g
            if total_cals <= calorie_budget and total_protein >= protein_target:
                combos.append({
                    "combo_name": f"{main.name} + {side.name}",
                    "items": [
                        {"id": main.external_id, "name": main.name, "calories": main.calories, "protein_g": main.protein_g, "carbs_g": main.carbs_g, "fat_g": main.fat_g},
                        {"id": side.external_id, "name": side.name, "calories": side.calories, "protein_g": side.protein_g, "carbs_g": side.carbs_g, "fat_g": side.fat_g}
                    ],
                    "total_calories": round(total_cals, 1),
                    "total_protein_g": round(total_protein, 1),
                    "total_carbs_g": round(main.carbs_g + side.carbs_g, 1),
                    "total_fat_g": round(main.fat_g + side.fat_g, 1),
                    "protein_density_score": round((total_protein * 4 / total_cals) * 100, 1) if total_cals > 0 else 0
                })

    combos.sort(key=lambda c: (c["total_protein_g"], -c["total_calories"]), reverse=True)

    formatted_singles = [
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
            "protein_density_score": round((i.protein_g * 4 / i.calories) * 100, 1) if i.calories > 0 else 0
        }
        for i in singles[:8]
    ]

    return {
        "brand": brand,
        "calorie_budget": calorie_budget,
        "protein_target": protein_target,
        "top_single_items": formatted_singles,
        "recommended_combos": combos[:5]
    }

