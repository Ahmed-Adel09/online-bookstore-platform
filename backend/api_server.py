"""
FastAPI Server for Subscription and Theme Management
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import uvicorn
from subscription_service import SubscriptionService, SubscriptionTier

app = FastAPI(title="Bookstore Subscription API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize subscription service
subscription_service = SubscriptionService()

# Pydantic models for API requests/responses
class PaymentRequest(BaseModel):
    user_id: str
    plan: str  # "monthly" or "yearly"
    card_number: str
    card_name: str
    expiry: str
    cvc: str
    billing_address: Dict[str, str]

class SubscriptionStatusResponse(BaseModel):
    tier: str
    is_premium: bool
    available_themes: List[Dict]
    total_themes: int
    subscription_active: bool
    end_date: Optional[str] = None
    newly_unlocked: Optional[List[str]] = None
    auto_applied: Optional[str] = None
    unlock_timestamp: Optional[str] = None

class ThemeAccessRequest(BaseModel):
    user_id: str
    theme_id: str

class ThemeValidationResponse(BaseModel):
    has_access: bool
    theme_name: Optional[str] = None
    required_tier: Optional[str] = None

@app.post("/api/subscription/process")
async def process_subscription(payment_request: PaymentRequest, background_tasks: BackgroundTasks):
    """Process a subscription payment and immediately unlock themes"""
    try:
        # Validate payment data (in production, integrate with payment processor)
        if not payment_request.card_number or len(payment_request.card_number) < 16:
            raise HTTPException(status_code=400, detail="Invalid card number")
        
        if not payment_request.card_name.strip():
            raise HTTPException(status_code=400, detail="Card name is required")
        
        if payment_request.plan not in ["monthly", "yearly"]:
            raise HTTPException(status_code=400, detail="Invalid subscription plan")
        
        # Simulate payment processing
        payment_data = {
            'transaction_id': f"TXN-{payment_request.user_id}-{hash(payment_request.card_number[-4:])}",
            'amount': 99.99 if payment_request.plan == "yearly" else 9.99,
            'currency': 'USD',
            'card_last_four': payment_request.card_number[-4:],
            'cardholder_name': payment_request.card_name
        }
        
        # Process subscription and unlock themes immediately
        result = subscription_service.process_subscription(
            payment_request.user_id, 
            payment_request.plan, 
            payment_data
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        
        # Return immediate response with unlocked themes
        return {
            "success": True,
            "message": result.message,
            "subscription": {
                "tier": result.subscription.tier.value,
                "start_date": result.subscription.start_date.isoformat(),
                "end_date": result.subscription.end_date.isoformat(),
                "transaction_id": result.subscription.transaction_id
            },
            "unlocked_themes": [
                {
                    "id": theme.id,
                    "name": theme.name,
                    "description": theme.description,
                    "colors": theme.colors,
                    "tier": theme.tier.value
                }
                for theme in result.unlocked_themes
            ],
            "auto_applied_theme": {
                "id": result.auto_applied_theme.id,
                "name": result.auto_applied_theme.name,
                "description": result.auto_applied_theme.description,
                "colors": result.auto_applied_theme.colors,
                "tier": result.auto_applied_theme.tier.value
            } if result.auto_applied_theme else None,
            "total_available_themes": len(subscription_service.get_themes_for_tier(result.subscription.tier))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription processing failed: {str(e)}")

@app.get("/api/subscription/status/{user_id}")
async def get_subscription_status(user_id: str):
    """Get current subscription status and available themes for a user"""
    try:
        status = subscription_service.get_user_subscription_status(user_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get subscription status: {str(e)}")

@app.post("/api/themes/validate-access")
async def validate_theme_access(request: ThemeAccessRequest):
    """Validate if a user has access to a specific theme"""
    try:
        has_access = subscription_service.validate_theme_access(request.user_id, request.theme_id)
        
        theme = subscription_service.themes.get(request.theme_id)
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        return ThemeValidationResponse(
            has_access=has_access,
            theme_name=theme.name,
            required_tier=theme.tier.value
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Theme validation failed: {str(e)}")

@app.get("/api/themes/available/{user_id}")
async def get_available_themes(user_id: str):
    """Get all themes available to a user based on their subscription"""
    try:
        status = subscription_service.get_user_subscription_status(user_id)
        return {
            "available_themes": status["available_themes"],
            "total_themes": status["total_themes"],
            "subscription_tier": status["tier"],
            "is_premium": status["is_premium"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get available themes: {str(e)}")

@app.get("/api/themes/all")
async def get_all_themes():
    """Get all themes with their tier requirements"""
    try:
        all_themes = []
        for theme in subscription_service.themes.values():
            all_themes.append({
                "id": theme.id,
                "name": theme.name,
                "description": theme.description,
                "colors": theme.colors,
                "tier": theme.tier.value
            })
        return {"themes": all_themes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get themes: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "subscription-api"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
