"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useBookshelf } from "@/hooks/use-bookshelf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ShippingCalculator } from "@/components/shipping-calculator"
import { PaymentMethods } from "@/components/payment-methods"
import { DigitalLibrary } from "@/components/digital-library"
import { OrderTracking } from "@/components/order-tracking"
import { ecommerceAPI, type ShippingAddress, type PaymentInfo, type CartItem } from "@/lib/ecommerce-api"
import { ChevronLeft, CheckCircle, BookOpen, Tablet, Package, CreditCard, Truck, Download, Tag } from "lucide-react"
import { authAPI } from "@/lib/auth-api"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getCartTotal, clearCart } = useCart()
  const { addPurchasedBook } = useBookshelf()
  const { toast } = useToast()

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Form data
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    first_name: "",
    last_name: "",
    street_address: "",
    apartment: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    phone: "",
  })

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: "credit_card",
    card_number: "",
    card_name: "",
    expiry: "",
    cvc: "",
    billing_address: undefined,
  })

  const [shippingMethod, setShippingMethod] = useState<string>("")
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [selectedCountry, setSelectedCountry] = useState<string>("United States")

  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoCodeData, setPromoCodeData] = useState<any>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoCodeUsed, setPromoCodeUsed] = useState(false)

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a promo code",
        variant: "destructive",
      })
      return
    }

    setPromoLoading(true)

    try {
      // Use the auth API to validate promo code
      const result = await authAPI
        .validatePromoCode(promoCode, subtotal)
        .catch(() => authAPI.validatePromoCodeFallback(promoCode, subtotal))

      if (result.success) {
        setDiscount(result.discount_percentage! / 100)
        setPromoApplied(true)
        setPromoCodeData(result)
        toast({
          title: "Promo Code Applied!",
          description: result.message || `${result.discount_percentage}% discount applied!`,
        })
      } else {
        toast({
          title: "Invalid Promo Code",
          description: result.error || "The promo code you entered is not valid.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Promo code error:", error)
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromoCode = () => {
    setPromoCode("")
    setDiscount(0)
    setPromoApplied(false)
    setPromoCodeData(null)
    toast({
      title: "Promo Code Removed",
      description: "The promotional code has been removed from your order.",
    })
  }

  // Calculate totals
  const subtotal = getCartTotal()
  const tax = subtotal * 0.08
  const discountedSubtotal = subtotal * (1 - discount)
  const total = discountedSubtotal + shippingCost + tax

  // Check cart composition
  const hasPhysicalBooks = cart.some((item) => item.format === "physical")
  const hasEbooks = cart.some((item) => item.format === "ebook")
  const hasOnlyEbooks = cart.length > 0 && cart.every((item) => item.format === "ebook")

  useEffect(() => {
    if (cart.length === 0 && !orderComplete) {
      router.push("/cart")
    }
  }, [cart, orderComplete, router])

  const handleShippingAddressChange = (field: string, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleShippingChange = (cost: number, method: string) => {
    setShippingCost(cost)
    setShippingMethod(method)
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setShippingAddress((prev) => ({ ...prev, country }))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    // Validate shipping address for physical books
    if (hasPhysicalBooks) {
      const requiredFields = ["first_name", "last_name", "street_address", "city", "state", "postal_code", "country"]
      const missingFields = requiredFields.filter((field) => !shippingAddress[field as keyof ShippingAddress]?.trim())

      if (missingFields.length > 0) {
        errors.push(`Missing shipping information: ${missingFields.join(", ")}`)
      }

      if (!shippingMethod) {
        errors.push("Please select a shipping method")
      }
    }

    // Validate payment information
    if (paymentInfo.method === "credit_card" || paymentInfo.method === "debit_card") {
      if (!paymentInfo.card_number || paymentInfo.card_number.length < 13) {
        errors.push("Invalid card number")
      }
      if (!paymentInfo.card_name?.trim()) {
        errors.push("Cardholder name is required")
      }
      if (!paymentInfo.expiry || paymentInfo.expiry.length !== 5) {
        errors.push("Invalid expiry date")
      }
      if (!paymentInfo.cvc || paymentInfo.cvc.length < 3) {
        errors.push("Invalid CVC")
      }
    }

    return errors
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(", "),
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Convert cart to API format
      const cartItems: CartItem[] = cart.map((item) => ({
        book: {
          id: item.book.id,
          title: item.book.title,
          author: item.book.author,
          price: item.format === "ebook" ? item.book.price * 0.7 : item.book.price,
          book_type: item.format as any,
          stock_quantity: 100,
          weight_oz: 8.0,
          digital_formats: item.format === "ebook" ? ["epub", "pdf"] : undefined,
        },
        quantity: item.quantity,
        selected_format: item.format === "ebook" ? "epub" : undefined,
      }))

      // Process order
      const result = await ecommerceAPI
        .processOrder(
          "user123", // In real app, get from auth context
          cartItems,
          hasPhysicalBooks ? shippingAddress : null,
          paymentInfo,
          hasPhysicalBooks ? shippingMethod : undefined,
        )
        .catch((error) =>
          ecommerceAPI.processOrderFallback(
            "user123",
            cartItems,
            hasPhysicalBooks ? shippingAddress : null,
            paymentInfo,
            hasPhysicalBooks ? shippingMethod : undefined,
          ),
        )

      if (result.success) {
        // Add e-books to bookshelf
        if (result.digital_downloads) {
          result.digital_downloads.forEach((download: any) => {
            const book = cart.find((item) => item.book.id === download.book_id)?.book
            if (book) {
              addPurchasedBook(book)
            }
          })
        }

        setOrderResult(result)
        setOrderComplete(true)
        clearCart()

        toast({
          title: "Order Placed Successfully!",
          description: `Order ${result.order_id} has been confirmed.`,
        })

        // Show e-book success message
        if (hasEbooks) {
          setTimeout(() => {
            toast({
              title: "E-books Ready!",
              description: "Your digital books are available for download.",
            })
          }, 1000)
        }
      } else {
        throw new Error(result.error || "Order processing failed")
      }
    } catch (error) {
      console.error("Order submission error:", error)
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }

    // Mark promo code as used
    if (promoApplied && promoCodeData) {
      try {
        await authAPI.usePromoCode(promoCodeData.code)
        setPromoCodeUsed(true)
      } catch (error) {
        console.log("Failed to mark promo code as used (fallback mode)")
      }
    }
  }

  if (cart.length === 0 && !orderComplete) {
    return null
  }

  if (orderComplete && orderResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order number is <span className="font-bold">{orderResult.order_id}</span>.
          </p>

          {/* Order Summary */}
          <Card className="mb-8 text-left">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono">{orderResult.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold">${orderResult.total?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-sm">{orderResult.transaction_id}</span>
                </div>
                {orderResult.tracking_number && (
                  <div className="flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-mono">{orderResult.tracking_number}</span>
                  </div>
                )}
                {orderResult.estimated_delivery && (
                  <div className="flex justify-between">
                    <span>Estimated Delivery:</span>
                    <span>{orderResult.estimated_delivery}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Digital Downloads */}
          {orderResult.digital_downloads && orderResult.digital_downloads.length > 0 && (
            <div className="mb-8">
              <DigitalLibrary userId="user123" recentPurchases={orderResult.digital_downloads} />
            </div>
          )}

          {/* Order Tracking */}
          {orderResult.tracking_number && (
            <div className="mb-8">
              <OrderTracking orderId={orderResult.order_id} embedded />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
            {orderResult.digital_downloads && orderResult.digital_downloads.length > 0 && (
              <Link href="/profile">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  My Library
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/cart" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                currentStep >= 1 ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Information</span>
          </div>
          <div className="h-px bg-gray-300 w-16"></div>
          <div className={`flex items-center ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                currentStep >= 2 ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
          <div className="h-px bg-gray-300 w-16"></div>
          <div className={`flex items-center ${currentStep >= 3 ? "text-blue-600" : "text-gray-400"}`}>
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                currentStep >= 3 ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
              }`}
            >
              3
            </div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Shipping Information */}
            {hasPhysicalBooks && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                  <CardDescription>Where should we deliver your physical books?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={shippingAddress.first_name}
                        onChange={(e) => handleShippingAddressChange("first_name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={shippingAddress.last_name}
                        onChange={(e) => handleShippingAddressChange("last_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="street_address">Street Address</Label>
                      <Input
                        id="street_address"
                        value={shippingAddress.street_address}
                        onChange={(e) => handleShippingAddressChange("street_address", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="apartment">Apartment/Suite (Optional)</Label>
                      <Input
                        id="apartment"
                        value={shippingAddress.apartment}
                        onChange={(e) => handleShippingAddressChange("apartment", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleShippingAddressChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleShippingAddressChange("state", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleShippingAddressChange("postal_code", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleShippingAddressChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Calculator */}
            <ShippingCalculator
              items={cart.map((item) => ({
                book: {
                  id: item.book.id,
                  title: item.book.title,
                  author: item.book.author,
                  price: item.format === "ebook" ? item.book.price * 0.7 : item.book.price,
                  book_type: item.format as any,
                  stock_quantity: 100,
                  weight_oz: 8.0,
                },
                quantity: item.quantity,
              }))}
              onShippingChange={handleShippingChange}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
            />

            {/* Payment Methods */}
            <PaymentMethods
              onPaymentChange={setPaymentInfo}
              billingAddress={shippingAddress}
              hasEbooksOnly={hasOnlyEbooks}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                "Processing Order..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Complete Order - ${total.toFixed(2)}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const price = item.format === "ebook" ? item.book.price * 0.7 : item.book.price

                  return (
                    <div key={`${item.book.id}-${item.format}`} className="flex gap-3">
                      <img
                        src={item.book.coverImage || `/placeholder.svg?height=60&width=45`}
                        alt={item.book.title}
                        className="rounded-md w-12 h-16 object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.book.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.format === "physical" ? (
                              <>
                                <BookOpen className="h-3 w-3 mr-1" /> Physical
                              </>
                            ) : (
                              <>
                                <Tablet className="h-3 w-3 mr-1" /> E-book
                              </>
                            )}
                          </Badge>
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        </div>
                        <p className="text-sm font-medium">${(price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code (try DRSHIMA)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied || promoLoading}
                  />
                  {!promoApplied ? (
                    <Button variant="outline" onClick={handleApplyPromo} disabled={promoLoading || !promoCode.trim()}>
                      {promoLoading ? "Checking..." : "Apply"}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={removePromoCode}>
                      Remove
                    </Button>
                  )}
                </div>
                {promoApplied && promoCodeData && (
                  <div className="mt-2 text-sm flex items-center text-green-600">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>
                      {promoCodeData.code} applied: {promoCodeData.discount_percentage}% discount!
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-green-600">-${(subtotal * discount).toFixed(2)}</span>
                  </div>
                )}
                {hasPhysicalBooks && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Secure Checkout</p>
                  <p className="text-green-700">Your payment information is encrypted and secure</p>
                </div>
              </div>

              {/* Delivery Information */}
              {hasEbooks && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Digital Delivery</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    E-books will be available for immediate download after purchase
                  </p>
                </div>
              )}

              {hasPhysicalBooks && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Physical Delivery</span>
                  </div>
                  <p className="text-sm text-amber-700">Physical books will be shipped to your address</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
