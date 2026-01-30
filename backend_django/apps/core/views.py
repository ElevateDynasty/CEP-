"""
Core app views
"""

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.conf import settings

from .models import GovernmentScheme, State, Feedback
from .serializers import (
    GovernmentSchemeSerializer,
    GovernmentSchemeListSerializer,
    StateSerializer,
    FeedbackSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root - Welcome endpoint with available endpoints
    """
    return Response({
        'status': 'healthy',
        'message': 'Indian Cattle & Buffalo Breed Recognition API (Django)',
        'version': '2.0.0',
        'endpoints': {
            'docs': '/api/docs/',
            'redoc': '/api/redoc/',
            'predict': '/api/v1/predict/',
            'breeds': '/api/v1/breeds/',
            'compare': '/api/v1/breeds/compare/',
            'schemes': '/api/v1/schemes/',
            'analytics': '/api/v1/analytics/',
            'auth': '/api/v1/users/',
        },
        'features': [
            'Two-stage ML breed classification',
            'Grad-CAM explainability',
            'Breed comparison',
            'User authentication',
            'Prediction history',
            'Government schemes database',
            'Analytics dashboard',
            'Favorites and bookmarks',
        ]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring
    """
    from apps.predictions.services import ModelService
    
    try:
        model_service = ModelService()
        model_loaded = model_service.is_loaded
    except Exception:
        model_loaded = False
    
    return Response({
        'status': 'healthy',
        'database': 'connected',
        'ml_model': 'loaded' if model_loaded else 'not loaded',
        'debug_mode': settings.DEBUG,
        'version': '2.0.0'
    })


class GovernmentSchemeListView(generics.ListAPIView):
    """
    List all government schemes with filtering
    """
    queryset = GovernmentScheme.objects.filter(status='active')
    permission_classes = [AllowAny]
    filterset_fields = ['scheme_type', 'status']
    search_fields = ['name', 'name_hindi', 'description']
    ordering_fields = ['name', 'max_subsidy_amount', 'created_at']
    
    def get_serializer_class(self):
        if self.request.query_params.get('detailed') == 'true':
            return GovernmentSchemeSerializer
        return GovernmentSchemeListSerializer


class GovernmentSchemeDetailView(generics.RetrieveAPIView):
    """
    Get detailed information about a government scheme
    """
    queryset = GovernmentScheme.objects.all()
    serializer_class = GovernmentSchemeSerializer
    permission_classes = [AllowAny]


class StateListView(generics.ListAPIView):
    """
    List all Indian states
    """
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class FeedbackCreateView(generics.CreateAPIView):
    """
    Submit user feedback
    """
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [AllowAny]
