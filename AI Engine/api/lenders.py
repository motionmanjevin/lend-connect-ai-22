from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from datetime import datetime
import uuid

from app.models.schemas import LenderCreate, Lender, LenderMatchRequest, APIResponse
from app.database.connection import get_supabase_client
from app.services.lender_matching_service import LenderMatchingService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/lenders/", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_lender(lender_data: LenderCreate):
    """Create a new lender"""
    try:
        supabase = get_supabase_client()
        
        # Create lender data
        lender_dict = lender_data.dict()
        lender_dict["id"] = str(uuid.uuid4())
        lender_dict["created_at"] = datetime.now().isoformat()
        lender_dict["updated_at"] = datetime.now().isoformat()
        
        # Insert lender
        response = supabase.table("lenders") \
            .insert(lender_dict) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create lender"
            )
        
        created_lender = Lender(**response.data[0])
        
        return APIResponse(
            success=True,
            message="Lender created successfully",
            data=created_lender
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating lender: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/lenders/{lender_id}", response_model=APIResponse)
async def get_lender(lender_id: str):
    """Get lender by ID"""
    try:
        lender_service = LenderMatchingService()
        
        lender = await lender_service.get_lender_details(lender_id)
        
        if not lender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lender not found"
            )
        
        return APIResponse(
            success=True,
            message="Lender retrieved successfully",
            data=lender
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting lender {lender_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/lenders/", response_model=APIResponse)
async def list_lenders(limit: int = 10, offset: int = 0):
    """List all lenders with pagination"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("lenders") \
            .select("*") \
            .range(offset, offset + limit - 1) \
            .order("created_at", desc=True) \
            .execute()
        
        lenders = [Lender(**lender_data) for lender_data in response.data]
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(lenders)} lenders",
            data={
                "lenders": lenders,
                "total": len(lenders),
                "limit": limit,
                "offset": offset
            }
        )
        
    except Exception as e:
        logger.error(f"Error listing lenders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/lenders/{lender_id}/performance", response_model=APIResponse)
async def get_lender_performance(lender_id: str):
    """Get performance metrics for a lender"""
    try:
        lender_service = LenderMatchingService()
        
        performance = await lender_service.get_lender_performance(lender_id)
        
        return APIResponse(
            success=True,
            message="Lender performance metrics retrieved successfully",
            data=performance
        )
        
    except Exception as e:
        logger.error(f"Error getting lender performance for {lender_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/lenders/match", response_model=APIResponse)
async def find_matching_lenders(request: LenderMatchRequest):
    """Find matching lenders for a user's loan request"""
    try:
        lender_service = LenderMatchingService()
        
        matches = await lender_service.find_matching_lenders(
            request.user_id,
            request.loan_amount,
            request.loan_type,
            request.term_months
        )
        
        return APIResponse(
            success=True,
            message=f"Found {len(matches)} matching lenders",
            data={
                "matches": [match.dict() for match in matches],
                "total_matches": len(matches),
                "user_id": request.user_id,
                "loan_amount": request.loan_amount,
                "loan_type": request.loan_type,
                "term_months": request.term_months
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error finding matching lenders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/lenders/sample", response_model=APIResponse)
async def create_sample_lenders():
    """Create sample lenders for testing"""
    try:
        lender_service = LenderMatchingService()
        
        await lender_service.create_sample_lenders()
        
        return APIResponse(
            success=True,
            message="Sample lenders created successfully"
        )
        
    except Exception as e:
        logger.error(f"Error creating sample lenders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/lenders/{lender_id}", response_model=APIResponse)
async def update_lender(lender_id: str, lender_data: dict):
    """Update lender information"""
    try:
        supabase = get_supabase_client()
        
        # Check if lender exists
        existing_lender = supabase.table("lenders") \
            .select("id") \
            .eq("id", lender_id) \
            .execute()
        
        if not existing_lender.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lender not found"
            )
        
        # Prepare update data
        update_data = lender_data.copy()
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Update lender
        response = supabase.table("lenders") \
            .update(update_data) \
            .eq("id", lender_id) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update lender"
            )
        
        updated_lender = Lender(**response.data[0])
        
        return APIResponse(
            success=True,
            message="Lender updated successfully",
            data=updated_lender
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lender {lender_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/lenders/{lender_id}", response_model=APIResponse)
async def delete_lender(lender_id: str):
    """Delete lender"""
    try:
        supabase = get_supabase_client()
        
        # Check if lender exists
        existing_lender = supabase.table("lenders") \
            .select("id") \
            .eq("id", lender_id) \
            .execute()
        
        if not existing_lender.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lender not found"
            )
        
        # Delete lender
        response = supabase.table("lenders") \
            .delete() \
            .eq("id", lender_id) \
            .execute()
        
        return APIResponse(
            success=True,
            message="Lender deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting lender {lender_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
