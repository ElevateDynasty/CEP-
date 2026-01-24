"""
Stage 1 Training: Cattle vs Buffalo Binary Classification
Uses EfficientNet-B0 with transfer learning
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import transforms, models
from PIL import Image
import json
from pathlib import Path
from tqdm import tqdm
import matplotlib.pyplot as plt
from datetime import datetime

# Configuration
CONFIG = {
    "data_dir": "../dataset",  # Path to your dataset
    "output_dir": "../backend/ml_models",
    "model_name": "cattle_buffalo_classifier.pth",
    "batch_size": 32,
    "num_epochs": 20,
    "learning_rate": 0.001,
    "image_size": 224,
    "train_split": 0.8,
    "num_workers": 4,
    "device": "cuda" if torch.cuda.is_available() else "cpu"
}

# Data transforms with augmentation
train_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomCrop(CONFIG["image_size"]),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_transform = transforms.Compose([
    transforms.Resize((CONFIG["image_size"], CONFIG["image_size"])),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


class CattleBuffaloDataset(Dataset):
    """Dataset for Cattle vs Buffalo classification"""
    
    def __init__(self, data_dir: str, transform=None):
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.samples = []
        self.class_to_idx = {"cattle": 0, "buffalo": 1}
        
        # Cattle breeds (from your dataset structure)
        cattle_breeds = [
            "gir", "sahiwal", "red_sindhi", "tharparkar", "kankrej",
            "ongole", "hariana", "rathi", "deoni", "khillari",
            "kangayam", "hallikar", "amritmahal", "punganur", "vechur"
        ]
        
        # Buffalo breeds
        buffalo_breeds = [
            "murrah", "mehsana", "jaffarabadi", "surti", "bhadawari",
            "nili_ravi", "nagpuri", "pandharpuri", "toda"
        ]
        
        # Load image paths
        for breed in cattle_breeds:
            breed_dir = self.data_dir / breed
            if breed_dir.exists():
                for img_path in breed_dir.glob("*.*"):
                    if img_path.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        self.samples.append((str(img_path), 0))  # 0 = cattle
        
        for breed in buffalo_breeds:
            breed_dir = self.data_dir / breed
            if breed_dir.exists():
                for img_path in breed_dir.glob("*.*"):
                    if img_path.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        self.samples.append((str(img_path), 1))  # 1 = buffalo
        
        print(f"Loaded {len(self.samples)} images")
        print(f"  Cattle: {sum(1 for _, label in self.samples if label == 0)}")
        print(f"  Buffalo: {sum(1 for _, label in self.samples if label == 1)}")
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception as e:
            print(f"Error loading {img_path}: {e}")
            # Return a blank image if loading fails
            image = Image.new("RGB", (CONFIG["image_size"], CONFIG["image_size"]))
        
        if self.transform:
            image = self.transform(image)
        
        return image, label


def create_model(num_classes: int = 2) -> nn.Module:
    """Create EfficientNet-B0 model with custom classifier"""
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    
    # Freeze early layers
    for param in model.features[:5].parameters():
        param.requires_grad = False
    
    # Replace classifier
    num_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(num_features, num_classes)
    )
    
    return model


def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    pbar = tqdm(dataloader, desc="Training")
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        pbar.set_postfix({
            "loss": f"{loss.item():.4f}",
            "acc": f"{100.*correct/total:.2f}%"
        })
    
    return running_loss / len(dataloader), 100. * correct / total


def validate(model, dataloader, criterion, device):
    """Validate the model"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in tqdm(dataloader, desc="Validating"):
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    return running_loss / len(dataloader), 100. * correct / total


def main():
    """Main training function"""
    print("=" * 60)
    print("Stage 1: Cattle vs Buffalo Classification")
    print("=" * 60)
    print(f"Device: {CONFIG['device']}")
    
    # Create output directory
    output_dir = Path(CONFIG["output_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load dataset
    print("\nLoading dataset...")
    full_dataset = CattleBuffaloDataset(CONFIG["data_dir"], transform=None)
    
    if len(full_dataset) == 0:
        print("❌ No images found! Please check the dataset directory.")
        print(f"   Expected path: {CONFIG['data_dir']}")
        print("\nDataset structure should be:")
        print("   dataset/")
        print("   ├── gir/")
        print("   │   ├── image1.jpg")
        print("   │   └── ...")
        print("   ├── murrah/")
        print("   │   ├── image1.jpg")
        print("   │   └── ...")
        print("   └── ...")
        return
    
    # Split dataset
    train_size = int(CONFIG["train_split"] * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    train_dataset, val_dataset = random_split(
        full_dataset, 
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    # Apply transforms
    train_dataset.dataset.transform = train_transform
    val_dataset.dataset.transform = val_transform
    
    # Create dataloaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=CONFIG["batch_size"],
        shuffle=True,
        num_workers=CONFIG["num_workers"],
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=CONFIG["batch_size"],
        shuffle=False,
        num_workers=CONFIG["num_workers"],
        pin_memory=True
    )
    
    print(f"\nTrain samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")
    
    # Create model
    print("\nCreating model...")
    model = create_model(num_classes=2)
    model = model.to(CONFIG["device"])
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=CONFIG["learning_rate"]
    )
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
    
    # Training loop
    print("\nStarting training...")
    best_val_acc = 0.0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    
    for epoch in range(CONFIG["num_epochs"]):
        print(f"\nEpoch {epoch+1}/{CONFIG['num_epochs']}")
        print("-" * 40)
        
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, CONFIG["device"]
        )
        val_loss, val_acc = validate(
            model, val_loader, criterion, CONFIG["device"]
        )
        
        scheduler.step()
        
        # Save history
        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            model_path = output_dir / CONFIG["model_name"]
            torch.save(model.state_dict(), model_path)
            print(f"✅ Saved best model with {val_acc:.2f}% accuracy")
    
    # Save training history
    history_path = output_dir / "stage1_history.json"
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)
    
    # Plot training curves
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history["train_loss"], label="Train")
    plt.plot(history["val_loss"], label="Validation")
    plt.title("Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history["train_acc"], label="Train")
    plt.plot(history["val_acc"], label="Validation")
    plt.title("Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy (%)")
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(output_dir / "stage1_training_curves.png")
    plt.close()
    
    print("\n" + "=" * 60)
    print(f"Training complete!")
    print(f"Best validation accuracy: {best_val_acc:.2f}%")
    print(f"Model saved to: {output_dir / CONFIG['model_name']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
