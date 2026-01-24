"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Settings
    APP_NAME: str = "Indian Breed Recognition API"
    DEBUG: bool = True
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app"
    ]
    
    # Model Settings
    MODEL_PATH: str = "ml_models"
    STAGE1_MODEL: str = "cattle_buffalo_classifier.pth"
    STAGE2_MODEL: str = "breed_classifier.pth"
    
    # Image Settings
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp"]
    IMAGE_SIZE: tuple = (224, 224)
    
    # Supabase Settings (optional)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Class mappings
    ANIMAL_CLASSES: List[str] = ["cattle", "buffalo"]
    
    CATTLE_BREEDS: List[str] = [
        "gir", "sahiwal", "red_sindhi", "tharparkar", "kankrej",
        "ongole", "hariana", "rathi", "deoni", "khillari",
        "kangayam", "hallikar", "amritmahal", "punganur", "vechur"
    ]
    
    BUFFALO_BREEDS: List[str] = [
        "murrah", "mehsana", "jaffarabadi", "surti", "bhadawari",
        "nili_ravi", "nagpuri", "pandharpuri", "toda"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
