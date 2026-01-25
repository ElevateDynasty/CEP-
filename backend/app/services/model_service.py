"""
ML Model Service
Handles model loading and inference for breed prediction
"""

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any
import os

from app.config import settings

class ModelService:
    """Service for loading and running ML models"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.stage1_model = None  # Cattle vs Buffalo
        self.stage2_cattle_model = None  # Cattle breed classifier
        self.stage2_buffalo_model = None  # Buffalo breed classifier
        self.is_loaded = False
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # Class mappings
        self.animal_classes = settings.ANIMAL_CLASSES
        self.cattle_breeds = settings.CATTLE_BREEDS
        self.buffalo_breeds = settings.BUFFALO_BREEDS
        
        # Try to load models
        self._load_models()
    
    def _load_models(self):
        """Load trained models from disk"""
        model_path = Path(__file__).parent.parent.parent / "ml_models"
        
        try:
            # Load Class Mappings first
            classes_path = model_path / "classes.json"
            if classes_path.exists():
                with open(classes_path, 'r') as f:
                    import json
                    self.animal_classes = json.load(f)
                print(f"Loaded class mappings: {self.animal_classes}")
            
            # Check if model files exist
            stage1_path = model_path / settings.STAGE1_MODEL
            
            if stage1_path.exists():
                # Load Stage 1 model (Cattle vs Buffalo)
                # ResNet18 is used in training, so we must use it here
                self.stage1_model = models.resnet18(pretrained=False)
                num_ftrs = self.stage1_model.fc.in_features
                self.stage1_model.fc = nn.Linear(num_ftrs, len(self.animal_classes))
                
                self.stage1_model.load_state_dict(torch.load(stage1_path, map_location=self.device))
                self.stage1_model.to(self.device)
                self.stage1_model.eval()
                print("Stage 1 model loaded (ResNet18 Fine-Tuned)")
            
            # Check and load Stage 2 models
            stage2_cattle_path = model_path / settings.STAGE2_CATTLE_MODEL
            if stage2_cattle_path.exists():
                self.stage2_cattle_model = self._create_model(num_classes=len(self.cattle_breeds))
                self.stage2_cattle_model.load_state_dict(torch.load(stage2_cattle_path, map_location=self.device))
                self.stage2_cattle_model.to(self.device)
                self.stage2_cattle_model.eval()
                print("Stage 2 Cattle model loaded")
                
            stage2_buffalo_path = model_path / settings.STAGE2_BUFFALO_MODEL
            if stage2_buffalo_path.exists():
                self.stage2_buffalo_model = self._create_model(num_classes=len(self.buffalo_breeds))
                self.stage2_buffalo_model.load_state_dict(torch.load(stage2_buffalo_path, map_location=self.device))
                self.stage2_buffalo_model.to(self.device)
                self.stage2_buffalo_model.eval()
                print("Stage 2 Buffalo model loaded")
            
            if not stage1_path.exists() and not (stage2_cattle_path.exists() or stage2_buffalo_path.exists()):
                print("Models not found, using demo mode")
                self._create_demo_models()
            
            self.is_loaded = True
            
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Using demo mode with random predictions")
            self._create_demo_models()
    
    def _create_demo_models(self):
        """Create demo models for testing without trained weights"""
        # Stage 1: Cattle vs Buffalo (2 classes)
        self.stage1_model = models.resnet18(pretrained=True)
        num_ftrs = self.stage1_model.fc.in_features
        self.stage1_model.fc = nn.Linear(num_ftrs, 2)
        self.stage1_model.to(self.device)
        self.stage1_model.eval()
        
        # Stage 2: Breed classifiers
        self.stage2_cattle_model = self._create_model(num_classes=len(self.cattle_breeds))
        self.stage2_cattle_model.to(self.device)
        self.stage2_cattle_model.eval()
        
        self.stage2_buffalo_model = self._create_model(num_classes=len(self.buffalo_breeds))
        self.stage2_buffalo_model.to(self.device)
        self.stage2_buffalo_model.eval()
        
        self.is_loaded = True
        print("Demo models created")
    
    def _create_model(self, num_classes: int) -> nn.Module:
        """Create EfficientNet-B0 model with custom classifier"""
        model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        
        # Replace classifier
        num_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(num_features, num_classes)
        )
        
        return model
    
    def preprocess(self, image: Image.Image) -> torch.Tensor:
        """Preprocess image for model input"""
        # Ensure transform matches training
        # If the image is grayscale, convert to RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        tensor = self.transform(image)
        return tensor.unsqueeze(0).to(self.device)
    
    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Perform two-stage prediction
        
        Stage 1: Classify as Cattle or Buffalo
        Stage 2: Classify specific breed
        """
        # Preprocess image
        input_tensor = self.preprocess(image)
        
        with torch.no_grad():
            # Stage 1: Animal type classification
            stage1_output = self.stage1_model(input_tensor)
            stage1_probs = torch.softmax(stage1_output, dim=1)
            animal_type_idx = torch.argmax(stage1_probs, dim=1).item()
            
            # Use loaded classes
            animal_type = self.animal_classes[animal_type_idx]
            animal_type_confidence = stage1_probs[0][animal_type_idx].item()
            
            # Stage 2: Breed classification
            if animal_type == "cattle":
                if self.stage2_cattle_model is not None:
                    stage2_output = self.stage2_cattle_model(input_tensor)
                    breed_classes = self.cattle_breeds
                else:
                    # Demo mode: use random prediction
                    stage2_output = torch.randn(1, len(self.cattle_breeds)).to(self.device)
                    breed_classes = self.cattle_breeds
            else:  # buffalo
                if self.stage2_buffalo_model is not None:
                    stage2_output = self.stage2_buffalo_model(input_tensor)
                    breed_classes = self.buffalo_breeds
                else:
                    # Demo mode: use random prediction
                    stage2_output = torch.randn(1, len(self.buffalo_breeds)).to(self.device)
                    breed_classes = self.buffalo_breeds
            
            stage2_probs = torch.softmax(stage2_output, dim=1)
            breed_idx = torch.argmax(stage2_probs, dim=1).item()
            breed = breed_classes[breed_idx]
            breed_confidence = stage2_probs[0][breed_idx].item()
            
            # Get top 3 predictions
            top_k = min(3, len(breed_classes))
            top_probs, top_indices = torch.topk(stage2_probs[0], top_k)
            top_predictions = [
                {
                    "breed": breed_classes[idx.item()],
                    "confidence": prob.item()
                }
                for prob, idx in zip(top_probs, top_indices)
            ]
        
        return {
            "animal_type": animal_type,
            "animal_type_confidence": round(animal_type_confidence * 100, 2),
            "breed": breed,
            "breed_confidence": round(breed_confidence * 100, 2),
            "top_predictions": [
                {
                    "breed": pred["breed"],
                    "confidence": round(pred["confidence"] * 100, 2)
                }
                for pred in top_predictions
            ]
        }
    
    def get_model_for_gradcam(self, animal_type: str) -> nn.Module:
        """Get the appropriate model for Grad-CAM generation"""
        if animal_type == "cattle":
            return self.stage2_cattle_model or self.stage1_model
        else:
            return self.stage2_buffalo_model or self.stage1_model
