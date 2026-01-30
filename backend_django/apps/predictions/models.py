"""
Prediction models for storing ML prediction results
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Prediction(models.Model):
    """Store prediction history"""
    
    # User association (optional for anonymous predictions)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='predictions'
    )
    
    # Prediction results
    animal_type = models.CharField(max_length=20)
    animal_type_confidence = models.FloatField()
    
    predicted_breed = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='predictions'
    )
    predicted_breed_name = models.CharField(max_length=100)
    breed_confidence = models.FloatField()
    
    # Top predictions (stored as JSON)
    top_predictions = models.JSONField(default=list)
    
    # Image data
    image = models.ImageField(upload_to='predictions/%Y/%m/%d/')
    image_hash = models.CharField(max_length=64, blank=True)  # For duplicate detection
    
    # Grad-CAM
    gradcam_image = models.TextField(blank=True)  # Base64 encoded
    gradcam_enabled = models.BooleanField(default=False)
    
    # User feedback
    user_feedback = models.CharField(
        max_length=20,
        choices=[
            ('correct', 'Correct'),
            ('incorrect', 'Incorrect'),
            ('unsure', 'Unsure'),
        ],
        blank=True
    )
    user_corrected_breed = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='corrections'
    )
    feedback_notes = models.TextField(blank=True)
    
    # Processing info
    processing_time_ms = models.IntegerField(default=0)
    model_version = models.CharField(max_length=50, default='1.0.0')
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Prediction')
        verbose_name_plural = _('Predictions')
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['predicted_breed', '-created_at']),
            models.Index(fields=['animal_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.predicted_breed_name} ({self.breed_confidence:.1%}) - {self.created_at}"


class PredictionSession(models.Model):
    """Track prediction sessions for analytics"""
    
    session_id = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prediction_sessions'
    )
    
    predictions_count = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    # Session metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = _('Prediction Session')
        verbose_name_plural = _('Prediction Sessions')
    
    def __str__(self):
        return f"Session {self.session_id[:8]}... ({self.predictions_count} predictions)"


class ModelVersion(models.Model):
    """Track ML model versions"""
    
    version = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    # Performance metrics
    accuracy = models.FloatField(null=True, blank=True)
    precision = models.FloatField(null=True, blank=True)
    recall = models.FloatField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    
    # Model files
    stage1_model_path = models.CharField(max_length=255, blank=True)
    stage2_cattle_model_path = models.CharField(max_length=255, blank=True)
    stage2_buffalo_model_path = models.CharField(max_length=255, blank=True)
    
    is_active = models.BooleanField(default=False)
    deployed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Model Version')
        verbose_name_plural = _('Model Versions')
    
    def __str__(self):
        return f"Model v{self.version}"
