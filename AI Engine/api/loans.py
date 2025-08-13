from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from datetime import datetime
import uuid

from app.models.schemas import LoanApplicationCreate, LoanApplication, APIResponse
from app.database.connection import get_supabase_client
from app.services.lender_matching_service import LenderMatchingService
from app.services.trust_score_service import TrustScoreService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/loans/apply", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_loan(application_data: LoanApplicationCreate):
    """Apply for a loan"""
    try:
        supabase = get_supabase_client()
        
        # Verify user exists
        user_response = supabase.table("users") \
            .select("id") \
            .eq("id", application_data.user_id) \
            .execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's trust score
        trust_service = TrustScoreService()
        trust_score_data = await trust_service.get_trust_score(application_data.user_id)
        
        if not trust_score_data:
            # Calculate trust score if not available
            trust_score_data = await trust_service.calculate_trust_score(application_data.user_id)
        
        trust_score = trust_score_data.get('trust_score', 0)
        
        # Find matching lenders
        lender_service = LenderMatchingService()
        matches = await lender_service.find_matching_lenders(
            application_data.user_id,
            application_data.amount,
            application_data.loan_type,
            application_data.term_months
        )
        
        # Create loan application
        application_dict = application_data.dict()
        application_dict["id"] = str(uuid.uuid4())
        application_dict["status"] = "pending"
        application_dict["trust_score"] = trust_score
        application_dict["matched_lenders"] = [match.lender_id for match in matches[:5]]  # Top 5 matches
        application_dict["created_at"] = datetime.now().isoformat()
        application_dict["updated_at"] = datetime.now().isoformat()
        
        # Insert application
        response = supabase.table("loan_applications") \
            .insert(application_dict) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create loan application"
            )
        
        created_application = LoanApplication(**response.data[0])
        
        return APIResponse(
            success=True,
            message="Loan application submitted successfully",
            data={
                "application": created_application,
                "trust_score": trust_score,
                "matching_lenders": len(matches),
                "top_matches": [match.dict() for match in matches[:3]]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error applying for loan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/loans/{application_id}", response_model=APIResponse)
async def get_loan_application(application_id: str):
    """Get loan application by ID"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("loan_applications") \
            .select("*") \
            .eq("id", application_id) \
            .single() \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        application = LoanApplication(**response.data)
        
        return APIResponse(
            success=True,
            message="Loan application retrieved successfully",
            data=application
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting loan application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/loans/user/{user_id}", response_model=APIResponse)
async def get_user_loan_applications(user_id: str, limit: int = 10, offset: int = 0):
    """Get all loan applications for a user"""
    try:
        supabase = get_supabase_client()
        
        # Verify user exists
        user_response = supabase.table("users") \
            .select("id") \
            .eq("id", user_id) \
            .execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        response = supabase.table("loan_applications") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()
        
        applications = [LoanApplication(**app_data) for app_data in response.data]
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(applications)} loan applications",
            data={
                "applications": applications,
                "total": len(applications),
                "limit": limit,
                "offset": offset
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting loan applications for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/loans/{application_id}/status", response_model=APIResponse)
async def update_loan_status(application_id: str, status: str):
    """Update loan application status"""
    try:
        supabase = get_supabase_client()
        
        # Check if application exists
        existing_app = supabase.table("loan_applications") \
            .select("id") \
            .eq("id", application_id) \
            .execute()
        
        if not existing_app.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        # Update status
        response = supabase.table("loan_applications") \
            .update({
                "status": status,
                "updated_at": datetime.now().isoformat()
            }) \
            .eq("id", application_id) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update loan application"
            )
        
        updated_application = LoanApplication(**response.data[0])
        
        return APIResponse(
            success=True,
            message=f"Loan application status updated to {status}",
            data=updated_application
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating loan application status {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/loans/", response_model=APIResponse)
async def list_loan_applications(limit: int = 10, offset: int = 0, status: Optional[str] = None):
    """List all loan applications with optional filtering"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table("loan_applications") \
            .select("*") \
            .range(offset, offset + limit - 1) \
            .order("created_at", desc=True)
        
        if status:
            query = query.eq("status", status)
        
        response = query.execute()
        
        applications = [LoanApplication(**app_data) for app_data in response.data]
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(applications)} loan applications",
            data={
                "applications": applications,
                "total": len(applications),
                "limit": limit,
                "offset": offset,
                "status_filter": status
            }
        )
        
    except Exception as e:
        logger.error(f"Error listing loan applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/loans/{application_id}", response_model=APIResponse)
async def delete_loan_application(application_id: str):
    """Delete loan application"""
    try:
        supabase = get_supabase_client()
        
        # Check if application exists
        existing_app = supabase.table("loan_applications") \
            .select("id") \
            .eq("id", application_id) \
            .execute()
        
        if not existing_app.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        # Delete application
        response = supabase.table("loan_applications") \
            .delete() \
            .eq("id", application_id) \
            .execute()
        
        return APIResponse(
            success=True,
            message="Loan application deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting loan application {application_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/loans/analytics/summary", response_model=APIResponse)
async def get_loan_analytics_summary():
    """Get loan application analytics summary"""
    try:
        supabase = get_supabase_client()
        
        # Get total applications
        total_response = supabase.table("loan_applications") \
            .select("count", count="exact") \
            .execute()
        
        total_applications = total_response.count or 0
        
        # Get applications by status
        status_response = supabase.table("loan_applications") \
            .select("status") \
            .execute()
        
        status_counts = {}
        for app in status_response.data:
            status = app.get('status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Get average trust score
        trust_scores = [app.get('trust_score', 0) for app in status_response.data if app.get('trust_score')]
        avg_trust_score = sum(trust_scores) / len(trust_scores) if trust_scores else 0
        
        analytics = {
            "total_applications": total_applications,
            "applications_by_status": status_counts,
            "average_trust_score": round(avg_trust_score, 2),
            "generated_at": datetime.now().isoformat()
        }
        
        return APIResponse(
            success=True,
            message="Loan analytics summary retrieved successfully",
            data=analytics
        )
        
    except Exception as e:
        logger.error(f"Error getting loan analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
