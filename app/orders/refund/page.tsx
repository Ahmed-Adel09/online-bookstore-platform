"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, AlertCircle, CheckCircle, DollarSign, Package, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock order data (same as tracking page)
const mockOrders = [
  {
    id: "ORD-123456",
    status: "delivered",
    orderDate: "May 15, 2024",
    deliveryDate: "May 19, 2024",
    total: 42.97,
    items: [
      { id: "1", title: "The Midnight Library", format: "physical", price: 14.99, quantity: 1, refundable: true },
      { id: "2", title: "Atomic Habits", format: "ebook", price: 8.39, quantity: 1, refundable: false }, // eBooks not refundable after download
      { id: "7", title: "Sapiens", format: "physical", price: 15.99, quantity: 1, refundable: true },
    ],
    paymentMethod: "Credit Card ending in 4242",
    shippingCost: 4.99,
    tax: 3.44,
    canRefund: true,
    refundDeadline: "June 18, 2024", // 30 days from delivery
  },
  {
    id: "ORD-789012",
    status: "shipped",
    orderDate: "May 20, 2024",
    total: 29.88,
    items: [
      { id: "3", title: "Project Hail Mary", format: "physical", price: 16.89, quantity: 1, refundable: true },
      { id: "5", title: "The Silent Patient", format: "ebook", price: 9.09, quantity: 1, refundable: true }, // Not yet downloaded
    ],
    paymentMethod: "PayPal",
    shippingCost: 4.99,
    tax: 2.39,
    canRefund: true,
    refundDeadline: "June 19, 2024",
  },
]

// Function to get return history and calculate fees
const getReturnHistory = () => {
  const returnHistory = JSON.parse(localStorage.getItem("returnHistory") || "[]")
  return returnHistory
}

const calculateReturnFees = (refundAmount: number, isFirstReturn: boolean) => {
  if (isFirstReturn) {
    return {
      returnShippingFee: 0,
      restockingFee: 0,
      processingFee: 0,
      totalFees: 0,
      netRefund: refundAmount,
    }
  }

  // Subsequent returns incur fees
  const returnShippingFee = 4.99
  const restockingFee = Math.min(refundAmount * 0.15, 25.0) // 15% restocking fee, max $25
  const processingFee = 2.99
  const totalFees = returnShippingFee + restockingFee + processingFee
  const netRefund = Math.max(0, refundAmount - totalFees)

  return {
    returnShippingFee,
    restockingFee,
    processingFee,
    totalFees,
    netRefund,
  }
}

const refundReasons = [
  "Item damaged during shipping",
  "Item not as described",
  "Wrong item received",
  "Changed my mind",
  "Found a better price elsewhere",
  "Quality issues",
  "Defective product",
  "Other",
]

