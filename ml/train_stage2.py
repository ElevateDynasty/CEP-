"""
Stage 2 Training: Breed Classification
Separate models for cattle and buffalo breeds
Uses EfficientNet-B0 with transfer learning
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split, WeightedRandomSampler
from torchvision import transforms, models
from PIL import Image
import json
from pathlib import Path
from tqdm import tqdm
import matplotlib.pyplot as plt
from collections import Counter
import numpy as np

# Configuration
CONFIG = {
    "data_dir": "../dataset",  # Path to your dataset
    "output_dir": "../backend/ml_models",
    "batch_size": 32,
    "num_epochs": 25,
    "learning_rate": 0.0005,
    "image_size": 224,
    "train_split": 0.8,
    "num_workers": 4,
    "device": "cuda" if torch.cuda.is_available() else "cpu"
}

# Breed definitions
CATTLE_BREEDS = [
    "gir", "sahiwal", "red_sindhi", "tharparkar", "kankrej",
    "ongole", "hariana", "rathi", "deoni", "khillari",
    "kangayam", "hallikar", "amritmahal", "punganur", "vechur"
]

BUFFALO_BREEDS = [
    "murrah", "mehsana", "jaffarabadi", "surti", "bhadawari",
    "nili_ravi", "nagpuri", "pandharpuri", "toda"
]

# Data transforms with augmentation
train_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomCrop(CONFIG["image_size"]),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.1),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1), scale=(0.9, 1.1)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
    transforms.RandomErasing(p=0.2)
])

val_transform = transforms.Compose([
    transforms.Resize((CONFIG["image_size"], CONFIG["image_size"])),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


class BreedDataset(Dataset):
    """Dataset for breed classification"""
    
    def __init__(self, data_dir: str, breeds: list, transform=None):
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.breeds = breeds
        self.class_to_idx = {breed: idx for idx, breed in enumerate(breeds)}
        self.idx_to_class = {idx: breed for breed, idx in self.class_to_idx.items()}
        self.samples = []
        
        # Load image paths
        for breed in breeds:
            breed_dir = self.data_dir / breed
            if breed_dir.exists():
                for img_path in breed_dir.glob("*.*"):
                    if img_path.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        self.samples.append((str(img_path), self.class_to_idx[breed]))
        
        # Print statistics
        self._print_stats()
    
    def _print_stats(self):
        """Print dataset statistics"""
        label_counts = Counter(label for _, label in self.samples)
        print(f"\nLoaded {len(self.samples)} images across {len(self.breeds)} breeds:")
        for breed in self.breeds:
            idx = self.class_to_idx[breed]
            count = label_counts.get(idx, 0)
            print(f"  {breed}: {count} images")
    
    def get_class_weights(self):
        """Calculate class weights for handling imbalanced data"""
        label_counts = Counter(label for _, label in self.samples)
        total = len(self.samples)
        weights = []
        for i in range(len(self.breeds)):
            count = label_counts.get(i, 1)
            weights.append(total / (len(self.breeds) * count))
        return torch.FloatTensor(weights)
    
    def get_sample_weights(self):
        """Get weight for each sample for weighted sampling"""
        label_counts = Counter(label for _, label in self.samples)
        total = len(self.samples)
        class_weights = {
            label: total / count 
            for label, count in label_counts.items()
        }
        return [class_weights[label] for _, label in self.samples]
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception as e:
            print(f"Error loading {img_path}: {e}")
            image = Image.new("RGB", (CONFIG["image_size"], CONFIG["image_size"]))
        
        if self.transform:
            image = self.transform(image)
        
        return image, label


def create_model(num_classes: int) -> nn.Module:
    """Create EfficientNet-B0 model with custom classifier"""
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    
    # Freeze early layers (less freezing for breed classification)
    for param in model.features[:3].parameters():
        param.requires_grad = False
    
    # Replace classifier with deeper head
    num_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4, inplace=True),
        nn.Linear(num_features, 512),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.3),
        nn.Linear(512, num_classes)
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
        
        # Gradient clipping
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
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
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in tqdm(dataloader, desc="Validating"):
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    return running_loss / len(dataloader), 100. * correct / total, all_preds, all_labels


def train_breed_classifier(animal_type: str, breeds: list, model_name: str):
    """Train a breed classifier"""
    print("\n" + "=" * 60)
    print(f"Training {animal_type.upper()} Breed Classifier")
    print(f"Breeds: {len(breeds)}")
    print("=" * 60)
    
    # Create output directory
    output_dir = Path(CONFIG["output_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load dataset
    print("\nLoading dataset...")
    full_dataset = BreedDataset(CONFIG["data_dir"], breeds, transform=None)
    
    if len(full_dataset) == 0:
        print(f"❌ No images found for {animal_type}!")
        return None
    
    # Split dataset
    train_size = int(CONFIG["train_split"] * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    train_dataset, val_dataset = random_split(
        full_dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    # Create a wrapper to apply different transforms
    class TransformedSubset(Dataset):
        def __init__(self, subset, transform):
            self.subset = subset
            self.transform = transform
        
        def __len__(self):
            return len(self.subset)
        
        def __getitem__(self, idx):
            img_path, label = self.subset.dataset.samples[self.subset.indices[idx]]
            try:
                image = Image.open(img_path).convert("RGB")
            except:
                image = Image.new("RGB", (CONFIG["image_size"], CONFIG["image_size"]))
            
            if self.transform:
                image = self.transform(image)
            return image, label
    
    train_dataset_transformed = TransformedSubset(train_dataset, train_transform)
    val_dataset_transformed = TransformedSubset(val_dataset, val_transform)
    
    # Create weighted sampler for handling class imbalance
    train_labels = [full_dataset.samples[i][1] for i in train_dataset.indices]
    label_counts = Counter(train_labels)
    class_weights = {label: len(train_labels) / count for label, count in label_counts.items()}
    sample_weights = [class_weights[label] for label in train_labels]
    sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)
    
    # Create dataloaders
    train_loader = DataLoader(
        train_dataset_transformed,
        batch_size=CONFIG["batch_size"],
        sampler=sampler,
        num_workers=CONFIG["num_workers"],
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset_transformed,
        batch_size=CONFIG["batch_size"],
        shuffle=False,
        num_workers=CONFIG["num_workers"],
        pin_memory=True
    )
    
    print(f"\nTrain samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")
    
    # Create model
    print("\nCreating model...")
    model = create_model(num_classes=len(breeds))
    model = model.to(CONFIG["device"])
    
    # Loss (with class weights) and optimizer
    class_weights_tensor = full_dataset.get_class_weights().to(CONFIG["device"])
    criterion = nn.CrossEntropyLoss(weight=class_weights_tensor)
    
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=CONFIG["learning_rate"],
        weight_decay=0.01
    )
    
    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, 
        T_max=CONFIG["num_epochs"],
        eta_min=1e-6
    )
    
    # Training loop
    print("\nStarting training...")
    best_val_acc = 0.0
    patience = 5
    patience_counter = 0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    
    for epoch in range(CONFIG["num_epochs"]):
        print(f"\nEpoch {epoch+1}/{CONFIG['num_epochs']}")
        print("-" * 40)
        
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, CONFIG["device"]
        )
        val_loss, val_acc, preds, labels = validate(
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
        print(f"Learning Rate: {scheduler.get_last_lr()[0]:.6f}")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            model_path = output_dir / model_name
            torch.save(model.state_dict(), model_path)
            print(f"✅ Saved best model with {val_acc:.2f}% accuracy")
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"Early stopping at epoch {epoch+1}")
                break
    
    # Save training history
    history_path = output_dir / f"{animal_type}_breed_history.json"
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)
    
    # Save class mapping
    mapping_path = output_dir / f"{animal_type}_breed_mapping.json"
    with open(mapping_path, "w") as f:
        json.dump({
            "class_to_idx": full_dataset.class_to_idx,
            "idx_to_class": full_dataset.idx_to_class
        }, f, indent=2)
    
    # Plot training curves
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history["train_loss"], label="Train")
    plt.plot(history["val_loss"], label="Validation")
    plt.title(f"{animal_type.capitalize()} Breed Classifier - Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history["train_acc"], label="Train")
    plt.plot(history["val_acc"], label="Validation")
    plt.title(f"{animal_type.capitalize()} Breed Classifier - Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy (%)")
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(output_dir / f"{animal_type}_breed_training_curves.png")
    plt.close()
    
    print(f"\n✅ {animal_type.capitalize()} breed classifier trained!")
    print(f"   Best accuracy: {best_val_acc:.2f}%")
    
    return best_val_acc


def main():
    """Main training function"""
    print("=" * 60)
    print("Stage 2: Breed Classification Training")
    print("=" * 60)
    print(f"Device: {CONFIG['device']}")
    
    # Train cattle breed classifier
    cattle_acc = train_breed_classifier(
        animal_type="cattle",
        breeds=CATTLE_BREEDS,
        model_name="cattle_breed_classifier.pth"
    )
    
    # Train buffalo breed classifier
    buffalo_acc = train_breed_classifier(
        animal_type="buffalo",
        breeds=BUFFALO_BREEDS,
        model_name="buffalo_breed_classifier.pth"
    )
    
    # Summary
    print("\n" + "=" * 60)
    print("TRAINING SUMMARY")
    print("=" * 60)
    if cattle_acc:
        print(f"Cattle Breed Classifier: {cattle_acc:.2f}%")
    if buffalo_acc:
        print(f"Buffalo Breed Classifier: {buffalo_acc:.2f}%")
    print(f"\nModels saved to: {CONFIG['output_dir']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
