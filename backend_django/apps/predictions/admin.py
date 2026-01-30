from django.contrib import admin
from .models import Prediction, PredictionSession, ModelVersion


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'animal_type', 'predicted_breed_name',
        'breed_confidence', 'user_feedback', 'created_at'
    ]
    list_filter = ['animal_type', 'user_feedback', 'created_at', 'gradcam_enabled']
    search_fields = ['predicted_breed_name', 'user__email']
    readonly_fields = ['created_at', 'processing_time_ms', 'image_hash']
    raw_id_fields = ['user', 'predicted_breed', 'user_corrected_breed']
    
    fieldsets = (
        ('Prediction Result', {
            'fields': ('animal_type', 'animal_type_confidence', 'predicted_breed', 
                      'predicted_breed_name', 'breed_confidence', 'top_predictions')
        }),
        ('Image', {
            'fields': ('image', 'image_hash', 'gradcam_enabled')
        }),
        ('User Info', {
            'fields': ('user', 'ip_address', 'user_agent')
        }),
        ('Feedback', {
            'fields': ('user_feedback', 'user_corrected_breed', 'feedback_notes')
        }),
        ('Technical', {
            'fields': ('processing_time_ms', 'model_version', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PredictionSession)
class PredictionSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'predictions_count', 'started_at', 'last_activity']
    list_filter = ['started_at']
    search_fields = ['session_id', 'user__email']
    raw_id_fields = ['user']


@admin.register(ModelVersion)
class ModelVersionAdmin(admin.ModelAdmin):
    list_display = ['version', 'accuracy', 'is_active', 'deployed_at', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['version', 'description']
