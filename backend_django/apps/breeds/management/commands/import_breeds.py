"""
Django management command to import breed data from JSON file
"""

import json
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from apps.breeds.models import Breed
from apps.core.models import State


class Command(BaseCommand):
    help = 'Import breed data from breed_info.json'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default=None,
            help='Path to breed_info.json file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing breed data before import'
        )
    
    def handle(self, *args, **options):
        # Determine file path
        file_path = options.get('file')
        if file_path:
            file_path = Path(file_path)
        else:
            file_path = settings.BREED_DATA_PATH
        
        if not file_path.exists():
            raise CommandError(f'Breed data file not found: {file_path}')
        
        # Clear existing data if requested
        if options['clear']:
            count = Breed.objects.count()
            Breed.objects.all().delete()
            self.stdout.write(f'Deleted {count} existing breeds')
        
        # Load JSON data
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        created_count = 0
        updated_count = 0
        
        # Import cattle breeds
        if 'cattle' in data:
            for breed_id, breed_data in data['cattle'].items():
                created, updated = self._import_breed(breed_id, 'cattle', breed_data)
                created_count += created
                updated_count += updated
        
        # Import buffalo breeds
        if 'buffalo' in data:
            for breed_id, breed_data in data['buffalo'].items():
                created, updated = self._import_breed(breed_id, 'buffalo', breed_data)
                created_count += created
                updated_count += updated
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully imported breeds: {created_count} created, {updated_count} updated'
            )
        )
    
    def _import_breed(self, breed_id, animal_type, data):
        """Import a single breed"""
        created = 0
        updated = 0
        
        # Prepare breed data
        breed_data = {
            'name': data.get('name', breed_id),
            'name_hindi': data.get('nameHindi', ''),
            'animal_type': animal_type,
            'native_region': data.get('nativeRegion', ''),
            'characteristics': data.get('characteristics', {}),
            
            # Productivity
            'milk_yield_per_day': data.get('productivity', {}).get('milkYieldPerDay', ''),
            'lactation_yield': data.get('productivity', {}).get('lactationYield', ''),
            'fat_content': data.get('productivity', {}).get('fatContent', ''),
            'lactation_period': data.get('productivity', {}).get('lactationPeriod', ''),
            
            # Sustainability
            'carbon_score': data.get('sustainability', {}).get('carbonScore', 0),
            'carbon_footprint': data.get('sustainability', {}).get('carbonFootprint', ''),
            'heat_tolerance': data.get('sustainability', {}).get('heatTolerance', ''),
            'disease_resistance': data.get('sustainability', {}).get('diseaseResistance', ''),
            'feed_efficiency': data.get('sustainability', {}).get('feedEfficiency', ''),
            'climate_adaptability': data.get('sustainability', {}).get('climateAdaptability', ''),
            
            # Economic
            'purchase_cost': data.get('economicValue', {}).get('purchaseCost', ''),
            'maintenance_cost': data.get('economicValue', {}).get('maintenanceCost', ''),
            'market_demand': data.get('economicValue', {}).get('marketDemand', ''),
            
            # Population
            'population_status': data.get('population', {}).get('status', ''),
            'population_trend': self._map_trend(data.get('population', {}).get('trend', '')),
            'conservation_status': self._map_conservation(
                data.get('population', {}).get('conservationStatus', '')
            ),
            
            # Additional
            'best_for': data.get('bestFor', []),
            'government_schemes': data.get('governmentSchemes', []),
            'fun_fact': data.get('funFact', ''),
            'image': data.get('image', ''),
        }
        
        # Create or update breed
        breed, is_created = Breed.objects.update_or_create(
            breed_id=breed_id,
            defaults=breed_data
        )
        
        if is_created:
            created = 1
            self.stdout.write(f'  Created: {breed.name}')
        else:
            updated = 1
            self.stdout.write(f'  Updated: {breed.name}')
        
        # Handle native states
        native_states = data.get('nativeState', [])
        if native_states:
            breed.native_states.clear()
            for state_name in native_states:
                state, _ = State.objects.get_or_create(
                    name=state_name,
                    defaults={'code': state_name[:3].upper()}
                )
                breed.native_states.add(state)
        
        return created, updated
    
    def _map_trend(self, trend):
        """Map trend string to choice"""
        mapping = {
            'positive': 'increasing',
            'increasing': 'increasing',
            'stable': 'stable',
            'negative': 'declining',
            'declining': 'declining',
        }
        return mapping.get(trend.lower(), 'unknown') if trend else 'unknown'
    
    def _map_conservation(self, status):
        """Map conservation status to choice"""
        status_lower = status.lower() if status else ''
        
        if 'not endangered' in status_lower:
            return 'not_endangered'
        elif 'critical' in status_lower:
            return 'critical'
        elif 'endangered' in status_lower:
            return 'endangered'
        elif 'vulnerable' in status_lower:
            return 'vulnerable'
        return 'unknown'
