"""
Breed app URLs
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.BreedListView.as_view(), name='breed-list'),
    path('stats/', views.BreedStatsView.as_view(), name='breed-stats'),
    path('compare/', views.BreedCompareView.as_view(), name='breed-compare'),
    path('popular-comparisons/', views.PopularComparisonsView.as_view(), name='popular-comparisons'),
    path('by-state/<str:state_name>/', views.BreedsByStateView.as_view(), name='breeds-by-state'),
    path('id/<int:pk>/', views.BreedByIdView.as_view(), name='breed-by-id'),
    path('<str:breed_id>/', views.BreedDetailView.as_view(), name='breed-detail'),
]
