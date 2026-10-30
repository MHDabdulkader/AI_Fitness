from django.urls import path
from apps.nutrition.views import (
    CalculateMacrosView,
    PublicSamplePlanView,
    FastFoodRecommenderView,
    FoodCatalogSearchView,
    Generate7DayPlanView,
    AISwapMealView
)

urlpatterns = [
    path('calculate-macros/', CalculateMacrosView.as_view(), name='calculate-macros'),
    path('public-sample-plan/', PublicSamplePlanView.as_view(), name='public-sample-plan'),
    path('fast-food-recommendation/', FastFoodRecommenderView.as_view(), name='fast-food-recommendation'),
    path('foods/', FoodCatalogSearchView.as_view(), name='food-catalog-search'),
    path('generate-7day-plan/', Generate7DayPlanView.as_view(), name='generate-7day-plan'),
    path('ai-swap-meal/', AISwapMealView.as_view(), name='ai-swap-meal'),
]
