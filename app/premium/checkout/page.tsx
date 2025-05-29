"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Check, ChevronLeft, Crown, Lock, Zap } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { subscriptionAPI, type PaymentData, type SubscriptionResponse } from "@/lib/subscription-api"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly")
  const [subscriptionResult, setSubscriptionResult] = useState<SubscriptionResponse | null>(null)

  // Payment form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  })

  useEffect(() => {
    const planParam = searchParams.get("plan")
    if (planParam === "yearly") {
      setPlan("yearly")
    } else {
      setPlan("monthly")
    }
  }, [searchParams])

  // Format card number with spaces (optional visual formatting)
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const formatted = digits.substring(0, 16)
    return formatted
  }

  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "")

    if (digits.length <= 2) {
      return digits
    }

    const month = digits.substring(0, 2)
    const year = digits.substring(2, 4)

    return `${month}/${year}`
  }

  // Handle expiry date input
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\//g, "")
    const formatted = formatExpiryDate(input)
    setExpiry(formatted)
  }

  // Handle CVC input - only allow 3 digits
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "")
    setCvc(digits.substring(0, 3))
  }

  const getThemeCount = () => {
    return plan === "yearly" ? 10 : 5
  }

  const getUnlockedThemes = () => {
    if (plan === "yearly") {
      return ["All themes including Sunset, Forest, AMOLED Dark, Ocean Breeze, Golden Hour"]
    } else {
      return ["Midnight, Retro Storm, Crimson Moon + 2 basic themes"]
    }
  }

  const activateSubscriptionAndThemes = async (result: SubscriptionResponse) => {
    try {
      // Generate a unique user ID (in production, this would come from authentication)
      const userId = localStorage.getItem("userId") || `user_${Date.now()}`
      localStorage.setItem("userId", userId)

      // Update user's premium status in local storage
      localStorage.setItem("isPremium", "true")
      localStorage.setItem("premiumPlan", plan)
      localStorage.setItem("premiumSince", result.subscription.start_date)
      localStorage.setItem("subscriptionEndDate", result.subscription.end_date)
      localStorage.setItem("transactionId", result.subscription.transaction_id)

      // Store backend-provided theme data
      localStorage.setItem("newlyUnlocked", "true")
      localStorage.setItem("purchaseTimestamp", Date.now().toString())
      localStorage.setItem("newlyUnlockedThemes", JSON.stringify(result.unlocked_themes.map((t) => t.id)))
      localStorage.setItem("availableThemes", JSON.stringify(result.unlocked_themes))

      // Auto-apply the backend-selected theme
      if (result.auto_applied_theme) {
        localStorage.setItem("bookstore-theme", result.auto_applied_theme.id)
        // Trigger a custom event to notify theme provider of immediate change
        window.dispatchEvent(
          new CustomEvent("themeUpdated", {
            detail: { theme: result.auto_applied_theme.id },
          }),
        )
      }

      // Force reload theme provider state
      window.dispatchEvent(new CustomEvent("premiumStatusChanged"))

      return true
    } catch (error) {
      console.error("Error activating subscription:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!cardNumber || cardNumber.length < 16) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid 16-digit card number",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!cardName.trim()) {
        toast({
          title: "Missing card name",
          description: "Please enter the name on your card",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!expiry || expiry.length < 5) {
        toast({
          title: "Invalid expiry date",
          description: "Please enter a valid expiry date (MM/YY)",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!cvc || cvc.length < 3) {
        toast({
          title: "Invalid CVC",
          description: "Please enter a valid 3-digit CVC code",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validate billing address
      if (
        !billingAddress.street.trim() ||
        !billingAddress.city.trim() ||
        !billingAddress.state.trim() ||
        !billingAddress.zip.trim()
      ) {
        toast({
          title: "Incomplete billing address",
          description: "Please fill in all billing address fields",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Prepare payment data for backend
      const userId = localStorage.getItem("userId") || `user_${Date.now()}`
      localStorage.setItem("userId", userId)

      const paymentData: PaymentData = {
        user_id: userId,
        plan: plan,
        card_number: cardNumber,
        card_name: cardName,
        expiry: expiry,
        cvc: cvc,
        billing_address: billingAddress,
      }

      // Process subscription through backend API
      let result: SubscriptionResponse
      try {
        result = await subscriptionAPI.processSubscription(paymentData)
      } catch (error) {
        console.log("Backend unavailable, using fallback:", error)
        // Fallback to local processing if backend is unavailable
        result = await subscriptionAPI.processSubscriptionFallback(paymentData)
      }

      if (!result.success) {
        throw new Error(result.message)
      }

      // Store the result for the success page
      setSubscriptionResult(result)

      // Immediately activate subscription and themes
      const activationSuccess = await activateSubscriptionAndThemes(result)

      if (activationSuccess) {
        // Show success message
        setIsComplete(true)
        setIsSubmitting(false)

        // Show immediate success toast
        toast({
          title: "🎉 Premium Activated!",
          description: `${result.unlocked_themes.length} themes unlocked and ready to use!`,
          duration: 5000,
        })

        // Redirect to exclusive themes page after 1.5 seconds
        setTimeout(() => {
          router.push("/exclusive-themes?newPurchase=true&autoActivated=true&backend=true")
        }, 1500)
      } else {
        throw new Error("Failed to activate subscription locally")
      }
    } catch (error) {
      console.error("Subscription processing error:", error)
      toast({
        title: "Subscription Error",
        description:
          error instanceof Error ? error.message : "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  if (isComplete && subscriptionResult) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              Premium Activated!
            </CardTitle>
            <CardDescription>
              Your {plan === "yearly" ? "Yearly" : "Monthly"} Premium subscription is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{subscriptionResult.subscription.tier} Premium</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Transaction:</span>
                <span className="font-medium text-xs">{subscriptionResult.subscription.transaction_id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Themes Unlocked:</span>
                <span className="font-medium">{subscriptionResult.unlocked_themes.length} new themes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Instantly Active
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">✨ Instantly Activated:</h3>
              <ul className="text-sm space-y-1">
                {subscriptionResult.unlocked_themes.map((theme, index) => (
                  <li key={theme.id} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{theme.name} theme</span>
                    {index === 0 && subscriptionResult.auto_applied_theme?.id === theme.id && (
                      <Badge variant="secondary" className="text-xs">
                        Auto-Applied
                      </Badge>
                    )}
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited reading access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Ad-free experience</span>
                </li>
                {plan === "yearly" && (
                  <>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Audiobooks included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>10% discount on physical books</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                🎉 Your themes are already active! We've automatically applied the{" "}
                {subscriptionResult.auto_applied_theme?.name} theme. Explore all your new themes in the gallery.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-center text-muted-foreground mb-2">Redirecting to your theme gallery...</p>
            <Button
              className="w-full"
              onClick={() => router.push("/exclusive-themes?newPurchase=true&autoActivated=true&backend=true")}
            >
              Explore Your Active Themes
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/premium" className="flex items-center text-blue-600 mb-6 hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{plan === "yearly" ? "Yearly" : "Monthly"} Premium</span>
                  <Badge variant="secondary">{plan === "yearly" ? "Save 17%" : "Monthly"}</Badge>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  ${plan === "yearly" ? "99.99" : "9.99"}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan === "yearly" ? "year" : "month"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Instantly activated upon purchase:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>{getThemeCount()} exclusive themes (auto-applied)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited reading access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Ad-free experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Offline reading</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Early access to new releases</span>
                  </li>
                  {plan === "yearly" && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Audiobooks included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>10% discount on physical books</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${plan === "yearly" ? "99.99" : "9.99"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate activation • Backend-powered • {plan === "yearly" ? "Annual" : "Monthly"} billing • Cancel
                  anytime
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>Secure payment processing with instant theme activation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={16}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                    />
                    <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cvc}
                      onChange={handleCvcChange}
                      maxLength={3}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Billing Address</h3>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street"
                      value={billingAddress.street}
                      onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        placeholder="10001"
                        value={billingAddress.zip}
                        onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={billingAddress.country}
                        onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing & Activating Themes...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Activate Premium for ${plan === "yearly" ? "99.99" : "9.99"}
                    </div>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By subscribing, you agree to our Terms of Service and Privacy Policy. Themes activate instantly upon
                  successful payment via our secure backend system.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
