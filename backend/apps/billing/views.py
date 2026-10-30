import json
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
from apps.billing.models import UserSubscription

class CreateTrialCheckoutSessionView(APIView):
    """
    Creates a Stripe Checkout Session with a 3 or 7-day free trial.
    """
    def post(self, request):
        plan_tier = request.data.get("plan_tier", "trial_7day")
        success_url = request.data.get("success_url", f"{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}")
        cancel_url = request.data.get("cancel_url", f"{settings.FRONTEND_URL}/pricing")

        trial_days = 7 if plan_tier == "trial_7day" else 3 if plan_tier == "trial_3day" else 0

        stripe_key = getattr(settings, "STRIPE_SECRET_KEY", "")

        # If Stripe key is test placeholder or unconfigured, provide a simulation mode so frontend works immediately
        if not stripe_key or stripe_key.startswith("sk_test_placeholder"):
            # Mock session response for instant local preview
            mock_session_id = f"cs_test_mock_{timezone.now().timestamp()}"
            if request.user.is_authenticated:
                sub, _ = UserSubscription.objects.get_or_create(user=request.user)
                sub.status = "trialing"
                sub.plan_tier = plan_tier
                sub.trial_start = timezone.now()
                sub.trial_end = timezone.now() + timedelta(days=trial_days)
                sub.save()

            return Response({
                "checkout_url": f"{settings.FRONTEND_URL}/dashboard?mock_trial_activated=true&days={trial_days}",
                "is_simulation": True,
                "message": f"Stripe Simulation: {trial_days}-Day Trial activated! (Add real sk_test in backend/.env for live Stripe Checkout redirect)."
            }, status=status.HTTP_200_OK)

        try:
            stripe.api_key = stripe_key
            # Create actual Stripe Checkout Session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='subscription',
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'FitCraft AI Pro ({trial_days}-Day Free Trial)',
                            'description': 'Full AI Meal Planner, 7-Day Plans, Restaurant Optimizer',
                        },
                        'unit_amount': 999, # $9.99/mo after trial
                        'recurring': {'interval': 'month'},
                    },
                    'quantity': 1,
                }],
                subscription_data={
                    'trial_period_days': trial_days if trial_days > 0 else None,
                },
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return Response({"checkout_url": session.url, "session_id": session.id}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionStatusView(APIView):
    """
    Returns user's current trial / pro subscription status.
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({
                "authenticated": False,
                "status": "guest",
                "plan_tier": "free",
                "is_premium_active": False,
                "trial_days_remaining": 0
            }, status=status.HTTP_200_OK)

        sub, _ = UserSubscription.objects.get_or_create(user=request.user)
        return Response({
            "authenticated": True,
            "status": sub.status,
            "plan_tier": sub.plan_tier,
            "is_premium_active": sub.is_premium_active,
            "trial_days_remaining": sub.days_remaining_in_trial,
            "trial_end": sub.trial_end
        }, status=status.HTTP_200_OK)


class StripeWebhookView(APIView):
    """
    Handles asynchronous Stripe webhooks (checkout.session.completed, etc.)
    """
    permission_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")

        if webhook_secret and not webhook_secret.startswith("whsec_placeholder"):
            try:
                event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                event = json.loads(payload.decode('utf-8'))
            except Exception:
                event = {}

        event_type = event.get('type')
        print(f"🔔 Received Stripe Webhook Event: {event_type}")

        # Handle trial / subscription updates
        if event_type == 'checkout.session.completed':
            session = event['data']['object']
            # Subscription initialized
            print(f"Customer completed checkout: {session.get('customer')}")

        return Response({"received": True}, status=status.HTTP_200_OK)
