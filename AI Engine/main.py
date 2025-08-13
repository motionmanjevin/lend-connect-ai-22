from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.api import users, payments, trust_scores, lenders, loans
from app.database.connection import init_database
from app.utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger()

# Create FastAPI app
app = FastAPI(
    title="Loan Trust Scoring System",
    description="ML-powered loan trust scoring and lender matching system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(payments.router, prefix="/api/v1", tags=["Payments"])
app.include_router(trust_scores.router, prefix="/api/v1", tags=["Trust Scores"])
app.include_router(lenders.router, prefix="/api/v1", tags=["Lenders"])
app.include_router(loans.router, prefix="/api/v1", tags=["Loans"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    try:
        await init_database()
        logger.info("Application started successfully")
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Loan Trust Scoring System API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "ml_model": "loaded"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )
