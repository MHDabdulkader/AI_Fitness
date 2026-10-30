import csv
import json
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def clean_starbucks(raw_path=None, output_path=None):
    if raw_path is None:
        raw_path = BASE_DIR / "data" / "raw" / "starbucks_expanded.csv"
    else:
        raw_path = Path(raw_path)

    if output_path is None:
        output_path = BASE_DIR / "data" / "processed" / "starbucks_clean.json"
    else:
        output_path = Path(output_path)

    if not raw_path.exists():
        print(f"Error: {raw_path} not found.")
        return []

    items = []
    with open(raw_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, raw_row in enumerate(reader):
            row = {k.strip(): v for k, v in raw_row.items() if k}

            beverage = row.get("Beverage", "").strip()
            prep = row.get("Beverage_prep", "").strip()
            category = row.get("Beverage_category", "").strip()

            full_name = f"{beverage} ({prep})" if prep else beverage

            def to_float(val, default=0.0):
                try:
                    cleaned = re.sub(r"[^\d.]", "", str(val))
                    return float(cleaned) if cleaned else default
                except (ValueError, TypeError):
                    return default

            calories = to_float(row.get("Calories"))
            fat = to_float(row.get("Total Fat (g)"))
            protein = to_float(row.get("Protein (g)"))
            carbs = to_float(row.get("Total Carbohydrates (g)"))
            fiber = to_float(row.get("Dietary Fibre (g)"))
            sugars = to_float(row.get("Sugars (g)"))
            sodium = to_float(row.get("Sodium (mg)"))
            caffeine = to_float(row.get("Caffeine (mg)"))

            tags = ["beverage", "starbucks", "coffee"]
            if "tea" in category.lower() or "tea" in beverage.lower():
                tags.append("tea")
            if "smoothie" in category.lower() or "frappuccino" in category.lower():
                tags.append("shake-smoothie")
            if protein >= 10:
                tags.append("protein-boost")
            if calories <= 15:
                tags.append("zero-calorie")
            if "nonfat" in prep.lower() or "soy" in prep.lower() or "almond" in prep.lower():
                tags.append("plant-or-lean-dairy")

            item_data = {
                "id": f"sbux_{idx+1}",
                "name": full_name,
                "brand": "Starbucks",
                "category": category,
                "serving_size": prep,
                "calories": round(calories, 1),
                "protein_g": round(protein, 1),
                "carbs_g": round(carbs, 1),
                "fat_g": round(fat, 1),
                "fiber_g": round(fiber, 1),
                "sugars_g": round(sugars, 1),
                "sodium_mg": round(sodium, 1),
                "caffeine_mg": round(caffeine, 1),
                "dietary_tags": sorted(list(set(tags))),
                "search_text": f"Starbucks {full_name} {category} {prep} {calories}kcal {protein}g protein".lower()
            }
            items.append(item_data)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)

    print(f"Successfully cleaned {len(items)} Starbucks items -> {output_path}")
    return items

if __name__ == "__main__":
    clean_starbucks()
