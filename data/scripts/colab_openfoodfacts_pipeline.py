"""
Open Food Facts Cloud Data Pipeline (for Google Colab or Kaggle Notebooks)
==========================================================================
Run this script in a free Kaggle Notebook or Google Colab to process the 
massive 40GB+ Open Food Facts dataset in the cloud with ZERO local disk usage!

Steps to use in Kaggle:
1. Create a new notebook on kaggle.com
2. Click "Add Input" -> Search "Open Food Facts" -> Add `openfoodfacts/world-food-facts`
3. Paste and run this script.
4. Download the resulting lightweight `openfoodfacts_fitness_curated.csv` (~5MB).
"""

import os
import pandas as pd

def process_openfoodfacts_in_cloud(
    input_file="/kaggle/input/world-food-facts/en.openfoodfacts.org.products.tsv",
    output_file="openfoodfacts_fitness_curated.csv",
    chunk_size=50000,
    max_clean_records=25000
):
    print("🚀 Starting Open Food Facts Cloud Extraction...")
    
    # Columns we care about for fitness & macros
    target_columns = [
        "product_name",
        "brands",
        "categories_en",
        "serving_size",
        "energy_100g",
        "proteins_100g",
        "carbohydrates_100g",
        "fat_100g",
        "fiber_100g",
        "sugars_100g",
        "sodium_100g"
    ]
    
    # High-relevance fitness categories
    fitness_keywords = [
        "chicken", "beef", "turkey", "fish", "salmon", "tuna", "egg", 
        "oat", "rice", "bread", "pasta", "quinoa", "potato", 
        "yogurt", "milk", "cheese", "whey", "protein", "tofu", "lentil",
        "almond", "peanut", "walnut", "apple", "banana", "berry", "spinach", "broccoli"
    ]
    
    clean_records = []
    
    # Process in chunks to avoid memory overflow (OOM)
    for chunk_idx, chunk in enumerate(pd.read_csv(
        input_file, 
        sep="\t", 
        usecols=lambda c: c in target_columns, 
        chunksize=chunk_size, 
        low_memory=False,
        on_bad_lines="skip"
    )):
        # 1. Drop rows without product name or basic macros
        chunk = chunk.dropna(subset=["product_name", "energy_100g", "proteins_100g", "fat_100g", "carbohydrates_100g"])
        
        # 2. Convert energy from kJ to kcal if necessary (1 kcal ≈ 4.184 kJ)
        # Open Food Facts often stores energy_100g in kJ
        chunk["calories_100g"] = chunk["energy_100g"].apply(
            lambda x: round(x / 4.184, 1) if x > 900 else round(x, 1)
        )
        
        # 3. Macro plausibility guardrails (100g cannot have >100g of any macro or >950 kcal)
        valid_macros = (
            (chunk["calories_100g"] <= 950) & (chunk["calories_100g"] >= 0) &
            (chunk["proteins_100g"] <= 100) & (chunk["proteins_100g"] >= 0) &
            (chunk["fat_100g"] <= 100) & (chunk["fat_100g"] >= 0) &
            (chunk["carbohydrates_100g"] <= 100) & (chunk["carbohydrates_100g"] >= 0)
        )
        chunk = chunk[valid_macros]
        
        # 4. Filter for staple fitness foods
        pattern = "|".join(fitness_keywords)
        matched = chunk[chunk["product_name"].str.contains(pattern, case=False, na=False)]
        
        clean_records.append(matched)
        current_total = sum(len(c) for c in clean_records)
        print(f"Processed chunk {chunk_idx + 1}... Extracted {current_total} quality records so far.")
        
        if current_total >= max_clean_records:
            print("Reached target record count!")
            break

    df_final = pd.concat(clean_records, ignore_index=True).drop_duplicates(subset=["product_name", "brands"])
    df_final.to_csv(output_file, index=False)
    print(f"✅ Successfully exported {len(df_final)} fitness foods to {output_file} (File size: ~{round(os.path.getsize(output_file)/(1024*1024), 2)} MB)")

if __name__ == "__main__":
    # In Colab/Kaggle, replace input_file with mounted path
    print("Cloud Pipeline Script Ready. See instructions in header docstring.")

