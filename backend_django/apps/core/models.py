"""
Core app models - Government Schemes and other shared models
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class GovernmentScheme(models.Model):
    """Government schemes for cattle and buffalo rearing"""
    
    SCHEME_TYPES = [
        ('financial', 'Financial Assistance'),
        ('insurance', 'Insurance'),
        ('breeding', 'Breeding Program'),
        ('healthcare', 'Healthcare'),
        ('infrastructure', 'Infrastructure'),
        ('training', 'Training'),
        ('marketing', 'Marketing Support'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('discontinued', 'Discontinued'),
        ('upcoming', 'Upcoming'),
    ]
    
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    description_hindi = models.TextField(blank=True)
    scheme_type = models.CharField(max_length=20, choices=SCHEME_TYPES)
    
    # Eligibility
    eligible_states = models.JSONField(default=list, help_text="List of eligible states")
    eligible_breeds = models.JSONField(default=list, help_text="List of eligible breed IDs")
    eligibility_criteria = models.TextField(blank=True)
    
    # Benefits
    benefits = models.TextField()
    max_subsidy_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    subsidy_percentage = models.IntegerField(null=True, blank=True)
    
    # Application
    application_process = models.TextField(blank=True)
    required_documents = models.JSONField(default=list)
    application_url = models.URLField(blank=True)
    
    # Status and dates
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    launch_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Metadata
    implementing_agency = models.CharField(max_length=255, blank=True)
    contact_info = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Government Scheme')
        verbose_name_plural = _('Government Schemes')
    
    def __str__(self):
        return self.name


class State(models.Model):
    """Indian states for location-based features"""
    
    name = models.CharField(max_length=100, unique=True)
    name_hindi = models.CharField(max_length=100, blank=True)
    code = models.CharField(max_length=5, unique=True)
    region = models.CharField(max_length=50, blank=True)  # North, South, East, West, Central
    
    class Meta:
        ordering = ['name']
        verbose_name = _('State')
        verbose_name_plural = _('States')
    
    def __str__(self):
        return self.name


class Feedback(models.Model):
    """User feedback and suggestions"""
    
    FEEDBACK_TYPES = [
        ('bug', 'Bug Report'),
        ('feature', 'Feature Request'),
        ('correction', 'Data Correction'),
        ('general', 'General Feedback'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks'
    )
    email = models.EmailField(blank=True)
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related content
    related_breed = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks'
    )
    related_prediction = models.ForeignKey(
        'predictions.Prediction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks'
    )
    
    # Status tracking
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Feedback')
        verbose_name_plural = _('Feedbacks')
    
    def __str__(self):
        return f"{self.feedback_type}: {self.subject}"
