"""
Grad-CAM Service
Generates explainable AI heatmaps for breed predictions
"""

import torch
import numpy as np
from PIL import Image
import cv2
import base64
import io
from typing import Optional

try:
    from pytorch_grad_cam import GradCAM
    from pytorch_grad_cam.utils.image import show_cam_on_image
    from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
    GRADCAM_AVAILABLE = True
except ImportError:
    GRADCAM_AVAILABLE = False
    print("pytorch-grad-cam not installed. Grad-CAM will be disabled.")

from app.services.model_service import ModelService
from app.config import settings


class GradCAMService:
    """Service for generating Grad-CAM visualizations"""
    
    def __init__(self, model_service: ModelService):
        self.model_service = model_service
        self.device = model_service.device
    
    def generate_heatmap(
        self, 
        image: Image.Image, 
        breed: str,
        opacity: float = 0.5
    ) -> Optional[str]:
        """
        Generate Grad-CAM heatmap overlay on the input image
        
        Args:
            image: Input PIL Image
            breed: Predicted breed name
            opacity: Heatmap overlay opacity (0-1)
        
        Returns:
            Base64 encoded image with heatmap overlay
        """
        if not GRADCAM_AVAILABLE:
            return None
        
        try:
            # Determine animal type and get appropriate model
            if breed in settings.CATTLE_BREEDS:
                animal_type = "cattle"
                breed_classes = settings.CATTLE_BREEDS
            else:
                animal_type = "buffalo"
                breed_classes = settings.BUFFALO_BREEDS
            
            model = self.model_service.get_model_for_gradcam(animal_type)
            
            if model is None:
                return None
            
            # Get target layer (last conv layer before classifier)
            # For EfficientNet-B0, this is the last block
            target_layers = [model.features[-1]]
            
            # Preprocess image
            input_tensor = self.model_service.preprocess(image)
            
            # Prepare original image for overlay
            original_image = image.resize((224, 224))
            original_np = np.array(original_image).astype(np.float32) / 255.0
            
            # Get target class index
            try:
                target_class = breed_classes.index(breed)
            except ValueError:
                target_class = 0
            
            # Create Grad-CAM
            cam = GradCAM(model=model, target_layers=target_layers)
            targets = [ClassifierOutputTarget(target_class)]
            
            # Generate heatmap
            grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
            grayscale_cam = grayscale_cam[0, :]  # Get first image in batch
            
            # Overlay on original image
            visualization = show_cam_on_image(
                original_np, 
                grayscale_cam, 
                use_rgb=True,
                image_weight=1 - opacity
            )
            
            # Convert to base64
            pil_image = Image.fromarray(visualization)
            buffer = io.BytesIO()
            pil_image.save(buffer, format="PNG")
            buffer.seek(0)
            
            base64_image = base64.b64encode(buffer.getvalue()).decode("utf-8")
            
            return f"data:image/png;base64,{base64_image}"
            
        except Exception as e:
            print(f"Grad-CAM generation error: {e}")
            return None
    
    def generate_multiple_heatmaps(
        self,
        image: Image.Image,
        breeds: list,
        opacity: float = 0.5
    ) -> dict:
        """
        Generate Grad-CAM heatmaps for multiple breed predictions
        
        Args:
            image: Input PIL Image
            breeds: List of breed names
            opacity: Heatmap overlay opacity
        
        Returns:
            Dictionary mapping breed names to base64 heatmap images
        """
        results = {}
        
        for breed in breeds:
            heatmap = self.generate_heatmap(image, breed, opacity)
            if heatmap:
                results[breed] = heatmap
        
        return results
