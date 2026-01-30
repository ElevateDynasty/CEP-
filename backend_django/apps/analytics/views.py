"""
Analytics views
"""

from rest_framework import generics, views
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Avg, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from .models import DailyStats, BreedPopularity, UserActivity, SearchQuery
from .serializers import (
    DailyStatsSerializer,
    BreedPopularitySerializer,
    UserActivitySerializer
)
from apps.predictions.models import Prediction
from apps.breeds.models import Breed
from apps.users.models import User


class DashboardStatsView(views.APIView):
    """
    Get dashboard statistics overview
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        now = timezone.now()
        today = now.date()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)
        
        # Total counts
        total_predictions = Prediction.objects.count()
        total_users = User.objects.count()
        total_breeds = Breed.objects.filter(is_active=True).count()
        
        # Today's stats
        today_predictions = Prediction.objects.filter(
            created_at__date=today
        ).count()
        today_new_users = User.objects.filter(
            date_joined__date=today
        ).count()
        
        # Prediction trend (last 30 days)
        prediction_trend = list(
            Prediction.objects.filter(
                created_at__gte=thirty_days_ago
            ).annotate(
                date=TruncDate('created_at')
            ).values('date').annotate(
                count=Count('id')
            ).order_by('date')
        )
        
        # User registration trend (last 30 days)
        user_trend = list(
            User.objects.filter(
                date_joined__gte=thirty_days_ago
            ).annotate(
                date=TruncDate('date_joined')
            ).values('date').annotate(
                count=Count('id')
            ).order_by('date')
        )
        
        # Top predicted breeds
        top_breeds = list(
            Prediction.objects.values(
                'predicted_breed_name'
            ).annotate(
                count=Count('id')
            ).order_by('-count')[:10]
        )
        
        # Top states (by user count)
        top_states = list(
            User.objects.exclude(
                state__isnull=True
            ).values(
                'state__name'
            ).annotate(
                count=Count('id')
            ).order_by('-count')[:10]
        )
        
        # Accuracy metrics
        avg_confidence = Prediction.objects.aggregate(
            avg=Avg('breed_confidence')
        )['avg'] or 0
        
        # Feedback accuracy
        feedback_predictions = Prediction.objects.exclude(user_feedback='')
        total_feedback = feedback_predictions.count()
        correct_feedback = feedback_predictions.filter(user_feedback='correct').count()
        feedback_accuracy = (correct_feedback / total_feedback * 100) if total_feedback > 0 else 0
        
        return Response({
            'total_predictions': total_predictions,
            'total_users': total_users,
            'total_breeds': total_breeds,
            'today_predictions': today_predictions,
            'today_new_users': today_new_users,
            'prediction_trend': prediction_trend,
            'user_trend': user_trend,
            'top_breeds': top_breeds,
            'top_states': top_states,
            'avg_confidence': avg_confidence,
            'feedback_accuracy': feedback_accuracy
        })


class BreedAnalyticsView(views.APIView):
    """
    Get breed-specific analytics
    """
    permission_classes = [AllowAny]
    
    def get(self, request, breed_id=None):
        if breed_id:
            return self._get_single_breed_analytics(breed_id)
        return self._get_all_breeds_analytics()
    
    def _get_single_breed_analytics(self, breed_id):
        try:
            breed = Breed.objects.get(breed_id=breed_id)
        except Breed.DoesNotExist:
            return Response({'error': 'Breed not found'}, status=404)
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Prediction stats
        predictions = Prediction.objects.filter(predicted_breed=breed)
        total_predictions = predictions.count()
        avg_confidence = predictions.aggregate(avg=Avg('breed_confidence'))['avg'] or 0
        
        # Trend
        prediction_trend = list(
            predictions.filter(
                created_at__gte=thirty_days_ago
            ).annotate(
                date=TruncDate('created_at')
            ).values('date').annotate(
                count=Count('id')
            ).order_by('date')
        )
        
        # Feedback
        feedback_stats = dict(
            predictions.exclude(user_feedback='').values(
                'user_feedback'
            ).annotate(
                count=Count('id')
            ).values_list('user_feedback', 'count')
        )
        
        return Response({
            'breed_id': breed_id,
            'breed_name': breed.name,
            'total_predictions': total_predictions,
            'avg_confidence': avg_confidence,
            'view_count': breed.view_count,
            'prediction_trend': prediction_trend,
            'feedback_stats': feedback_stats
        })
    
    def _get_all_breeds_analytics(self):
        # Top breeds by predictions
        top_by_predictions = list(
            Prediction.objects.values(
                'predicted_breed__breed_id',
                'predicted_breed__name'
            ).annotate(
                count=Count('id'),
                avg_conf=Avg('breed_confidence')
            ).order_by('-count')[:20]
        )
        
        # Top breeds by views
        top_by_views = list(
            Breed.objects.filter(is_active=True).values(
                'breed_id', 'name', 'view_count'
            ).order_by('-view_count')[:20]
        )
        
        # By animal type
        by_type = Prediction.objects.values('animal_type').annotate(
            count=Count('id'),
            avg_conf=Avg('breed_confidence')
        )
        
        return Response({
            'top_by_predictions': top_by_predictions,
            'top_by_views': top_by_views,
            'by_animal_type': list(by_type)
        })


class UserEngagementView(views.APIView):
    """
    Get user engagement analytics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # User's predictions
        user_predictions = Prediction.objects.filter(user=user)
        
        # Activity over time
        activity_trend = list(
            user_predictions.filter(
                created_at__gte=thirty_days_ago
            ).annotate(
                date=TruncDate('created_at')
            ).values('date').annotate(
                count=Count('id')
            ).order_by('date')
        )
        
        # Breed preferences
        breed_preferences = list(
            user_predictions.values(
                'predicted_breed_name'
            ).annotate(
                count=Count('id')
            ).order_by('-count')[:10]
        )
        
        # Animal type distribution
        type_distribution = dict(
            user_predictions.values('animal_type').annotate(
                count=Count('id')
            ).values_list('animal_type', 'count')
        )
        
        return Response({
            'total_predictions': user_predictions.count(),
            'activity_trend': activity_trend,
            'breed_preferences': breed_preferences,
            'type_distribution': type_distribution,
            'member_since': user.date_joined,
            'last_active': user.last_login
        })


