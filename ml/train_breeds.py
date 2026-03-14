import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torch.utils.data import DataLoader, Dataset
import json
from pathlib import Path
from PIL import Image
import copy

# ─────────────────────────────────────────
# STEP 1 — CONFIGURATION
# ─────────────────────────────────────────
CONFIG = {
    "BASE_DIR"       : Path(__file__).resolve().parent.parent,
    "BATCH_SIZE"     : 32,
    "IMG_SIZE"       : 224,
    "DEVICE"         : torch.device('cuda' if torch.cuda.is_available() else 'cpu'),
    "EPOCHS_PHASE1"  : 10,
    "EPOCHS_PHASE2"  : 15,
    "LR_HEAD"        : 1e-3,
    "LR_BACKBONE"    : 1e-4,
}

# ─────────────────────────────────────────────────────────────
# STEP 2 — AUTO DETECT BREEDS FROM FOLDER NAMES
# No more manual breed lists — reads directly from dataset/
# ─────────────────────────────────────────────────────────────
def get_breeds_from_folders(dataset_dir, animal_type):
    animal_path = Path(dataset_dir) / animal_type
    breeds = sorted([
        d.name for d in animal_path.iterdir()
        if d.is_dir()
    ])
    print(f"\n✅ Auto-detected {animal_type} breeds: {breeds}")
    return breeds


# ─────────────────────────────────────────
# STEP 3 — DATASET CLASS (FIXED)
# ─────────────────────────────────────────
class BreedDataset(Dataset):
    def __init__(self, dataset_dir, animal_type, target_breeds, transform=None):
        self.transform = transform
        self.images    = []
        self.labels    = []
        self.classes   = sorted(target_breeds)
        self.class_to_idx = {cls: i for i, cls in enumerate(self.classes)}

        print(f"\n📂 Loading dataset for: {animal_type.upper()}")
        print(f"   Breeds: {self.classes}")

        animal_dir = Path(dataset_dir) / animal_type

        for class_name in self.classes:
            # Case-insensitive folder matching
            breed_path = None
            for p in animal_dir.iterdir():
                if p.is_dir() and p.name.lower() == class_name.lower():
                    breed_path = p
                    break

            if not breed_path:
                print(f"   ⚠️  Folder not found for breed: {class_name}")
                continue

            count = 0
            for ext in ['*.jpg','*.jpeg','*.png','*.bmp',
                        '*.JPG','*.JPEG','*.PNG','*.BMP']:
                for f in breed_path.rglob(ext):
                    # ── Basic corrupt check ──
                    try:
                        img = Image.open(f)
                        img.verify()
                        self.images.append(str(f))
                        self.labels.append(self.class_to_idx[class_name])
                        count += 1
                    except Exception:
                        print(f"   ❌ Corrupt image removed: {f.name}")

            print(f"   {class_name:20s} → {count} images")

        print(f"\n   Total images loaded: {len(self.images)}")

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        try:
            image = Image.open(self.images[idx]).convert('RGB')
        except Exception:
            image = Image.new('RGB', (CONFIG["IMG_SIZE"], CONFIG["IMG_SIZE"]))
        if self.transform:
            image = self.transform(image)
        return image, self.labels[idx]


# ─────────────────────────────────────────
# STEP 4 — TRANSFORMS (FIXED)
# Val transform is now SEPARATE and correct
# ─────────────────────────────────────────
def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(CONFIG["IMG_SIZE"]),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((CONFIG["IMG_SIZE"], CONFIG["IMG_SIZE"])),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform


# ─────────────────────────────────────────────────────────────
# STEP 5 — SPLIT DATASET WITH CORRECT TRANSFORMS (FIXED)
# ─────────────────────────────────────────────────────────────
class TransformWrapper(Dataset):
    """Applies a different transform to a Subset."""
    def __init__(self, subset, transform):
        self.subset    = subset
        self.transform = transform

    def __len__(self):
        return len(self.subset)

    def __getitem__(self, idx):
        # Load raw PIL image (bypass original transform)
        orig_dataset = self.subset.dataset
        img_path     = orig_dataset.images[self.subset.indices[idx]]
        label        = orig_dataset.labels[self.subset.indices[idx]]
        try:
            image = Image.open(img_path).convert('RGB')
        except Exception:
            image = Image.new('RGB', (CONFIG["IMG_SIZE"], CONFIG["IMG_SIZE"]))
        if self.transform:
            image = self.transform(image)
        return image, label


# ─────────────────────────────────────────
# STEP 6 — MODEL BUILDER (FIXED)
# Added Dropout for regularization
# ─────────────────────────────────────────
def build_model(num_classes):
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)

    # Freeze all layers
    for param in model.parameters():
        param.requires_grad = False

    # Replace final layer with Dropout + Linear
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(model.fc.in_features, num_classes)
    )

    return model.to(CONFIG["DEVICE"])


