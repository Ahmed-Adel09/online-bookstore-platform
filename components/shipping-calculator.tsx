"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Truck, Package, Zap, Globe, Calculator } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ecommerceAPI, type CartItem, type ShippingOption } from "@/lib/ecommerce-api"

interface ShippingCalculatorProps {
  items: CartItem[]
  onShippingChange: (cost: number, method: string) => void
  selectedCountry?: string
  onCountryChange?: (country: string) => void
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "India",
  "Mexico",
]

export function ShippingCalculator({
  items,
  onShippingChange,
  selectedCountry = "United States",
  onCountryChange,
}: ShippingCalculatorProps) {
  const { toast } = useToast()
  const [shippingMethods, setShippingMethods] = useState<ShippingOption[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [shippingDetails, setShippingDetails] = useState<any>(null)

  // Check if cart has physical books
  const hasPhysicalBooks = items.some((item) => item.book.book_type === "physical" || item.book.book_type === "both")

  useEffect(() => {
    loadShippingMethods()
  }, [selectedCountry])

  useEffect(() => {
    if (selectedMethod && hasPhysicalBooks) {
      calculateShipping()
    } else if (!hasPhysicalBooks) {
      setShippingCost(0)
      onShippingChange(0, "digital")
      setShippingDetails({
        cost: 0,
        method: "Digital Delivery",
        description: "Instant download - no shipping required",
        delivery_estimate: "Immediate",
      })
    }
  }, [selectedMethod, items, selectedCountry])

  const loadShippingMethods = async () => {
    try {
      const methods = await ecommerceAPI.getShippingMethods(selectedCountry).catch(() => {
        // Fallback shipping methods
        const isInternational = selectedCountry !== "United States"
        return [
          {
            method: "standard",
            name: "Standard Shipping",
            description: isInternational ? "7-14 business days" : "3-5 business days",
            base_cost: isInternational ? 24.99 : 4.99,
            delivery_days: isInternational ? "7-14 business days" : "3-5 business days",
          },
          {
            method: "expedited",
            name: "Expedited Shipping",
            description: isInternational ? "3-7 business days" : "1-2 business days",
            base_cost: isInternational ? 39.99 : 9.99,
            delivery_days: isInternational ? "3-7 business days" : "1-2 business days",
          },
          {
            method: "overnight",
            name: "Overnight Shipping",
            description: isInternational ? "1-3 business days" : "Next business day",
            base_cost: isInternational ? 59.99 : 19.99,
            delivery_days: isInternational ? "1-3 business days" : "Next business day",
          },
        ]
      })

      setShippingMethods(methods)

      // Auto-select first method if none selected
      if (!selectedMethod && methods.length > 0) {
        setSelectedMethod(methods[0].method)
      }
    } catch (error) {
      toast({
        title: "Error loading shipping methods",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  const calculateShipping = async () => {
    if (!selectedMethod || !hasPhysicalBooks) return

    setIsCalculating(true)
    try {
      const result = await ecommerceAPI
        .calculateShipping(items, selectedMethod, selectedCountry)
        .catch(() => ecommerceAPI.calculateShippingFallback(items, selectedMethod, selectedCountry))

      if (result.error) {
        toast({
          title: "Shipping Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setShippingCost(result.cost)
      setShippingDetails(result)
      onShippingChange(result.cost, selectedMethod)
    } catch (error) {
      toast({
        title: "Error calculating shipping",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "standard":
        return <Package className="h-4 w-4" />
      case "expedited":
        return <Truck className="h-4 w-4" />
      case "overnight":
        return <Zap className="h-4 w-4" />
      case "international":
        return <Globe className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (!hasPhysicalBooks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery Information
          </CardTitle>
          <CardDescription>Your order contains only digital books</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
            <div className="text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Instant Digital Delivery</h3>
              <p className="text-sm text-blue-700">
                Your e-books will be available for download immediately after purchase
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Shipping Calculator
        </CardTitle>
        <CardDescription>Calculate shipping costs for your physical books</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <Label htmlFor="country">Shipping Destination</Label>
          <Select value={selectedCountry} onValueChange={onCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shipping Methods */}
        <div className="space-y-3">
          <Label>Shipping Method</Label>
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            {shippingMethods.map((method) => (
              <div key={method.method} className="flex items-center space-x-2">
                <RadioGroupItem value={method.method} id={method.method} />
                <Label htmlFor={method.method} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(method.method)}
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${method.base_cost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Base rate</div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Shipping Details */}
        {shippingDetails && (
          <div className="border rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Shipping Summary</h4>
              {isCalculating && <Badge variant="secondary">Calculating...</Badge>}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Method:</span>
                <span>{shippingDetails.method}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Time:</span>
                <span>{shippingDetails.delivery_estimate}</span>
              </div>
              {shippingDetails.weight_oz && (
                <div className="flex justify-between">
                  <span>Package Weight:</span>
                  <span>{(shippingDetails.weight_oz / 16).toFixed(1)} lbs</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Shipping Cost:</span>
                <span>
                  {shippingDetails.cost === 0 ? (
                    <Badge variant="secondary">Free</Badge>
                  ) : (
                    `$${shippingDetails.cost.toFixed(2)}`
                  )}
                </span>
              </div>
              {shippingDetails.free_shipping_eligible && shippingDetails.cost > 0 && (
                <div className="text-xs text-green-600">
                  💡 Add ${(35 - items.reduce((sum, item) => sum + item.book.price * item.quantity, 0)).toFixed(2)} more
                  for free shipping!
                </div>
              )}
            </div>
          </div>
        )}

        {/* International Shipping Notice */}
        {selectedCountry !== "United States" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">International Shipping</p>
                <p className="text-amber-700">
                  Additional customs fees and import duties may apply. Delivery times may vary based on customs
                  processing.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
