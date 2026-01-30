"""
Prediction serializers
"""

from rest_framework import serializers
from .models import Prediction, PredictionSession


class PredictionSerializer(serializers.ModelSerializer):
    """Full prediction serializer"""
    
    breed_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'animal_type', 'animal_type_confidence',
            'predicted_breed_name', 'breed_confidence',
            'top_predictions', 'gradcam_image', 'gradcam_enabled',
            'user_feedback', 'feedback_notes',
            'processing_time_ms', 'model_version',
            'created_at', 'breed_info'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_breed_info(self, obj):
        if obj.predicted_breed:
            from apps.breeds.serializers import BreedListSerializer
            return BreedListSerializer(obj.predicted_breed).data
        return None


class PredictionCreateSerializer(serializers.Serializer):
    """Serializer for creating a prediction"""
    
    image = serializers.ImageField()
    include_gradcam = serializers.BooleanField(default=False)
    include_breed_info = serializers.BooleanField(default=True)


class PredictionFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for prediction feedback"""
    
    class Meta:
        model = Prediction
        fields = ['user_feedback', 'user_corrected_breed', 'feedback_notes']


class PredictionHistorySerializer(serializers.ModelSerializer):
    """Simplified serializer for prediction history"""
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'animal_type', 'predicted_breed_name',
            'breed_confidence', 'user_feedback', 'created_at'
        ]


class PredictionStatsSerializer(serializers.Serializer):
    """Serializer for prediction statistics"""
    
    total_predictions = serializers.IntegerField()
    cattle_predictions = serializers.IntegerField()
    buffalo_predictions = serializers.IntegerField()
    average_confidence = serializers.FloatField()
    feedback_stats = serializers.DictField()
    top_predicted_breeds = serializers.ListField()
    predictions_over_time = serializers.ListField()
