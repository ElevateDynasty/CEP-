"""
Analytics models for tracking usage and insights
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class DailyStats(models.Model):
    """Daily aggregated statistics"""
    
    date = models.DateField(unique=True)
    
    # Predictions
    total_predictions = models.IntegerField(default=0)
    cattle_predictions = models.IntegerField(default=0)
    buffalo_predictions = models.IntegerField(default=0)
    
    # Confidence
    avg_confidence = models.FloatField(default=0)
    high_confidence_count = models.IntegerField(default=0)  # > 80%
    low_confidence_count = models.IntegerField(default=0)   # < 50%
    
    # Users
    unique_users = models.IntegerField(default=0)
    new_registrations = models.IntegerField(default=0)
    
    # Breed views
    total_breed_views = models.IntegerField(default=0)
    total_comparisons = models.IntegerField(default=0)
    
    # API usage
    api_requests = models.IntegerField(default=0)
    
    # Processing
    avg_processing_time_ms = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name = _('Daily Statistics')
        verbose_name_plural = _('Daily Statistics')
    
    def __str__(self):
        return f"Stats for {self.date}"


class BreedPopularity(models.Model):
    """Track breed popularity over time"""
    
    breed = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.CASCADE,
        related_name='popularity_records'
    )
    date = models.DateField()
    
    prediction_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    favorite_count = models.IntegerField(default=0)
    comparison_count = models.IntegerField(default=0)
    
    popularity_score = models.FloatField(default=0)  # Calculated metric
    
    class Meta:
        unique_together = ['breed', 'date']
        ordering = ['-date', '-popularity_score']
        verbose_name = _('Breed Popularity')
        verbose_name_plural = _('Breed Popularity Records')
    
    def __str__(self):
        return f"{self.breed.name} - {self.date}"
    
    def calculate_score(self):
        """Calculate popularity score based on various factors"""
        self.popularity_score = (
            self.prediction_count * 3 +
            self.view_count * 1 +
            self.favorite_count * 5 +
            self.comparison_count * 2
        )
        self.save()


class UserActivity(models.Model):
    """Track user activity for engagement analytics"""
    
    ACTIVITY_TYPES = [
        ('prediction', 'Made Prediction'),
        ('view_breed', 'Viewed Breed'),
        ('compare', 'Compared Breeds'),
        ('favorite', 'Added Favorite'),
        ('feedback', 'Submitted Feedback'),
        ('login', 'Logged In'),
        ('register', 'Registered'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    
    # Optional references
    breed = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    prediction = models.ForeignKey(
        'predictions.Prediction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('User Activity')
        verbose_name_plural = _('User Activities')
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['activity_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email}: {self.activity_type}"


class SearchQuery(models.Model):
    """Track search queries for analytics"""
    
    query = models.CharField(max_length=255)
    results_count = models.IntegerField(default=0)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Search Query')
        verbose_name_plural = _('Search Queries')
    
    def __str__(self):
        return f"'{self.query}' ({self.results_count} results)"


class RegionalStats(models.Model):
    """Statistics by state/region"""
    
    state = models.ForeignKey(
        'core.State',
        on_delete=models.CASCADE,
        related_name='regional_stats'
    )
    date = models.DateField()
    
    predictions_count = models.IntegerField(default=0)
    users_count = models.IntegerField(default=0)
    top_breed = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        unique_together = ['state', 'date']
        ordering = ['-date']
        verbose_name = _('Regional Statistics')
        verbose_name_plural = _('Regional Statistics')
    
    def __str__(self):
        return f"{self.state.name} - {self.date}"
