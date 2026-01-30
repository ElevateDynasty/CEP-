"""
Breed models for cattle and buffalo breeds
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class Breed(models.Model):
    """Indian cattle and buffalo breed information"""
    
    ANIMAL_TYPES = [
        ('cattle', 'Cattle'),
        ('buffalo', 'Buffalo'),
    ]
    
    CONSERVATION_STATUS = [
        ('not_endangered', 'Not Endangered'),
        ('vulnerable', 'Vulnerable'),
        ('endangered', 'Endangered'),
        ('critical', 'Critical'),
        ('unknown', 'Unknown'),
    ]
    
    POPULATION_TRENDS = [
        ('increasing', 'Increasing'),
        ('stable', 'Stable'),
        ('declining', 'Declining'),
        ('unknown', 'Unknown'),
    ]
    
    # Basic Info
    breed_id = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    name_hindi = models.CharField(max_length=100, blank=True)
    animal_type = models.CharField(max_length=10, choices=ANIMAL_TYPES)
    
    # Origin
    native_states = models.ManyToManyField(
        'core.State',
        related_name='native_breeds',
        blank=True
    )
    native_region = models.CharField(max_length=255, blank=True)
    
    # Characteristics (stored as JSON for flexibility)
    characteristics = models.JSONField(default=dict, blank=True)
    
    # Productivity
    milk_yield_per_day = models.CharField(max_length=50, blank=True)
    lactation_yield = models.CharField(max_length=50, blank=True)
    fat_content = models.CharField(max_length=50, blank=True)
    lactation_period = models.CharField(max_length=50, blank=True)
    
    # Sustainability scores
    carbon_score = models.IntegerField(default=0, help_text="0-100 sustainability score")
    carbon_footprint = models.CharField(max_length=50, blank=True)
    heat_tolerance = models.CharField(max_length=50, blank=True)
    disease_resistance = models.CharField(max_length=50, blank=True)
    feed_efficiency = models.CharField(max_length=50, blank=True)
    climate_adaptability = models.CharField(max_length=100, blank=True)
    
    # Economic
    purchase_cost = models.CharField(max_length=100, blank=True)
    maintenance_cost = models.CharField(max_length=100, blank=True)
    market_demand = models.CharField(max_length=50, blank=True)
    
    # Population
    population_status = models.CharField(max_length=50, blank=True)
    population_trend = models.CharField(max_length=20, choices=POPULATION_TRENDS, default='unknown')
    conservation_status = models.CharField(max_length=20, choices=CONSERVATION_STATUS, default='unknown')
    
    # Additional info
    best_for = models.JSONField(default=list, blank=True)
    government_schemes = models.JSONField(default=list, blank=True)
    fun_fact = models.TextField(blank=True)
    description = models.TextField(blank=True)
    
    # Media
    image = models.CharField(max_length=255, blank=True)  # URL or path
    gallery = models.JSONField(default=list, blank=True)  # List of image URLs
    
    # Metadata
    is_active = models.BooleanField(default=True)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = _('Breed')
        verbose_name_plural = _('Breeds')
        indexes = [
            models.Index(fields=['animal_type', 'name']),
            models.Index(fields=['conservation_status']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.animal_type})"
    
    def increment_view_count(self):
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    @property
    def productivity_summary(self):
        return {
            'milk_yield_per_day': self.milk_yield_per_day,
            'lactation_yield': self.lactation_yield,
            'fat_content': self.fat_content,
            'lactation_period': self.lactation_period,
        }
    
    @property
    def sustainability_summary(self):
        return {
            'carbon_score': self.carbon_score,
            'carbon_footprint': self.carbon_footprint,
            'heat_tolerance': self.heat_tolerance,
            'disease_resistance': self.disease_resistance,
            'feed_efficiency': self.feed_efficiency,
            'climate_adaptability': self.climate_adaptability,
        }
    
    @property
    def economic_summary(self):
        return {
            'purchase_cost': self.purchase_cost,
            'maintenance_cost': self.maintenance_cost,
            'market_demand': self.market_demand,
        }


class BreedComparison(models.Model):
    """Store popular breed comparisons for quick access"""
    
    breed_1 = models.ForeignKey(Breed, on_delete=models.CASCADE, related_name='comparison_first')
    breed_2 = models.ForeignKey(Breed, on_delete=models.CASCADE, related_name='comparison_second')
    comparison_count = models.IntegerField(default=0)
    last_compared = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['breed_1', 'breed_2']
        ordering = ['-comparison_count']
        verbose_name = _('Breed Comparison')
        verbose_name_plural = _('Breed Comparisons')
    
    def __str__(self):
        return f"{self.breed_1.name} vs {self.breed_2.name}"
    
    def increment_count(self):
        self.comparison_count += 1
        self.save()


class BreedResource(models.Model):
    """Additional resources and links for breeds"""
    
    RESOURCE_TYPES = [
        ('article', 'Article'),
        ('video', 'Video'),
        ('research', 'Research Paper'),
        ('guide', 'Guide'),
        ('website', 'Website'),
    ]
    
    breed = models.ForeignKey(Breed, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    url = models.URLField()
    description = models.TextField(blank=True)
    is_official = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_official', '-created_at']
        verbose_name = _('Breed Resource')
        verbose_name_plural = _('Breed Resources')
    
    def __str__(self):
        return f"{self.breed.name}: {self.title}"
