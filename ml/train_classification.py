import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, Dataset
import json
from pathlib import Path
from PIL import Image

def train_model():
    # Configuration
    # Use project-relative paths
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATASET_DIR = BASE_DIR / "dataset"
    MODEL_DIR = BASE_DIR / "backend" / "ml_models"
    
    # Ensure model directory exists
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    MODEL_SAVE_PATH = MODEL_DIR / "cattle_buffalo_classifier.pth"
    CLASSES_SAVE_PATH = MODEL_DIR / "classes.json"
    
    BATCH_SIZE = 32
    EPOCHS = 1  # Reduced for testing
    IMG_SIZE = 224
    
    # Device configuration
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # Custom Dataset
    class AnimalDataset(Dataset):
        def __init__(self, dataset_dir, transform=None):
            self.dataset_dir = dataset_dir
            self.transform = transform
            self.images = []
            self.labels = []
            
            # Enforce specific classes
            self.classes = ['buffalo', 'cattle'] # Sorted strictly
            self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
            
            print(f"Target classes: {self.class_to_idx}")
            
            class_counts = {}
            
            for class_name in self.classes:
                class_path = dataset_dir / class_name
                if not class_path.exists():
                    print(f"Warning: Path not found: {class_path}")
                    continue
                    
                count = 0
                # Walk through directory to find images (including subdirectories if any)
                for root, _, files in os.walk(class_path):
                    for file in files:
                        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
                            self.images.append(str(Path(root) / file))
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
                image = Image.new('RGB', (IMG_SIZE, IMG_SIZE))
                
            label = self.labels[idx]

            if self.transform:
                image = self.transform(image)

            return image, label

    # Transforms (Match ImageNet stats)
    data_transforms = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Load Data
    dataset = AnimalDataset(DATASET_DIR, transform=data_transforms)
    
    if len(dataset) == 0:
        print("No images found! Please check the dataset paths.")
        return

    # Split into train/val (80/20)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    # Model Setup (ResNet18 Fine-Tuning)
    print("Loading pretrained ResNet18...")
    model = models.resnet18(pretrained=True)
    
    # FREEZE BACKBONE
    print("Freezing backbone layers...")
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace the final fully connected layer
    # This new layer will require gradients by default
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(dataset.classes))
    
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    # Optimizer should only optimize parameters that require gradients (the head)
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=0.001)

    # Training Loop
    print("Starting fine-tuning...")
    best_acc = 0.0
    
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        corrects = 0
        
        for inputs, labels in train_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / train_size
        epoch_acc = corrects.double() / train_size

        print(f'Epoch {epoch+1}/{EPOCHS} Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_corrects = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs = inputs.to(device)
                labels = labels.to(device)

                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * inputs.size(0)
                val_corrects += torch.sum(preds == labels.data)

        val_loss = val_loss / val_size
        val_acc = val_corrects.double() / val_size
        print(f'Epoch {epoch+1}/{EPOCHS} Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}')
        
        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)
            print(f"New best model saved! Acc: {val_acc:.4f}")

    # Save Classes Mapping
    with open(CLASSES_SAVE_PATH, 'w') as f:
        json.dump(dataset.classes, f)
        
    print(f"Final Model saved to {MODEL_SAVE_PATH}")
    print(f"Classes saved to {CLASSES_SAVE_PATH}")

if __name__ == '__main__':
    train_model()
