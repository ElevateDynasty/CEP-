from django.contrib import admin
from .models import DailyStats, BreedPopularity, UserActivity, SearchQuery, RegionalStats


@admin.register(DailyStats)
class DailyStatsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'total_predictions', 'cattle_predictions', 'buffalo_predictions',
        'unique_users', 'new_registrations'
    ]
    list_filter = ['date']
    ordering = ['-date']


@admin.register(BreedPopularity)
class BreedPopularityAdmin(admin.ModelAdmin):
    list_display = ['breed', 'date', 'prediction_count', 'view_count', 'popularity_score']
    list_filter = ['date', 'breed__animal_type']
    raw_id_fields = ['breed']


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'created_at']
    list_filter = ['activity_type', 'created_at']
    raw_id_fields = ['user', 'breed', 'prediction']


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ['query', 'results_count', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['query']


@admin.register(RegionalStats)
class RegionalStatsAdmin(admin.ModelAdmin):
    list_display = ['state', 'date', 'predictions_count', 'users_count']
    list_filter = ['date', 'state']
    raw_id_fields = ['state', 'top_breed']