# ─────────────────────────────────────────
# STEP 7 — TRAINING FUNCTION (FIXED)
# Added: best model saving, LR scheduler
# ─────────────────────────────────────────
def fit(model, train_loader, val_loader,
        criterion, optimizer, scheduler,
        epochs, phase_name, save_path):

    best_acc   = 0.0
    best_weights = copy.deepcopy(model.state_dict())

    for epoch in range(epochs):
        # ── Training ──
        model.train()
        loss_sum, correct, total = 0.0, 0, 0

        for inputs, labels in train_loader:
            inputs = inputs.to(CONFIG["DEVICE"])
            labels = labels.to(CONFIG["DEVICE"])

            optimizer.zero_grad()
            outputs = model(inputs)
            loss    = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            loss_sum += loss.item() * inputs.size(0)
            correct  += (outputs.argmax(1) == labels).sum().item()
            total    += inputs.size(0)

        train_loss = loss_sum / total
        train_acc  = correct  / total

        # ── Validation ──
        val_loss, val_acc = evaluate(model, val_loader, criterion)

        # ── LR Scheduler step ──
        scheduler.step(val_acc)

        # ── Save best model ──
        if val_acc > best_acc:
            best_acc     = val_acc
            best_weights = copy.deepcopy(model.state_dict())
            torch.save(best_weights, save_path)
            saved_tag = "💾 saved"
        else:
            saved_tag = ""

        print(f"[{phase_name}] Epoch {epoch+1:02d}/{epochs} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} {saved_tag}")

    # Restore best weights for next phase
    model.load_state_dict(best_weights)
    print(f"\n✅ {phase_name} done! Best Val Acc: {best_acc:.4f}")
    return model


def evaluate(model, loader, criterion):
    model.eval()
    loss_sum, correct, total = 0.0, 0, 0

    with torch.no_grad():
        for inputs, labels in loader:
            inputs = inputs.to(CONFIG["DEVICE"])
            labels = labels.to(CONFIG["DEVICE"])
            outputs = model(inputs)
            loss    = criterion(outputs, labels)

            loss_sum += loss.item() * inputs.size(0)
            correct  += (outputs.argmax(1) == labels).sum().item()
            total    += inputs.size(0)

    return loss_sum / total, correct / total


# ─────────────────────────────────────────
# STEP 8 — MAIN TRAINING PIPELINE
# ─────────────────────────────────────────
def train_breed_model(animal_type):
    print(f"\n{'='*50}")
    print(f"  TRAINING: {animal_type.upper()}")
    print(f"{'='*50}")

    DATASET_DIR = CONFIG["BASE_DIR"] / "dataset"
    MODEL_DIR   = CONFIG["BASE_DIR"] / "models"
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    SAVE_PATH   = MODEL_DIR / f"{animal_type}_breed_classifier.pth"
    CLASSES_PATH= MODEL_DIR / f"{animal_type}_classes.json"

    # Auto-detect breeds from folders
    breeds = get_breeds_from_folders(DATASET_DIR, animal_type)
    if not breeds:
        print("❌ No breed folders found!")
        return

    train_transform, val_transform = get_transforms()

    # Load full dataset (no transform yet — TransformWrapper handles it)
    full_dataset = BreedDataset(
        DATASET_DIR, animal_type, breeds, transform=None
    )

    if len(full_dataset) == 0:
        print("❌ No images found. Check your dataset folder!")
        return

    # Split 80% train / 20% val
    train_size   = int(0.8 * len(full_dataset))
    val_size     = len(full_dataset) - train_size
    train_subset, val_subset = torch.utils.data.random_split(
        full_dataset, [train_size, val_size]
    )

    # Apply CORRECT transforms to each split
    train_data = TransformWrapper(train_subset, train_transform)
    val_data   = TransformWrapper(val_subset,   val_transform)

    train_loader = DataLoader(train_data, batch_size=CONFIG["BATCH_SIZE"],
                              shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_data,   batch_size=CONFIG["BATCH_SIZE"],
                              shuffle=False, num_workers=0)

    print(f"\n📊 Train: {len(train_data)} | Val: {len(val_data)}")

    # Build model
    model     = build_model(num_classes=len(breeds))
    criterion = nn.CrossEntropyLoss()

    # ── PHASE 1: Train head only ──
    print("\n--- PHASE 1: Training Final Layer Only ---")
    optimizer = optim.Adam(model.fc.parameters(), lr=CONFIG["LR_HEAD"])
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, patience=3, factor=0.5
    )
    model = fit(model, train_loader, val_loader,
                criterion, optimizer, scheduler,
                CONFIG["EPOCHS_PHASE1"], "Phase1", SAVE_PATH)

    # ── PHASE 2: Unfreeze layer4 & fine-tune ──
    print("\n--- PHASE 2: Fine-tuning Layer4 ---")
    for param in model.layer4.parameters():
        param.requires_grad = True

    optimizer = optim.Adam([
        {'params': model.layer4.parameters(), 'lr': CONFIG["LR_BACKBONE"]},
        {'params': model.fc.parameters(),     'lr': CONFIG["LR_HEAD"]}
    ])
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, patience=3, factor=0.5
    )
    model = fit(model, train_loader, val_loader,
                criterion, optimizer, scheduler,
                CONFIG["EPOCHS_PHASE2"], "Phase2", SAVE_PATH)

    # Save class names
    with open(CLASSES_PATH, 'w') as f:
        json.dump(breeds, f, indent=2)

    print(f"\n✅ Model saved → {SAVE_PATH}")
    print(f"✅ Classes saved → {CLASSES_PATH}")
    print(f"   Classes: {breeds}")


# ─────────────────────────────────────────
if __name__ == "__main__":
    print(f"🖥️  Device: {CONFIG['DEVICE']}")
    train_breed_model("cattle")
    train_breed_model("buffalo")