export default function RefundRequestPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [orderId, setOrderId] = useState("")
  const [orderData, setOrderData] = useState<(typeof mockOrders)[0] | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [refundReason, setRefundReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [description, setDescription] = useState("")
  const [refundMethod, setRefundMethod] = useState("original")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refundSubmitted, setRefundSubmitted] = useState(false)
  const [refundRequestId, setRefundRequestId] = useState("")

  const [returnFees, setReturnFees] = useState({
    returnShippingFee: 0,
    restockingFee: 0,
    processingFee: 0,
    totalFees: 0,
    netRefund: 0,
  })
  const [isFirstReturn, setIsFirstReturn] = useState(true)

  // Get order ID from URL params
  useEffect(() => {
    const orderIdParam = searchParams.get("orderId")
    if (orderIdParam) {
      setOrderId(orderIdParam)
      // Auto-load order data
      const foundOrder = mockOrders.find((order) => order.id === orderIdParam)
      if (foundOrder) {
        setOrderData(foundOrder)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const returnHistory = getReturnHistory()
    const firstReturn = returnHistory.length === 0
    setIsFirstReturn(firstReturn)
  }, [])

  const handleOrderLookup = (e: React.FormEvent) => {
    e.preventDefault()
    const foundOrder = mockOrders.find((order) => order.id.toLowerCase() === orderId.toLowerCase())

    if (foundOrder) {
      if (!foundOrder.canRefund) {
        toast({
          title: "Refund Not Available",
          description: "This order is not eligible for refund.",
          variant: "destructive",
        })
        return
      }
      setOrderData(foundOrder)
    } else {
      toast({
        title: "Order Not Found",
        description: "Please check your order number and try again.",
        variant: "destructive",
      })
    }
  }

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  const calculateRefundAmount = () => {
    if (!orderData) return 0

    const selectedItemsData = orderData.items.filter((item) => selectedItems.includes(item.id))
    const itemsTotal = selectedItemsData.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // If all items are being refunded, include shipping and tax
    const allItemsSelected = selectedItems.length === orderData.items.filter((item) => item.refundable).length
    const shipping = allItemsSelected ? orderData.shippingCost : 0
    const tax = allItemsSelected
      ? orderData.tax
      : (itemsTotal / (orderData.total - orderData.shippingCost - orderData.tax)) * orderData.tax

    return itemsTotal + shipping + tax
  }

  // Add this new useEffect after the existing useEffects
  useEffect(() => {
    if (selectedItems.length > 0 && orderData) {
      const refundAmount = calculateRefundAmount()
      const fees = calculateReturnFees(refundAmount, isFirstReturn)
      setReturnFees(fees)
    }
  }, [selectedItems, orderData, isFirstReturn])

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to refund.",
        variant: "destructive",
      })
      return
    }

    if (!refundReason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for the refund.",
        variant: "destructive",
      })
      return
    }

    if (refundReason === "Other" && !customReason.trim()) {
      toast({
        title: "Custom Reason Required",
        description: "Please provide a custom reason for the refund.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const requestId = `REF-${Math.floor(100000 + Math.random() * 900000)}`

      // Save return to history
      const returnHistory = getReturnHistory()
      const newReturn = {
        id: requestId,
        orderId: orderData?.id,
        date: new Date().toISOString(),
        items: selectedItems,
        reason: refundReason === "Other" ? customReason : refundReason,
        grossRefund: calculateRefundAmount(),
        fees: returnFees,
        netRefund: returnFees.netRefund,
        isFirstReturn,
        status: "pending",
      }

      returnHistory.push(newReturn)
      localStorage.setItem("returnHistory", JSON.stringify(returnHistory))

      setRefundRequestId(requestId)
      setRefundSubmitted(true)
      setIsSubmitting(false)

      toast({
        title: "Refund Request Submitted",
        description: `Your refund request ${requestId} has been submitted successfully.`,
      })
    }, 1500)
  }

  if (refundSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Refund Request Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your refund request <span className="font-bold">{refundRequestId}</span> has been submitted successfully.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-800 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• We'll review your refund request within 1-2 business days</li>
              <li>• You'll receive an email confirmation with tracking details</li>
              <li>• If approved, refund will be processed within 3-5 business days</li>
              <li>• For physical items, you may need to return them using a prepaid label</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/orders/track">
              <Button>Track Orders</Button>
            </Link>
            <Link href="/returns/track">
              <Button variant="outline">Track Returns</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Return to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/orders/track" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Order Tracking
      </Link>

      <h1 className="text-3xl font-bold mb-4">Request Refund</h1>
      <p className="text-lg text-gray-600 mb-8">
        Request a refund for your order. Please note that refunds must be requested within 30 days of delivery.
      </p>

      {!orderData ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Order</CardTitle>
            <CardDescription>Enter your order number to start the refund process</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrderLookup} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="orderId">Order Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderId"
                    placeholder="e.g., ORD-123456"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit">Find Order</Button>
                </div>
              </div>
            </form>

            <div className="mt-4 text-sm text-gray-500">
              <p>Demo order numbers: ORD-123456, ORD-789012</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmitRefund} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order #{orderData.id}</CardTitle>
              <CardDescription>
                Ordered on {orderData.orderDate} • Total: ${orderData.total.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Refund Policy</p>
                      <p className="text-sm text-amber-700">
                        Refunds must be requested within 30 days of delivery. Refund deadline for this order:{" "}
                        <span className="font-medium">{orderData.refundDeadline}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Select Items to Refund</h3>
                  <div className="space-y-3">
                    {orderData.items.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={item.id}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                          disabled={!item.refundable}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.format === "physical" ? "Physical" : "eBook"}
                                </Badge>
                                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                {!item.refundable && (
                                  <Badge variant="destructive" className="text-xs">
                                    Not Refundable
                                  </Badge>
                                )}
                              </div>
                              {!item.refundable && (
                                <p className="text-xs text-red-600 mt-1">
                                  {item.format === "ebook"
                                    ? "eBook already downloaded"
                                    : "Item not eligible for refund"}
                                </p>
                              )}
                            </div>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-800">Gross Refund Amount:</span>
                        <span className="text-xl font-bold text-green-800">${calculateRefundAmount().toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">Includes applicable taxes and shipping costs</p>
                    </div>

                    {!isFirstReturn && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="font-medium text-amber-800 mb-3">Return Fees (Subsequent Return)</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Return Shipping Fee:</span>
                            <span>${returnFees.returnShippingFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Restocking Fee (15%, max $25):</span>
                            <span>${returnFees.restockingFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Processing Fee:</span>
                            <span>${returnFees.processingFee.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-medium">
                            <span>Total Fees:</span>
                            <span>${returnFees.totalFees.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className={`${
                        isFirstReturn ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                      } border rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">Net Refund Amount:</span>
                        <span className={`text-2xl font-bold ${isFirstReturn ? "text-green-800" : "text-blue-800"}`}>
                          ${(returnFees.netRefund || calculateRefundAmount()).toFixed(2)}
                        </span>
                      </div>
                      {isFirstReturn && (
                        <p className="text-sm text-green-700 mt-1">🎉 First return is free - no fees applied!</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedItems.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Refund Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="refundReason">Reason for Refund *</Label>
                    <Select value={refundReason} onValueChange={setRefundReason} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {refundReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {refundReason === "Other" && (
                    <div>
                      <Label htmlFor="customReason">Custom Reason *</Label>
                      <Input
                        id="customReason"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Please specify your reason"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Additional Details (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide any additional details about your refund request..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Refund Method</Label>
                    <RadioGroup value={refundMethod} onValueChange={setRefundMethod} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="original" id="original" />
                        <Label htmlFor="original" className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Refund to original payment method ({orderData.paymentMethod})
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="store-credit" id="store-credit" />
                        <Label htmlFor="store-credit" className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Store credit (10% bonus)
                        </Label>
                      </div>
                    </RadioGroup>
                    {refundMethod === "store-credit" && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Bonus:</strong> Get 10% extra value with store credit! Your $
                          {calculateRefundAmount().toFixed(2)} refund becomes $
                          {(calculateRefundAmount() * 1.1).toFixed(2)} in store credit.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Return Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedItems.some((id) => {
                      const item = orderData.items.find((i) => i.id === id)
                      return item?.format === "physical"
                    }) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Package className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-blue-800">Physical Items Return Process</p>
                            <ul className="text-sm text-blue-700 mt-2 space-y-1">
                              <li>• We'll email you a prepaid return shipping label</li>
                              <li>• Pack items securely in original packaging if possible</li>
                              <li>• Drop off at any authorized shipping location</li>
                              <li>• Refund will be processed once we receive the items</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedItems.some((id) => {
                      const item = orderData.items.find((i) => i.id === id)
                      return item?.format === "ebook"
                    }) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-800">eBook Refund Process</p>
                            <p className="text-sm text-green-700 mt-1">
                              eBook refunds are processed immediately upon approval. Access to the eBook will be revoked
                              once the refund is issued.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Important Notes:</p>
                      <ul className="space-y-1">
                        <li>• Refund processing time: 3-5 business days after approval</li>
                        <li>• You'll receive email updates throughout the process</li>
                        <li>• Original shipping costs are only refunded if all items are returned</li>
                        <li>• Items must be in original condition for full refund</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button type="button" variant="outline" onClick={() => setOrderData(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Refund Request"}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}
