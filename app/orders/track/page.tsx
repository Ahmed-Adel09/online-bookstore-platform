"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Search, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock order data for demonstration
const mockOrders = [
  {
    id: "ORD-123456",
    status: "delivered",
    orderDate: "May 15, 2024",
    estimatedDelivery: "May 20, 2024",
    actualDelivery: "May 19, 2024",
    total: 42.97,
    items: [
      { id: "1", title: "The Midnight Library", format: "physical", price: 14.99, quantity: 1 },
      { id: "2", title: "Atomic Habits", format: "ebook", price: 8.39, quantity: 1 },
      { id: "7", title: "Sapiens", format: "physical", price: 15.99, quantity: 1 },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },
    timeline: [
      {
        date: "May 15, 2024",
        time: "10:30 AM",
        status: "Order placed",
        description: "Your order has been confirmed and is being prepared",
      },
      {
        date: "May 15, 2024",
        time: "2:15 PM",
        status: "Payment confirmed",
        description: "Payment has been successfully processed",
      },
      {
        date: "May 16, 2024",
        time: "9:00 AM",
        status: "Processing",
        description: "Your order is being prepared for shipment",
      },
      {
        date: "May 16, 2024",
        time: "4:30 PM",
        status: "Shipped",
        description: "Your order has been shipped via UPS Ground",
      },
      {
        date: "May 17, 2024",
        time: "11:20 AM",
        status: "In transit",
        description: "Package is on its way to your location",
      },
      {
        date: "May 18, 2024",
        time: "8:45 AM",
        status: "Out for delivery",
        description: "Package is out for delivery and will arrive today",
      },
      {
        date: "May 19, 2024",
        time: "2:30 PM",
        status: "Delivered",
        description: "Package delivered successfully to your address",
      },
    ],
    trackingNumber: "1Z999AA1234567890",
    carrier: "UPS",
    paymentMethod: "Credit Card ending in 4242",
    canRequestRefund: false, // Delivered orders can still request refunds within 30 days
  },
  {
    id: "ORD-789012",
    status: "shipped",
    orderDate: "May 20, 2024",
    estimatedDelivery: "May 25, 2024",
    total: 29.88,
    items: [
      { id: "3", title: "Project Hail Mary", format: "physical", price: 16.89, quantity: 1 },
      { id: "5", title: "The Silent Patient", format: "ebook", price: 9.09, quantity: 1 },
    ],
    shippingAddress: {
      name: "Jane Smith",
      address: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "United States",
    },
    timeline: [
      {
        date: "May 20, 2024",
        time: "3:45 PM",
        status: "Order placed",
        description: "Your order has been confirmed and is being prepared",
      },
      {
        date: "May 20, 2024",
        time: "4:00 PM",
        status: "Payment confirmed",
        description: "Payment has been successfully processed",
      },
      {
        date: "May 21, 2024",
        time: "10:15 AM",
        status: "Processing",
        description: "Your order is being prepared for shipment",
      },
      {
        date: "May 22, 2024",
        time: "1:20 PM",
        status: "Shipped",
        description: "Your order has been shipped via FedEx Ground",
      },
      {
        date: "May 23, 2024",
        time: "9:30 AM",
        status: "In transit",
        description: "Package is on its way to your location",
      },
    ],
    trackingNumber: "1234567890123456",
    carrier: "FedEx",
    paymentMethod: "PayPal",
    canRequestRefund: true,
  },
  {
    id: "ORD-345678",
    status: "processing",
    orderDate: "May 22, 2024",
    estimatedDelivery: "May 27, 2024",
    total: 14.49,
    items: [{ id: "8", title: "The Four Winds", format: "physical", price: 14.49, quantity: 1 }],
    shippingAddress: {
      name: "Mike Johnson",
      address: "789 Pine Street",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "United States",
    },
    timeline: [
      {
        date: "May 22, 2024",
        time: "11:20 AM",
        status: "Order placed",
        description: "Your order has been confirmed and is being prepared",
      },
      {
        date: "May 22, 2024",
        time: "11:25 AM",
        status: "Payment confirmed",
        description: "Payment has been successfully processed",
      },
      {
        date: "May 23, 2024",
        time: "8:00 AM",
        status: "Processing",
        description: "Your order is being prepared for shipment",
      },
    ],
    trackingNumber: null,
    carrier: "UPS",
    paymentMethod: "Credit Card ending in 1234",
    canRequestRefund: true,
  },
]

