"""
Indian Cattle & Buffalo Breed Recognition API
FastAPI backend with ML inference, Grad-CAM, and breed metadata
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from pathlib import Path

from app.routers import predict, breeds, compare
from app.services.model_service import ModelService
from app.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="Indian Cattle & Buffalo Breed Recognition API",
    description="""
    AI-powered breed identification system for Indian cattle and buffaloes.
    
    ## Features
    - Image-based breed recognition
    - Two-stage classification (Animal Type → Breed)
    - Grad-CAM explainability
    - Comprehensive breed metadata
    - Sustainability scoring
    - Government scheme information
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api/v1", tags=["Prediction"])
app.include_router(breeds.router, prefix="/api/v1", tags=["Breeds"])
app.include_router(compare.router, prefix="/api/v1", tags=["Comparison"])

# Load breed data
DATA_PATH = Path(__file__).parent.parent.parent / "data" / "breed_info.json"

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting Indian Breed Recognition API...")
    
    # Load breed metadata
    if DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            app.state.breed_data = json.load(f)
        print("✅ Breed metadata loaded")
    else:
        print("⚠️ Breed metadata file not found")
        app.state.breed_data = {}
    
    # Initialize ML model service (lazy loading)
    app.state.model_service = ModelService()
    print("✅ Model service initialized")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 Shutting down API...")

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "healthy",
        "message": "Indian Cattle & Buffalo Breed Recognition API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "predict": "/api/v1/predict",
            "breeds": "/api/v1/breeds",
            "compare": "/api/v1/compare"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": hasattr(app.state, 'model_service') and app.state.model_service.is_loaded,
        "breed_data_loaded": hasattr(app.state, 'breed_data') and bool(app.state.breed_data)
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Internal server error",
            "detail": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
