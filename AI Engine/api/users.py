from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging
from datetime import datetime
import uuid

from app.models.schemas import UserCreate, UserUpdate, User, APIResponse
from app.database.connection import get_supabase_client
from app.services.trust_score_service import TrustScoreService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/users/", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    try:
        supabase = get_supabase_client()
        
        # Check if user already exists
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("email", user_data.email) \
            .execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user data
        user_dict = user_data.dict()
        user_dict["id"] = str(uuid.uuid4())
        user_dict["created_at"] = datetime.now().isoformat()
        user_dict["updated_at"] = datetime.now().isoformat()
        
        # Remove password from dict (would be hashed in production)
        user_dict.pop("password", None)
        
        # Insert user
        response = supabase.table("users") \
            .insert(user_dict) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        created_user = User(**response.data[0])
        
        # Calculate initial trust score
        trust_service = TrustScoreService()
        await trust_service.calculate_trust_score(created_user.id)
        
        return APIResponse(
            success=True,
            message="User created successfully",
            data=created_user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/users/{user_id}", response_model=APIResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("users") \
            .select("*") \
            .eq("id", user_id) \
            .single() \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = User(**response.data)
        
        return APIResponse(
            success=True,
            message="User retrieved successfully",
            data=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/users/{user_id}", response_model=APIResponse)
async def update_user(user_id: str, user_data: UserUpdate):
    """Update user information"""
    try:
        supabase = get_supabase_client()
        
        # Check if user exists
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("id", user_id) \
            .execute()
        
        if not existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prepare update data
        update_data = user_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Update user
        response = supabase.table("users") \
            .update(update_data) \
            .eq("id", user_id) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user"
            )
        
        updated_user = User(**response.data[0])
        
        # Recalculate trust score if relevant fields were updated
        if any(field in update_data for field in ['income', 'employment_status', 'credit_score']):
            trust_service = TrustScoreService()
            await trust_service.calculate_trust_score(user_id)
        
        return APIResponse(
            success=True,
            message="User updated successfully",
            data=updated_user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/users/{user_id}", response_model=APIResponse)
async def delete_user(user_id: str):
    """Delete user"""
    try:
        supabase = get_supabase_client()
        
        # Check if user exists
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("id", user_id) \
            .execute()
        
        if not existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete user (in production, you might want to soft delete)
        response = supabase.table("users") \
            .delete() \
            .eq("id", user_id) \
            .execute()
        
        return APIResponse(
            success=True,
            message="User deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/users/", response_model=APIResponse)
async def list_users(limit: int = 10, offset: int = 0):
    """List users with pagination"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("users") \
            .select("*") \
            .range(offset, offset + limit - 1) \
            .order("created_at", desc=True) \
            .execute()
        
        users = [User(**user_data) for user_data in response.data]
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(users)} users",
            data={
                "users": users,
                "total": len(users),
                "limit": limit,
                "offset": offset
            }
        )
        
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/users/{user_id}/profile", response_model=APIResponse)
async def get_user_profile(user_id: str):
    """Get comprehensive user profile with trust score and payment analysis"""
    try:
        supabase = get_supabase_client()
        trust_service = TrustScoreService()
        
        # Get user data
        user_response = supabase.table("users") \
            .select("*") \
            .eq("id", user_id) \
            .single() \
            .execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = User(**user_response.data)
        
        # Get trust score
        trust_score = await trust_service.get_trust_score(user_id)
        
        # Get payment behavior analysis
        payment_analysis = await trust_service.analyze_payment_behavior(user_id)
        
        # Get recent payments
        payments_response = supabase.table("payments") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(5) \
            .execute()
        
        profile_data = {
            "user": user,
            "trust_score": trust_score,
            "payment_analysis": payment_analysis,
            "recent_payments": payments_response.data
        }
        
        return APIResponse(
            success=True,
            message="User profile retrieved successfully",
            data=profile_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
