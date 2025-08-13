import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import sys
import os

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ml.trust_score_model import TrustScoreModel
from app.database.connection import get_supabase_client
from app.models.schemas import TrustScoreCreate, TrustScore, User, Payment

logger = logging.getLogger(__name__)

class TrustScoreService:
    """Service for managing trust scores and ML model interactions"""
    
    def __init__(self):
        self.model = TrustScoreModel()
        self.supabase = get_supabase_client()
    
    async def calculate_trust_score(self, user_id: str, include_payment_history: bool = True) -> Dict[str, Any]:
        """Calculate trust score for a user"""
        try:
            # Get user data
            user_data = await self._get_user_data(user_id)
            if not user_data:
                raise ValueError(f"User {user_id} not found")
            
            # Get payment history
            payment_data = []
            if include_payment_history:
                payment_data = await self._get_payment_data(user_id)
            
            # Predict trust score
            prediction = self.model.predict_trust_score(user_data, payment_data)
            
            # Save trust score to database
            trust_score_data = TrustScoreCreate(
                user_id=user_id,
                score=prediction['trust_score'],
                level=prediction['trust_level'],
                factors=prediction['factors'],
                confidence=prediction['confidence']
            )
            
            saved_score = await self._save_trust_score(trust_score_data)
            
            # Update user with trust score
            await self._update_user_trust_score(user_id, prediction['trust_score'], prediction['trust_level'])
            
            return {
                'trust_score': prediction['trust_score'],
                'trust_level': prediction['trust_level'],
                'confidence': prediction['confidence'],
                'factors': prediction['factors'],
                'feature_importance': prediction['feature_importance'],
                'created_at': saved_score.created_at,
                'user_id': user_id
            }
            
        except Exception as e:
            logger.error(f"Error calculating trust score for user {user_id}: {e}")
            raise
    
    async def get_trust_score(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the latest trust score for a user"""
        try:
            response = self.supabase.table("trust_scores") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(1) \
                .execute()
            
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error getting trust score for user {user_id}: {e}")
            raise
    
    async def get_trust_score_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trust score history for a user"""
        try:
            response = self.supabase.table("trust_scores") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(limit) \
                .execute()
            
            return response.data
            
        except Exception as e:
            logger.error(f"Error getting trust score history for user {user_id}: {e}")
            raise
    
    async def retrain_model(self, training_data: List[Dict]) -> Dict[str, Any]:
        """Retrain the ML model with new data"""
        try:
            logger.info("Starting model retraining...")
            results = self.model.train(training_data)
            logger.info("Model retraining completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Error retraining model: {e}")
            raise
    
    async def get_model_performance(self) -> Dict[str, Any]:
        """Get model performance metrics"""
        try:
            # This would typically load from a metrics table
            # For now, return basic info
            return {
                'model_type': 'GradientBoostingRegressor',
                'last_trained': datetime.now().isoformat(),
                'feature_count': len(self.model.feature_names),
                'status': 'active'
            }
            
        except Exception as e:
            logger.error(f"Error getting model performance: {e}")
            raise
    
    async def _get_user_data(self, user_id: str) -> Dict[str, Any]:
        """Get user data from database"""
        try:
            response = self.supabase.table("users") \
                .select("*") \
                .eq("id", user_id) \
                .single() \
                .execute()
            
            if response.data:
                return response.data
            return None
            
        except Exception as e:
            logger.error(f"Error getting user data for {user_id}: {e}")
            raise
    
    async def _get_payment_data(self, user_id: str) -> List[Dict[str, Any]]:
        """Get payment data for a user"""
        try:
            response = self.supabase.table("payments") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .execute()
            
            return response.data
            
        except Exception as e:
            logger.error(f"Error getting payment data for user {user_id}: {e}")
            raise
    
    async def _save_trust_score(self, trust_score_data: TrustScoreCreate) -> TrustScore:
        """Save trust score to database"""
        try:
            response = self.supabase.table("trust_scores") \
                .insert(trust_score_data.dict()) \
                .execute()
            
            if response.data:
                return TrustScore(**response.data[0])
            raise ValueError("Failed to save trust score")
            
        except Exception as e:
            logger.error(f"Error saving trust score: {e}")
            raise
    
    async def _update_user_trust_score(self, user_id: str, score: float, level: str):
        """Update user with latest trust score"""
        try:
            self.supabase.table("users") \
                .update({
                    "trust_score": score,
                    "trust_level": level,
                    "updated_at": datetime.now().isoformat()
                }) \
                .eq("id", user_id) \
                .execute()
                
        except Exception as e:
            logger.error(f"Error updating user trust score: {e}")
            raise
    
    async def analyze_payment_behavior(self, user_id: str) -> Dict[str, Any]:
        """Analyze payment behavior patterns"""
        try:
            payments = await self._get_payment_data(user_id)
            
            if not payments:
                return {
                    'user_id': user_id,
                    'total_payments': 0,
                    'on_time_payments': 0,
                    'late_payments': 0,
                    'missed_payments': 0,
                    'average_payment_amount': 0,
                    'payment_frequency': 0,
                    'credit_utilization': 0,
                    'debt_to_income_ratio': 0,
                    'income_stability_score': 0
                }
            
            # Calculate metrics
            total_payments = len(payments)
            on_time_payments = sum(1 for p in payments if p['status'] == 'on_time')
            late_payments = sum(1 for p in payments if p['status'] == 'late')
            missed_payments = sum(1 for p in payments if p['status'] == 'missed')
            
            average_payment_amount = sum(p['amount'] for p in payments) / total_payments
            
            # Calculate payment frequency (payments per month)
            if payments:
                first_payment = min(payments, key=lambda x: x['created_at'])
                last_payment = max(payments, key=lambda x: x['created_at'])
                
                start_date = datetime.strptime(first_payment['created_at'], '%Y-%m-%d')
                end_date = datetime.strptime(last_payment['created_at'], '%Y-%m-%d')
                months_diff = (end_date - start_date).days / 30
                
                payment_frequency = total_payments / max(months_diff, 1)
            else:
                payment_frequency = 0
            
            # Get user data for additional calculations
            user_data = await self._get_user_data(user_id)
            income = user_data.get('income', 0) if user_data else 0
            
            # Calculate credit utilization and debt-to-income ratio
            total_debt = sum(p['amount'] for p in payments if p['status'] in ['late', 'missed'])
            credit_utilization = self.model.calculate_credit_utilization(total_debt, income * 0.3)
            debt_to_income_ratio = self.model.calculate_debt_to_income_ratio(total_debt, income)
            
            # Simplified income stability score
            income_stability_score = 0.8  # Would need historical income data
            
            return {
                'user_id': user_id,
                'total_payments': total_payments,
                'on_time_payments': on_time_payments,
                'late_payments': late_payments,
                'missed_payments': missed_payments,
                'average_payment_amount': round(average_payment_amount, 2),
                'payment_frequency': round(payment_frequency, 2),
                'credit_utilization': round(credit_utilization, 3),
                'debt_to_income_ratio': round(debt_to_income_ratio, 3),
                'income_stability_score': round(income_stability_score, 3)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing payment behavior for user {user_id}: {e}")
            raise
