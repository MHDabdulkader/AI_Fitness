from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserSubscription(models.Model):
    STATUS_CHOICES = [
        ('inactive', 'Inactive'),
        ('trialing', 'Free Trial Active'),
        ('active', 'Pro Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
    ]

    PLAN_CHOICES = [
        ('free', 'Free Guest / Registered'),
        ('trial_3day', '3-Day Trial'),
        ('trial_7day', '7-Day Trial'),
        ('pro_monthly', 'Pro Monthly ($9.99/mo)'),
        ('pro_yearly', 'Pro Yearly ($79.99/yr)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    stripe_customer_id = models.CharField(max_length=120, blank=True, default='')
    stripe_subscription_id = models.CharField(max_length=120, blank=True, default='')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    plan_tier = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    
    trial_start = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_premium_active(self):
        """Returns True if the user has an active paid subscription or unexpired trial."""
        now = timezone.now()
        if self.status == 'active':
            return True
        if self.status == 'trialing' and self.trial_end and self.trial_end > now:
            return True
        return False

    @property
    def days_remaining_in_trial(self):
        if self.status == 'trialing' and self.trial_end:
            now = timezone.now()
            remaining = (self.trial_end - now).days
            return max(0, remaining)
        return 0

    def __str__(self):
        return f"{self.user.username} - {self.plan_tier} ({self.status})"
