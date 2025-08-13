from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class PaymentStatus(str, Enum):
    ON_TIME = "on_time"
    LATE = "late"
    MISSED = "missed"
    PARTIAL = "partial"

class LoanType(str, Enum):
    PERSONAL = "personal"
    BUSINESS = "business"
    MORTGAGE = "mortgage"
    AUTO = "auto"
    STUDENT = "student"

class TrustScoreLevel(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    VERY_POOR = "very_poor"

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    phone: Optional[str] = None
    date_of_birth: date
    income: float = Field(..., gt=0)
    employment_status: str
    credit_score: Optional[int] = Field(None, ge=300, le=850)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    phone: Optional[str] = None
    income: Optional[float] = Field(None, gt=0)
    employment_status: Optional[str] = None
    credit_score: Optional[int] = Field(None, ge=300, le=850)

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    trust_score: Optional[float] = None
    trust_level: Optional[TrustScoreLevel] = None

    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    amount: float = Field(..., gt=0)
    due_date: date
    payment_date: Optional[date] = None
    status: PaymentStatus
    loan_type: LoanType
    description: Optional[str] = None

class PaymentCreate(PaymentBase):
    user_id: str

class Payment(PaymentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TrustScoreBase(BaseModel):
    score: float = Field(..., ge=0, le=1000)
    level: TrustScoreLevel
    factors: Dict[str, Any]
    confidence: float = Field(..., ge=0, le=1)

class TrustScoreCreate(TrustScoreBase):
    user_id: str

class TrustScore(TrustScoreBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LenderBase(BaseModel):
    name: str
    min_trust_score: float = Field(..., ge=0, le=1000)
    max_loan_amount: float = Field(..., gt=0)
    interest_rate_range: Dict[str, float]
    loan_types: List[LoanType]
    requirements: Dict[str, Any]

class LenderCreate(LenderBase):
    pass

class Lender(LenderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LoanApplicationBase(BaseModel):
    amount: float = Field(..., gt=0)
    loan_type: LoanType
    purpose: str
    term_months: int = Field(..., gt=0, le=360)

class LoanApplicationCreate(LoanApplicationBase):
    user_id: str

class LoanApplication(LoanApplicationBase):
    id: str
    user_id: str
    status: str
    trust_score: Optional[float] = None
    matched_lenders: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaymentBehaviorAnalysis(BaseModel):
    user_id: str
    total_payments: int
    on_time_payments: int
    late_payments: int
    missed_payments: int
    average_payment_amount: float
    payment_frequency: float
    credit_utilization: float
    debt_to_income_ratio: float
    income_stability_score: float

class TrustScoreRequest(BaseModel):
    user_id: str
    include_payment_history: bool = True
    include_credit_data: bool = True

class LenderMatchRequest(BaseModel):
    user_id: str
    loan_amount: float
    loan_type: LoanType
    term_months: int

class LenderMatch(BaseModel):
    lender_id: str
    lender_name: str
    match_score: float
    interest_rate: float
    max_amount: float
    requirements_met: bool
    reasons: List[str]

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None
