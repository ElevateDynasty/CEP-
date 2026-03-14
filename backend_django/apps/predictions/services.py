"""
ML Model Service for Django — Fixed Version
"""

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional
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
        print(f"🖥️  ModelService using device: {self.device}")

        # Models
        self.animal_model  = None
        self.cattle_model  = None
        self.buffalo_model = None
        self.is_loaded     = False

        # Classes — loaded from json
        self.cattle_breeds  = []
        self.buffalo_breeds = []
        self.animal_classes = ["buffalo", "cattle"]

        # Transform — MUST match val_transform in training
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        self._load_models()
        self._initialized = True

    # ─────────────────────────────────────────
    # MODEL ARCHITECTURE — must match training!
    # ─────────────────────────────────────────
    def _build_resnet18(self, num_classes: int) -> nn.Module:
        """
        Build ResNet-18 with Dropout — IDENTICAL to train_breeds.py
        DO NOT change this architecture
        """
        model = models.resnet18(weights=None)
        model.fc = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(model.fc.in_features, num_classes)
        )
        return model

    # ─────────────────────────────────────────
    # LOAD MODELS
    # ─────────────────────────────────────────
    def _load_models(self):
        try:
            # Model directory — looks in project_root/models/
            model_dir = Path(settings.ML_MODELS_PATH)
            print(f"📂 Looking for models in: {model_dir}")

            # ── Load animal classifier ──
            animal_model_path = model_dir / "animal_classifier.pth"
            if animal_model_path.exists():
                # The animal classifier uses a plain Linear fc without Sequential/Dropout
                self.animal_model = models.resnet18(weights=None)
                self.animal_model.fc = nn.Linear(self.animal_model.fc.in_features, 2)
                self.animal_model.load_state_dict(
                    torch.load(animal_model_path, map_location=self.device)
                )
                self.animal_model.to(self.device)
                self.animal_model.eval()
                print(f"✅ Animal model loaded")
            else:
                print(f"❌ Animal model not found at {animal_model_path}")

            # ── Load cattle ──
            cattle_model_path   = model_dir / "cattle_breed_classifier.pth"
            cattle_classes_path = model_dir / "cattle_classes.json"

            if cattle_classes_path.exists():
                with open(cattle_classes_path, 'r') as f:
                    self.cattle_breeds = json.load(f)
                print(f"✅ Cattle classes loaded: {len(self.cattle_breeds)} breeds")
            else:
                print(f"❌ cattle_classes.json not found at {cattle_classes_path}")

            if cattle_model_path.exists() and self.cattle_breeds:
                self.cattle_model = self._build_resnet18(len(self.cattle_breeds))
                self.cattle_model.load_state_dict(
                    torch.load(cattle_model_path, map_location=self.device)
                )
                self.cattle_model.to(self.device)
                self.cattle_model.eval()
                print(f"✅ Cattle model loaded")
            else:
                print(f"❌ Cattle model not found at {cattle_model_path}")

            # ── Load buffalo ──
            buffalo_model_path   = model_dir / "buffalo_breed_classifier.pth"
            buffalo_classes_path = model_dir / "buffalo_classes.json"

            if buffalo_classes_path.exists():
                with open(buffalo_classes_path, 'r') as f:
                    self.buffalo_breeds = json.load(f)
                print(f"✅ Buffalo classes loaded: {len(self.buffalo_breeds)} breeds")
            else:
                print(f"❌ buffalo_classes.json not found at {buffalo_classes_path}")

            if buffalo_model_path.exists() and self.buffalo_breeds:
                self.buffalo_model = self._build_resnet18(len(self.buffalo_breeds))
                self.buffalo_model.load_state_dict(
                    torch.load(buffalo_model_path, map_location=self.device)
                )
                self.buffalo_model.to(self.device)
                self.buffalo_model.eval()
                print(f"✅ Buffalo model loaded")
            else:
                print(f"❌ Buffalo model not found at {buffalo_model_path}")

            if self.cattle_model and self.buffalo_model and self.animal_model:
                self.is_loaded = True
                print("✅ All models ready!")
            else:
                print("⚠️  Some models missing — partial functionality")
                self.is_loaded = False

        except Exception as e:
            print(f"❌ Error loading models: {e}")
            self.is_loaded = False

    # ─────────────────────────────────────────
    # PREPROCESS
    # ─────────────────────────────────────────
    def preprocess(self, image: Image.Image) -> torch.Tensor:
        if image.mode != 'RGB':
            image = image.convert('RGB')
        tensor = self.transform(image)
        return tensor.unsqueeze(0).to(self.device)

    # ─────────────────────────────────────────
    # PREDICT — Main function called by views.py
    # ─────────────────────────────────────────
    def predict(self, image: Image.Image,
                animal_type_hint: str = None,
                include_gradcam: bool = False) -> Dict[str, Any]:
        """
        Predict breed from image.
        animal_type_hint: 'cattle' or 'buffalo' if known from frontend
        """
        start_time = time.time()

        if not self.is_loaded:
            return self._error_response("Models not loaded", start_time)

        input_tensor = self.preprocess(image)

        # ── Determine animal type ──
        # If frontend sends animal_type, use it directly
        # Otherwise auto-detect by running both models and picking higher confidence
        if animal_type_hint and animal_type_hint in ["cattle", "buffalo"]:
            animal_type = animal_type_hint
            animal_confidence = 1.0
        else:
            animal_type, animal_confidence = self._detect_animal_type(input_tensor)

        # ── Select correct model & breeds ──
        if animal_type == "cattle":
            model        = self.cattle_model
            breed_classes = self.cattle_breeds
        else:
            model        = self.buffalo_model
            breed_classes = self.buffalo_breeds

        if model is None:
            return self._error_response(f"{animal_type} model not available", start_time)

        # ── Breed prediction ──
        with torch.no_grad():
            output = model(input_tensor)
            probs  = torch.softmax(output, dim=1)
            breed_idx    = torch.argmax(probs, dim=1).item()
            breed_conf   = probs[0][breed_idx].item()

        predicted_breed = breed_classes[breed_idx]

        # ── Top 5 predictions ──
        top_k = min(5, len(breed_classes))
        top_probs, top_indices = torch.topk(probs[0], top_k)
        top_predictions = [
            {"breed": breed_classes[i], "confidence": round(p, 4)}
            for p, i in zip(top_probs.tolist(), top_indices.tolist())
        ]

        processing_time = int((time.time() - start_time) * 1000)

        result = {
            "success"                : True,
            "animal_type"            : animal_type,
            "animal_type_confidence" : round(animal_confidence, 4),
            "breed"                  : predicted_breed,
            "breed_confidence"       : round(breed_conf, 4),
            "top_predictions"        : top_predictions,
            "processing_time_ms"     : processing_time,
            "gradcam_image"          : None
        }

        # ── Optional Grad-CAM ──
        if include_gradcam:
            try:
                result["gradcam_image"] = self._generate_gradcam(
                    image, input_tensor, model, breed_idx
                )
            except Exception as e:
                print(f"Grad-CAM failed: {e}")

        return result

    # ─────────────────────────────────────────
    # AUTO DETECT ANIMAL TYPE
    # ─────────────────────────────────────────
    def _detect_animal_type(self, input_tensor: torch.Tensor):
        if self.animal_model is None:
            return "cattle", 0.5

        with torch.no_grad():
            output = self.animal_model(input_tensor)
            probs = torch.softmax(output, dim=1)
            print("Animal classifier probabilities:", probs)
            idx = torch.argmax(probs, dim=1).item()
            confidence = probs[0][idx].item()

        animal_type = self.animal_classes[idx]
        return animal_type, confidence

    # ─────────────────────────────────────────
    # ERROR RESPONSE
    # ─────────────────────────────────────────
    def _error_response(self, message: str, start_time: float) -> Dict:
        return {
            "success"                : False,
            "error"                  : message,
            "animal_type"            : None,
            "animal_type_confidence" : 0,
            "breed"                  : None,
            "breed_confidence"       : 0,
            "top_predictions"        : [],
            "processing_time_ms"     : int((time.time() - start_time) * 1000),
            "gradcam_image"          : None
        }

    # ─────────────────────────────────────────
    # GRAD-CAM
    # ─────────────────────────────────────────
    def _generate_gradcam(self, original_image, input_tensor,
                          model, target_class) -> Optional[str]:
        try:
            from pytorch_grad_cam import GradCAM
            from pytorch_grad_cam.utils.image import show_cam_on_image

            target_layers = [model.layer4[-1]]
            cam = GradCAM(model=model, target_layers=target_layers)
            grayscale_cam = cam(input_tensor=input_tensor, targets=None)[0]

            rgb_img = np.array(original_image.resize((224, 224))) / 255.0
            visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

            buffer = io.BytesIO()
            Image.fromarray(visualization).save(buffer, format='PNG')
            return base64.b64encode(buffer.getvalue()).decode('utf-8')

        except ImportError:
            print("pytorch-grad-cam not installed")
            return None
        except Exception as e:
            print(f"Grad-CAM error: {e}")
            return None

    # ─────────────────────────────────────────
    # UTILITY
    # ─────────────────────────────────────────
    @staticmethod
    def compute_image_hash(image: Image.Image) -> str:
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        return hashlib.md5(buffer.getvalue()).hexdigest()


# Global singleton instance
model_service = ModelService()