export default function TrackOrderPage() {
  const { toast } = useToast()
  const [orderNumber, setOrderNumber] = useState("")
  const [orderData, setOrderData] = useState<(typeof mockOrders)[0] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call to fetch order data
    setTimeout(() => {
      const foundOrder = mockOrders.find((order) => order.id.toLowerCase() === orderNumber.toLowerCase())

      if (foundOrder) {
        setOrderData(foundOrder)
        setError("")
      } else {
        setOrderData(null)
        setError("No order found with that order number. Please check and try again.")
        toast({
          title: "Order Not Found",
          description: "We couldn't find an order with that order number.",
          variant: "destructive",
        })
      }

      setIsLoading(false)
    }, 1000)
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "shipped":
      case "in transit":
      case "out for delivery":
        return <Truck className="h-6 w-6 text-blue-500" />
      case "processing":
        return <Package className="h-6 w-6 text-amber-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  // Helper function to get status color class
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
      case "in transit":
      case "out for delivery":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
      <p className="text-lg text-gray-600 mb-8">
        Enter your order number to check the status of your order and track its progress.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <CardDescription>Enter your order number (ORD-XXXXXX)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <div className="flex gap-2">
                <Input
                  id="orderNumber"
                  placeholder="e.g., ORD-123456"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isLoading || !orderNumber}>
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
            <p>Demo order numbers: ORD-123456, ORD-789012, ORD-345678</p>
          </div>
        </CardContent>
      </Card>

      {orderData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{orderData.id}</CardTitle>
                  <CardDescription>Placed on {orderData.orderDate}</CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(orderData.status)}`}>
                  {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Total:</span>
                      <span className="font-medium">${orderData.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span>{orderData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span>{orderData.estimatedDelivery}</span>
                    </div>
                    {orderData.actualDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered On:</span>
                        <span className="text-green-600 font-medium">{orderData.actualDelivery}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Shipping Information</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{orderData.shippingAddress.name}</p>
                    <p>{orderData.shippingAddress.address}</p>
                    <p>
                      {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{" "}
                      {orderData.shippingAddress.zipCode}
                    </p>
                    <p>{orderData.shippingAddress.country}</p>
                    {orderData.trackingNumber && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-gray-600">Tracking Number:</p>
                        <p className="font-mono text-sm">{orderData.trackingNumber}</p>
                        <p className="text-gray-600">Carrier: {orderData.carrier}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Items Ordered</h3>
                  <ul className="space-y-2">
                    {orderData.items.map((item, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.format === "physical" ? "Physical" : "eBook"}
                              </Badge>
                              <span className="text-gray-500">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-medium">${item.price.toFixed(2)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-gray-700 mb-4">Order Timeline</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {orderData.timeline.map((event, index) => (
                      <div key={index} className="relative flex items-start gap-4">
                        <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                          {index === orderData.timeline.length - 1 ? (
                            getStatusIcon(event.status)
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                        <div className="ml-10">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{event.status}</p>
                            <Badge variant="outline" className="text-xs">
                              {event.date} at {event.time}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={() => window.print()}>
              Print Order Details
            </Button>
            {orderData.canRequestRefund && (
              <Link href={`/orders/refund?orderId=${orderData.id}`}>
                <Button variant="outline">Request Refund</Button>
              </Link>
            )}
            {orderData.trackingNumber && <Button variant="outline">Track with {orderData.carrier}</Button>}
            <Link href="/support">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
