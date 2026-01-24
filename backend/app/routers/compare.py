"""
Comparison API Router
Handles breed comparison functionality
"""

from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class ComparisonResult(BaseModel):
    """Comparison result model"""
    breeds: List[Dict[str, Any]]
    comparison_metrics: Dict[str, Any]
    recommendation: Optional[str] = None

@router.get("/compare")
async def compare_breeds(
    request: Request,
    breed1: str = Query(..., description="First breed ID"),
    breed2: str = Query(..., description="Second breed ID")
):
    """
    Compare two breeds side by side
    
    Returns detailed comparison including:
    - Productivity metrics
    - Sustainability scores
    - Economic factors
    - Climate adaptability
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_data = request.app.state.breed_data
    
    # Find both breeds
    def find_breed(breed_id: str):
        for animal_type in ["cattle", "buffalo"]:
            if animal_type in breed_data and breed_id in breed_data[animal_type]:
                return {
                    "id": breed_id,
                    "animal_type": animal_type,
                    "data": breed_data[animal_type][breed_id]
                }
        return None
    
    breed1_data = find_breed(breed1)
    breed2_data = find_breed(breed2)
    
    if not breed1_data:
        raise HTTPException(status_code=404, detail=f"Breed '{breed1}' not found")
    if not breed2_data:
        raise HTTPException(status_code=404, detail=f"Breed '{breed2}' not found")
    
    # Extract comparison data
    def extract_metrics(breed_info: dict) -> dict:
        data = breed_info["data"]
        return {
            "id": breed_info["id"],
            "name": data.get("name", ""),
            "name_hindi": data.get("nameHindi", ""),
            "type": breed_info["animal_type"],
            "native_states": data.get("nativeState", []),
            "productivity": {
                "milk_yield_per_day": data.get("productivity", {}).get("milkYieldPerDay", "N/A"),
                "lactation_yield": data.get("productivity", {}).get("lactationYield", "N/A"),
                "fat_content": data.get("productivity", {}).get("fatContent", "N/A"),
                "lactation_period": data.get("productivity", {}).get("lactationPeriod", "N/A")
            },
            "sustainability": {
                "carbon_score": data.get("sustainability", {}).get("carbonScore", 0),
                "carbon_footprint": data.get("sustainability", {}).get("carbonFootprint", "Unknown"),
                "heat_tolerance": data.get("sustainability", {}).get("heatTolerance", "Unknown"),
                "disease_resistance": data.get("sustainability", {}).get("diseaseResistance", "Unknown"),
                "feed_efficiency": data.get("sustainability", {}).get("feedEfficiency", "Unknown"),
                "climate_adaptability": data.get("sustainability", {}).get("climateAdaptability", "Unknown")
            },
            "economic": {
                "purchase_cost": data.get("economicValue", {}).get("purchaseCost", "N/A"),
                "maintenance_cost": data.get("economicValue", {}).get("maintenanceCost", "N/A"),
                "market_demand": data.get("economicValue", {}).get("marketDemand", "Unknown")
            },
            "population": {
                "status": data.get("population", {}).get("status", "Unknown"),
                "trend": data.get("population", {}).get("trend", "unknown"),
                "conservation_status": data.get("population", {}).get("conservationStatus", "Unknown")
            },
            "best_for": data.get("bestFor", []),
            "government_schemes": data.get("governmentSchemes", [])
        }
    
    breed1_metrics = extract_metrics(breed1_data)
    breed2_metrics = extract_metrics(breed2_data)
    
    # Calculate comparison insights
    comparison_metrics = {
        "carbon_score_difference": breed1_metrics["sustainability"]["carbon_score"] - breed2_metrics["sustainability"]["carbon_score"],
        "better_carbon_score": breed1 if breed1_metrics["sustainability"]["carbon_score"] > breed2_metrics["sustainability"]["carbon_score"] else breed2,
        "same_animal_type": breed1_data["animal_type"] == breed2_data["animal_type"]
    }
    
    # Generate recommendation
    recommendation = None
    if breed1_metrics["sustainability"]["carbon_score"] > breed2_metrics["sustainability"]["carbon_score"]:
        recommendation = f"{breed1_metrics['name']} has better sustainability score ({breed1_metrics['sustainability']['carbon_score']} vs {breed2_metrics['sustainability']['carbon_score']})"
    else:
        recommendation = f"{breed2_metrics['name']} has better sustainability score ({breed2_metrics['sustainability']['carbon_score']} vs {breed1_metrics['sustainability']['carbon_score']})"
    
    return {
        "breeds": [breed1_metrics, breed2_metrics],
        "comparison_metrics": comparison_metrics,
        "recommendation": recommendation
    }

@router.get("/compare/multi")
async def compare_multiple_breeds(
    request: Request,
    breeds: str = Query(..., description="Comma-separated breed IDs (max 4)")
):
    """
    Compare multiple breeds (up to 4)
    
    - **breeds**: Comma-separated breed IDs (e.g., 'gir,sahiwal,murrah')
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_ids = [b.strip() for b in breeds.split(",")]
    
    if len(breed_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 breeds required for comparison")
    if len(breed_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 breeds allowed for comparison")
    
    breed_data = request.app.state.breed_data
    
    def find_breed(breed_id: str):
        for animal_type in ["cattle", "buffalo"]:
            if animal_type in breed_data and breed_id in breed_data[animal_type]:
                return {
                    "id": breed_id,
                    "animal_type": animal_type,
                    "data": breed_data[animal_type][breed_id]
                }
        return None
    
    results = []
    for breed_id in breed_ids:
        breed_info = find_breed(breed_id)
        if not breed_info:
            raise HTTPException(status_code=404, detail=f"Breed '{breed_id}' not found")
        
        data = breed_info["data"]
        results.append({
            "id": breed_id,
            "name": data.get("name", ""),
            "type": breed_info["animal_type"],
            "milk_yield": data.get("productivity", {}).get("milkYieldPerDay", "N/A"),
            "carbon_score": data.get("sustainability", {}).get("carbonScore", 0),
            "purchase_cost": data.get("economicValue", {}).get("purchaseCost", "N/A"),
            "conservation_status": data.get("population", {}).get("conservationStatus", "Unknown"),
            "heat_tolerance": data.get("sustainability", {}).get("heatTolerance", "Unknown")
        })
    
    # Find best in each category
    best_carbon = max(results, key=lambda x: x["carbon_score"])
    
    return {
        "breeds": results,
        "insights": {
            "best_sustainability": best_carbon["name"],
            "total_compared": len(results)
        }
    }

@router.get("/sustainability-ranking")
async def get_sustainability_ranking(
    request: Request,
    animal_type: Optional[str] = Query(None, description="Filter by animal type"),
    limit: int = Query(10, description="Number of results")
):
    """
    Get breeds ranked by sustainability score
    
    - **animal_type**: Filter by 'cattle' or 'buffalo'
    - **limit**: Number of results to return
    """
    if not hasattr(request.app.state, 'breed_data'):
        raise HTTPException(status_code=500, detail="Breed data not loaded")
    
    breed_data = request.app.state.breed_data
    results = []
    
    animal_types = [animal_type.lower()] if animal_type else ["cattle", "buffalo"]
    
    for atype in animal_types:
        if atype not in breed_data:
            continue
            
        for breed_id, breed_info in breed_data[atype].items():
            carbon_score = breed_info.get("sustainability", {}).get("carbonScore", 0)
            results.append({
                "id": breed_id,
                "name": breed_info.get("name", breed_id),
                "type": atype,
                "carbon_score": carbon_score,
                "carbon_footprint": breed_info.get("sustainability", {}).get("carbonFootprint", "Unknown"),
                "feed_efficiency": breed_info.get("sustainability", {}).get("feedEfficiency", "Unknown")
            })
    
    # Sort by carbon score (higher is better)
    results.sort(key=lambda x: x["carbon_score"], reverse=True)
    
    return {
        "ranking": results[:limit],
        "total": len(results)
    }
