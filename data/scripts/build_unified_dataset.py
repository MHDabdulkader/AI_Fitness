"""
Unified Food Nutrition Dataset Builder
======================================
Merges McDonald's, Starbucks, and Curated Whole Foods (Open Food Facts subset)
into a single high-performance dataset for RAG, vector search, and meal planning.
"""

import json
import os
from pathlib import Path
import pandas as pd
from clean_mcdonalds import clean_mcdonalds
from clean_starbucks import clean_starbucks
from generate_curated_fitness_foods import generate_curated_dataset

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def build_unified_dataset(
    output_json=None,
    output_csv=None
):
    if output_json is None:
        output_json = BASE_DIR / "data" / "processed" / "unified_foods.json"
    else:
        output_json = Path(output_json)

    if output_csv is None:
        output_csv = BASE_DIR / "data" / "processed" / "unified_foods.csv"
    else:
        output_csv = Path(output_csv)

    print("🔄 Step 1: Processing McDonald's menu...")
    mcd_items = clean_mcdonalds()

    print("🔄 Step 2: Processing Starbucks menu...")
    sbux_items = clean_starbucks()

    print("🔄 Step 3: Generating Curated Whole Foods / Open Food Facts...")
    curated_items = generate_curated_dataset()

    all_items = mcd_items + sbux_items + curated_items
    print(f"📦 Total merged food items: {len(all_items)}")

    # Ensure output directory exists
    output_json.parent.mkdir(parents=True, exist_ok=True)

    # 1. Save unified JSON
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(all_items, f, indent=2)
    print(f"✅ Saved JSON to: {output_json} ({round(os.path.getsize(output_json)/1024, 1)} KB)")

    # 2. Save unified CSV (for fast pandas / SQL loading)
    flattened = []
    for item in all_items:
        row = dict(item)
        row["dietary_tags"] = ", ".join(row.get("dietary_tags", []))
        flattened.append(row)

    df = pd.DataFrame(flattened)
    df.to_csv(output_csv, index=False)
    print(f"✅ Saved CSV to: {output_csv} ({round(os.path.getsize(output_csv)/1024, 1)} KB)")

    print("\n--- DATASET SUMMARY ---")
    print(f"McDonald's Items : {len(mcd_items)}")
    print(f"Starbucks Items  : {len(sbux_items)}")
    print(f"Whole Food Items : {len(curated_items)}")
    print(f"Total Database   : {len(all_items)} searchable nutrition items")
    return all_items

if __name__ == "__main__":
    build_unified_dataset()
