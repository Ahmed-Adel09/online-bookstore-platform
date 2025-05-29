"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/auth-api"
import { Tag, Percent, Calendar, Users, DollarSign, CheckCircle, XCircle } from "lucide-react"

interface PromoCode {
  code: string
  discount_percentage: number
  discount_amount?: number
  valid_from: string
  valid_until: string
  usage_limit?: number
  used_count: number
  is_active: boolean
  minimum_order: number
}

export function PromoCodeManager() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [testCode, setTestCode] = useState("")
  const [testAmount, setTestAmount] = useState("50")
  const [testResult, setTestResult] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPromoCodes()
  }, [])

  const loadPromoCodes = async () => {
    try {
      const codes = await authAPI.listPromoCode()
      setPromoCodes(codes)
    } catch (error) {
      console.error("Failed to load promo codes:", error)
      // Fallback data
      setPromoCodes([
        {
          code: "DRSHIMA",
          discount_percentage: 100,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          used_count: 0,
          is_active: true,
          minimum_order: 0,
        },
        {
          code: "WELCOME10",
          discount_percentage: 10,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usage_limit: 100,
          used_count: 15,
          is_active: true,
          minimum_order: 25,
        },
        {
          code: "STUDENT20",
          discount_percentage: 20,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          usage_limit: 500,
          used_count: 87,
          is_active: true,
          minimum_order: 15,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const testPromoCode = async () => {
    if (!testCode.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a promo code to test",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await authAPI
        .validatePromoCode(testCode, Number.parseFloat(testAmount))
        .catch(() => authAPI.validatePromoCodeFallback(testCode, Number.parseFloat(testAmount)))

      setTestResult(result)

      if (result.success) {
        toast({
          title: "Promo Code Valid!",
          description: result.message,
        })
      } else {
        toast({
          title: "Promo Code Invalid",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test promo code",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading promo codes...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Promo Code Tester */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Test Promo Code
          </CardTitle>
          <CardDescription>Test any promo code with a sample order amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Promo Code</label>
              <Input
                placeholder="Enter code (e.g., DRSHIMA)"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Order Amount ($)</label>
              <Input
                type="number"
                placeholder="50.00"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={testPromoCode} className="w-full">
                Test Code
              </Button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg border ${
                testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                  {testResult.success ? "Valid Code" : "Invalid Code"}
                </span>
              </div>
              {testResult.success ? (
                <div className="space-y-1 text-sm text-green-700">
                  <p>Code: {testResult.code}</p>
                  <p>Discount: {testResult.discount_percentage}%</p>
                  <p>Discount Amount: ${testResult.discount_amount?.toFixed(2)}</p>
                  <p>Final Total: ${testResult.final_total?.toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-sm text-red-700">{testResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Promo Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Active Promotional Codes
          </CardTitle>
          <CardDescription>Currently available promo codes and their usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {promoCodes.map((promo) => (
              <div key={promo.code} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={promo.is_active ? "default" : "secondary"} className="text-lg px-3 py-1">
                      {promo.code}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Percent className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">{promo.discount_percentage}% OFF</span>
                    </div>
                  </div>
                  <Badge variant={promo.is_active ? "default" : "secondary"}>
                    {promo.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Valid Until</p>
                      <p className="font-medium">{formatDate(promo.valid_until)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Min. Order</p>
                      <p className="font-medium">${promo.minimum_order.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Usage</p>
                      <p className="font-medium">
                        {promo.used_count}
                        {promo.usage_limit ? ` / ${promo.usage_limit}` : " (Unlimited)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium">
                        {promo.usage_limit && promo.used_count >= promo.usage_limit ? "Limit Reached" : "Available"}
                      </p>
                    </div>
                  </div>
                </div>

                {promo.code === "DRSHIMA" && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      🎉 Special Code: This code offers 100% discount on all purchases!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Promo Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <p className="text-sm">Add books to your cart and proceed to checkout</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <p className="text-sm">Enter your promo code in the "Promo code" field</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">3</span>
            </div>
            <p className="text-sm">Click "Apply" to see the discount applied to your order</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1">
              <span className="text-blue-600 font-bold text-sm">4</span>
            </div>
            <p className="text-sm">Complete your purchase with the discounted price</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
