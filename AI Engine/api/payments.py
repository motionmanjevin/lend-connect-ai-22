from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from datetime import datetime
import uuid

from app.models.schemas import PaymentCreate, Payment, APIResponse
from app.database.connection import get_supabase_client
from app.services.trust_score_service import TrustScoreService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/payments/", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(payment_data: PaymentCreate):
    """Record a new payment"""
    try:
        supabase = get_supabase_client()
        
        # Verify user exists
        user_response = supabase.table("users") \
            .select("id") \
            .eq("id", payment_data.user_id) \
            .execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create payment data
        payment_dict = payment_data.dict()
        payment_dict["id"] = str(uuid.uuid4())
        payment_dict["created_at"] = datetime.now().isoformat()
        payment_dict["updated_at"] = datetime.now().isoformat()
        
        # Insert payment
        response = supabase.table("payments") \
            .insert(payment_dict) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment"
            )
        
        created_payment = Payment(**response.data[0])
        
        # Recalculate trust score after new payment
        trust_service = TrustScoreService()
        await trust_service.calculate_trust_score(payment_data.user_id)
        
        return APIResponse(
            success=True,
            message="Payment recorded successfully",
            data=created_payment
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/payments/{payment_id}", response_model=APIResponse)
async def get_payment(payment_id: str):
    """Get payment by ID"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("payments") \
            .select("*") \
            .eq("id", payment_id) \
            .single() \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        payment = Payment(**response.data)
        
        return APIResponse(
            success=True,
            message="Payment retrieved successfully",
            data=payment
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payment {payment_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/payments/user/{user_id}", response_model=APIResponse)
async def get_user_payments(user_id: str, limit: int = 50, offset: int = 0):
    """Get all payments for a user"""
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
        
        response = supabase.table("payments") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()
        
        payments = [Payment(**payment_data) for payment_data in response.data]
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(payments)} payments for user",
            data={
                "payments": payments,
                "total": len(payments),
                "limit": limit,
                "offset": offset
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payments for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/payments/{payment_id}", response_model=APIResponse)
async def update_payment(payment_id: str, payment_data: dict):
    """Update payment information"""
    try:
        supabase = get_supabase_client()
        
        # Check if payment exists
        existing_payment = supabase.table("payments") \
            .select("id, user_id") \
            .eq("id", payment_id) \
            .execute()
        
        if not existing_payment.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # Prepare update data
        update_data = payment_data.copy()
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Update payment
        response = supabase.table("payments") \
            .update(update_data) \
            .eq("id", payment_id) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update payment"
            )
        
        updated_payment = Payment(**response.data[0])
        
        # Recalculate trust score if payment status changed
        if 'status' in update_data:
            user_id = existing_payment.data[0]['user_id']
            trust_service = TrustScoreService()
            await trust_service.calculate_trust_score(user_id)
        
        return APIResponse(
            success=True,
            message="Payment updated successfully",
            data=updated_payment
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating payment {payment_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/payments/{payment_id}", response_model=APIResponse)
async def delete_payment(payment_id: str):
    """Delete payment"""
    try:
        supabase = get_supabase_client()
        
        # Get payment details before deletion
        payment_response = supabase.table("payments") \
            .select("user_id") \
            .eq("id", payment_id) \
            .execute()
        
        if not payment_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        user_id = payment_response.data[0]['user_id']
        
        # Delete payment
        response = supabase.table("payments") \
            .delete() \
            .eq("id", payment_id) \
            .execute()
        
        # Recalculate trust score after payment deletion
        trust_service = TrustScoreService()
        await trust_service.calculate_trust_score(user_id)
        
        return APIResponse(
            success=True,
            message="Payment deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting payment {payment_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/payments/analysis/{user_id}", response_model=APIResponse)
async def get_payment_analysis(user_id: str):
    """Get detailed payment behavior analysis for a user"""
    try:
        trust_service = TrustScoreService()
        
        # Get payment behavior analysis
        analysis = await trust_service.analyze_payment_behavior(user_id)
        
        # Get payment history summary
        supabase = get_supabase_client()
        payments_response = supabase.table("payments") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        
        payments = payments_response.data
        
        # Calculate additional metrics
        if payments:
            # Payment trends over time
            monthly_payments = {}
            for payment in payments:
                month = payment['created_at'][:7]  # YYYY-MM
                if month not in monthly_payments:
                    monthly_payments[month] = {
                        'total': 0,
                        'count': 0,
                        'on_time': 0,
                        'late': 0,
                        'missed': 0
                    }
                
                monthly_payments[month]['total'] += payment['amount']
                monthly_payments[month]['count'] += 1
                
                if payment['status'] == 'on_time':
                    monthly_payments[month]['on_time'] += 1
                elif payment['status'] == 'late':
                    monthly_payments[month]['late'] += 1
                elif payment['status'] == 'missed':
                    monthly_payments[month]['missed'] += 1
            
            # Loan type distribution
            loan_type_distribution = {}
            for payment in payments:
                loan_type = payment['loan_type']
                if loan_type not in loan_type_distribution:
                    loan_type_distribution[loan_type] = 0
                loan_type_distribution[loan_type] += 1
        else:
            monthly_payments = {}
            loan_type_distribution = {}
        
        analysis_data = {
            "behavior_analysis": analysis,
            "monthly_trends": monthly_payments,
            "loan_type_distribution": loan_type_distribution,
            "total_payments": len(payments),
            "analysis_date": datetime.now().isoformat()
        }
        
        return APIResponse(
            success=True,
            message="Payment analysis retrieved successfully",
            data=analysis_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payment analysis for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/payments/bulk", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_bulk_payments(payments_data: List[PaymentCreate]):
    """Create multiple payments at once"""
    try:
        supabase = get_supabase_client()
        
        # Validate all users exist
        user_ids = list(set(payment.user_id for payment in payments_data))
        for user_id in user_ids:
            user_response = supabase.table("users") \
                .select("id") \
                .eq("id", user_id) \
                .execute()
            
            if not user_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User {user_id} not found"
                )
        
        # Prepare payments data
        payments_to_insert = []
        for payment_data in payments_data:
            payment_dict = payment_data.dict()
            payment_dict["id"] = str(uuid.uuid4())
            payment_dict["created_at"] = datetime.now().isoformat()
            payment_dict["updated_at"] = datetime.now().isoformat()
            payments_to_insert.append(payment_dict)
        
        # Insert payments
        response = supabase.table("payments") \
            .insert(payments_to_insert) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payments"
            )
        
        created_payments = [Payment(**payment_data) for payment_data in response.data]
        
        # Recalculate trust scores for affected users
        trust_service = TrustScoreService()
        affected_users = list(set(payment.user_id for payment in created_payments))
        for user_id in affected_users:
            await trust_service.calculate_trust_score(user_id)
        
        return APIResponse(
            success=True,
            message=f"Created {len(created_payments)} payments successfully",
            data={
                "payments": created_payments,
                "total_created": len(created_payments),
                "affected_users": len(affected_users)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating bulk payments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
