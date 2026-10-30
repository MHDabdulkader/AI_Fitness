from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "FitCraft AI - Fitness & Macro Intelligence API",
        "version": "1.0.0",
        "endpoints": {
            "calculate_macros": "/api/nutrition/calculate-macros/ (POST, public)",
            "sample_plan": "/api/nutrition/public-sample-plan/ (POST, public)",
            "fast_food_optimizer": "/api/nutrition/fast-food-recommendation/ (GET, public)",
            "food_catalog": "/api/nutrition/foods/ (GET, public)",
            "generate_7day_plan": "/api/nutrition/generate-7day-plan/ (POST, pro/trial)",
            "stripe_trial_checkout": "/api/billing/checkout-trial/ (POST)",
            "subscription_status": "/api/billing/status/ (GET)",
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', health_check, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path('api/nutrition/', include('apps.nutrition.urls')),
    path('api/billing/', include('apps.billing.urls')),
]
