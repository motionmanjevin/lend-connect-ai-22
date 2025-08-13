import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import math

from app.database.connection import get_supabase_client
from app.models.schemas import LenderMatch, LenderMatchRequest, Lender, LoanType

logger = logging.getLogger(__name__)

class LenderMatchingService:
    """Service for matching users with appropriate lenders"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def find_matching_lenders(self, user_id: str, loan_amount: float, 
                                  loan_type: LoanType, term_months: int) -> List[LenderMatch]:
        """Find matching lenders for a user's loan request"""
        try:
            # Get user's trust score
            trust_score = await self._get_user_trust_score(user_id)
            if not trust_score:
                raise ValueError(f"No trust score found for user {user_id}")
            
            # Get all lenders
            lenders = await self._get_all_lenders()
            
            # Filter and score lenders
            matches = []
            for lender in lenders:
                match_score = self._calculate_match_score(
                    lender, trust_score, loan_amount, loan_type, term_months
                )
                
                if match_score > 0:  # Only include lenders with positive match score
                    interest_rate = self._calculate_interest_rate(
                        lender, trust_score, loan_amount, term_months
                    )
                    
                    requirements_met = self._check_requirements(
                        lender, trust_score, loan_amount, loan_type
                    )
                    
                    reasons = self._get_match_reasons(
                        lender, trust_score, loan_amount, loan_type, match_score
                    )
                    
                    match = LenderMatch(
                        lender_id=lender['id'],
                        lender_name=lender['name'],
                        match_score=round(match_score, 3),
                        interest_rate=round(interest_rate, 2),
                        max_amount=lender['max_loan_amount'],
                        requirements_met=requirements_met,
                        reasons=reasons
                    )
                    
                    matches.append(match)
            
            # Sort by match score (highest first)
            matches.sort(key=lambda x: x.match_score, reverse=True)
            
            return matches
            
        except Exception as e:
            logger.error(f"Error finding matching lenders for user {user_id}: {e}")
            raise
    
    async def get_lender_details(self, lender_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific lender"""
        try:
            response = self.supabase.table("lenders") \
                .select("*") \
                .eq("id", lender_id) \
                .single() \
                .execute()
            
            if response.data:
                return response.data
            return None
            
        except Exception as e:
            logger.error(f"Error getting lender details for {lender_id}: {e}")
            raise
    
    async def get_lender_performance(self, lender_id: str) -> Dict[str, Any]:
        """Get performance metrics for a lender"""
        try:
            # This would typically aggregate data from loan applications
            # For now, return basic metrics
            return {
                'lender_id': lender_id,
                'total_loans_processed': 0,
                'average_approval_rate': 0.85,
                'average_processing_time_days': 3.5,
                'customer_satisfaction_score': 4.2,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting lender performance for {lender_id}: {e}")
            raise
    
    def _calculate_match_score(self, lender: Dict, trust_score: float, 
                             loan_amount: float, loan_type: LoanType, 
                             term_months: int) -> float:
        """Calculate how well a lender matches the user's requirements"""
        score = 0.0
        
        # Trust score compatibility (40% weight)
        trust_score_weight = self._calculate_trust_score_weight(lender, trust_score)
        score += trust_score_weight * 0.4
        
        # Loan amount compatibility (25% weight)
        amount_weight = self._calculate_amount_weight(lender, loan_amount)
        score += amount_weight * 0.25
        
        # Loan type compatibility (20% weight)
        type_weight = self._calculate_type_weight(lender, loan_type)
        score += type_weight * 0.2
        
        # Term compatibility (15% weight)
        term_weight = self._calculate_term_weight(lender, term_months)
        score += term_weight * 0.15
        
        return score
    
    def _calculate_trust_score_weight(self, lender: Dict, trust_score: float) -> float:
        """Calculate weight based on trust score compatibility"""
        min_trust = lender.get('min_trust_score', 0)
        
        if trust_score < min_trust:
            return 0.0
        
        # Higher trust scores get better weights
        if trust_score >= 800:
            return 1.0
        elif trust_score >= 650:
            return 0.9
        elif trust_score >= 500:
            return 0.7
        elif trust_score >= 300:
            return 0.5
        else:
            return 0.3
    
    def _calculate_amount_weight(self, lender: Dict, loan_amount: float) -> float:
        """Calculate weight based on loan amount compatibility"""
        max_amount = lender.get('max_loan_amount', 0)
        
        if loan_amount > max_amount:
            return 0.0
        
        # Prefer lenders that can handle the full amount
        utilization = loan_amount / max_amount
        
        if utilization <= 0.5:
            return 1.0  # Excellent fit
        elif utilization <= 0.8:
            return 0.8  # Good fit
        else:
            return 0.6  # Acceptable fit
    
    def _calculate_type_weight(self, lender: Dict, loan_type: LoanType) -> float:
        """Calculate weight based on loan type compatibility"""
        supported_types = lender.get('loan_types', [])
        
        if loan_type in supported_types:
            return 1.0
        else:
            return 0.0
    
    def _calculate_term_weight(self, lender: Dict, term_months: int) -> float:
        """Calculate weight based on loan term compatibility"""
        # Most lenders support standard terms (12-60 months)
        if 12 <= term_months <= 60:
            return 1.0
        elif 6 <= term_months <= 84:
            return 0.8
        else:
            return 0.5
    
    def _calculate_interest_rate(self, lender: Dict, trust_score: float, 
                               loan_amount: float, term_months: int) -> float:
        """Calculate interest rate based on lender's range and user's profile"""
        rate_range = lender.get('interest_rate_range', {})
        min_rate = rate_range.get('min', 5.0)
        max_rate = rate_range.get('max', 25.0)
        
        # Base rate on trust score
        if trust_score >= 800:
            rate_multiplier = 0.8  # Excellent borrowers get better rates
        elif trust_score >= 650:
            rate_multiplier = 0.9
        elif trust_score >= 500:
            rate_multiplier = 1.0
        elif trust_score >= 300:
            rate_multiplier = 1.1
        else:
            rate_multiplier = 1.2  # Higher risk borrowers pay more
        
        # Adjust for loan amount (larger loans often get better rates)
        if loan_amount >= 50000:
            amount_multiplier = 0.95
        elif loan_amount >= 25000:
            amount_multiplier = 0.98
        else:
            amount_multiplier = 1.0
        
        # Adjust for term length (longer terms often have higher rates)
        if term_months <= 12:
            term_multiplier = 0.95
        elif term_months <= 36:
            term_multiplier = 1.0
        else:
            term_multiplier = 1.05
        
        # Calculate final rate
        base_rate = (min_rate + max_rate) / 2
        final_rate = base_rate * rate_multiplier * amount_multiplier * term_multiplier
        
        # Ensure rate is within lender's range
        return max(min_rate, min(max_rate, final_rate))
    
    def _check_requirements(self, lender: Dict, trust_score: float, 
                          loan_amount: float, loan_type: LoanType) -> bool:
        """Check if user meets lender's requirements"""
        requirements = lender.get('requirements', {})
        
        # Check trust score requirement
        min_trust = requirements.get('min_trust_score', 0)
        if trust_score < min_trust:
            return False
        
        # Check income requirement
        min_income = requirements.get('min_income', 0)
        # This would need user income data
        
        # Check employment requirement
        employment_required = requirements.get('employment_required', False)
        # This would need user employment data
        
        # Check loan type requirement
        supported_types = requirements.get('supported_loan_types', [])
        if supported_types and loan_type not in supported_types:
            return False
        
        return True
    
    def _get_match_reasons(self, lender: Dict, trust_score: float, 
                          loan_amount: float, loan_type: LoanType, 
                          match_score: float) -> List[str]:
        """Get reasons why this lender is a good match"""
        reasons = []
        
        # Trust score reasons
        if trust_score >= 800:
            reasons.append("Excellent credit profile")
        elif trust_score >= 650:
            reasons.append("Good credit profile")
        elif trust_score >= 500:
            reasons.append("Fair credit profile")
        
        # Amount reasons
        max_amount = lender.get('max_loan_amount', 0)
        if loan_amount <= max_amount * 0.5:
            reasons.append("Loan amount well within limits")
        elif loan_amount <= max_amount * 0.8:
            reasons.append("Loan amount within limits")
        
        # Type reasons
        if loan_type in lender.get('loan_types', []):
            reasons.append(f"Specializes in {loan_type} loans")
        
        # Rate reasons
        rate_range = lender.get('interest_rate_range', {})
        if rate_range.get('min', 25) <= 8:
            reasons.append("Competitive interest rates")
        
        # Match score reasons
        if match_score >= 0.8:
            reasons.append("Excellent match")
        elif match_score >= 0.6:
            reasons.append("Good match")
        else:
            reasons.append("Acceptable match")
        
        return reasons
    
    async def _get_user_trust_score(self, user_id: str) -> Optional[float]:
        """Get user's current trust score"""
        try:
            response = self.supabase.table("users") \
                .select("trust_score") \
                .eq("id", user_id) \
                .single() \
                .execute()
            
            if response.data and response.data.get('trust_score'):
                return response.data['trust_score']
            return None
            
        except Exception as e:
            logger.error(f"Error getting trust score for user {user_id}: {e}")
            raise
    
    async def _get_all_lenders(self) -> List[Dict[str, Any]]:
        """Get all available lenders"""
        try:
            response = self.supabase.table("lenders") \
                .select("*") \
                .execute()
            
            return response.data
            
        except Exception as e:
            logger.error(f"Error getting lenders: {e}")
            raise
    
    async def create_sample_lenders(self):
        """Create sample lenders for testing"""
        sample_lenders = [
            {
                "name": "Prime Lending Co.",
                "min_trust_score": 700,
                "max_loan_amount": 100000,
                "interest_rate_range": {"min": 4.5, "max": 12.0},
                "loan_types": ["personal", "business", "auto"],
                "requirements": {
                    "min_trust_score": 700,
                    "min_income": 50000,
                    "employment_required": True,
                    "supported_loan_types": ["personal", "business", "auto"]
                }
            },
            {
                "name": "Quick Cash Solutions",
                "min_trust_score": 500,
                "max_loan_amount": 25000,
                "interest_rate_range": {"min": 8.0, "max": 18.0},
                "loan_types": ["personal", "auto"],
                "requirements": {
                    "min_trust_score": 500,
                    "min_income": 25000,
                    "employment_required": True,
                    "supported_loan_types": ["personal", "auto"]
                }
            },
            {
                "name": "Flexible Finance",
                "min_trust_score": 300,
                "max_loan_amount": 15000,
                "interest_rate_range": {"min": 12.0, "max": 25.0},
                "loan_types": ["personal"],
                "requirements": {
                    "min_trust_score": 300,
                    "min_income": 15000,
                    "employment_required": False,
                    "supported_loan_types": ["personal"]
                }
            },
            {
                "name": "Premium Mortgage Bank",
                "min_trust_score": 750,
                "max_loan_amount": 500000,
                "interest_rate_range": {"min": 3.5, "max": 8.0},
                "loan_types": ["mortgage"],
                "requirements": {
                    "min_trust_score": 750,
                    "min_income": 80000,
                    "employment_required": True,
                    "supported_loan_types": ["mortgage"]
                }
            },
            {
                "name": "Student Loan Pro",
                "min_trust_score": 600,
                "max_loan_amount": 75000,
                "interest_rate_range": {"min": 5.0, "max": 15.0},
                "loan_types": ["student"],
                "requirements": {
                    "min_trust_score": 600,
                    "min_income": 30000,
                    "employment_required": False,
                    "supported_loan_types": ["student"]
                }
            }
        ]
        
        try:
            for lender_data in sample_lenders:
                self.supabase.table("lenders") \
                    .insert(lender_data) \
                    .execute()
            
            logger.info("Sample lenders created successfully")
            
        except Exception as e:
            logger.error(f"Error creating sample lenders: {e}")
            raise
