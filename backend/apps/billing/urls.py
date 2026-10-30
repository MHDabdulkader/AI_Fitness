from django.urls import path
from apps.billing.views import (
    CreateTrialCheckoutSessionView,
    SubscriptionStatusView,
    StripeWebhookView
)

urlpatterns = [
    path('checkout-trial/', CreateTrialCheckoutSessionView.as_view(), name='checkout-trial'),
    path('status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]

