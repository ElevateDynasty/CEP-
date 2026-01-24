"""
Model Evaluation and Testing
Comprehensive evaluation of trained models
"""

import torch
import torch.nn as nn
from torchvision import transforms, models
from torch.utils.data import DataLoader
from PIL import Image
import numpy as np
from pathlib import Path
import json
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm

# Configuration
CONFIG = {
    "data_dir": "../dataset",
    "model_dir": "../backend/ml_models",
    "image_size": 224,
    "batch_size": 32,
    "device": "cuda" if torch.cuda.is_available() else "cpu"
}

CATTLE_BREEDS = [
    "gir", "sahiwal", "red_sindhi", "tharparkar", "kankrej",
    "ongole", "hariana", "rathi", "deoni", "khillari",
    "kangayam", "hallikar", "amritmahal", "punganur", "vechur"
]

BUFFALO_BREEDS = [
    "murrah", "mehsana", "jaffarabadi", "surti", "bhadawari",
    "nili_ravi", "nagpuri", "pandharpuri", "toda"
]

# Transform for evaluation
eval_transform = transforms.Compose([
    transforms.Resize((CONFIG["image_size"], CONFIG["image_size"])),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def create_model(num_classes: int) -> nn.Module:
    """Create EfficientNet-B0 model"""
    model = models.efficientnet_b0(weights=None)
    num_features = model.classifier[1].in_features
    
    # Match training architecture
    if num_classes == 2:  # Stage 1
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(num_features, num_classes)
        )
    else:  # Stage 2
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.4, inplace=True),
            nn.Linear(num_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.3),
            nn.Linear(512, num_classes)
        )
    
    return model


def load_model(model_path: str, num_classes: int) -> nn.Module:
    """Load a trained model"""
    model = create_model(num_classes)
    model.load_state_dict(torch.load(model_path, map_location=CONFIG["device"]))
    model = model.to(CONFIG["device"])
    model.eval()
    return model


def predict_single_image(image_path: str, model: nn.Module, class_names: list) -> dict:
    """Predict breed for a single image"""
    image = Image.open(image_path).convert("RGB")
    tensor = eval_transform(image).unsqueeze(0).to(CONFIG["device"])
    
    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        top_prob, top_idx = probs.max(1)
        
        # Get top 3
        top3_probs, top3_indices = probs.topk(3, dim=1)
    
    return {
        "prediction": class_names[top_idx.item()],
        "confidence": top_prob.item() * 100,
        "top_3": [
            {"breed": class_names[idx.item()], "confidence": prob.item() * 100}
            for prob, idx in zip(top3_probs[0], top3_indices[0])
        ]
    }


def evaluate_model(model: nn.Module, data_dir: str, breeds: list, animal_type: str):
    """Comprehensive model evaluation"""
    print(f"\nEvaluating {animal_type} breed classifier...")
    
    all_preds = []
    all_labels = []
    all_probs = []
    
    data_path = Path(data_dir)
    
    for breed_idx, breed in enumerate(tqdm(breeds, desc="Processing breeds")):
        breed_dir = data_path / breed
        if not breed_dir.exists():
            continue
        
        for img_path in breed_dir.glob("*.*"):
            if img_path.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                continue
            
            try:
                image = Image.open(img_path).convert("RGB")
                tensor = eval_transform(image).unsqueeze(0).to(CONFIG["device"])
                
                with torch.no_grad():
                    outputs = model(tensor)
                    probs = torch.softmax(outputs, dim=1)
                    pred = outputs.argmax(1).item()
                
                all_preds.append(pred)
                all_labels.append(breed_idx)
                all_probs.append(probs[0].cpu().numpy())
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
    
    # Calculate metrics
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=breeds, zero_division=0))
    
    # Confusion matrix
    cm = confusion_matrix(all_labels, all_preds)
    
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=breeds, yticklabels=breeds)
    plt.title(f"{animal_type.capitalize()} Breed Classification - Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.xticks(rotation=45, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    output_path = Path(CONFIG["model_dir"]) / f"{animal_type}_confusion_matrix.png"
    plt.savefig(output_path)
    plt.close()
    
    print(f"Confusion matrix saved to: {output_path}")
    
    # Overall accuracy
    accuracy = np.mean(np.array(all_preds) == np.array(all_labels)) * 100
    print(f"\nOverall Accuracy: {accuracy:.2f}%")
    
    return accuracy


def main():
    """Main evaluation function"""
    print("=" * 60)
    print("Model Evaluation")
    print("=" * 60)
    
    model_dir = Path(CONFIG["model_dir"])
    
    # Evaluate Stage 1 (Cattle vs Buffalo)
    stage1_path = model_dir / "cattle_buffalo_classifier.pth"
    if stage1_path.exists():
        print("\n--- Stage 1: Cattle vs Buffalo ---")
        model = load_model(str(stage1_path), num_classes=2)
        # Would need combined dataset evaluation here
    else:
        print("Stage 1 model not found")
    
    # Evaluate Cattle breed classifier
    cattle_path = model_dir / "cattle_breed_classifier.pth"
    if cattle_path.exists():
        print("\n--- Cattle Breed Classifier ---")
        model = load_model(str(cattle_path), num_classes=len(CATTLE_BREEDS))
        evaluate_model(model, CONFIG["data_dir"], CATTLE_BREEDS, "cattle")
    else:
        print("Cattle breed model not found")
    
    # Evaluate Buffalo breed classifier
    buffalo_path = model_dir / "buffalo_breed_classifier.pth"
    if buffalo_path.exists():
        print("\n--- Buffalo Breed Classifier ---")
        model = load_model(str(buffalo_path), num_classes=len(BUFFALO_BREEDS))
        evaluate_model(model, CONFIG["data_dir"], BUFFALO_BREEDS, "buffalo")
    else:
        print("Buffalo breed model not found")
    
    print("\n" + "=" * 60)
    print("Evaluation Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
