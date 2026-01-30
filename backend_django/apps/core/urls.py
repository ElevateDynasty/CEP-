"""
Core app URLs
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('health/', views.health_check, name='health-check'),
    path('schemes/', views.GovernmentSchemeListView.as_view(), name='scheme-list'),
    path('schemes/<int:pk>/', views.GovernmentSchemeDetailView.as_view(), name='scheme-detail'),
    path('states/', views.StateListView.as_view(), name='state-list'),
    path('feedback/', views.FeedbackCreateView.as_view(), name='feedback-create'),
]
