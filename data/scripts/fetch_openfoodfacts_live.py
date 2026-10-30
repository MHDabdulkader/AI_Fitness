"""
Live Open Food Facts API Ingestor
=================================
Fetches real-world verified food items from the free Open Food Facts REST API
without requiring massive 40GB downloads or API keys.
"""

import json
import time
from pathlib import Path
import requests

BASE_DIR = Path(__file__).resolve().parent.parent.parent

CATEGORIES = [
    "poultry",
    "fishes",
    "dairy-products",
    "cereals-and-potatoes",
    "fruits",
    "vegetables",
    "plant-based-foods",
    "protein-powders"
]

def fetch_category_foods(category, page_size=20):
    url = f"https://world.openfoodfacts.org/category/{category}.json"
    params = {
        "page_size": page_size,
        "sort_by": "popularity_key"
    }
    headers = {
        "User-Agent": "NutriFitAI - Fitness Nutrition Assistant - Student Portfolio"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Failed to fetch {category}: {response.status_code}")
            return []

        data = response.json()
        products = data.get("products", [])
        clean_items = []

        for p in products:
            name = p.get("product_name", "").strip()
            nutriments = p.get("nutriments", {})
            if not name:
                continue

            calories = nutriments.get("energy-kcal_100g") or nutriments.get("energy-kcal")
            protein = nutriments.get("proteins_100g") or nutriments.get("proteins")
            carbs = nutriments.get("carbohydrates_100g") or nutriments.get("carbohydrates")
            fat = nutriments.get("fat_100g") or nutriments.get("fat")

            if calories is None or protein is None:
                continue

            try:
                calories = float(calories)
                protein = float(protein)
                carbs = float(carbs or 0.0)
                fat = float(fat or 0.0)
            except (ValueError, TypeError):
                continue

            # Guardrails: discard corrupt nutritional values
            if calories > 950 or calories < 0 or protein > 100 or fat > 100 or carbs > 100:
                continue

            brand = p.get("brands", "Open Food Facts").strip()
            item = {
                "id": f"off_api_{p.get('_id', len(clean_items))}",
                "name": name,
                "brand": brand or "Open Food Facts",
                "category": category.replace("-", " ").title(),
                "serving_size": p.get("serving_size", "100g"),
                "calories": round(calories, 1),
                "protein_g": round(protein, 1),
                "carbs_g": round(carbs, 1),
                "fat_g": round(fat, 1),
                "fiber_g": round(float(nutriments.get("fiber_100g") or 0.0), 1),
                "sugars_g": round(float(nutriments.get("sugars_100g") or 0.0), 1),
                "sodium_mg": round(float(nutriments.get("sodium_100g") or 0.0) * 1000, 1),
                "dietary_tags": ["open-food-facts", category],
                "search_text": f"{name} {brand} {category} {calories}kcal {protein}g protein".lower()
            }
            clean_items.append(item)

        print(f"Fetched {len(clean_items)} verified items for '{category}'")
        return clean_items
    except Exception as e:
        print(f"Error fetching {category}: {e}")
        return []

def run_live_ingestion(output_path=None):
    if output_path is None:
        output_path = BASE_DIR / "data" / "processed" / "openfoodfacts_live.json"
    else:
        output_path = Path(output_path)

    all_items = []
    for cat in CATEGORIES:
        items = fetch_category_foods(cat, page_size=25)
        all_items.extend(items)
        time.sleep(0.5) # Polite rate limiting

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_items, f, indent=2)

    print(f"🎉 Successfully saved {len(all_items)} live items to {output_path}")
    return all_items

if __name__ == "__main__":
    run_live_ingestion()

