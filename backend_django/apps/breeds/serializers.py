"""
Breed serializers
"""

from rest_framework import serializers
from .models import Breed, BreedComparison, BreedResource


class BreedListSerializer(serializers.ModelSerializer):
    """Simplified serializer for breed listing"""
    
    native_states = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = Breed
        fields = [
            'id', 'breed_id', 'name', 'name_hindi', 'animal_type',
            'native_states', 'milk_yield_per_day', 'conservation_status',
            'carbon_score', 'image', 'view_count'
        ]


class BreedDetailSerializer(serializers.ModelSerializer):
    """Full breed details serializer"""
    
    native_states = serializers.StringRelatedField(many=True)
    productivity = serializers.SerializerMethodField()
    sustainability = serializers.SerializerMethodField()
    economic = serializers.SerializerMethodField()
    resources = serializers.SerializerMethodField()
    
    class Meta:
        model = Breed
        fields = [
            'id', 'breed_id', 'name', 'name_hindi', 'animal_type',
            'native_states', 'native_region', 'characteristics',
            'productivity', 'sustainability', 'economic',
            'population_status', 'population_trend', 'conservation_status',
            'best_for', 'government_schemes', 'fun_fact', 'description',
            'image', 'gallery', 'resources', 'view_count',
            'created_at', 'updated_at'
        ]
    
    def get_productivity(self, obj):
        return obj.productivity_summary
    
    def get_sustainability(self, obj):
        return obj.sustainability_summary
    
    def get_economic(self, obj):
        return obj.economic_summary
    
    def get_resources(self, obj):
        return BreedResourceSerializer(obj.resources.all()[:5], many=True).data


class BreedCompareSerializer(serializers.Serializer):
    """Serializer for breed comparison"""
    
    breed_ids = serializers.ListField(
        child=serializers.CharField(),
        min_length=2,
        max_length=4,
        help_text="List of 2-4 breed IDs to compare"
    )
    
    def validate_breed_ids(self, value):
        breeds = Breed.objects.filter(breed_id__in=value)
        if breeds.count() != len(value):
            raise serializers.ValidationError("One or more breed IDs not found")
        return value


class BreedComparisonResultSerializer(serializers.Serializer):
    """Serializer for comparison results"""
    
    breeds = BreedDetailSerializer(many=True)
    comparison_metrics = serializers.DictField()
    recommendation = serializers.CharField(allow_blank=True)


class BreedResourceSerializer(serializers.ModelSerializer):
    """Serializer for breed resources"""
    
    class Meta:
        model = BreedResource
        fields = ['id', 'title', 'resource_type', 'url', 'description', 'is_official']


class BreedComparisonPopularSerializer(serializers.ModelSerializer):
    """Serializer for popular comparisons"""
    
    breed_1_name = serializers.CharField(source='breed_1.name')
    breed_2_name = serializers.CharField(source='breed_2.name')
    breed_1_id = serializers.CharField(source='breed_1.breed_id')
    breed_2_id = serializers.CharField(source='breed_2.breed_id')
    
    class Meta:
        model = BreedComparison
        fields = [
            'breed_1_id', 'breed_1_name',
            'breed_2_id', 'breed_2_name',
            'comparison_count'
        ]
