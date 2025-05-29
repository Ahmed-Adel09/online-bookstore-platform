"""
User Database and Authentication System
"""
import json
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
import os

@dataclass
class User:
    id: str
    email: str
    password_hash: str
    first_name: str
    last_name: str
    is_premium: bool = False
    premium_plan: Optional[str] = None
    created_at: str = ""
    last_login: Optional[str] = None
    is_active: bool = True
    role: str = "user"

@dataclass
class PromoCode:
    code: str
    discount_percentage: float
    discount_amount: Optional[float] = None
    valid_from: str = ""
    valid_until: str = ""
    usage_limit: Optional[int] = None
    used_count: int = 0
    is_active: bool = True
    applicable_to: str = "all"  # "all", "physical", "ebook"
    minimum_order: float = 0.0

class UserDatabase:
    def __init__(self, db_file: str = "users.json"):
        self.db_file = db_file
        self.users: Dict[str, User] = {}
        self.promo_codes: Dict[str, PromoCode] = {}
        self.load_database()
        self.create_demo_admin()
        self.initialize_promo_codes()

    def load_database(self):
        """Load users from JSON file"""
        try:
            if os.path.exists(self.db_file):
                with open(self.db_file, 'r') as f:
                    data = json.load(f)
                    for user_data in data.get('users', []):
                        user = User(**user_data)
                        self.users[user.email.lower()] = user
                    
                    for promo_data in data.get('promo_codes', []):
                        promo = PromoCode(**promo_data)
                        self.promo_codes[promo.code.upper()] = promo
            else:
                # Initialize empty database
                self.save_database()
        except Exception as e:
            print(f"Error loading database: {e}")
            # Initialize empty database on error
            self.save_database()

    def save_database(self):
        """Save users to JSON file"""
        try:
            data = {
                'users': [asdict(user) for user in self.users.values()],
                'promo_codes': [asdict(promo) for promo in self.promo_codes.values()]
            }
            with open(self.db_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving database: {e}")

    def create_demo_admin(self):
        """Create demo admin user if it doesn't exist"""
        demo_email = "demo@bookhaven.com"
        
        if demo_email not in self.users:
            demo_user = User(
                id="demo-admin-001",
                email=demo_email,
                password_hash=self.hash_password("demo123"),
                first_name="Demo",
                last_name="Admin",
                is_premium=True,
                premium_plan="yearly",
                created_at=datetime.now().isoformat(),
                role="admin"
            )
            self.users[demo_email] = demo_user
            self.save_database()
            
            print(f"=== DEMO ADMIN CREATED ===")
            print(f"Email: {demo_email}")
            print(f"Password: demo123")
            print(f"Role: admin")
            print(f"=== END DEMO ADMIN ===")

    def initialize_promo_codes(self):
        """Initialize promotional codes"""
        if not self.promo_codes:
            # DRSHIMA code - 100% discount
            drshima_code = PromoCode(
                code="DRSHIMA",
                discount_percentage=100.0,
                valid_from=datetime.now().isoformat(),
                valid_until=(datetime.now() + timedelta(days=365)).isoformat(),
                usage_limit=None,  # Unlimited usage
                is_active=True,
                applicable_to="all",
                minimum_order=0.0
            )
            self.promo_codes["DRSHIMA"] = drshima_code

            # Additional promo codes
            welcome_code = PromoCode(
                code="WELCOME10",
                discount_percentage=10.0,
                valid_from=datetime.now().isoformat(),
                valid_until=(datetime.now() + timedelta(days=30)).isoformat(),
                usage_limit=100,
                is_active=True,
                applicable_to="all",
                minimum_order=25.0
            )
            self.promo_codes["WELCOME10"] = welcome_code

            student_code = PromoCode(
                code="STUDENT20",
                discount_percentage=20.0,
                valid_from=datetime.now().isoformat(),
                valid_until=(datetime.now() + timedelta(days=90)).isoformat(),
                usage_limit=500,
                is_active=True,
                applicable_to="all",
                minimum_order=15.0
            )
            self.promo_codes["STUDENT20"] = student_code

            self.save_database()

    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return self.hash_password(password) == password_hash

    def register_user(self, email: str, password: str, first_name: str, last_name: str) -> Dict:
        """Register a new user"""
        try:
            email = email.lower().strip()
            
            # Prevent registration with demo admin email
            if email == "demo@bookhaven.com":
                return {
                    "success": False,
                    "error": "This email address is reserved for administrative purposes"
                }
            
            # Check if user already exists
            if email in self.users:
                return {
                    "success": False,
                    "error": "User with this email already exists"
                }

            # Validate email format
            if "@" not in email or "." not in email:
                return {
                    "success": False,
                    "error": "Invalid email format"
                }

            # Validate password strength
            if len(password) < 6:
                return {
                    "success": False,
                    "error": "Password must be at least 6 characters long"
                }

            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=self.hash_password(password),
                first_name=first_name.strip(),
                last_name=last_name.strip(),
                created_at=datetime.now().isoformat()
            )

            self.users[email] = user
            self.save_database()

            print(f"=== USER REGISTERED ===")
            print(f"Email: {email}")
            print(f"Name: {first_name} {last_name}")
            print(f"User ID: {user.id}")
            print(f"=== END REGISTRATION ===")

            return {
                "success": True,
                "user_id": user.id,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_premium": user.is_premium,
                    "premium_plan": user.premium_plan,
                    "role": user.role
                },
                "message": "User registered successfully"
            }

        except Exception as e:
            print(f"Registration error: {e}")
            return {
                "success": False,
                "error": f"Registration failed: {str(e)}"
            }

    def authenticate_user(self, email: str, password: str) -> Dict:
        """Authenticate user login"""
        try:
            email = email.lower().strip()
            
            # Check if user exists
            if email not in self.users:
                return {
                    "success": False,
                    "error": "Invalid email or password"
                }

            user = self.users[email]

            # Check if user is active
            if not user.is_active:
                return {
                    "success": False,
                    "error": "Account is deactivated"
                }

            # Verify password
            if not self.verify_password(password, user.password_hash):
                return {
                    "success": False,
                    "error": "Invalid email or password"
                }

            # Update last login
            user.last_login = datetime.now().isoformat()
            self.save_database()

            print(f"=== USER LOGIN ===")
            print(f"Email: {email}")
            print(f"Name: {user.first_name} {user.last_name}")
            print(f"Role: {user.role}")
            print(f"Premium: {user.is_premium}")
            print(f"=== END LOGIN ===")

            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_premium": user.is_premium,
                    "premium_plan": user.premium_plan,
                    "role": user.role
                },
                "message": "Login successful"
            }

        except Exception as e:
            print(f"Authentication error: {e}")
            return {
                "success": False,
                "error": f"Authentication failed: {str(e)}"
            }

    def validate_promo_code(self, code: str, order_total: float, cart_items: List = None) -> Dict:
        """Validate and apply promotional code"""
        try:
            code = code.upper().strip()
            
            if code not in self.promo_codes:
                return {
                    "success": False,
                    "error": "Invalid promotional code"
                }

            promo = self.promo_codes[code]

            # Check if code is active
            if not promo.is_active:
                return {
                    "success": False,
                    "error": "This promotional code is no longer active"
                }

            # Check validity dates
            now = datetime.now()
            if promo.valid_from and datetime.fromisoformat(promo.valid_from) > now:
                return {
                    "success": False,
                    "error": "This promotional code is not yet valid"
                }

            if promo.valid_until and datetime.fromisoformat(promo.valid_until) < now:
                return {
                    "success": False,
                    "error": "This promotional code has expired"
                }

            # Check usage limit
            if promo.usage_limit and promo.used_count >= promo.usage_limit:
                return {
                    "success": False,
                    "error": "This promotional code has reached its usage limit"
                }

            # Check minimum order amount
            if order_total < promo.minimum_order:
                return {
                    "success": False,
                    "error": f"Minimum order amount of ${promo.minimum_order:.2f} required for this code"
                }

            # Calculate discount
            if promo.discount_amount:
                discount = min(promo.discount_amount, order_total)
            else:
                discount = order_total * (promo.discount_percentage / 100)

            # Ensure discount doesn't exceed order total
            discount = min(discount, order_total)

            print(f"=== PROMO CODE APPLIED ===")
            print(f"Code: {code}")
            print(f"Discount: {promo.discount_percentage}%")
            print(f"Order Total: ${order_total:.2f}")
            print(f"Discount Amount: ${discount:.2f}")
            print(f"=== END PROMO ===")

            return {
                "success": True,
                "code": code,
                "discount_percentage": promo.discount_percentage,
                "discount_amount": discount,
                "final_total": max(0, order_total - discount),
                "message": f"Promotional code applied! {promo.discount_percentage}% discount"
            }

        except Exception as e:
            print(f"Promo code validation error: {e}")
            return {
                "success": False,
                "error": f"Error validating promotional code: {str(e)}"
            }

    def use_promo_code(self, code: str) -> bool:
        """Mark promo code as used"""
        try:
            code = code.upper().strip()
            if code in self.promo_codes:
                self.promo_codes[code].used_count += 1
                self.save_database()
                return True
            return False
        except Exception as e:
            print(f"Error using promo code: {e}")
            return False

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.users.get(email.lower().strip())

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        for user in self.users.values():
            if user.id == user_id:
                return user
        return None

    def update_user_premium_status(self, email: str, is_premium: bool, plan: str = None) -> bool:
        """Update user's premium status"""
        try:
            email = email.lower().strip()
            if email in self.users:
                self.users[email].is_premium = is_premium
                if plan:
                    self.users[email].premium_plan = plan
                self.save_database()
                return True
            return False
        except Exception as e:
            print(f"Error updating premium status: {e}")
            return False

    def list_all_users(self) -> List[Dict]:
        """List all users (for admin purposes)"""
        return [
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_premium": user.is_premium,
                "premium_plan": user.premium_plan,
                "created_at": user.created_at,
                "last_login": user.last_login,
                "role": user.role
            }
            for user in self.users.values()
        ]

# Global database instance
user_db = UserDatabase()

# Example usage and testing
if __name__ == "__main__":
    db = UserDatabase()
    
    # Test registration
    result = db.register_user("john@example.com", "password123", "John", "Doe")
    print(f"Registration result: {result}")
    
    # Test authentication
    auth_result = db.authenticate_user("john@example.com", "password123")
    print(f"Authentication result: {auth_result}")
    
    # Test demo admin
    demo_result = db.authenticate_user("demo@bookhaven.com", "demo123")
    print(f"Demo admin result: {demo_result}")
    
    # Test promo code
    promo_result = db.validate_promo_code("DRSHIMA", 50.0)
    print(f"Promo code result: {promo_result}")
    
    # List users
    users = db.list_all_users()
    print(f"Total users: {len(users)}")
