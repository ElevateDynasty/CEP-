"""
Django management command to setup initial data
"""

from django.core.management.base import BaseCommand
from apps.core.models import State, GovernmentScheme


INDIAN_STATES = [
    ('Andhra Pradesh', 'AP', 'South'),
    ('Arunachal Pradesh', 'AR', 'East'),
    ('Assam', 'AS', 'East'),
    ('Bihar', 'BR', 'East'),
    ('Chhattisgarh', 'CG', 'Central'),
    ('Goa', 'GA', 'West'),
    ('Gujarat', 'GJ', 'West'),
    ('Haryana', 'HR', 'North'),
    ('Himachal Pradesh', 'HP', 'North'),
    ('Jharkhand', 'JH', 'East'),
    ('Karnataka', 'KA', 'South'),
    ('Kerala', 'KL', 'South'),
    ('Madhya Pradesh', 'MP', 'Central'),
    ('Maharashtra', 'MH', 'West'),
    ('Manipur', 'MN', 'East'),
    ('Meghalaya', 'ML', 'East'),
    ('Mizoram', 'MZ', 'East'),
    ('Nagaland', 'NL', 'East'),
    ('Odisha', 'OD', 'East'),
    ('Punjab', 'PB', 'North'),
    ('Rajasthan', 'RJ', 'North'),
    ('Sikkim', 'SK', 'East'),
    ('Tamil Nadu', 'TN', 'South'),
    ('Telangana', 'TS', 'South'),
    ('Tripura', 'TR', 'East'),
    ('Uttar Pradesh', 'UP', 'North'),
    ('Uttarakhand', 'UK', 'North'),
    ('West Bengal', 'WB', 'East'),
]

GOVERNMENT_SCHEMES = [
    {
        'name': 'Rashtriya Gokul Mission',
        'name_hindi': 'राष्ट्रीय गोकुल मिशन',
        'description': 'A flagship program for development and conservation of indigenous bovine breeds.',
        'scheme_type': 'breeding',
        'benefits': 'Financial support for breed improvement, AI services, and conservation programs.',
        'max_subsidy_amount': 500000,
        'status': 'active',
        'implementing_agency': 'Department of Animal Husbandry, Government of India',
    },
    {
        'name': 'National Livestock Mission',
        'name_hindi': 'राष्ट्रीय पशुधन मिशन',
        'description': 'Comprehensive program for sustainable livestock development.',
        'scheme_type': 'financial',
        'benefits': 'Subsidies for fodder production, breed improvement, and infrastructure.',
        'max_subsidy_amount': 1000000,
        'status': 'active',
        'implementing_agency': 'Ministry of Fisheries, Animal Husbandry and Dairying',
    },
    {
        'name': 'Livestock Insurance Scheme',
        'name_hindi': 'पशुधन बीमा योजना',
        'description': 'Insurance coverage for cattle and buffaloes against death due to diseases or accidents.',
        'scheme_type': 'insurance',
        'benefits': 'Insurance coverage up to market value with subsidized premium.',
        'subsidy_percentage': 50,
        'status': 'active',
        'implementing_agency': 'State Animal Husbandry Departments',
    },
    {
        'name': 'National Programme for Bovine Breeding',
        'name_hindi': 'राष्ट्रीय गोवंश प्रजनन कार्यक्रम',
        'description': 'Program to strengthen bovine breeding infrastructure in the country.',
        'scheme_type': 'breeding',
        'benefits': 'Free AI services, quality semen production, and genetic improvement.',
        'status': 'active',
        'implementing_agency': 'Department of Animal Husbandry',
    },
    {
        'name': 'Dairy Entrepreneurship Development Scheme',
        'name_hindi': 'डेयरी उद्यमिता विकास योजना',
        'description': 'Scheme to generate self-employment in dairy sector.',
        'scheme_type': 'financial',
        'benefits': 'Bank loans with subsidy for dairy units, milk processing, and marketing.',
        'max_subsidy_amount': 700000,
        'subsidy_percentage': 33,
        'status': 'active',
        'implementing_agency': 'NABARD',
    },
]


class Command(BaseCommand):
    help = 'Setup initial data (states and government schemes)'
    
    def handle(self, *args, **options):
        self.stdout.write('Setting up initial data...')
        
        # Create states
        states_created = 0
        for name, code, region in INDIAN_STATES:
            state, created = State.objects.get_or_create(
                name=name,
                defaults={'code': code, 'region': region}
            )
            if created:
                states_created += 1
        
        self.stdout.write(f'States: {states_created} created')
        
        # Create government schemes
        schemes_created = 0
        for scheme_data in GOVERNMENT_SCHEMES:
            scheme, created = GovernmentScheme.objects.get_or_create(
                name=scheme_data['name'],
                defaults=scheme_data
            )
            if created:
                schemes_created += 1
        
        self.stdout.write(f'Government schemes: {schemes_created} created')
        
        self.stdout.write(
            self.style.SUCCESS('Initial data setup complete!')
        )
