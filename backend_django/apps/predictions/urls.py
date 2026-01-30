"""
Prediction app URLs
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.PredictView.as_view(), name='predict'),
    path('history/', views.UserPredictionHistoryView.as_view(), name='prediction-history'),
    path('stats/', views.PredictionStatsView.as_view(), name='prediction-stats'),
    path('model-info/', views.ModelInfoView.as_view(), name='model-info'),
    path('<int:pk>/', views.PredictionDetailView.as_view(), name='prediction-detail'),
    path('<int:pk>/feedback/', views.PredictionFeedbackView.as_view(), name='prediction-feedback'),
]
