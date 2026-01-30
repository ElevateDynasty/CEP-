from django.contrib import admin
from .models import Breed, BreedComparison, BreedResource


@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ['name', 'animal_type', 'conservation_status', 'carbon_score', 'view_count', 'is_active']
    list_filter = ['animal_type', 'conservation_status', 'population_trend', 'is_active']
    search_fields = ['name', 'name_hindi', 'breed_id', 'native_region']
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    filter_horizontal = ['native_states']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('breed_id', 'name', 'name_hindi', 'animal_type', 'description')
        }),
        ('Origin', {
            'fields': ('native_states', 'native_region')
        }),
        ('Characteristics', {
            'fields': ('characteristics',)
        }),
        ('Productivity', {
            'fields': ('milk_yield_per_day', 'lactation_yield', 'fat_content', 'lactation_period')
        }),
        ('Sustainability', {
            'fields': ('carbon_score', 'carbon_footprint', 'heat_tolerance', 
                      'disease_resistance', 'feed_efficiency', 'climate_adaptability')
        }),
        ('Economic', {
            'fields': ('purchase_cost', 'maintenance_cost', 'market_demand')
        }),
        ('Population', {
            'fields': ('population_status', 'population_trend', 'conservation_status')
        }),
        ('Additional Info', {
            'fields': ('best_for', 'government_schemes', 'fun_fact')
        }),
        ('Media', {
            'fields': ('image', 'gallery')
        }),
        ('Metadata', {
            'fields': ('is_active', 'view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BreedComparison)
class BreedComparisonAdmin(admin.ModelAdmin):
    list_display = ['breed_1', 'breed_2', 'comparison_count', 'last_compared']
    list_filter = ['last_compared']
    raw_id_fields = ['breed_1', 'breed_2']


@admin.register(BreedResource)
class BreedResourceAdmin(admin.ModelAdmin):
    list_display = ['breed', 'title', 'resource_type', 'is_official', 'created_at']
    list_filter = ['resource_type', 'is_official', 'created_at']
    search_fields = ['title', 'description']
    raw_id_fields = ['breed']
