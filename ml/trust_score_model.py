import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
from typing import Dict, List, Any, Tuple
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class TrustScoreModel:
    """
    ML model for calculating trust scores based on payment behavior and user data
    """
    
    def __init__(self, model_path: str = None, scaler_path: str = None):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = [
            'payment_history_score',
            'credit_utilization',
            'debt_to_income_ratio',
            'income_stability',
            'employment_duration',
            'payment_frequency',
            'late_payment_ratio',
            'missed_payment_ratio',
            'average_payment_amount',
            'credit_score_normalized',
            'age',
            'income_log'
        ]
        
        self.model_path = model_path or "ml/models/trust_score_model.pkl"
        self.scaler_path = scaler_path or "ml/models/feature_scaler.pkl"
        
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
    def load_model(self) -> bool:
        """Load trained model and scaler"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                logger.info("Model and scaler loaded successfully")
                return True
            else:
                logger.warning("Model files not found, training new model")
                return False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def save_model(self):
        """Save trained model and scaler"""
        try:
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            logger.info("Model and scaler saved successfully")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def calculate_payment_history_score(self, payments: List[Dict]) -> float:
        """Calculate payment history score based on payment patterns"""
        if not payments:
            return 0.0
        
        total_payments = len(payments)
        on_time = sum(1 for p in payments if p['status'] == 'on_time')
        late = sum(1 for p in payments if p['status'] == 'late')
        missed = sum(1 for p in payments if p['status'] == 'missed')
        
        # Weighted scoring
        score = (on_time * 1.0 + late * 0.5 + missed * 0.0) / total_payments
        
        # Bonus for consistent payments
        if total_payments >= 12:  # At least 1 year of history
            score += 0.1
        
        return min(score, 1.0)
    
    def calculate_credit_utilization(self, total_debt: float, total_credit: float) -> float:
        """Calculate credit utilization ratio"""
        if total_credit == 0:
            return 1.0
        return min(total_debt / total_credit, 1.0)
    
    def calculate_debt_to_income_ratio(self, total_debt: float, income: float) -> float:
        """Calculate debt-to-income ratio"""
        if income == 0:
            return 1.0
        return min(total_debt / income, 1.0)
    
    def calculate_income_stability(self, income_history: List[float]) -> float:
        """Calculate income stability score"""
        if len(income_history) < 2:
            return 0.5
        
        # Calculate coefficient of variation
        mean_income = np.mean(income_history)
        std_income = np.std(income_history)
        
        if mean_income == 0:
            return 0.0
        
        cv = std_income / mean_income
        # Lower CV means more stable income
        stability_score = max(0, 1 - cv)
        
        return stability_score
    
    def calculate_payment_frequency(self, payments: List[Dict], months: int = 12) -> float:
        """Calculate average payments per month"""
        if not payments:
            return 0.0
        
        # Count payments in last N months
        cutoff_date = datetime.now() - timedelta(days=months*30)
        recent_payments = [
            p for p in payments 
            if datetime.strptime(p['created_at'], '%Y-%m-%d') >= cutoff_date
        ]
        
        return len(recent_payments) / months
    
    def calculate_late_payment_ratio(self, payments: List[Dict]) -> float:
        """Calculate ratio of late payments"""
        if not payments:
            return 0.0
        
        late_payments = sum(1 for p in payments if p['status'] == 'late')
        return late_payments / len(payments)
    
    def calculate_missed_payment_ratio(self, payments: List[Dict]) -> float:
        """Calculate ratio of missed payments"""
        if not payments:
            return 0.0
        
        missed_payments = sum(1 for p in payments if p['status'] == 'missed')
        return missed_payments / len(payments)
    
    def extract_features(self, user_data: Dict, payment_data: List[Dict]) -> np.ndarray:
        """Extract features from user and payment data"""
        features = []
        
        # Payment history score
        payment_history_score = self.calculate_payment_history_score(payment_data)
        features.append(payment_history_score)
        
        # Credit utilization (estimated)
        total_debt = sum(p['amount'] for p in payment_data if p['status'] in ['late', 'missed'])
        total_credit = user_data.get('income', 0) * 0.3  # Estimate credit limit as 30% of income
        credit_utilization = self.calculate_credit_utilization(total_debt, total_credit)
        features.append(credit_utilization)
        
        # Debt-to-income ratio
        debt_to_income = self.calculate_debt_to_income_ratio(total_debt, user_data.get('income', 0))
        features.append(debt_to_income)
        
        # Income stability (simplified)
        income_stability = 0.8  # Default value, would need historical data
        features.append(income_stability)
        
        # Employment duration (simplified)
        employment_duration = 0.7  # Default value
        features.append(employment_duration)
        
        # Payment frequency
        payment_frequency = self.calculate_payment_frequency(payment_data)
        features.append(payment_frequency)
        
        # Late payment ratio
        late_payment_ratio = self.calculate_late_payment_ratio(payment_data)
        features.append(late_payment_ratio)
        
        # Missed payment ratio
        missed_payment_ratio = self.calculate_missed_payment_ratio(payment_data)
        features.append(missed_payment_ratio)
        
        # Average payment amount
        if payment_data:
            avg_payment = np.mean([p['amount'] for p in payment_data])
        else:
            avg_payment = 0
        features.append(avg_payment)
        
        # Credit score normalized
        credit_score = user_data.get('credit_score', 650)
        credit_score_normalized = (credit_score - 300) / (850 - 300)
        features.append(credit_score_normalized)
        
        # Age (calculated from date of birth)
        dob = datetime.strptime(user_data['date_of_birth'], '%Y-%m-%d')
        age = (datetime.now() - dob).days / 365.25
        features.append(age)
        
        # Income log
        income = user_data.get('income', 0)
        income_log = np.log(income + 1) if income > 0 else 0
        features.append(income_log)
        
        return np.array(features).reshape(1, -1)
    
    def train(self, training_data: List[Dict]):
        """Train the trust score model"""
        logger.info("Starting model training...")
        
        # Prepare training data
        X = []
        y = []
        
        for data_point in training_data:
            user_data = data_point['user']
            payment_data = data_point['payments']
            trust_score = data_point['trust_score']  # Target variable
            
            features = self.extract_features(user_data, payment_data)
            X.append(features.flatten())
            y.append(trust_score)
        
        X = np.array(X)
        y = np.array(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        logger.info(f"Model training completed. MSE: {mse:.4f}, R²: {r2:.4f}")
        
        # Save model
        self.save_model()
        
        return {
            'mse': mse,
            'r2': r2,
            'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_))
        }
    
    def predict_trust_score(self, user_data: Dict, payment_data: List[Dict]) -> Dict[str, Any]:
        """Predict trust score for a user"""
        if self.model is None:
            if not self.load_model():
                # Train a simple model if none exists
                self._train_default_model()
        
        # Extract features
        features = self.extract_features(user_data, payment_data)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict
        trust_score = self.model.predict(features_scaled)[0]
        
        # Ensure score is within bounds
        trust_score = max(0, min(1000, trust_score))
        
        # Determine trust level
        if trust_score >= 800:
            level = "excellent"
        elif trust_score >= 650:
            level = "good"
        elif trust_score >= 500:
            level = "fair"
        elif trust_score >= 300:
            level = "poor"
        else:
            level = "very_poor"
        
        # Calculate confidence based on data quality
        confidence = self._calculate_confidence(user_data, payment_data)
        
        # Get feature importance for this prediction
        feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
        
        return {
            'trust_score': round(trust_score, 2),
            'trust_level': level,
            'confidence': confidence,
            'factors': {
                'payment_history_score': round(features[0][0], 3),
                'credit_utilization': round(features[0][1], 3),
                'debt_to_income_ratio': round(features[0][2], 3),
                'payment_frequency': round(features[0][5], 3),
                'late_payment_ratio': round(features[0][6], 3),
                'missed_payment_ratio': round(features[0][7], 3),
                'credit_score': user_data.get('credit_score', 'Not provided'),
                'income': user_data.get('income', 0)
            },
            'feature_importance': feature_importance
        }
    
    def _calculate_confidence(self, user_data: Dict, payment_data: List[Dict]) -> float:
        """Calculate confidence in the prediction based on data quality"""
        confidence = 0.5  # Base confidence
        
        # More payment history = higher confidence
        if len(payment_data) >= 12:
            confidence += 0.2
        elif len(payment_data) >= 6:
            confidence += 0.1
        
        # Credit score available = higher confidence
        if user_data.get('credit_score'):
            confidence += 0.1
        
        # Income information = higher confidence
        if user_data.get('income'):
            confidence += 0.1
        
        # Employment status = higher confidence
        if user_data.get('employment_status'):
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def _train_default_model(self):
        """Train a default model with synthetic data"""
        logger.info("Training default model with synthetic data...")
        
        # Generate synthetic training data
        synthetic_data = self._generate_synthetic_data()
        self.train(synthetic_data)
    
    def _generate_synthetic_data(self) -> List[Dict]:
        """Generate synthetic training data"""
        data = []
        np.random.seed(42)
        
        for i in range(1000):
            # Generate user data
            income = np.random.lognormal(10, 0.5)
            credit_score = np.random.normal(650, 100)
            credit_score = max(300, min(850, credit_score))
            
            # Generate payment history
            num_payments = np.random.poisson(24)  # Average 2 payments per month
            payments = []
            
            for j in range(num_payments):
                status = np.random.choice(['on_time', 'late', 'missed'], p=[0.7, 0.2, 0.1])
                amount = np.random.lognormal(5, 0.5)
                payments.append({
                    'amount': amount,
                    'status': status,
                    'created_at': f"2023-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}"
                })
            
            # Calculate synthetic trust score
            payment_score = self.calculate_payment_history_score(payments)
            credit_score_norm = (credit_score - 300) / (850 - 300)
            income_norm = np.log(income) / 15  # Normalize log income
            
            trust_score = (
                payment_score * 400 +
                credit_score_norm * 300 +
                income_norm * 200 +
                np.random.normal(0, 50)
            )
            trust_score = max(0, min(1000, trust_score))
            
            data.append({
                'user': {
                    'income': income,
                    'credit_score': credit_score,
                    'date_of_birth': '1990-01-01'
                },
                'payments': payments,
                'trust_score': trust_score
            })
        
        return data
