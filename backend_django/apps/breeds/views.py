"""
Breed views
"""

from rest_framework import generics, status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db.models import F

from .models import Breed, BreedComparison, BreedResource
from .serializers import (
    BreedListSerializer,
    BreedDetailSerializer,
    BreedCompareSerializer,
    BreedComparisonResultSerializer,
    BreedResourceSerializer,
    BreedComparisonPopularSerializer
)


class BreedFilter(filters.FilterSet):
    """Filter for breeds"""
    
    animal_type = filters.ChoiceFilter(choices=Breed.ANIMAL_TYPES)
    conservation_status = filters.ChoiceFilter(choices=Breed.CONSERVATION_STATUS)
    min_carbon_score = filters.NumberFilter(field_name='carbon_score', lookup_expr='gte')
    state = filters.CharFilter(field_name='native_states__name', lookup_expr='icontains')
    
    class Meta:
        model = Breed
        fields = ['animal_type', 'conservation_status', 'population_trend']


class BreedListView(generics.ListAPIView):
    """
    List all breeds with filtering, search, and ordering
    
    Supports filtering by:
    - animal_type: cattle or buffalo
    - conservation_status: not_endangered, vulnerable, endangered, critical
    - state: Native state name
    - min_carbon_score: Minimum sustainability score
    
    Search by name, name_hindi, native_region
    Order by name, carbon_score, view_count
    """
    queryset = Breed.objects.filter(is_active=True)
    serializer_class = BreedListSerializer
    permission_classes = [AllowAny]
    filterset_class = BreedFilter
    search_fields = ['name', 'name_hindi', 'native_region']
    ordering_fields = ['name', 'carbon_score', 'view_count', 'created_at']
    ordering = ['name']


class BreedDetailView(generics.RetrieveAPIView):
    """
    Get detailed information about a specific breed
    
    Use breed_id (e.g., 'gir', 'murrah') or database ID
    """
    queryset = Breed.objects.filter(is_active=True)
    serializer_class = BreedDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'breed_id'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Breed.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BreedByIdView(generics.RetrieveAPIView):
    """
    Get breed by database ID
    """
    queryset = Breed.objects.filter(is_active=True)
    serializer_class = BreedDetailSerializer
    permission_classes = [AllowAny]


class BreedCompareView(views.APIView):
    """
    Compare multiple breeds (2-4 breeds)
    
    POST with { "breed_ids": ["gir", "sahiwal", "murrah"] }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = BreedCompareSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        breed_ids = serializer.validated_data['breed_ids']
        breeds = Breed.objects.filter(breed_id__in=breed_ids)
        
        # Track comparison
        if len(breed_ids) == 2:
            self._track_comparison(breed_ids[0], breed_ids[1])
        
        # Generate comparison metrics
        comparison_metrics = self._generate_comparison_metrics(breeds)
        recommendation = self._generate_recommendation(breeds)
        
        result = {
            'breeds': BreedDetailSerializer(breeds, many=True).data,
            'comparison_metrics': comparison_metrics,
            'recommendation': recommendation
        }
        
        return Response(result)
    
    def _track_comparison(self, breed_id_1, breed_id_2):
        """Track comparison for analytics"""
        try:
            breed_1 = Breed.objects.get(breed_id=breed_id_1)
            breed_2 = Breed.objects.get(breed_id=breed_id_2)
            
            # Ensure consistent ordering
            if breed_1.id > breed_2.id:
                breed_1, breed_2 = breed_2, breed_1
            
            comparison, created = BreedComparison.objects.get_or_create(
                breed_1=breed_1,
                breed_2=breed_2
            )
            comparison.increment_count()
        except Breed.DoesNotExist:
            pass
    
    def _generate_comparison_metrics(self, breeds):
        """Generate comparison metrics between breeds"""
        metrics = {
            'carbon_scores': {},
            'milk_yield': {},
            'heat_tolerance': {},
            'best_carbon_score': None,
            'category_winners': {}
        }
        
        max_carbon = 0
        best_carbon_breed = None
        
        for breed in breeds:
            metrics['carbon_scores'][breed.breed_id] = breed.carbon_score
            metrics['milk_yield'][breed.breed_id] = breed.milk_yield_per_day
            metrics['heat_tolerance'][breed.breed_id] = breed.heat_tolerance
            
            if breed.carbon_score > max_carbon:
                max_carbon = breed.carbon_score
                best_carbon_breed = breed.breed_id
        
        metrics['best_carbon_score'] = best_carbon_breed
        
        return metrics
    
    def _generate_recommendation(self, breeds):
        """Generate a recommendation based on breed comparison"""
        if not breeds:
            return ""
        
        # Simple recommendation based on carbon score
        best_breed = max(breeds, key=lambda b: b.carbon_score)
        
        return f"{best_breed.name} has the highest sustainability score ({best_breed.carbon_score}/100) " \
               f"with {best_breed.heat_tolerance} heat tolerance, making it ideal for " \
               f"{', '.join(best_breed.best_for[:2]) if best_breed.best_for else 'general farming'}."


class PopularComparisonsView(generics.ListAPIView):
    """
    Get most popular breed comparisons
    """
    queryset = BreedComparison.objects.all()[:10]
    serializer_class = BreedComparisonPopularSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class BreedsByStateView(views.APIView):
    """
    Get breeds native to a specific state
    """
    permission_classes = [AllowAny]
    
    def get(self, request, state_name):
        breeds = Breed.objects.filter(
            is_active=True,
            native_states__name__icontains=state_name
        )
        
        serializer = BreedListSerializer(breeds, many=True)
        
        return Response({
            'state': state_name,
            'total': breeds.count(),
            'breeds': serializer.data
        })


class BreedStatsView(views.APIView):
    """
    Get overall breed statistics
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        total_breeds = Breed.objects.filter(is_active=True).count()
        cattle_count = Breed.objects.filter(is_active=True, animal_type='cattle').count()
        buffalo_count = Breed.objects.filter(is_active=True, animal_type='buffalo').count()
        
        # Conservation breakdown
        conservation_stats = {}
        for status, label in Breed.CONSERVATION_STATUS:
            conservation_stats[status] = Breed.objects.filter(
                is_active=True,
                conservation_status=status
            ).count()
        
        # Most viewed breeds
        most_viewed = Breed.objects.filter(is_active=True).order_by('-view_count')[:5]
        
        # Average carbon score by type
        from django.db.models import Avg
        avg_scores = Breed.objects.filter(is_active=True).values('animal_type').annotate(
            avg_carbon=Avg('carbon_score')
        )
        
        return Response({
            'total_breeds': total_breeds,
            'cattle_count': cattle_count,
            'buffalo_count': buffalo_count,
            'conservation_breakdown': conservation_stats,
            'most_viewed': BreedListSerializer(most_viewed, many=True).data,
            'average_carbon_scores': {item['animal_type']: item['avg_carbon'] for item in avg_scores}
        })
