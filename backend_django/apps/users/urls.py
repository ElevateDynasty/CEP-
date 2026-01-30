"""
User app URLs
"""

from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='user-register'),
    path('login/', views.LoginView.as_view(), name='user-login'),
    path('logout/', views.LogoutView.as_view(), name='user-logout'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='user-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    
    # Favorites
    path('favorites/', views.FavoriteBreedListView.as_view(), name='favorite-list'),
    path('favorites/<int:pk>/', views.FavoriteBreedDetailView.as_view(), name='favorite-detail'),
    
    # Saved comparisons
    path('comparisons/', views.SavedComparisonListView.as_view(), name='comparison-list'),
    path('comparisons/<int:pk>/', views.SavedComparisonDetailView.as_view(), name='comparison-detail'),
]
