"""
Analytics app URLs
"""

from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('breeds/', views.BreedAnalyticsView.as_view(), name='breed-analytics'),
    path('breeds/<str:breed_id>/', views.BreedAnalyticsView.as_view(), name='breed-analytics-detail'),
    path('engagement/', views.UserEngagementView.as_view(), name='user-engagement'),
    path('popular/', views.PopularBreedsView.as_view(), name='popular-breeds'),
    path('recent/', views.RecentActivityView.as_view(), name='recent-activity'),
    path('admin/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
]
