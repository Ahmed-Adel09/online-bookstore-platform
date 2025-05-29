"""
Authentication and Promo Code API Server
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uvicorn
from user_database import user_db

app = FastAPI(title="BookHaven Auth API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PromoCodeValidation(BaseModel):
    code: str
    order_total: float
    cart_items: Optional[List] = None

class PremiumUpdate(BaseModel):
    email: EmailStr
    is_premium: bool
    plan: Optional[str] = None

# Authentication endpoints
@app.post("/api/auth/register")
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    result = user_db.register_user(
        user_data.email,
        user_data.password,
        user_data.first_name,
        user_data.last_name
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@app.post("/api/auth/login")
async def login_user(login_data: UserLogin):
    """Authenticate user login"""
    result = user_db.authenticate_user(login_data.email, login_data.password)
    
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    
    return result

@app.get("/api/auth/user/{email}")
async def get_user(email: str):
    """Get user information by email"""
    user = user_db.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_premium": user.is_premium,
        "premium_plan": user.premium_plan,
        "role": user.role
    }

# Promo code endpoints
@app.post("/api/promo/validate")
async def validate_promo_code(promo_data: PromoCodeValidation):
    """Validate a promotional code"""
    result = user_db.validate_promo_code(
        promo_data.code,
        promo_data.order_total,
        promo_data.cart_items
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@app.post("/api/promo/use/{code}")
async def use_promo_code(code: str):
    """Mark a promo code as used"""
    success = user_db.use_promo_code(code)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to use promo code")
    
    return {"success": True, "message": "Promo code used successfully"}

@app.get("/api/promo/codes")
async def list_promo_codes():
    """List all available promo codes (for admin)"""
    return {
        "promo_codes": [
            {
                "code": promo.code,
                "discount_percentage": promo.discount_percentage,
                "discount_amount": promo.discount_amount,
                "valid_from": promo.valid_from,
                "valid_until": promo.valid_until,
                "usage_limit": promo.usage_limit,
                "used_count": promo.used_count,
                "is_active": promo.is_active,
                "minimum_order": promo.minimum_order
            }
            for promo in user_db.promo_codes.values()
        ]
    }

# Premium status endpoints
@app.post("/api/auth/premium/update")
async def update_premium_status(premium_data: PremiumUpdate):
    """Update user's premium status"""
    success = user_db.update_user_premium_status(
        premium_data.email,
        premium_data.is_premium,
        premium_data.plan
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update premium status")
    
    return {"success": True, "message": "Premium status updated successfully"}

# Admin endpoints
@app.get("/api/admin/users")
async def list_users():
    """List all users (admin only)"""
    return {"users": user_db.list_all_users()}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Auth API is running"}

if __name__ == "__main__":
    print("Starting BookHaven Auth API server...")
    print("Available endpoints:")
    print("- POST /api/auth/register - Register new user")
    print("- POST /api/auth/login - User login")
    print("- GET /api/auth/user/{email} - Get user info")
    print("- POST /api/promo/validate - Validate promo code")
    print("- POST /api/promo/use/{code} - Use promo code")
    print("- GET /api/promo/codes - List promo codes")
    print("- POST /api/auth/premium/update - Update premium status")
    print("- GET /api/admin/users - List all users")
    
    uvicorn.run(app, host="0.0.0.0", port=8002)
