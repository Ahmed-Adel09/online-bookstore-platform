"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Search, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock return data for demonstration
const mockReturns = [
  {
    id: "RET-123456",
    orderId: "ORD-789012",
    status: "delivered",
    items: [
      { title: "The Midnight Library", quantity: 1 },
      { title: "Atomic Habits", quantity: 1 },
    ],
    timeline: [
      { date: "May 15, 2023", status: "Return requested", description: "Return request submitted" },
      { date: "May 16, 2023", status: "Return approved", description: "Return request approved" },
      { date: "May 18, 2023", status: "In transit", description: "Package picked up by carrier" },
      { date: "May 20, 2023", status: "Delivered", description: "Package received at our warehouse" },
      { date: "May 21, 2023", status: "Processing", description: "Return is being processed" },
      { date: "May 22, 2023", status: "Completed", description: "Refund issued to original payment method" },
    ],
    refundAmount: 26.97,
    returnType: "First return",
    shippingCost: 0,
  },
  {
    id: "RET-654321",
    orderId: "ORD-345678",
    status: "in_transit",
    items: [{ title: "The Four Winds", quantity: 1 }],
    timeline: [
      { date: "June 5, 2023", status: "Return requested", description: "Return request submitted" },
      { date: "June 6, 2023", status: "Return approved", description: "Return request approved" },
      { date: "June 8, 2023", status: "In transit", description: "Package picked up by carrier" },
    ],
    refundAmount: 14.49,
    returnType: "Second return",
    shippingCost: 5.99,
  },
  {
    id: "RET-987654",
    orderId: "ORD-123456",
    status: "processing",
    items: [{ title: "Sapiens: A Brief History of Humankind", quantity: 1 }],
    timeline: [
      { date: "June 10, 2023", status: "Return requested", description: "Return request submitted" },
      { date: "June 11, 2023", status: "Return approved", description: "Return request approved" },
      { date: "June 13, 2023", status: "In transit", description: "Package picked up by carrier" },
      { date: "June 15, 2023", status: "Delivered", description: "Package received at our warehouse" },
      { date: "June 16, 2023", status: "Processing", description: "Return is being processed" },
    ],
    refundAmount: 15.99,
    returnType: "Second return",
    shippingCost: 5.99,
  },
]

export default function TrackReturnPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [returnData, setReturnData] = useState<(typeof mockReturns)[0] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrackReturn = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call to fetch return data
    setTimeout(() => {
      const foundReturn = mockReturns.find(
        (ret) =>
          ret.id.toLowerCase() === trackingNumber.toLowerCase() ||
          ret.orderId.toLowerCase() === trackingNumber.toLowerCase(),
      )

      if (foundReturn) {
        setReturnData(foundReturn)
        setError("")
      } else {
        setReturnData(null)
        setError("No return found with that tracking number or order ID. Please check and try again.")
        toast({
          title: "Return Not Found",
          description: "We couldn't find a return with that tracking number or order ID.",
          variant: "destructive",
        })
      }

      setIsLoading(false)
    }, 1000)
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "in transit":
      case "in_transit":
        return <Truck className="h-6 w-6 text-blue-500" />
      case "processing":
        return <Package className="h-6 w-6 text-amber-500" />
      case "delivered":
        return <Package className="h-6 w-6 text-green-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  // Helper function to get status color class
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in transit":
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-amber-100 text-amber-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/returns" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Returns
      </Link>

      <h1 className="text-3xl font-bold mb-4">Track Your Return</h1>
      <p className="text-lg text-gray-600 mb-8">
        Enter your return tracking number or order ID to check the status of your return.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Return Tracking</CardTitle>
          <CardDescription>Enter your return tracking number (RET-XXXXXX) or order ID (ORD-XXXXXX)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackReturn} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number or Order ID</Label>
              <div className="flex gap-2">
                <Input
                  id="trackingNumber"
                  placeholder="e.g., RET-123456 or ORD-789012"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isLoading || !trackingNumber}>
                  {isLoading ? "Searching..." : "Track"}
                  {!isLoading && <Search className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            <p>Demo tracking numbers: RET-123456, RET-654321, RET-987654</p>
            <p>Demo order IDs: ORD-789012, ORD-345678, ORD-123456</p>
          </div>
        </CardContent>
      </Card>

      {returnData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Return #{returnData.id}</CardTitle>
                  <CardDescription>Order #{returnData.orderId}</CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(returnData.status)}`}>
                  {returnData.status.charAt(0).toUpperCase() + returnData.status.slice(1).replace("_", " ")}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Return Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Type:</span>
                      <span>{returnData.returnType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Cost:</span>
                      <span>{returnData.shippingCost === 0 ? "Free" : `$${returnData.shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Amount:</span>
                      <span className="font-medium">${returnData.refundAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Items Being Returned</h3>
                  <ul className="space-y-2">
                    {returnData.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.title}</span>
                        <span>x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-gray-700 mb-4">Return Timeline</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {returnData.timeline.map((event, index) => (
                      <div key={index} className="relative flex items-start gap-4">
                        <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                          {index === returnData.timeline.length - 1 ? (
                            getStatusIcon(event.status)
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                        <div className="ml-10">
                          <p className="font-medium">{event.status}</p>
                          <p className="text-sm text-gray-500">{event.date}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.print()}>
              Print Details
            </Button>
            <Link href="/returns">
              <Button>Return Policy</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
