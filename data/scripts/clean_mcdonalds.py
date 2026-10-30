import csv
import json
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def clean_mcdonalds(raw_path=None, output_path=None):
    if raw_path is None:
        raw_path = BASE_DIR / "data" / "raw" / "mcdonalds.csv"
    else:
        raw_path = Path(raw_path)

    if output_path is None:
        output_path = BASE_DIR / "data" / "processed" / "mcdonalds_clean.json"
    else:
        output_path = Path(output_path)

    if not raw_path.exists():
        print(f"Error: {raw_path} not found.")
        return []

    items = []
    with open(raw_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            name = row.get("Item", "").strip()
            category = row.get("Category", "").strip()
            serving = row.get("Serving Size", "").strip()

            def to_float(val, default=0.0):
                try:
                    cleaned = re.sub(r"[^\d.]", "", str(val))
                    return float(cleaned) if cleaned else default
                except (ValueError, TypeError):
                    return default

            calories = to_float(row.get("Calories"))
            protein = to_float(row.get("Protein"))
            carbs = to_float(row.get("Carbohydrates"))
            fat = to_float(row.get("Total Fat"))
            fiber = to_float(row.get("Dietary Fiber"))
            sugars = to_float(row.get("Sugars"))
            sodium = to_float(row.get("Sodium"))

            tags = ["fast-food", "mcdonalds"]
            cat_lower = category.lower()
            if "breakfast" in cat_lower:
                tags.append("breakfast")
            if "chicken" in cat_lower or "fish" in cat_lower:
                tags.append("high-protein" if protein >= 20 else "poultry-seafood")
            if "beverages" in cat_lower or "coffee" in cat_lower or "tea" in cat_lower:
                tags.append("beverage")
            if "salad" in cat_lower:
                tags.append("salad")
            if protein >= 20:
                tags.append("high-protein")
            if carbs <= 15 and calories > 50:
                tags.append("low-carb")

            item_data = {
                "id": f"mcd_{idx+1}",
                "name": name,
                "brand": "McDonald's",
                "category": category,
                "serving_size": serving,
                "calories": round(calories, 1),
                "protein_g": round(protein, 1),
                "carbs_g": round(carbs, 1),
                "fat_g": round(fat, 1),
                "fiber_g": round(fiber, 1),
                "sugars_g": round(sugars, 1),
                "sodium_mg": round(sodium, 1),
                "dietary_tags": sorted(list(set(tags))),
                "search_text": f"McDonald's {name} {category} {serving} {calories}kcal {protein}g protein".lower()
            }
            items.append(item_data)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)

    print(f"Successfully cleaned {len(items)} McDonald's items -> {output_path}")
    return items

if __name__ == "__main__":
    clean_mcdonalds()
