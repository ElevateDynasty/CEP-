"""
ML Model Service for Django
Handles model loading and inference for breed prediction
"""

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
import json
import time
import hashlib
import io
import base64

from django.conf import settings


class ModelService:
    """Singleton service for loading and running ML models"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.stage1_model = None
        self.stage2_cattle_model = None
        self.stage2_buffalo_model = None
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
        
        # Default class mappings
        self.animal_classes = ["cattle", "buffalo"]
        self.cattle_breeds = ["Gir", "Ayrshire", "Hallikar", "Kenkatha"]
        self.buffalo_breeds = ["Jaffarabadi", "murrah", "nili-ravi", "gojri"]
        
        # Try to load models
        self._load_models()
        self._initialized = True
    
    def _load_models(self):
        """Load trained models from disk"""
        model_path = settings.ML_MODELS_PATH
        ml_settings = settings.ML_SETTINGS
        
        try:
            # Load class mappings
            classes_path = model_path / "classes.json"
            if classes_path.exists():
                with open(classes_path, 'r') as f:
                    self.animal_classes = json.load(f)
                print(f"Loaded class mappings: {self.animal_classes}")
            
            # Load Stage 1 model
            stage1_path = model_path / ml_settings['STAGE1_MODEL']
            
            if stage1_path.exists():
                self.stage1_model = models.resnet18(weights=None)
                num_ftrs = self.stage1_model.fc.in_features
                self.stage1_model.fc = nn.Linear(num_ftrs, len(self.animal_classes))
                
                self.stage1_model.load_state_dict(torch.load(stage1_path, map_location=self.device))
                self.stage1_model.to(self.device)
                self.stage1_model.eval()
                print("Stage 1 model loaded")
            
            # Load Stage 2 models
            stage2_cattle_path = model_path / ml_settings['STAGE2_CATTLE_MODEL']
            if stage2_cattle_path.exists():
                self.stage2_cattle_model = self._create_model(num_classes=len(self.cattle_breeds))
                self.stage2_cattle_model.load_state_dict(torch.load(stage2_cattle_path, map_location=self.device))
                self.stage2_cattle_model.to(self.device)
                self.stage2_cattle_model.eval()
                print("Stage 2 Cattle model loaded")
                
            stage2_buffalo_path = model_path / ml_settings['STAGE2_BUFFALO_MODEL']
            if stage2_buffalo_path.exists():
                self.stage2_buffalo_model = self._create_model(num_classes=len(self.buffalo_breeds))
                self.stage2_buffalo_model.load_state_dict(torch.load(stage2_buffalo_path, map_location=self.device))
                self.stage2_buffalo_model.to(self.device)
                self.stage2_buffalo_model.eval()
                print("Stage 2 Buffalo model loaded")
            
            if not stage1_path.exists():
                print("Models not found, using demo mode")
                self._create_demo_models()
            
            self.is_loaded = True
            
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Using demo mode with random predictions")
            self._create_demo_models()
    
    def _create_demo_models(self):
        """Create demo models for testing"""
        self.stage1_model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        num_ftrs = self.stage1_model.fc.in_features
        self.stage1_model.fc = nn.Linear(num_ftrs, 2)
        self.stage1_model.to(self.device)
        self.stage1_model.eval()
        
        self.stage2_cattle_model = self._create_model(num_classes=len(self.cattle_breeds))
        self.stage2_cattle_model.to(self.device)
        self.stage2_cattle_model.eval()
        
        self.stage2_buffalo_model = self._create_model(num_classes=len(self.buffalo_breeds))
        self.stage2_buffalo_model.to(self.device)
        self.stage2_buffalo_model.eval()
        
        self.is_loaded = True
        print("Demo models created")
    
    def _create_model(self, num_classes: int) -> nn.Module:
        """Create EfficientNet-B0 model"""
        model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        num_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(num_features, num_classes)
        )
        return model
    
    def preprocess(self, image: Image.Image) -> torch.Tensor:
        """Preprocess image for model input"""
        if image.mode != 'RGB':
            image = image.convert('RGB')
        tensor = self.transform(image)
        return tensor.unsqueeze(0).to(self.device)
    
    def predict(self, image: Image.Image, include_gradcam: bool = False) -> Dict[str, Any]:
        """Perform two-stage prediction"""
        start_time = time.time()
        
        # Preprocess image
        input_tensor = self.preprocess(image)
        
        # Stage 1: Animal type classification
        with torch.no_grad():
            stage1_output = self.stage1_model(input_tensor)
            stage1_probs = torch.softmax(stage1_output, dim=1)
            animal_idx = torch.argmax(stage1_probs, dim=1).item()
            animal_confidence = stage1_probs[0][animal_idx].item()
        
        animal_type = self.animal_classes[animal_idx]
        
        # Stage 2: Breed classification
        if animal_type == "cattle" and self.stage2_cattle_model:
            stage2_model = self.stage2_cattle_model
            breed_classes = self.cattle_breeds
        elif animal_type == "buffalo" and self.stage2_buffalo_model:
            stage2_model = self.stage2_buffalo_model
            breed_classes = self.buffalo_breeds
        else:
            breed_classes = self.cattle_breeds if animal_type == "cattle" else self.buffalo_breeds
            stage2_model = self.stage2_cattle_model or self.stage2_buffalo_model
        
        with torch.no_grad():
            stage2_output = stage2_model(input_tensor)
            stage2_probs = torch.softmax(stage2_output, dim=1)
            breed_idx = torch.argmax(stage2_probs, dim=1).item()
            breed_confidence = stage2_probs[0][breed_idx].item()
        
        predicted_breed = breed_classes[breed_idx]
        
        # Get top predictions
        top_k = min(5, len(breed_classes))
        top_probs, top_indices = torch.topk(stage2_probs[0], top_k)
        
        top_predictions = []
        for prob, idx in zip(top_probs.tolist(), top_indices.tolist()):
            top_predictions.append({
                "breed": breed_classes[idx],
                "confidence": prob
            })
        
        processing_time = int((time.time() - start_time) * 1000)
        
        result = {
            "success": True,
            "animal_type": animal_type,
            "animal_type_confidence": animal_confidence,
            "breed": predicted_breed,
            "breed_confidence": breed_confidence,
            "top_predictions": top_predictions,
            "processing_time_ms": processing_time,
            "gradcam_image": None
        }
        
        # Generate Grad-CAM if requested
        if include_gradcam:
            try:
                gradcam_image = self._generate_gradcam(image, input_tensor, stage2_model, breed_idx)
                result["gradcam_image"] = gradcam_image
            except Exception as e:
                print(f"Grad-CAM generation failed: {e}")
        
        return result
    
    def _generate_gradcam(self, original_image: Image.Image, input_tensor: torch.Tensor, 
                          model: nn.Module, target_class: int) -> Optional[str]:
        """Generate Grad-CAM visualization"""
        try:
            from pytorch_grad_cam import GradCAM
            from pytorch_grad_cam.utils.image import show_cam_on_image
            
            # Get target layer
            if hasattr(model, 'features'):
                target_layers = [model.features[-1]]
            else:
                target_layers = [model.layer4[-1]]
            
            cam = GradCAM(model=model, target_layers=target_layers)
            
            targets = None
            grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
            grayscale_cam = grayscale_cam[0, :]
            
            # Resize original image
            rgb_img = original_image.resize((224, 224))
            rgb_img = np.array(rgb_img) / 255.0
            
            # Create visualization
            visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
            
            # Convert to base64
            pil_img = Image.fromarray(visualization)
            buffer = io.BytesIO()
            pil_img.save(buffer, format='PNG')
            buffer.seek(0)
            
            return base64.b64encode(buffer.read()).decode('utf-8')
            
        except ImportError:
            print("pytorch-grad-cam not installed")
            return None
        except Exception as e:
            print(f"Grad-CAM error: {e}")
            return None
    
    @staticmethod
    def compute_image_hash(image: Image.Image) -> str:
        """Compute hash for duplicate detection"""
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        return hashlib.md5(buffer.getvalue()).hexdigest()


# Global model service instance
model_service = ModelService()
