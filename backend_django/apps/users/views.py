"""
User views
"""

from rest_framework import generics, status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout

from .models import User, UserFavoriteBreed, UserComparison
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    UserFavoriteBreedSerializer,
    UserComparisonSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    Register a new user account
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    """
    Login and receive authentication token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'token': token.key
        })


class LogoutView(views.APIView):
    """
    Logout and invalidate token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        logout(request)
        return Response({'message': 'Logged out successfully'})


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile
    """
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer


class ChangePasswordView(views.APIView):
    """
    Change user password
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({'message': 'Password changed successfully'})


class FavoriteBreedListView(generics.ListCreateAPIView):
    """
    List or add favorite breeds
    """
    serializer_class = UserFavoriteBreedSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserFavoriteBreed.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteBreedDetailView(generics.RetrieveDestroyAPIView):
    """
    Get or remove a favorite breed
    """
    serializer_class = UserFavoriteBreedSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserFavoriteBreed.objects.filter(user=self.request.user)


class SavedComparisonListView(generics.ListCreateAPIView):
    """
    List or save breed comparisons
    """
    serializer_class = UserComparisonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserComparison.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedComparisonDetailView(generics.RetrieveDestroyAPIView):
    """
    Get or delete a saved comparison
    """
    serializer_class = UserComparisonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserComparison.objects.filter(user=self.request.user)


class UserStatsView(views.APIView):
    """
    Get user statistics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        from apps.predictions.models import Prediction
        
        predictions = Prediction.objects.filter(user=user)
        favorites = UserFavoriteBreed.objects.filter(user=user)
        comparisons = UserComparison.objects.filter(user=user)
        
        # Get breed distribution
        breed_counts = predictions.values('predicted_breed__name').annotate(
            count=models.Count('id')
        ).order_by('-count')[:5]
        
        return Response({
            'total_predictions': predictions.count(),
            'total_favorites': favorites.count(),
            'total_comparisons': comparisons.count(),
            'recent_predictions': predictions[:5].values(
                'id', 'predicted_breed__name', 'confidence', 'created_at'
            ),
            'top_predicted_breeds': list(breed_counts),
            'member_since': user.date_joined,
        })


# Import models for stats view
from django.db import models
