"""
Breeds API Router
Handles breed information and metadata
"""

from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter()

class BreedSummary(BaseModel):
    """Summary model for breed listing"""
    id: str
    name: str
    name_hindi: str
    type: str
    native_states: List[str]
    milk_yield: str
    conservation_status: str

class BreedDetail(BaseModel):
    """Full breed details"""
    id: str
    data: Dict[str, Any]

@router.get("/breeds")
async def list_breeds(
    request: Request,
    animal_type: Optional[str] = Query(None, description="Filter by animal type: cattle or buffalo"),
    state: Optional[str] = Query(None, description="Filter by native state"),
    conservation_status: Optional[str] = Query(None, description="Filter by conservation status")
):
    """
    List all breeds with optional filtering
    
    - **animal_type**: Filter by 'cattle' or 'buffalo'
    - **state**: Filter by native state name
    - **conservation_status**: Filter by status (e.g., 'Endangered', 'Vulnerable')
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_data = request.app.state.breed_data
    results = []
    
    # Determine which animal types to include
    animal_types = []
    if animal_type:
        if animal_type.lower() not in ["cattle", "buffalo"]:
            raise HTTPException(status_code=400, detail="animal_type must be 'cattle' or 'buffalo'")
        animal_types = [animal_type.lower()]
    else:
        animal_types = ["cattle", "buffalo"]
    
    # Iterate through breeds
    for atype in animal_types:
        if atype not in breed_data:
            continue
            
        for breed_id, breed_info in breed_data[atype].items():
            # Apply filters
            if state:
                native_states = breed_info.get("nativeState", [])
                if state not in native_states:
                    continue
            
            if conservation_status:
                breed_status = breed_info.get("population", {}).get("conservationStatus", "")
                if conservation_status.lower() not in breed_status.lower():
                    continue
            
            results.append({
                "id": breed_id,
                "name": breed_info.get("name", breed_id),
                "name_hindi": breed_info.get("nameHindi", ""),
                "type": atype,
                "native_states": breed_info.get("nativeState", []),
                "milk_yield": breed_info.get("productivity", {}).get("milkYieldPerDay", "N/A"),
                "conservation_status": breed_info.get("population", {}).get("conservationStatus", "Unknown"),
                "carbon_score": breed_info.get("sustainability", {}).get("carbonScore", 0),
                "image": breed_info.get("image", "")
            })
    
    return {
        "total": len(results),
        "breeds": results
    }

@router.get("/breeds/{breed_id}")
async def get_breed(
    request: Request,
    breed_id: str
):
    """
    Get detailed information about a specific breed
    
    - **breed_id**: Breed identifier (e.g., 'gir', 'murrah')
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_data = request.app.state.breed_data
    
    # Search in both cattle and buffalo
    for animal_type in ["cattle", "buffalo"]:
        if animal_type in breed_data and breed_id in breed_data[animal_type]:
            return {
                "id": breed_id,
                "animal_type": animal_type,
                "data": breed_data[animal_type][breed_id]
            }
    
    raise HTTPException(status_code=404, detail=f"Breed '{breed_id}' not found")

@router.get("/breeds/state/{state_name}")
async def get_breeds_by_state(
    request: Request,
    state_name: str
):
    """
    Get all breeds native to a specific state
    
    - **state_name**: Indian state name (e.g., 'Gujarat', 'Punjab')
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_data = request.app.state.breed_data
    
    # Check state mapping
    state_mapping = breed_data.get("stateBreedMapping", {})
    
    # Find exact or partial match
    matching_state = None
    for state in state_mapping.keys():
        if state.lower() == state_name.lower():
            matching_state = state
            break
    
    if not matching_state:
        # Try partial match
        for state in state_mapping.keys():
            if state_name.lower() in state.lower():
                matching_state = state
                break
    
    if not matching_state:
        raise HTTPException(
            status_code=404,
            detail=f"State '{state_name}' not found. Available states: {list(state_mapping.keys())}"
        )
    
    breed_ids = state_mapping.get(matching_state, [])
    results = []
    
    for breed_id in breed_ids:
        for animal_type in ["cattle", "buffalo"]:
            if animal_type in breed_data and breed_id in breed_data[animal_type]:
                breed_info = breed_data[animal_type][breed_id]
                results.append({
                    "id": breed_id,
                    "name": breed_info.get("name", breed_id),
                    "name_hindi": breed_info.get("nameHindi", ""),
                    "type": animal_type,
                    "milk_yield": breed_info.get("productivity", {}).get("milkYieldPerDay", "N/A"),
                    "conservation_status": breed_info.get("population", {}).get("conservationStatus", "Unknown")
                })
                break
    
    return {
        "state": matching_state,
        "total": len(results),
        "breeds": results
    }

@router.get("/states")
async def list_states(request: Request):
    """
    Get all Indian states with their native breeds
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_data = request.app.state.breed_data
    state_mapping = breed_data.get("stateBreedMapping", {})
    
    results = []
    for state, breed_ids in state_mapping.items():
        results.append({
            "state": state,
            "breed_count": len(breed_ids),
            "breed_ids": breed_ids
        })
    
    return {
        "total": len(results),
        "states": sorted(results, key=lambda x: x["state"])
    }

@router.get("/government-schemes")
async def list_government_schemes(request: Request):
    """
    Get all government schemes for cattle and buffalo farmers
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_data = request.app.state.breed_data
    schemes = breed_data.get("governmentSchemes", {})
    
    results = []
    for scheme_id, scheme_info in schemes.items():
        results.append({
            "id": scheme_id,
            "name": scheme_info.get("name", ""),
            "name_hindi": scheme_info.get("nameHindi", ""),
            "description": scheme_info.get("description", ""),
            "benefits": scheme_info.get("benefits", []),
            "eligibility": scheme_info.get("eligibility", ""),
            "website": scheme_info.get("website", "")
        })
    
    return {
        "total": len(results),
        "schemes": results
    }
