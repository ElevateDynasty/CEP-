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
    STAGE2_CATTLE_MODEL: str = "cattle_breed_classifier.pth"
    STAGE2_BUFFALO_MODEL: str = "buffalo_breed_classifier.pth"
    
    # Image Settings
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp"]
    IMAGE_SIZE: tuple = (224, 224)
    
    # Supabase Settings (optional)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Class mappings
    ANIMAL_CLASSES: List[str] = ["cattle", "buffalo"]  # Aligned with training script (0=cattle, 1=buffalo)
    
    CATTLE_BREEDS: List[str] = [
        "Gir", "Ayrshire", "Hallikar", "Kenkatha"
    ]
    
    BUFFALO_BREEDS: List[str] = [
        "Jaffarabadi", "murrah", "nili-ravi", "gojri"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
