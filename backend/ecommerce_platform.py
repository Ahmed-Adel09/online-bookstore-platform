"""
Comprehensive E-commerce Platform for Physical and Digital Books
"""
import json
import datetime
import uuid
import hashlib
from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import math

class BookType(Enum):
    PHYSICAL = "physical"
    EBOOK = "ebook"
    BOTH = "both"

class ShippingMethod(Enum):
    STANDARD = "standard"
    EXPEDITED = "expedited"
    OVERNIGHT = "overnight"
    INTERNATIONAL = "international"

class PaymentMethod(Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"

class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"

class EbookFormat(Enum):
    EPUB = "epub"
    PDF = "pdf"
    MOBI = "mobi"

@dataclass
class ShippingAddress:
    first_name: str
    last_name: str
    street_address: str
    apartment: str = ""
    city: str = ""
    state: str = ""
    postal_code: str = ""
    country: str = "United States"
    phone: str = ""

@dataclass
class PaymentInfo:
    method: PaymentMethod
    card_number: str = ""
    card_name: str = ""
    expiry: str = ""
    cvc: str = ""
    billing_address: Optional[ShippingAddress] = None

@dataclass
class ShippingOption:
    method: ShippingMethod
    name: str
    description: str
    base_cost: float
    delivery_days: str
    international_available: bool = False

@dataclass
class Book:
    id: str
    title: str
    author: str
    isbn: str
    price: float
    book_type: BookType
    stock_quantity: int = 0
    weight_oz: float = 8.0  # Average book weight
    digital_formats: List[EbookFormat] = None
    file_size_mb: float = 2.5
    cover_image: str = ""
    description: str = ""

@dataclass
class CartItem:
    book: Book
    quantity: int
    selected_format: Optional[EbookFormat] = None

@dataclass
class Order:
    id: str
    user_id: str
    items: List[CartItem]
    shipping_address: Optional[ShippingAddress]
    payment_info: PaymentInfo
    shipping_method: Optional[ShippingMethod]
    subtotal: float
    shipping_cost: float
    tax: float
    total: float
    status: OrderStatus
    created_at: datetime.datetime
    tracking_number: str = ""
    digital_downloads: List[str] = None

class EcommercePlatform:
    def __init__(self):
        # Shipping options configuration
        self.shipping_options = {
            ShippingMethod.STANDARD: ShippingOption(
                ShippingMethod.STANDARD,
                "Standard Shipping",
                "3-5 business days",
                4.99,
                "3-5 business days"
            ),
            ShippingMethod.EXPEDITED: ShippingOption(
                ShippingMethod.EXPEDITED,
                "Expedited Shipping",
                "1-2 business days",
                9.99,
                "1-2 business days"
            ),
            ShippingMethod.OVERNIGHT: ShippingOption(
                ShippingMethod.OVERNIGHT,
                "Overnight Shipping",
                "Next business day",
                19.99,
                "Next business day"
            ),
            ShippingMethod.INTERNATIONAL: ShippingOption(
                ShippingMethod.INTERNATIONAL,
                "International Shipping",
                "7-14 business days",
                24.99,
                "7-14 business days",
                True
            )
        }
        
        # Sample book catalog
        self.books = {
            "book1": Book(
                "book1", "The Midnight Library", "Matt Haig", "978-0525559474", 14.99,
                BookType.BOTH, 50, 7.2, [EbookFormat.EPUB, EbookFormat.PDF], 2.1
            ),
            "book2": Book(
                "book2", "Atomic Habits", "James Clear", "978-0735211292", 16.99,
                BookType.PHYSICAL, 75, 8.5
            ),
            "book3": Book(
                "book3", "Digital Marketing Guide", "Tech Author", "978-1234567890", 9.99,
                BookType.EBOOK, 999, 0, [EbookFormat.EPUB, EbookFormat.PDF, EbookFormat.MOBI], 3.2
            )
        }
        
        # In-memory storage (use database in production)
        self.orders = {}
        self.inventory = {}
        self.digital_library = {}
        
        # Initialize inventory
        for book_id, book in self.books.items():
            self.inventory[book_id] = book.stock_quantity

    def calculate_shipping_cost(self, items: List[CartItem], shipping_method: ShippingMethod, 
                              destination_country: str = "United States") -> Dict:
        """Calculate shipping cost based on items, method, and destination"""
        
        # Filter physical books only
        physical_items = [item for item in items if item.book.book_type in [BookType.PHYSICAL, BookType.BOTH]]
        
        if not physical_items:
            return {
                "cost": 0.0,
                "method": "digital_delivery",
                "description": "Digital delivery - no shipping required",
                "delivery_estimate": "Immediate"
            }
        
        # Check if international shipping is needed
        is_international = destination_country.lower() != "united states"
        
        if is_international and shipping_method != ShippingMethod.INTERNATIONAL:
            return {
                "error": "International shipping required for this destination",
                "available_methods": ["international"]
            }
        
        # Get base shipping cost
        shipping_option = self.shipping_options[shipping_method]
        base_cost = shipping_option.base_cost
        
        # Calculate total weight
        total_weight = sum(item.book.weight_oz * item.quantity for item in physical_items)
        
        # Weight-based pricing (additional cost for heavy orders)
        if total_weight > 32:  # 2 pounds
            weight_surcharge = math.ceil((total_weight - 32) / 16) * 2.99
            base_cost += weight_surcharge
        
        # International surcharge
        if is_international:
            base_cost += 15.00
        
        # Free shipping threshold
        subtotal = sum(item.book.price * item.quantity for item in physical_items)
        if subtotal >= 35 and shipping_method == ShippingMethod.STANDARD and not is_international:
            base_cost = 0.0
        
        return {
            "cost": round(base_cost, 2),
            "method": shipping_option.name,
            "description": shipping_option.description,
            "delivery_estimate": shipping_option.delivery_days,
            "weight_oz": total_weight,
            "free_shipping_eligible": subtotal >= 35 and not is_international
        }

    def validate_payment(self, payment_info: PaymentInfo) -> Dict:
        """Validate payment information"""
        errors = []
        
        if payment_info.method == PaymentMethod.CREDIT_CARD:
            if not payment_info.card_number or len(payment_info.card_number.replace(" ", "")) < 13:
                errors.append("Invalid card number")
            
            if not payment_info.card_name or len(payment_info.card_name.strip()) < 2:
                errors.append("Card name is required")
            
            if not payment_info.expiry or len(payment_info.expiry) != 5:
                errors.append("Invalid expiry date (MM/YY)")
            
            if not payment_info.cvc or len(payment_info.cvc) < 3:
                errors.append("Invalid CVC")
        
        # Simulate payment processing
        if not errors:
            # In production, integrate with payment processor
            transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
            return {
                "success": True,
                "transaction_id": transaction_id,
                "message": "Payment processed successfully"
            }
        
        return {
            "success": False,
            "errors": errors,
            "message": "Payment validation failed"
        }

    def check_inventory(self, items: List[CartItem]) -> Dict:
        """Check if all items are in stock"""
        availability = {}
        all_available = True
        
        for item in items:
            book_id = item.book.id
            current_stock = self.inventory.get(book_id, 0)
            
            # E-books have unlimited stock
            if item.book.book_type == BookType.EBOOK:
                availability[book_id] = {
                    "available": True,
                    "requested": item.quantity,
                    "in_stock": 999,
                    "type": "digital"
                }
            else:
                is_available = current_stock >= item.quantity
                availability[book_id] = {
                    "available": is_available,
                    "requested": item.quantity,
                    "in_stock": current_stock,
                    "type": "physical"
                }
                
                if not is_available:
                    all_available = False
        
        return {
            "all_available": all_available,
            "items": availability
        }

    def process_order(self, user_id: str, items: List[CartItem], 
                     shipping_address: Optional[ShippingAddress], 
                     payment_info: PaymentInfo,
                     shipping_method: Optional[ShippingMethod] = None) -> Dict:
        """Process a complete order"""
        
        try:
            # Generate order ID
            order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
            
            # Check inventory
            inventory_check = self.check_inventory(items)
            if not inventory_check["all_available"]:
                return {
                    "success": False,
                    "error": "Some items are out of stock",
                    "inventory": inventory_check
                }
            
            # Validate payment
            payment_result = self.validate_payment(payment_info)
            if not payment_result["success"]:
                return {
                    "success": False,
                    "error": "Payment validation failed",
                    "payment_errors": payment_result.get("errors", [])
                }
            
            # Calculate costs
            subtotal = sum(item.book.price * item.quantity for item in items)
            
            # Calculate shipping for physical items
            shipping_cost = 0.0
            if shipping_method and any(item.book.book_type in [BookType.PHYSICAL, BookType.BOTH] for item in items):
                shipping_calc = self.calculate_shipping_cost(
                    items, shipping_method, 
                    shipping_address.country if shipping_address else "United States"
                )
                if "error" in shipping_calc:
                    return {
                        "success": False,
                        "error": shipping_calc["error"]
                    }
                shipping_cost = shipping_calc["cost"]
            
            # Calculate tax (8% for demonstration)
            tax = subtotal * 0.08
            total = subtotal + shipping_cost + tax
            
            # Create order
            order = Order(
                id=order_id,
                user_id=user_id,
                items=items,
                shipping_address=shipping_address,
                payment_info=payment_info,
                shipping_method=shipping_method,
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                tax=tax,
                total=total,
                status=OrderStatus.CONFIRMED,
                created_at=datetime.datetime.now(),
                tracking_number=f"TRK-{uuid.uuid4().hex[:10].upper()}" if shipping_method else "",
                digital_downloads=[]
            )
            
            # Update inventory for physical books
            for item in items:
                if item.book.book_type in [BookType.PHYSICAL, BookType.BOTH]:
                    self.inventory[item.book.id] -= item.quantity
            
            # Generate digital download links for e-books
            digital_downloads = []
            for item in items:
                if item.book.book_type in [BookType.EBOOK, BookType.BOTH]:
                    for format_type in item.book.digital_formats or []:
                        download_token = hashlib.sha256(f"{order_id}-{item.book.id}-{format_type.value}".encode()).hexdigest()
                        digital_downloads.append({
                            "book_id": item.book.id,
                            "book_title": item.book.title,
                            "format": format_type.value,
                            "download_url": f"/api/download/{download_token}",
                            "expires_at": (datetime.datetime.now() + datetime.timedelta(days=30)).isoformat()
                        })
            
            order.digital_downloads = digital_downloads
            
            # Store order
            self.orders[order_id] = order
            
            # Log successful order
            print(f"=== ORDER PROCESSED ===")
            print(f"Order ID: {order_id}")
            print(f"User ID: {user_id}")
            print(f"Items: {len(items)}")
            print(f"Subtotal: ${subtotal:.2f}")
            print(f"Shipping: ${shipping_cost:.2f}")
            print(f"Tax: ${tax:.2f}")
            print(f"Total: ${total:.2f}")
            print(f"Digital Downloads: {len(digital_downloads)}")
            print(f"Transaction ID: {payment_result['transaction_id']}")
            print(f"=== END ORDER LOG ===")
            
            return {
                "success": True,
                "order_id": order_id,
                "transaction_id": payment_result["transaction_id"],
                "total": total,
                "digital_downloads": digital_downloads,
                "tracking_number": order.tracking_number,
                "estimated_delivery": self._get_delivery_estimate(shipping_method),
                "message": "Order processed successfully"
            }
            
        except Exception as e:
            print(f"Order processing error: {str(e)}")
            return {
                "success": False,
                "error": f"Order processing failed: {str(e)}"
            }

    def track_order(self, order_id: str) -> Dict:
        """Get order tracking information"""
        order = self.orders.get(order_id)
        if not order:
            return {
                "success": False,
                "error": "Order not found"
            }
        
        # Simulate tracking updates
        tracking_events = self._generate_tracking_events(order)
        
        return {
            "success": True,
            "order_id": order_id,
            "status": order.status.value,
            "tracking_number": order.tracking_number,
            "estimated_delivery": self._get_delivery_estimate(order.shipping_method),
            "tracking_events": tracking_events,
            "items": [
                {
                    "title": item.book.title,
                    "quantity": item.quantity,
                    "type": item.book.book_type.value
                }
                for item in order.items
            ]
        }

    def process_return(self, order_id: str, return_items: List[str], reason: str) -> Dict:
        """Process a return request"""
        order = self.orders.get(order_id)
        if not order:
            return {
                "success": False,
                "error": "Order not found"
            }
        
        # Generate return ID
        return_id = f"RET-{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate refund amount
        refund_amount = 0.0
        for item in order.items:
            if item.book.id in return_items:
                refund_amount += item.book.price * item.quantity
        
        # Add shipping cost to refund if all items are returned
        if len(return_items) == len(order.items):
            refund_amount += order.shipping_cost
        
        print(f"=== RETURN PROCESSED ===")
        print(f"Return ID: {return_id}")
        print(f"Order ID: {order_id}")
        print(f"Items: {return_items}")
        print(f"Reason: {reason}")
        print(f"Refund Amount: ${refund_amount:.2f}")
        print(f"=== END RETURN LOG ===")
        
        return {
            "success": True,
            "return_id": return_id,
            "refund_amount": refund_amount,
            "processing_time": "3-5 business days",
            "message": "Return request processed successfully"
        }

    def get_available_shipping_methods(self, destination_country: str = "United States") -> List[Dict]:
        """Get available shipping methods for destination"""
        is_international = destination_country.lower() != "united states"
        
        methods = []
        for method, option in self.shipping_options.items():
            if is_international and not option.international_available:
                continue
            
            methods.append({
                "method": method.value,
                "name": option.name,
                "description": option.description,
                "base_cost": option.base_cost,
                "delivery_days": option.delivery_days
            })
        
        return methods

    def _get_delivery_estimate(self, shipping_method: Optional[ShippingMethod]) -> str:
        """Get delivery estimate for shipping method"""
        if not shipping_method:
            return "Immediate (Digital)"
        
        option = self.shipping_options.get(shipping_method)
        if option:
            base_days = datetime.datetime.now() + datetime.timedelta(days=3)  # Processing time
            return base_days.strftime("%B %d, %Y")
        
        return "Unknown"

    def _generate_tracking_events(self, order: Order) -> List[Dict]:
        """Generate mock tracking events for demonstration"""
        events = [
            {
                "date": order.created_at.isoformat(),
                "status": "Order Confirmed",
                "description": "Your order has been confirmed and is being prepared"
            }
        ]
        
        # Add more events based on order age
        order_age = datetime.datetime.now() - order.created_at
        
        if order_age.days >= 1:
            events.append({
                "date": (order.created_at + datetime.timedelta(days=1)).isoformat(),
                "status": "Processing",
                "description": "Your order is being prepared for shipment"
            })
        
        if order_age.days >= 2:
            events.append({
                "date": (order.created_at + datetime.timedelta(days=2)).isoformat(),
                "status": "Shipped",
                "description": f"Your order has been shipped with tracking number {order.tracking_number}"
            })
        
        return events

# Example usage and testing
if __name__ == "__main__":
    platform = EcommercePlatform()
    
    # Test shipping calculation
    test_items = [
        CartItem(platform.books["book1"], 2),
        CartItem(platform.books["book2"], 1)
    ]
    
    shipping_cost = platform.calculate_shipping_cost(
        test_items, ShippingMethod.STANDARD, "United States"
    )
    print(f"Shipping calculation: {json.dumps(shipping_cost, indent=2)}")
    
    # Test order processing
    shipping_address = ShippingAddress(
        "John", "Doe", "123 Main St", "", "New York", "NY", "10001", "United States", "555-1234"
    )
    
    payment_info = PaymentInfo(
        PaymentMethod.CREDIT_CARD, "4111111111111111", "John Doe", "12/25", "123"
    )
    
    order_result = platform.process_order(
        "user123", test_items, shipping_address, payment_info, ShippingMethod.STANDARD
    )
    
    print(f"Order result: {json.dumps(order_result, indent=2, default=str)}")
