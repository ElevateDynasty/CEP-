# Models Directory

This directory contains trained PyTorch model files:

- `stage1_classifier.pth` - Cattle vs Buffalo binary classifier
- `stage2_classifier.pth` - Breed multi-class classifier

## Training Models

To train the models, use the scripts in the `ml/` directory:

```bash
# Stage 1: Cattle vs Buffalo classification
python ml/train_stage1.py --data_dir data/raw --output_dir models

# Stage 2: Breed classification  
python ml/train_stage2.py --data_dir data/raw --output_dir models
```

## Model Architecture

Both models use EfficientNet-B0 as the backbone with transfer learning from ImageNet weights.

### Stage 1 (Binary Classification)
- Input: 224x224 RGB image
- Output: 2 classes (cattle, buffalo)
- Final layer: Linear(1280, 2)

### Stage 2 (Multi-class Classification)
- Input: 224x224 RGB image
- Output: 24 classes (15 cattle breeds + 9 buffalo breeds)
- Final layer: Linear(1280, 24)

## Demo Mode

If model files are not found, the backend will run in demo mode with random predictions for testing purposes.