class RecentActivityView(generics.ListAPIView):
    """
    Get recent platform activity
    """
    serializer_class = UserActivitySerializer
    permission_classes = [AllowAny]
    pagination_class = None
    
    def get_queryset(self):
        return UserActivity.objects.all()[:20]


class PopularBreedsView(views.APIView):
    """
    Get popular breeds based on various metrics
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        period = request.query_params.get('period', '7')  # days
        try:
            days = int(period)
        except ValueError:
            days = 7
        
        since = timezone.now() - timedelta(days=days)
        
        # By predictions
        by_predictions = list(
            Prediction.objects.filter(
                created_at__gte=since
            ).values(
                'predicted_breed__breed_id',
                'predicted_breed__name',
                'predicted_breed__animal_type'
            ).annotate(
                count=Count('id')
            ).order_by('-count')[:10]
        )
        
        # By views
        by_views = list(
            Breed.objects.filter(
                is_active=True
            ).values(
                'breed_id', 'name', 'animal_type', 'view_count'
            ).order_by('-view_count')[:10]
        )
        
        return Response({
            'period_days': days,
            'by_predictions': by_predictions,
            'by_views': by_views
        })


class AdminAnalyticsView(views.APIView):
    """
    Detailed analytics for administrators
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        now = timezone.now()
        today = now.date()
        
        # System health
        total_predictions = Prediction.objects.count()
        predictions_today = Prediction.objects.filter(created_at__date=today).count()
        avg_processing_time = Prediction.objects.aggregate(
            avg=Avg('processing_time_ms')
        )['avg'] or 0
        
        # User stats
        total_users = User.objects.count()
        active_users_30d = User.objects.filter(
            last_login__gte=now - timedelta(days=30)
        ).count()
        
        # Content stats
        total_breeds = Breed.objects.count()
        active_breeds = Breed.objects.filter(is_active=True).count()
        
        # Feedback analysis
        feedback_breakdown = dict(
            Prediction.objects.exclude(
                user_feedback=''
            ).values('user_feedback').annotate(
                count=Count('id')
            ).values_list('user_feedback', 'count')
        )
        
        return Response({
            'system_health': {
                'total_predictions': total_predictions,
                'predictions_today': predictions_today,
                'avg_processing_time_ms': avg_processing_time
            },
            'users': {
                'total': total_users,
                'active_30d': active_users_30d
            },
            'content': {
                'total_breeds': total_breeds,
                'active_breeds': active_breeds
            },
            'feedback': feedback_breakdown
        })
