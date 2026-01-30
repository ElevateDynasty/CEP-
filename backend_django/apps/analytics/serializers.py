"""
Analytics serializers
"""

from rest_framework import serializers
from .models import DailyStats, BreedPopularity, UserActivity, SearchQuery


class DailyStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStats
        fields = '__all__'


class BreedPopularitySerializer(serializers.ModelSerializer):
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    breed_id = serializers.CharField(source='breed.breed_id', read_only=True)
    
    class Meta:
        model = BreedPopularity
        fields = [
            'breed_id', 'breed_name', 'date',
            'prediction_count', 'view_count', 'favorite_count',
            'comparison_count', 'popularity_score'
        ]


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ['id', 'activity_type', 'breed', 'metadata', 'created_at']


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    
    # Overview
    total_predictions = serializers.IntegerField()
    total_users = serializers.IntegerField()
    total_breeds = serializers.IntegerField()
    
    # Today's stats
    today_predictions = serializers.IntegerField()
    today_new_users = serializers.IntegerField()
    
    # Trends
    prediction_trend = serializers.ListField()
    user_trend = serializers.ListField()
    
    # Top items
    top_breeds = serializers.ListField()
    top_states = serializers.ListField()
    
    # Accuracy
    avg_confidence = serializers.FloatField()
    feedback_accuracy = serializers.FloatField()
