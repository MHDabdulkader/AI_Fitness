from django.db import models
from django.contrib.auth.models import User

class FoodItem(models.Model):
    external_id = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    brand = models.CharField(max_length=120, db_index=True)
    category = models.CharField(max_length=120, db_index=True)
    serving_size = models.CharField(max_length=120, blank=True, default='')
    calories = models.FloatField(db_index=True)
    protein_g = models.FloatField(db_index=True)
    carbs_g = models.FloatField(default=0.0)
    fat_g = models.FloatField(default=0.0)
    fiber_g = models.FloatField(default=0.0)
    sugars_g = models.FloatField(default=0.0)
    sodium_mg = models.FloatField(default=0.0)
    dietary_tags = models.JSONField(default=list, blank=True)
    search_text = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['brand', 'category']),
            models.Index(fields=['calories', 'protein_g']),
        ]

    def __str__(self):
        return f"{self.brand} - {self.name} ({self.calories} kcal, {self.protein_g}g P)"


class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]

    ACTIVITY_CHOICES = [
        ('sedentary', 'Sedentary (desk job, little exercise)'),
        ('light', 'Lightly Active (1-3 days/week exercise)'),
        ('moderate', 'Moderately Active (3-5 days/week exercise)'),
        ('very', 'Very Active (6-7 days/week intense exercise)'),
        ('extra', 'Extra Active (physical job & double daily training)'),
    ]

    GOAL_CHOICES = [
        ('lose_weight', 'Weight Loss (Caloric Deficit)'),
        ('maintain', 'Maintain Weight & Recomposition'),
        ('gain_weight', 'Weight / Muscle Gain (Caloric Surplus)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='fitness_profile')
    guest_session_id = models.CharField(max_length=128, blank=True, null=True, db_index=True)

    age = models.IntegerField(default=25)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    height_cm = models.FloatField(default=175.0)
    weight_kg = models.FloatField(default=75.0)
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='moderate')
    fitness_goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='lose_weight')

    # Computed Macro Targets
    bmr = models.FloatField(default=0.0)
    tdee = models.FloatField(default=0.0)
    target_calories = models.FloatField(default=2000.0)
    target_protein_g = models.FloatField(default=150.0)
    target_carbs_g = models.FloatField(default=200.0)
    target_fat_g = models.FloatField(default=65.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        user_name = self.user.username if self.user else f"Guest ({self.guest_session_id})"
        return f"{user_name} Profile - {self.fitness_goal} ({self.target_calories:.0f} kcal)"


class MealPlan(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='meal_plans')
    title = models.CharField(max_length=255, default='Daily Nutrition Plan')
    day_number = models.IntegerField(default=1) # 1 to 7
    is_sample_guest_plan = models.BooleanField(default=False)

    # Detailed structured meal plan JSON:
    # {
    #   "summary": "...",
    #   "meals": [
    #      {"meal_type": "Breakfast", "items": [...], "meal_calories": 500, ...},
    #      ...
    #   ]
    # }
    plan_json = models.JSONField(default=dict)

    total_calories = models.FloatField(default=0.0)
    total_protein_g = models.FloatField(default=0.0)
    total_carbs_g = models.FloatField(default=0.0)
    total_fat_g = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Day {self.day_number} Plan for {self.user_profile} - {self.total_calories:.0f} kcal"
