from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from datetime import datetime

from app.models.schemas import TrustScoreRequest, APIResponse
from app.services.trust_score_service import TrustScoreService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/trust-score/calculate", response_model=APIResponse)
async def calculate_trust_score(request: TrustScoreRequest):
    """Calculate trust score for a user"""
    try:
        trust_service = TrustScoreService()
        
        result = await trust_service.calculate_trust_score(
            request.user_id,
            include_payment_history=request.include_payment_history
        )
        
        return APIResponse(
            success=True,
            message="Trust score calculated successfully",
            data=result
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error calculating trust score: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/trust-score/{user_id}", response_model=APIResponse)
async def get_trust_score(user_id: str):
    """Get the latest trust score for a user"""
    try:
        trust_service = TrustScoreService()
        
        trust_score = await trust_service.get_trust_score(user_id)
        
        if not trust_score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No trust score found for this user"
            )
        
        return APIResponse(
            success=True,
            message="Trust score retrieved successfully",
            data=trust_score
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trust score for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/trust-score/{user_id}/history", response_model=APIResponse)
async def get_trust_score_history(user_id: str, limit: int = 10):
    """Get trust score history for a user"""
    try:
        trust_service = TrustScoreService()
        
        history = await trust_service.get_trust_score_history(user_id, limit)
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(history)} trust score records",
            data={
                "history": history,
                "total_records": len(history),
                "user_id": user_id
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting trust score history for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/trust-score/{user_id}/analysis", response_model=APIResponse)
async def get_payment_behavior_analysis(user_id: str):
    """Get detailed payment behavior analysis for trust scoring"""
    try:
        trust_service = TrustScoreService()
        
        analysis = await trust_service.analyze_payment_behavior(user_id)
        
        return APIResponse(
            success=True,
            message="Payment behavior analysis retrieved successfully",
            data=analysis
        )
        
    except Exception as e:
        logger.error(f"Error getting payment analysis for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/trust-score/model/performance", response_model=APIResponse)
async def get_model_performance():
    """Get ML model performance metrics"""
    try:
        trust_service = TrustScoreService()
        
        performance = await trust_service.get_model_performance()
        
        return APIResponse(
            success=True,
            message="Model performance metrics retrieved successfully",
            data=performance
        )
        
    except Exception as e:
        logger.error(f"Error getting model performance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/trust-score/model/retrain", response_model=APIResponse)
async def retrain_model(training_data: List[dict]):
    """Retrain the trust score model with new data"""
    try:
        trust_service = TrustScoreService()
        
        results = await trust_service.retrain_model(training_data)
        
        return APIResponse(
            success=True,
            message="Model retraining completed successfully",
            data=results
        )
        
    except Exception as e:
        logger.error(f"Error retraining model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
