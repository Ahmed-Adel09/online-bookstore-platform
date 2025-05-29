"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, Wallet, Shield, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PaymentInfo, ShippingAddress } from "@/lib/ecommerce-api"

interface PaymentMethodsProps {
  onPaymentChange: (paymentInfo: PaymentInfo) => void
  billingAddress?: ShippingAddress
  onBillingAddressChange?: (address: ShippingAddress) => void
  hasEbooksOnly?: boolean
}

export function PaymentMethods({
  onPaymentChange,
  billingAddress,
  onBillingAddressChange,
  hasEbooksOnly = false,
}: PaymentMethodsProps) {
  const { toast } = useToast()
  const [selectedMethod, setSelectedMethod] = useState<string>("credit_card")
  const [cardData, setCardData] = useState({
    card_number: "",
    card_name: "",
    expiry: "",
    cvc: "",
  })
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [separateBilling, setSeparateBilling] = useState<ShippingAddress>({
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

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value

    // Format card number with spaces
    if (field === "card_number") {
      formattedValue = value.replace(/\D/g, "").substring(0, 16)
    }

    // Format expiry as MM/YY
    if (field === "expiry") {
      const digits = value.replace(/\D/g, "")
      if (digits.length <= 2) {
        formattedValue = digits
      } else {
        formattedValue = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
      }
    }

    // Format CVC (3-4 digits)
    if (field === "cvc") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4)
    }

    setCardData((prev) => ({ ...prev, [field]: formattedValue }))

    // Update parent component
    const paymentInfo: PaymentInfo = {
      method: selectedMethod as any,
      ...cardData,
      [field]: formattedValue,
      billing_address: useSameAddress ? billingAddress : separateBilling,
    }
    onPaymentChange(paymentInfo)
  }

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method)
    const paymentInfo: PaymentInfo = {
      method: method as any,
      ...cardData,
      billing_address: useSameAddress ? billingAddress : separateBilling,
    }
    onPaymentChange(paymentInfo)
  }

  const handleBillingAddressChange = (field: string, value: string) => {
    const updatedAddress = { ...separateBilling, [field]: value }
    setSeparateBilling(updatedAddress)

    if (!useSameAddress && onBillingAddressChange) {
      onBillingAddressChange(updatedAddress)
    }
  }

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\D/g, "")
    if (number.startsWith("4")) return "Visa"
    if (number.startsWith("5") || number.startsWith("2")) return "Mastercard"
    if (number.startsWith("3")) return "American Express"
    return "Credit Card"
  }

  const validateCard = () => {
    const errors = []
    if (!cardData.card_number || cardData.card_number.length < 13) {
      errors.push("Invalid card number")
    }
    if (!cardData.card_name || cardData.card_name.trim().length < 2) {
      errors.push("Cardholder name is required")
    }
    if (!cardData.expiry || cardData.expiry.length !== 5) {
      errors.push("Invalid expiry date")
    }
    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.push("Invalid CVC")
    }
    return errors
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedMethod} onValueChange={handleMethodChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="credit_card">
              <CreditCard className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="debit_card">
              <Badge variant="outline" className="text-xs">
                Debit
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="paypal">
              <Wallet className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="apple_pay">
              <Smartphone className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="google_pay">
              <span className="text-xs font-bold">G</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credit_card" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="card_name">Cardholder Name</Label>
                <Input
                  id="card_name"
                  placeholder="John Doe"
                  value={cardData.card_name}
                  onChange={(e) => handleCardInputChange("card_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="card_number">Card Number</Label>
                <div className="relative">
                  <Input
                    id="card_number"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.card_number}
                    onChange={(e) => handleCardInputChange("card_number", e.target.value)}
                    maxLength={16}
                    required
                  />
                  {cardData.card_number && (
                    <Badge variant="outline" className="absolute right-2 top-2 text-xs">
                      {getCardType(cardData.card_number)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardData.cvc}
                    onChange={(e) => handleCardInputChange("cvc", e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Secure Payment</p>
                  <p className="text-green-700">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="debit_card" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="debit_card_name">Cardholder Name</Label>
                <Input
                  id="debit_card_name"
                  placeholder="John Doe"
                  value={cardData.card_name}
                  onChange={(e) => handleCardInputChange("card_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="debit_card_number">Debit Card Number</Label>
                <Input
                  id="debit_card_number"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.card_number}
                  onChange={(e) => handleCardInputChange("card_number", e.target.value)}
                  maxLength={16}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debit_expiry">Expiry Date</Label>
                  <Input
                    id="debit_expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="debit_cvc">CVC</Label>
                  <Input
                    id="debit_cvc"
                    placeholder="123"
                    value={cardData.cvc}
                    onChange={(e) => handleCardInputChange("cvc", e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Debit Card Payment</p>
                  <p className="text-blue-700">Funds will be immediately deducted from your account</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paypal" className="space-y-4 mt-6">
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">PayPal Payment</h3>
              <p className="text-muted-foreground mb-4">
                You will be redirected to PayPal to complete your payment securely.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Protected by PayPal Buyer Protection</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apple_pay" className="space-y-4 mt-6">
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 text-gray-800 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Apple Pay</h3>
              <p className="text-muted-foreground mb-4">
                Use Touch ID, Face ID, or your device passcode to pay securely.
              </p>
              {hasEbooksOnly && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">Perfect for instant e-book purchases!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="google_pay" className="space-y-4 mt-6">
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Google Pay</h3>
              <p className="text-muted-foreground mb-4">Pay quickly and securely with your saved payment methods.</p>
              {hasEbooksOnly && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">Instant checkout for digital books!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Billing Address Section */}
        {(selectedMethod === "credit_card" || selectedMethod === "debit_card") && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="same-address"
                checked={useSameAddress}
                onChange={(e) => setUseSameAddress(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="same-address">Billing address same as shipping address</Label>
            </div>

            {!useSameAddress && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Billing Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billing_first_name">First Name</Label>
                    <Input
                      id="billing_first_name"
                      value={separateBilling.first_name}
                      onChange={(e) => handleBillingAddressChange("first_name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_last_name">Last Name</Label>
                    <Input
                      id="billing_last_name"
                      value={separateBilling.last_name}
                      onChange={(e) => handleBillingAddressChange("last_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="billing_address">Street Address</Label>
                    <Input
                      id="billing_address"
                      value={separateBilling.street_address}
                      onChange={(e) => handleBillingAddressChange("street_address", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_city">City</Label>
                    <Input
                      id="billing_city"
                      value={separateBilling.city}
                      onChange={(e) => handleBillingAddressChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_postal_code">Postal Code</Label>
                    <Input
                      id="billing_postal_code"
                      value={separateBilling.postal_code}
                      onChange={(e) => handleBillingAddressChange("postal_code", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Summary */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium mb-2">Payment Summary</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="capitalize">{selectedMethod.replace("_", " ")}</span>
            </div>
            {selectedMethod === "credit_card" && cardData.card_number && (
              <div className="flex justify-between">
                <span>Card:</span>
                <span>
                  {getCardType(cardData.card_number)} ending in {cardData.card_number.slice(-4)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Security:</span>
              <span className="text-green-600">✓ Encrypted</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
