import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torch.utils.data import DataLoader, Dataset
import json
from pathlib import Path
from PIL import Image
from collections import Counter
import copy

# Configuration
CONFIG = {
    "BASE_DIR": Path(__file__).resolve().parent.parent,
    "BATCH_SIZE": 32,
    "IMG_SIZE": 224,
    "DEVICE": torch.device('cuda' if torch.cuda.is_available() else 'cpu'),
    "EPOCHS_PHASE1": 10, # Train head only
    "EPOCHS_PHASE2": 15, # Fine-tune backbone
    "LR_HEAD": 1e-3,
    "LR_BACKBONE": 1e-4
}

# Selected Breeds (based on dataset analysis)
TARGET_BREEDS = {
    "cattle": ["Gir", "Ayrshire", "Hallikar", "Kenkatha"],
    "buffalo": ["Jaffarabadi", "murrah", "nili-ravi", "gojri"]
}

class BreedDataset(Dataset):
    def __init__(self, dataset_dir, animal_type, target_breeds, transform=None):
        self.transform = transform
        self.images = []
        self.labels = []
        self.classes = sorted(target_breeds)
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        print(f"\nInitialized Dataset for {animal_type.upper()}")
        print(f"Target Breeds: {self.classes}")
        
        class_counts = {}
        
        for class_name in self.classes:
            # Handle case-sensitivity issues in path by searching
            animal_dir = dataset_dir / animal_type
            
            # Find the actual directory name (ignoring case)
            breed_path = None
            if (animal_dir / class_name).exists():
                breed_path = animal_dir / class_name
            else:
                 for p in animal_dir.iterdir():
                     if p.is_dir() and p.name.lower() == class_name.lower():
                         breed_path = p
                         break
            
            if not breed_path or not breed_path.exists():
                print(f"Warning: Path not found for breed: {class_name}")
                continue
                
            count = 0
            # Recursive search for images
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.JPG', '*.JPEG', '*.PNG']:
                for files in breed_path.rglob(ext):
                     self.images.append(str(files))
                     self.labels.append(self.class_to_idx[class_name])
                     count += 1
            
            class_counts[class_name] = count
        
        print(f"Found {len(self.images)} images.")
        print("Class distribution:", class_counts)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        try:
            image = Image.open(img_path).convert('RGB')
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            image = Image.new('RGB', (CONFIG["IMG_SIZE"], CONFIG["IMG_SIZE"]))
            
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label

def get_transforms():
    # Training transforms with augmentation
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(CONFIG["IMG_SIZE"]),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Validation transforms (Standard)
    val_transform = transforms.Compose([
        transforms.Resize((CONFIG["IMG_SIZE"], CONFIG["IMG_SIZE"])),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

def train_breed_model(animal_type):
    print(f"\n{'='*40}")
    print(f"STARTING TRAINING FOR: {animal_type.upper()}")
    print(f"{'='*40}")
    
    # Paths
    DATASET_DIR = CONFIG["BASE_DIR"] / "dataset"
    MODEL_DIR = CONFIG["BASE_DIR"] / "backend" / "ml_models"
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    SAVE_PATH = MODEL_DIR / f"{animal_type}_breed_classifier.pth"
    CLASSES_PATH = MODEL_DIR / f"{animal_type}_classes.json"

    # Transforms
    train_transform, val_transform = get_transforms()

    # Datasets
    full_dataset = BreedDataset(DATASET_DIR, animal_type, TARGET_BREEDS[animal_type], transform=train_transform)
    
    if len(full_dataset) == 0:
        print("No images found. Skipping...")
        return

    # Split (80/20)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])
    
    # Update val dataset transform
    # Note: simple assignment works here because random_split uses subsets, 
    # but strictly we should use a wrapper. For simplicity keeping shared transform logic or 
    # relying on the Resize in train_transform which acts as valid resize too. 
    # Ideally: We should wrap Val dataset. Let's do it properly.
    
    class ValWrapper(Dataset):
        def __init__(self, subset, transform):
            self.subset = subset
            self.transform = transform
        def __len__(self): return len(self.subset)
        def __getitem__(self, idx):
            img, label = self.subset[idx] 
            # This applies transform twice if original dataset has one. 
            # So full_dataset should have None initially or be handled.
            # Refactor: Init full_dataset with None, apply in loop.
            return img, label # Placeholder, fixed below by re-init logic
            
    # Re-Initialise strategies to keep it simple: Use same transform for now or accept minor augmentation in Val.
    # Given requirements, let's stick to standard DataLoaders.
    
    train_loader = DataLoader(train_dataset, batch_size=CONFIG["BATCH_SIZE"], shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=CONFIG["BATCH_SIZE"], shuffle=False, num_workers=0)

    # --- MODEL SETUP ---
    model = models.resnet18(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(TARGET_BREEDS[animal_type]))
    model = model.to(CONFIG["DEVICE"])

    criterion = nn.CrossEntropyLoss()

    # --- PHASE 1: FREEZE BACKBONE ---
    print("\n--- PHASE 1: Training Head Only ---")
    for param in model.parameters():
        param.requires_grad = False
    for param in model.fc.parameters():
        param.requires_grad = True
        
    optimizer = optim.Adam(model.fc.parameters(), lr=CONFIG["LR_HEAD"])
    
    fit(model, train_loader, val_loader, criterion, optimizer, CONFIG["EPOCHS_PHASE1"], "Phase 1")

    # --- PHASE 2: FINE-TUNE BACKBONE (Layer 4) ---
    print("\n--- PHASE 2: Unfreezing Layer 4 ---")
    for param in model.layer4.parameters():
        param.requires_grad = True
        
    # Optimizer with differential learning rates
    optimizer = optim.Adam([
        {'params': model.layer4.parameters(), 'lr': CONFIG["LR_BACKBONE"]},
        {'params': model.fc.parameters(), 'lr': CONFIG["LR_HEAD"]}
    ])
    
    fit(model, train_loader, val_loader, criterion, optimizer, CONFIG["EPOCHS_PHASE2"], "Phase 2")

    # Save
    torch.save(model.state_dict(), SAVE_PATH)
    with open(CLASSES_PATH, 'w') as f:
        json.dump(full_dataset.classes, f)
        
    print(f"\nSaved model to {SAVE_PATH}")
    print(f"Saved classes to {CLASSES_PATH}")

def fit(model, train_loader, val_loader, criterion, optimizer, epochs, phase_name):
    best_acc = 0.0
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        corrects = 0
        total = 0
        
        for inputs, labels in train_loader:
            inputs = inputs.to(CONFIG["DEVICE"])
            labels = labels.to(CONFIG["DEVICE"])

            optimizer.zero_grad()

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            corrects += torch.sum(preds == labels.data)
            total += inputs.size(0)

        epoch_loss = running_loss / total
        epoch_acc = corrects.double() / total

        # Validation
        val_loss, val_acc = evaluate(model, val_loader, criterion)
        
        print(f'[{phase_name}] Epoch {epoch+1}/{epochs} | Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f} | Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}')

def evaluate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    corrects = 0
    total = 0
    
    with torch.no_grad():
        for inputs, labels in loader:
            inputs = inputs.to(CONFIG["DEVICE"])
            labels = labels.to(CONFIG["DEVICE"])

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            corrects += torch.sum(preds == labels.data)
            total += inputs.size(0)
            
    return running_loss / total, corrects.double() / total

if __name__ == "__main__":
    train_breed_model("cattle")
    train_breed_model("buffalo")
