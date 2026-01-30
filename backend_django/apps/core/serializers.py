"""
Core app serializers
"""

from rest_framework import serializers
from .models import GovernmentScheme, State, Feedback


class GovernmentSchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentScheme
        fields = '__all__'


class GovernmentSchemeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list view"""
    
    class Meta:
        model = GovernmentScheme
        fields = [
            'id', 'name', 'name_hindi', 'scheme_type', 'status',
            'max_subsidy_amount', 'subsidy_percentage', 'implementing_agency'
        ]


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            'id', 'feedback_type', 'subject', 'message', 'email',
            'related_breed', 'related_prediction', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
