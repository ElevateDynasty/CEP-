import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
from pathlib import Path
import sys

def verify_inference():
    print("Starting verification (Fixed OpenMP)...")
    
    BASE_DIR = Path(__file__).resolve().parent
    MODEL_DIR = BASE_DIR / "backend" / "ml_models"
    DATASET_DIR = BASE_DIR / "dataset"
    
    MODEL_PATH = MODEL_DIR / "cattle_buffalo_classifier.pth"
    CLASSES_PATH = MODEL_DIR / "classes.json"
    
    if not MODEL_PATH.exists():
        print(f"ERROR: Model not found at {MODEL_PATH}")
        return
        
    if not CLASSES_PATH.exists():
        print(f"ERROR: Classes file not found at {CLASSES_PATH}")
        return
        
    # Load classes
    with open(CLASSES_PATH, 'r') as f:
        classes = json.load(f)
    print(f"Loaded classes: {classes}")
    
    # Load Model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    model = models.resnet18(pretrained=False)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(classes))
    
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.to(device)
        model.eval()
        print("Model loaded successfully.")
    except Exception as e:
        print(f"ERROR loading model: {e}")
        return

    # Transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Test on a few images
    test_dirs = {
        'cattle': DATASET_DIR / "cattle",
        'buffalo': DATASET_DIR / "buffalo"
    }
    
    print("\n--- Running Inference Tests ---")
    
    for class_name, dir_path in test_dirs.items():
        if not dir_path.exists():
            print(f"Warning: {class_name} directory not found.")
            continue
            
        # Get first image (recursive search)
        images = list(dir_path.rglob("*.jpg")) + list(dir_path.rglob("*.png")) + list(dir_path.rglob("*.jpeg"))
        if not images:
            print(f"No images found for {class_name}")
            continue
            
        img_path = images[0]
        print(f"\nTesting {class_name} image: {img_path.name}")
        
        try:
            image = Image.open(img_path).convert('RGB')
            input_tensor = transform(image).unsqueeze(0).to(device)
            
            with torch.no_grad():
                output = model(input_tensor)
                probs = torch.softmax(output, dim=1)
                
                print(f"Raw Output: {output.cpu().numpy()}")
                print(f"Probabilities: {probs.cpu().numpy()}")
                
                pred_idx = torch.argmax(probs, dim=1).item()
                pred_class = classes[pred_idx]
                confidence = probs[0][pred_idx].item()
                
                print(f"Prediction: {pred_class} ({confidence*100:.2f}%)")
                
                if pred_class == class_name:
                    print("✅ CORRECT")
                else:
                    print("❌ INCORRECT / BIASED")
                    
        except Exception as e:
            print(f"Error processing image: {e}")

if __name__ == "__main__":
    verify_inference()
