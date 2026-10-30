import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from apps.nutrition.models import FoodItem

class Command(BaseCommand):
    help = "Seeds database with processed nutrition datasets (McDonald's, Starbucks, Open Food Facts)"

    def handle(self, *args, **options):
        # Look in candidate paths
        candidate_paths = [
            settings.BASE_DIR / "data" / "processed" / "unified_foods.json",
            settings.BASE_DIR.parent / "data" / "processed" / "unified_foods.json",
            Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "unified_foods.json",
        ]

        json_path = None
        for p in candidate_paths:
            if p.exists():
                json_path = p
                break

        if not json_path:
            self.stdout.write(self.style.WARNING("⚠️ Warning: unified_foods.json not found in candidate paths. Skipping food seed."))
            return

        with open(json_path, "r", encoding="utf-8") as f:
            foods_data = json.load(f)

        self.stdout.write(f"Loading {len(foods_data)} food items from {json_path}...")

        created_count = 0
        updated_count = 0

        for item in foods_data:
            obj, created = FoodItem.objects.update_or_create(
                external_id=item["id"],
                defaults={
                    "name": item["name"],
                    "brand": item["brand"],
                    "category": item.get("category", ""),
                    "serving_size": item.get("serving_size", ""),
                    "calories": item.get("calories", 0.0),
                    "protein_g": item.get("protein_g", 0.0),
                    "carbs_g": item.get("carbs_g", 0.0),
                    "fat_g": item.get("fat_g", 0.0),
                    "fiber_g": item.get("fiber_g", 0.0),
                    "sugars_g": item.get("sugars_g", 0.0),
                    "sodium_mg": item.get("sodium_mg", 0.0),
                    "dietary_tags": item.get("dietary_tags", []),
                    "search_text": item.get("search_text", ""),
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Done! Created: {created_count}, Updated: {updated_count}. Total in DB: {FoodItem.objects.count()}"
            )
        )
