"""
ASGI config for breed_recognition project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'breed_recognition.settings')

application = get_asgi_application()
