# 🐄 Indian Cattle & Buffalo Breed Recognition System

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)](https://pytorch.org)

An AI-powered web application for identifying and comparing Indian cattle and buffalo breeds. Features deep learning-based image classification with GradCAM visualizations, interactive breed comparison tools, and an educational platform for learning about India's indigenous livestock heritage.

## ✨ Features

### 🔍 Breed Identification
- **AI-Powered Recognition**: Upload images to identify cattle/buffalo breeds using trained CNN models
- **GradCAM Visualization**: See which features the AI focuses on for breed identification
- **Confidence Scores**: Get probability scores for top predicted breeds
- **Multi-stage Classification**: First classifies cattle vs buffalo, then identifies specific breed

### 📊 Breed Comparison
- **Side-by-Side Comparison**: Compare up to 4 breeds simultaneously
- **Interactive Charts**: Radar and bar charts for visual comparison
- **Quick Presets**: Pre-configured comparison sets (Milk Champions, Draft Powerhouses, etc.)
- **Export Feature**: Download comparison as PNG image
- **Winner Highlighting**: Best breed highlighted for each attribute

### 🗺️ Interactive Map
- **Geographic Distribution**: View breed origins on interactive India map
- **State-wise Information**: Click states to see native breeds
- **Leaflet Integration**: Smooth pan/zoom with detailed markers

### 📚 Breed Encyclopedia
- **24 Indigenous Breeds**: Comprehensive database of Indian cattle and buffalo breeds
- **Detailed Information**: Origin, characteristics, milk yield, uses, conservation status
- **Real Images**: Authentic breed photos from Wikimedia Commons
- **Filter & Sort**: Search, filter by type, sort by various attributes

### 🌐 Multi-language Support
- Hindi and English language options
- Text-to-speech functionality for accessibility

## 🏗️ Project Structure

```
breed-recognition/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── routers/
│   │   │   ├── predict.py     # Breed prediction endpoints
│   │   │   ├── breeds.py      # Breed information endpoints
│   │   │   └── compare.py     # Comparison endpoints
│   │   └── services/
│   │       ├── model_service.py    # ML model loading & inference
│   │       └── gradcam_service.py  # GradCAM visualization
│   ├── ml_models/             # Trained model weights
│   │   ├── animal_classifier.pth
│   │   ├── cattle_buffalo_classifier.pth
│   │   └── classes.json
│   └── requirements.txt
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── pages/
│   │   │   ├── HomePage.jsx   # Landing page
│   │   │   ├── IdentifyPage.jsx    # Breed identification
│   │   │   ├── ExplorePage.jsx     # Breed encyclopedia
│   │   │   ├── ComparePage.jsx     # Breed comparison
│   │   │   ├── MapPage.jsx         # Geographic map
│   │   │   └── SchemesPage.jsx     # Government schemes
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── CompareFloatingBar.jsx
│   │   ├── context/
│   │   │   └── CompareContext.jsx  # Global comparison state
│   │   ├── data/
│   │   │   └── breedData.js   # Breed database
│   │   └── services/
│   │       └── api.js         # API client
│   ├── package.json
│   └── vite.config.js
│
├── ml/                         # Machine Learning Training
│   ├── train_stage1.py        # Cattle vs Buffalo classifier
│   ├── train_stage2.py        # Breed classifier
│   ├── evaluate.py            # Model evaluation
│   └── dataset/               # Training images
│
├── data/
│   └── breed_info.json        # Breed metadata
│
└── models/
    └── classes.json           # Class labels
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Classify breed from uploaded image |
| `/api/predict/gradcam` | POST | Get GradCAM visualization |
| `/api/breeds` | GET | List all breeds with details |
| `/api/breeds/{id}` | GET | Get specific breed information |
| `/api/compare` | POST | Compare multiple breeds |
| `/health` | GET | Health check endpoint |

## 🐄 Supported Breeds

### Cattle Breeds (15)
| Breed | Origin | Type | Conservation |
|-------|--------|------|--------------|
| Gir | Gujarat | Dairy | Vulnerable |
| Sahiwal | Punjab | Dairy | Stable |
| Red Sindhi | Sindh | Dairy | Vulnerable |
| Tharparkar | Rajasthan | Dual | Endangered |
| Kankrej | Gujarat | Dual | Vulnerable |
| Ongole | Andhra Pradesh | Draft | Stable |
| Hariana | Haryana | Dual | Stable |
| Rathi | Rajasthan | Dairy | Endangered |
| Deoni | Maharashtra | Dual | Critical |
| Khillari | Maharashtra | Draft | Vulnerable |
| Kangayam | Tamil Nadu | Draft | Endangered |
| Hallikar | Karnataka | Draft | Vulnerable |
| Amritmahal | Karnataka | Draft | Critical |
| Punganur | Andhra Pradesh | Dairy | Critical |
| Vechur | Kerala | Dairy | Critical |

### Buffalo Breeds (9)
| Breed | Origin | Type | Conservation |
|-------|--------|------|--------------|
| Murrah | Haryana | Dairy | Stable |
| Mehsana | Gujarat | Dairy | Stable |
| Jaffarabadi | Gujarat | Dairy | Vulnerable |
| Surti | Gujarat | Dairy | Endangered |
| Bhadawari | Uttar Pradesh | Dairy | Endangered |
| Nili-Ravi | Punjab | Dairy | Stable |
| Nagpuri | Maharashtra | Dual | Vulnerable |
| Pandharpuri | Maharashtra | Dairy | Critical |
| Toda | Tamil Nadu | Dairy | Critical |

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PyTorch** - Deep learning framework
- **OpenCV** - Image processing
- **Grad-CAM** - Model interpretability
- **Uvicorn** - ASGI server
- **Pillow** - Image handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps
- **i18next** - Internationalization
- **html2canvas** - Export functionality

### Machine Learning
- **EfficientNet-B0** - Base architecture
- **Transfer Learning** - Pre-trained weights
- **Two-stage Classification** - Hierarchical approach

## 📊 Model Performance

| Model | Accuracy | F1 Score |
|-------|----------|----------|
| Cattle vs Buffalo | 98.5% | 0.985 |
| Breed Classifier | 92.3% | 0.918 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NBAGR** - National Bureau of Animal Genetic Resources for breed information
- **Wikimedia Commons** - Breed images under Creative Commons
- **ICAR** - Indian Council of Agricultural Research for research data

---

Made with ❤️ for preserving India's indigenous cattle heritage
