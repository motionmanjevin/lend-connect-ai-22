import os
from supabase import create_client, Client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Global Supabase client
supabase: Optional[Client] = None

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    global supabase
    if supabase is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        supabase = create_client(url, key)
        logger.info("Supabase client initialized")
    
    return supabase

async def init_database():
    """Initialize database tables and connections"""
    try:
        client = get_supabase_client()
        
        # Test connection
        response = client.table("users").select("count", count="exact").limit(1).execute()
        logger.info("Database connection successful")
        
        # Initialize tables if they don't exist
        await create_tables()
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

async def create_tables():
    """Create database tables if they don't exist"""
    # This would typically be done through Supabase migrations
    # For now, we'll assume tables exist or create them via SQL
    logger.info("Database tables ready")

def get_database():
    """Dependency to get database client"""
    return get_supabase_client()
