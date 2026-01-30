"""
Prediction views
"""

from rest_framework import generics, status, views
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import UserRateThrottle
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate
from django.conf import settings
from PIL import Image
import io

from .models import Prediction
from .serializers import (
    PredictionSerializer,
    PredictionCreateSerializer,
    PredictionFeedbackSerializer,
    PredictionHistorySerializer
)
from .services import ModelService, model_service
from apps.breeds.models import Breed


class PredictionThrottle(UserRateThrottle):
    rate = '50/hour'


class PredictView(views.APIView):
    """
    Make a breed prediction from an uploaded image
    
    Performs two-stage ML classification:
    1. Animal type (cattle vs buffalo)
    2. Specific breed identification
    
    Optionally includes Grad-CAM visualization
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]
    throttle_classes = [PredictionThrottle]
    
    def post(self, request):
        serializer = PredictionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        image_file = serializer.validated_data['image']
        include_gradcam = serializer.validated_data.get('include_gradcam', False)
        include_breed_info = serializer.validated_data.get('include_breed_info', True)
        
        # Validate image
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid image type. Allowed: JPEG, PNG, WebP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        max_size = settings.ML_SETTINGS['MAX_IMAGE_SIZE']
        if image_file.size > max_size:
            return Response(
                {'error': f'Image too large. Maximum size: {max_size // (1024*1024)}MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Open image
            image = Image.open(image_file).convert('RGB')
        except Exception:
            return Response(
                {'error': 'Invalid image file'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Run prediction
        try:
            result = model_service.predict(image, include_gradcam=include_gradcam)
        except Exception as e:
            return Response(
                {'error': f'Prediction failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Try to find breed in database
        breed = Breed.objects.filter(
            name__iexact=result['breed']
        ).first() or Breed.objects.filter(
            breed_id__iexact=result['breed'].lower().replace(' ', '_')
        ).first()
        
        # Get breed info if requested
        breed_info = None
        if include_breed_info and breed:
            from apps.breeds.serializers import BreedDetailSerializer
            breed_info = BreedDetailSerializer(breed).data
        
        # Save prediction
        prediction = Prediction.objects.create(
            user=request.user if request.user.is_authenticated else None,
            animal_type=result['animal_type'],
            animal_type_confidence=result['animal_type_confidence'],
            predicted_breed=breed,
            predicted_breed_name=result['breed'],
            breed_confidence=result['breed_confidence'],
            top_predictions=result['top_predictions'],
            image=image_file,
            gradcam_image=result.get('gradcam_image', ''),
            gradcam_enabled=include_gradcam,
            processing_time_ms=result['processing_time_ms'],
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
        )
        
        # Update user prediction count
        if request.user.is_authenticated:
            request.user.total_predictions += 1
            request.user.save(update_fields=['total_predictions'])
        
        response_data = {
            'success': True,
            'prediction_id': prediction.id,
            'animal_type': result['animal_type'],
            'animal_type_confidence': result['animal_type_confidence'],
            'breed': result['breed'],
            'breed_confidence': result['breed_confidence'],
            'top_predictions': result['top_predictions'],
            'processing_time_ms': result['processing_time_ms'],
        }
        
        if include_gradcam and result.get('gradcam_image'):
            response_data['gradcam_image'] = result['gradcam_image']
        
        if breed_info:
            response_data['breed_info'] = breed_info
        
        return Response(response_data)
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class PredictionDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific prediction
    """
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [AllowAny]


class PredictionFeedbackView(generics.UpdateAPIView):
    """
    Submit feedback for a prediction
    """
    queryset = Prediction.objects.all()
    serializer_class = PredictionFeedbackSerializer
    permission_classes = [AllowAny]
    http_method_names = ['patch']


class UserPredictionHistoryView(generics.ListAPIView):
    """
    Get prediction history for the authenticated user
    """
    serializer_class = PredictionHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Prediction.objects.filter(user=self.request.user)


class PredictionStatsView(views.APIView):
    """
    Get prediction statistics
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        predictions = Prediction.objects.all()
        
        # Basic stats
        total = predictions.count()
        cattle_count = predictions.filter(animal_type='cattle').count()
        buffalo_count = predictions.filter(animal_type='buffalo').count()
        avg_confidence = predictions.aggregate(avg=Avg('breed_confidence'))['avg'] or 0
        
        # Feedback stats
        feedback_stats = dict(predictions.values('user_feedback').annotate(
            count=Count('id')
        ).values_list('user_feedback', 'count'))
        
        # Top predicted breeds
        top_breeds = list(predictions.values('predicted_breed_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10])
        
        # Predictions over time (last 30 days)
        from django.utils import timezone
        from datetime import timedelta
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        predictions_by_date = predictions.filter(
            created_at__gte=thirty_days_ago
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return Response({
            'total_predictions': total,
            'cattle_predictions': cattle_count,
            'buffalo_predictions': buffalo_count,
            'average_confidence': avg_confidence,
            'feedback_stats': feedback_stats,
            'top_predicted_breeds': top_breeds,
            'predictions_over_time': list(predictions_by_date)
        })


class ModelInfoView(views.APIView):
    """
    Get information about the ML model
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'model_loaded': model_service.is_loaded,
            'device': str(model_service.device),
            'animal_classes': model_service.animal_classes,
            'cattle_breeds': model_service.cattle_breeds,
            'buffalo_breeds': model_service.buffalo_breeds,
            'version': '2.0.0',
            'features': [
                'Two-stage classification',
                'Grad-CAM visualization',
                'ResNet18 for animal classification',
                'EfficientNet-B0 for breed classification'
            ]
        })
