import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
from pathlib import Path

# ─────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────
BASE_DIR    = Path(__file__).resolve().parent
MODEL_DIR   = BASE_DIR / "models"
DATASET_DIR = BASE_DIR / "dataset"
DEVICE      = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

CONFIDENCE_THRESHOLD = 0.4  # Below 40% = uncertain

# ─────────────────────────────────────────
# TRANSFORM (must match val_transform in training)
# ─────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ─────────────────────────────────────────
# LOAD MODEL FUNCTION
# ─────────────────────────────────────────
def load_model(animal_type):
    model_path   = MODEL_DIR / f"{animal_type}_breed_classifier.pth"
    classes_path = MODEL_DIR / f"{animal_type}_classes.json"

    # Check files exist
    if not model_path.exists():
        print(f"❌ Model not found: {model_path}")
        return None, None
    if not classes_path.exists():
        print(f"❌ Classes file not found: {classes_path}")
        return None, None

    # Load classes
    with open(classes_path, 'r') as f:
        classes = json.load(f)
    print(f"✅ Classes loaded ({len(classes)}): {classes}")

    # Build model with SAME architecture as training
    model = models.resnet18(weights=None)
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(model.fc.in_features, len(classes))
    )

    # Load saved weights
    try:
        model.load_state_dict(
            torch.load(model_path, map_location=DEVICE)
        )
        model.to(DEVICE)
        model.eval()
        print(f"✅ Model loaded: {model_path.name}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None, None

    return model, classes

# ─────────────────────────────────────────
# PREDICT SINGLE IMAGE
# ─────────────────────────────────────────
def predict(model, classes, image_path):
    try:
        image = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"❌ Cannot open image: {e}")
        return None, 0.0

    tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = model(tensor)
        probs  = torch.softmax(output, dim=1)
        confidence, pred_idx = probs.max(1)

    confidence  = confidence.item()
    pred_class  = classes[pred_idx.item()]

    return pred_class, confidence

# ─────────────────────────────────────────
# VERIFY ON DATASET IMAGES
# ─────────────────────────────────────────
def verify_animal(animal_type, test_images=3):
    print(f"\n{'='*50}")
    print(f"  VERIFYING: {animal_type.upper()}")
    print(f"{'='*50}")

    model, classes = load_model(animal_type)
    if model is None:
        return

    animal_dir = DATASET_DIR / animal_type
    correct, total = 0, 0

    # Test first N images from each breed
    for breed_folder in sorted(animal_dir.iterdir()):
        if not breed_folder.is_dir():
            continue

        images = (list(breed_folder.rglob("*.jpg")) +
                  list(breed_folder.rglob("*.jpeg")) +
                  list(breed_folder.rglob("*.png")))

        if not images:
            continue

        print(f"\n📁 Breed: {breed_folder.name}")

        for img_path in images[:test_images]:
            pred_class, confidence = predict(model, classes, img_path)

            if pred_class is None:
                continue

            total += 1
            is_correct = pred_class.lower() == breed_folder.name.lower()
            if is_correct:
                correct += 1

            # Confidence check
            if confidence < CONFIDENCE_THRESHOLD:
                status = "⚠️  LOW CONFIDENCE"
            elif is_correct:
                status = "✅ CORRECT"
            else:
                status = "❌ WRONG"

            print(f"   {img_path.name:30s} → "
                  f"Predicted: {pred_class:20s} "
                  f"Confidence: {confidence*100:.1f}%  {status}")

    # Summary
    if total > 0:
        accuracy = correct / total * 100
        print(f"\n{'='*50}")
        print(f"  Quick Accuracy: {correct}/{total} = {accuracy:.1f}%")
        print(f"{'='*50}")

# ─────────────────────────────────────────
# PREDICT A SINGLE CUSTOM IMAGE
# ─────────────────────────────────────────
def predict_single_image(image_path, animal_type):
    print(f"\n🔍 Predicting: {image_path}")
    print(f"   Animal type: {animal_type}")

    model, classes = load_model(animal_type)
    if model is None:
        return

    pred_class, confidence = predict(model, classes, image_path)

    if confidence < CONFIDENCE_THRESHOLD:
        print(f"⚠️  Uncertain prediction: {pred_class} ({confidence*100:.1f}%)")
        print(f"   Try a clearer image or check animal type")
    else:
        print(f"✅ Prediction : {pred_class}")
        print(f"   Confidence : {confidence*100:.1f}%")

# ─────────────────────────────────────────
if __name__ == "__main__":
    print(f"🖥️  Device: {DEVICE}")
    print(f"📂 Model Dir: {MODEL_DIR}")

    # Verify on dataset samples
    verify_animal("cattle",  test_images=2)
    verify_animal("buffalo", test_images=2)

    # ── To test your own image, uncomment below ──
    # predict_single_image("path/to/your/image.jpg", "cattle")