"""
Subscription Service - Handles premium subscriptions and theme unlocking
"""
import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class SubscriptionTier(Enum):
    FREE = "free"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class ThemeTier(Enum):
    FREE = "free"
    MONTHLY = "monthly"
    YEARLY = "yearly"

@dataclass
class Theme:
    id: str
    name: str
    description: str
    colors: List[str]
    tier: ThemeTier
    
@dataclass
class Subscription:
    user_id: str
    tier: SubscriptionTier
    start_date: datetime.datetime
    end_date: datetime.datetime
    auto_renew: bool = True
    transaction_id: Optional[str] = None

@dataclass
class SubscriptionResponse:
    success: bool
    subscription: Optional[Subscription]
    unlocked_themes: List[Theme]
    auto_applied_theme: Optional[Theme]
    message: str

class SubscriptionService:
    def __init__(self):
        # Define all available themes
        self.themes = {
            "light": Theme("light", "Light", "Clean and bright default theme", 
                          ["#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6"], ThemeTier.FREE),
            "dark": Theme("dark", "Dark", "Easy on the eyes default dark theme", 
                         ["#1a1a1a", "#2d2d2d", "#404040", "#666666"], ThemeTier.FREE),
            "midnight": Theme("midnight", "Midnight", "A deeper dark theme with blue and purple hues", 
                             ["#0f172a", "#1e293b", "#334155", "#94a3b8"], ThemeTier.MONTHLY),
            "retro-storm": Theme("retro-storm", "Retro Storm", "Inspired by old-school tech and CRT monitors", 
                               ["#0a0a0a", "#003300", "#00ff00", "#66ff66"], ThemeTier.MONTHLY),
            "crimson-moon": Theme("crimson-moon", "Crimson Moon", "A red-toned dark theme with a moody aesthetic", 
                                 ["#1a0505", "#2d0a0a", "#4a0f0f", "#8c1c1c"], ThemeTier.MONTHLY),
            "sunset": Theme("sunset", "Sunset", "Warm orange and pink gradient hues for a cozy feel", 
                           ["#7d2a2a", "#a73e3e", "#cf6a6a", "#f8a170"], ThemeTier.YEARLY),
            "forest": Theme("forest", "Forest", "Earthy green theme, calming for long reading sessions", 
                           ["#0f2417", "#1e3a2f", "#2d5646", "#4a7c64"], ThemeTier.YEARLY),
            "amoled-dark": Theme("amoled-dark", "AMOLED Dark", "Pure dark background for OLED screens", 
                               ["#000000", "#0a0a0a", "#1a1a1a", "#2a2a2a"], ThemeTier.YEARLY),
            "ocean-breeze": Theme("ocean-breeze", "Ocean Breeze", "Cool blue tones inspired by ocean waves", 
                                 ["#0c4a6e", "#0369a1", "#0284c7", "#38bdf8"], ThemeTier.YEARLY),
            "golden-hour": Theme("golden-hour", "Golden Hour", "Warm golden tones perfect for evening reading", 
                                ["#451a03", "#92400e", "#d97706", "#fbbf24"], ThemeTier.YEARLY),
        }
        
        # In-memory storage (in production, use a proper database)
        self.subscriptions = {}
        self.user_themes = {}
    
    def get_themes_for_tier(self, tier: SubscriptionTier) -> List[Theme]:
        """Get all themes available for a subscription tier"""
        available_themes = []
        
        # Free themes are always available
        available_themes.extend([theme for theme in self.themes.values() if theme.tier == ThemeTier.FREE])
        
        # Monthly themes for monthly and yearly subscribers
        if tier in [SubscriptionTier.MONTHLY, SubscriptionTier.YEARLY]:
            available_themes.extend([theme for theme in self.themes.values() if theme.tier == ThemeTier.MONTHLY])
        
        # Yearly themes only for yearly subscribers
        if tier == SubscriptionTier.YEARLY:
            available_themes.extend([theme for theme in self.themes.values() if theme.tier == ThemeTier.YEARLY])
        
        return available_themes
    
    def get_newly_unlocked_themes(self, old_tier: SubscriptionTier, new_tier: SubscriptionTier) -> List[Theme]:
        """Get themes that are newly unlocked when upgrading from old_tier to new_tier"""
        old_themes = set(theme.id for theme in self.get_themes_for_tier(old_tier))
        new_themes = set(theme.id for theme in self.get_themes_for_tier(new_tier))
        newly_unlocked_ids = new_themes - old_themes
        
        return [self.themes[theme_id] for theme_id in newly_unlocked_ids]
    
    def process_subscription(self, user_id: str, tier: str, payment_data: Dict) -> SubscriptionResponse:
        """Process a new subscription and unlock themes immediately"""
        try:
            # Validate subscription tier
            subscription_tier = SubscriptionTier(tier)
            
            # Get current subscription (if any)
            current_subscription = self.subscriptions.get(user_id)
            old_tier = current_subscription.tier if current_subscription else SubscriptionTier.FREE
            
            # Calculate subscription dates
            start_date = datetime.datetime.now()
            if subscription_tier == SubscriptionTier.YEARLY:
                end_date = start_date + datetime.timedelta(days=365)
            else:  # MONTHLY
                end_date = start_date + datetime.timedelta(days=30)
            
            # Create new subscription
            new_subscription = Subscription(
                user_id=user_id,
                tier=subscription_tier,
                start_date=start_date,
                end_date=end_date,
                transaction_id=payment_data.get('transaction_id')
            )
            
            # Store subscription
            self.subscriptions[user_id] = new_subscription
            
            # Get all available themes for new tier
            all_available_themes = self.get_themes_for_tier(subscription_tier)
            
            # Get newly unlocked themes
            newly_unlocked_themes = self.get_newly_unlocked_themes(old_tier, subscription_tier)
            
            # Auto-apply the first newly unlocked theme (if any)
            auto_applied_theme = newly_unlocked_themes[0] if newly_unlocked_themes else None
            
            # Update user's available themes
            self.user_themes[user_id] = {
                'available_themes': [theme.id for theme in all_available_themes],
                'newly_unlocked': [theme.id for theme in newly_unlocked_themes],
                'auto_applied': auto_applied_theme.id if auto_applied_theme else None,
                'subscription_tier': subscription_tier.value,
                'unlock_timestamp': start_date.isoformat()
            }
            
            # Log the successful subscription
            print(f"=== SUBSCRIPTION PROCESSED ===")
            print(f"User ID: {user_id}")
            print(f"Tier: {subscription_tier.value}")
            print(f"Total Themes Unlocked: {len(all_available_themes)}")
            print(f"Newly Unlocked Themes: {[t.name for t in newly_unlocked_themes]}")
            print(f"Auto-Applied Theme: {auto_applied_theme.name if auto_applied_theme else 'None'}")
            print(f"Transaction ID: {payment_data.get('transaction_id')}")
            print(f"=== END SUBSCRIPTION LOG ===")
            
            return SubscriptionResponse(
                success=True,
                subscription=new_subscription,
                unlocked_themes=newly_unlocked_themes,
                auto_applied_theme=auto_applied_theme,
                message=f"Successfully activated {subscription_tier.value} subscription with {len(newly_unlocked_themes)} new themes!"
            )
            
        except Exception as e:
            print(f"Subscription processing error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription=None,
                unlocked_themes=[],
                auto_applied_theme=None,
                message=f"Failed to process subscription: {str(e)}"
            )
    
    def get_user_subscription_status(self, user_id: str) -> Dict:
        """Get current subscription status and available themes for a user"""
        subscription = self.subscriptions.get(user_id)
        user_theme_data = self.user_themes.get(user_id, {})
        
        if not subscription:
            # Free user
            free_themes = self.get_themes_for_tier(SubscriptionTier.FREE)
            return {
                'tier': 'free',
                'is_premium': False,
                'available_themes': [asdict(theme) for theme in free_themes],
                'total_themes': len(free_themes),
                'subscription_active': False
            }
        
        # Check if subscription is still active
        now = datetime.datetime.now()
        is_active = now <= subscription.end_date
        
        if not is_active:
            # Expired subscription - revert to free
            free_themes = self.get_themes_for_tier(SubscriptionTier.FREE)
            return {
                'tier': 'free',
                'is_premium': False,
                'available_themes': [asdict(theme) for theme in free_themes],
                'total_themes': len(free_themes),
                'subscription_active': False,
                'expired': True
            }
        
        # Active subscription
        available_themes = self.get_themes_for_tier(subscription.tier)
        
        return {
            'tier': subscription.tier.value,
            'is_premium': True,
            'available_themes': [asdict(theme) for theme in available_themes],
            'total_themes': len(available_themes),
            'subscription_active': True,
            'end_date': subscription.end_date.isoformat(),
            'newly_unlocked': user_theme_data.get('newly_unlocked', []),
            'auto_applied': user_theme_data.get('auto_applied'),
            'unlock_timestamp': user_theme_data.get('unlock_timestamp')
        }
    
    def validate_theme_access(self, user_id: str, theme_id: str) -> bool:
        """Validate if a user has access to a specific theme"""
        if theme_id not in self.themes:
            return False
        
        subscription = self.subscriptions.get(user_id)
        if not subscription:
            # Free user - only free themes
            return self.themes[theme_id].tier == ThemeTier.FREE
        
        # Check if subscription is active
        now = datetime.datetime.now()
        if now > subscription.end_date:
            # Expired - only free themes
            return self.themes[theme_id].tier == ThemeTier.FREE
        
        # Active subscription - check tier access
        available_themes = self.get_themes_for_tier(subscription.tier)
        return any(theme.id == theme_id for theme in available_themes)

# Example usage and testing
if __name__ == "__main__":
    service = SubscriptionService()
    
    # Test subscription processing
    payment_data = {
        'transaction_id': 'TXN-123456789',
        'amount': 99.99,
        'currency': 'USD'
    }
    
    # Process yearly subscription
    result = service.process_subscription('user123', 'yearly', payment_data)
    print(f"Subscription Result: {result.success}")
    print(f"Message: {result.message}")
    print(f"Unlocked Themes: {[t.name for t in result.unlocked_themes]}")
    print(f"Auto-Applied: {result.auto_applied_theme.name if result.auto_applied_theme else 'None'}")
    
    # Check user status
    status = service.get_user_subscription_status('user123')
    print(f"\nUser Status: {json.dumps(status, indent=2)}")
    
    # Test theme access validation
    print(f"\nTheme Access Tests:")
    print(f"Can access 'sunset': {service.validate_theme_access('user123', 'sunset')}")
    print(f"Can access 'light': {service.validate_theme_access('user123', 'light')}")
