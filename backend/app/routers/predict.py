"""
Prediction API Router
Handles image upload and breed prediction
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import base64
import io
from PIL import Image

from app.services.model_service import ModelService
from app.services.gradcam_service import GradCAMService
from app.config import settings

router = APIRouter()

class PredictionResponse(BaseModel):
    """Response model for predictions"""
    success: bool
    animal_type: str
    animal_type_confidence: float
    breed: str
    breed_confidence: float
    breed_hindi: Optional[str] = None
    top_predictions: list
    gradcam_image: Optional[str] = None  # Base64 encoded
    breed_info: Optional[dict] = None

class PredictionRequest(BaseModel):
    """Request model for base64 image prediction"""
    image: str  # Base64 encoded image
    include_gradcam: bool = False
    include_breed_info: bool = True

def validate_image(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check file extension
    ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )

@router.post("/predict", response_model=PredictionResponse)
async def predict_breed(
    request: Request,
    file: UploadFile = File(...),
    include_gradcam: bool = Form(default=False),
    include_breed_info: bool = Form(default=True)
):
    """
    Predict cattle/buffalo breed from uploaded image
    
    - **file**: Image file (JPG, PNG, WebP)
    - **include_gradcam**: Include Grad-CAM heatmap visualization
    - **include_breed_info**: Include detailed breed information
    """
    # Validate image
    validate_image(file)
    
    # Read image bytes
    contents = await file.read()
    
    # Check file size
    if len(contents) > settings.MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_IMAGE_SIZE // (1024*1024)}MB"
        )
    
    try:
        # Open image with PIL
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )
    
    # Get model service
    model_service: ModelService = request.app.state.model_service
    
    # Perform prediction
    try:
        result = model_service.predict(image)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
    
    # Generate Grad-CAM if requested
    gradcam_image = None
    if include_gradcam:
        try:
            gradcam_service = GradCAMService(model_service)
            gradcam_image = gradcam_service.generate_heatmap(image, result["breed"])
        except Exception as e:
            print(f"Grad-CAM generation failed: {e}")
            gradcam_image = None
    
    # Get breed info if requested
    breed_info = None
    if include_breed_info and hasattr(request.app.state, 'breed_data'):
        breed_data = request.app.state.breed_data
        animal_type = result["animal_type"]
        breed_key = result["breed"]
        
        if animal_type in breed_data and breed_key in breed_data[animal_type]:
            breed_info = breed_data[animal_type][breed_key]
    
    # Get Hindi name
    breed_hindi = None
    if breed_info and "nameHindi" in breed_info:
        breed_hindi = breed_info["nameHindi"]
    
    return PredictionResponse(
        success=True,
        animal_type=result["animal_type"],
        animal_type_confidence=result["animal_type_confidence"],
        breed=result["breed"],
        breed_confidence=result["breed_confidence"],
        breed_hindi=breed_hindi,
        top_predictions=result["top_predictions"],
        gradcam_image=gradcam_image,
        breed_info=breed_info
    )

@router.post("/predict/base64", response_model=PredictionResponse)
async def predict_breed_base64(
    request: Request,
    prediction_request: PredictionRequest
):
    """
    Predict breed from base64 encoded image
    
    Useful for web applications that capture images from canvas or webcam
    """
    try:
        # Decode base64 image
        image_data = prediction_request.image
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid base64 image"
        )
    
    # Get model service
    model_service: ModelService = request.app.state.model_service
    
    # Perform prediction
    try:
        result = model_service.predict(image)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
    
    # Generate Grad-CAM if requested
    gradcam_image = None
    if prediction_request.include_gradcam:
        try:
            gradcam_service = GradCAMService(model_service)
            gradcam_image = gradcam_service.generate_heatmap(image, result["breed"])
        except Exception as e:
            print(f"Grad-CAM generation failed: {e}")
    
    # Get breed info if requested
    breed_info = None
    if prediction_request.include_breed_info and hasattr(request.app.state, 'breed_data'):
        breed_data = request.app.state.breed_data
        animal_type = result["animal_type"]
        breed_key = result["breed"]
        
        if animal_type in breed_data and breed_key in breed_data[animal_type]:
            breed_info = breed_data[animal_type][breed_key]
    
    # Get Hindi name
    breed_hindi = None
    if breed_info and "nameHindi" in breed_info:
        breed_hindi = breed_info["nameHindi"]
    
    return PredictionResponse(
        success=True,
        animal_type=result["animal_type"],
        animal_type_confidence=result["animal_type_confidence"],
        breed=result["breed"],
        breed_confidence=result["breed_confidence"],
        breed_hindi=breed_hindi,
        top_predictions=result["top_predictions"],
        gradcam_image=gradcam_image,
        breed_info=breed_info
    )
