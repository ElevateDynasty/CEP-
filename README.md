# 🐄 Indian Cattle & Buffalo Breed Recognition System

An AI-powered full-stack application for identifying cattle and buffalo breeds native to India from images. Features explainable AI (Grad-CAM), regional breed mapping, sustainability scoring, and farmer advisory system.

## 🌟 Features

- **Image-Based Breed Recognition** - Upload cattle/buffalo images for instant breed identification
- **Two-Stage Classification** - Cattle vs Buffalo detection → Breed classification
- **Explainable AI (Grad-CAM)** - Visual heatmaps showing what the model focuses on
- **Interactive India Map** - Explore breeds by their native states
- **Sustainability Score** - Carbon footprint and milk yield efficiency metrics
- **Breed Comparison** - Side-by-side comparison of different breeds
- **Farmer Advisory** - Government schemes and best practices for each breed
- **Hindi Voice Output** - Text-to-speech in Hindi for rural accessibility
- **PWA/Offline Mode** - Works without internet after first load
- **Bilingual Support** - English and Hindi interface

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                        │
│  React + Tailwind CSS + react-simple-maps                   │
│  Web Speech API + PWA + TensorFlow.js (offline)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Hugging Face Spaces)                  │
│  FastAPI + PyTorch + Grad-CAM                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (Supabase)                        │
│  PostgreSQL + Storage + Auth                                │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
breed-recognition/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── data/           # Static data files
│   └── public/             # Static assets
│
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── routers/        # API routes
│   │   ├── services/       # Business logic
│   │   └── models/         # Pydantic models
│   └── ml_models/          # Trained model files
│
├── ml/                     # ML training pipeline
│   ├── train_stage1.py     # Cattle vs Buffalo classifier
│   ├── train_stage2.py     # Breed classifier
│   ├── inference.py        # Inference utilities
│   └── gradcam.py          # Grad-CAM implementation
│
└── data/                   # Breed metadata and configs
    └── breed_info.json     # Breed information database
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### ML Model Training
```bash
cd ml
# Download dataset from Kaggle first
python train_stage1.py
python train_stage2.py
```

## 📊 Dataset

Using [Indian Cattle Image Dataset](https://www.kaggle.com/datasets/atharvadarpude/indian-cattle-image-dataset) from Kaggle:
- 50 government-recognized breeds
- 12,000-15,000 images
- CC0 Public Domain license

## 🐄 Supported Breeds

### Cattle Breeds
Gir, Sahiwal, Red Sindhi, Tharparkar, Kankrej, Ongole, Hariana, Rathi, Deoni, Khillari, Kangayam, Hallikar, Amritmahal, Punganur, Vechur, and more...

### Buffalo Breeds
Murrah, Mehsana, Jaffarabadi, Surti, Bhadawari, Nili-Ravi, Nagpuri, Pandharpuri, Toda, and more...

## 🏛️ Linked Government Schemes

- Rashtriya Gokul Mission
- Pashu Kisan Credit Card
- National Livestock Mission
- e-Gopala App
- DIDF (Dairy Processing & Infrastructure Development Fund)

## 🌐 Deployment

- **Frontend**: Vercel (https://your-app.vercel.app)
- **Backend**: Hugging Face Spaces
- **Database**: Supabase

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
