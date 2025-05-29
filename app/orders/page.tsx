"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, Clock, CheckCircle, Truck, RefreshCw, Eye, RotateCcw } from "lucide-react"

// Mock order data
const mockOrders = [
  {
    id: "ORD-123456",
    date: "May 19, 2024",
    status: "delivered",
    total: 42.97,
    items: 3,
    estimatedDelivery: "May 20, 2024",
    trackingNumber: "1Z999AA1234567890",
  },
  {
    id: "ORD-789012",
    date: "May 20, 2024",
    status: "shipped",
    total: 29.88,
    items: 2,
    estimatedDelivery: "May 25, 2024",
    trackingNumber: "1234567890123456",
  },
  {
    id: "ORD-345678",
    date: "May 22, 2024",
    status: "processing",
    total: 14.49,
    items: 1,
    estimatedDelivery: "May 27, 2024",
    trackingNumber: null,
  },
  {
    id: "ORD-567890",
    date: "April 15, 2024",
    status: "delivered",
    total: 67.45,
    items: 4,
    estimatedDelivery: "April 18, 2024",
    trackingNumber: "1Z999BB9876543210",
  },
  {
    id: "ORD-234567",
    date: "March 28, 2024",
    status: "delivered",
    total: 23.98,
    items: 2,
    estimatedDelivery: "March 30, 2024",
    trackingNumber: "9876543210987654",
  },
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "processing":
        return <Package className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || order.status === activeTab
    return matchesSearch && matchesTab
  })

  const getTabCount = (status: string) => {
    if (status === "all") return mockOrders.length
    return mockOrders.filter((order) => order.status === status).length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-lg text-gray-600">Track and manage your orders</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href="/orders/track">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Track Order
            </Button>
          </Link>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({getTabCount("processing")})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({getTabCount("shipped")})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({getTabCount("delivered")})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? "No orders match your search criteria." : "You haven't placed any orders yet."}
                </p>
                {!searchQuery && (
                  <Link href="/books">
                    <Button>Start Shopping</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Order Date:</span>
                            <br />
                            {order.date}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span>
                            <br />
                            <span className="text-lg font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Items:</span>
                            <br />
                            {order.items} item{order.items !== 1 ? "s" : ""}
                          </div>
                        </div>

                        {order.status !== "delivered" && (
                          <div className="mt-3 text-sm">
                            <span className="font-medium text-gray-600">Estimated Delivery: </span>
                            <span className="text-blue-600">{order.estimatedDelivery}</span>
                          </div>
                        )}

                        {order.trackingNumber && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-600">Tracking: </span>
                            <span className="font-mono text-blue-600">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                        <Link href={`/orders/track?orderId=${order.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </Link>

                        {order.status === "delivered" && (
                          <Link href={`/orders/refund?orderId=${order.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <RotateCcw className="h-4 w-4" />
                              Request Refund
                            </Button>
                          </Link>
                        )}

                        {order.status === "processing" && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Can't find what you're looking for? Our support team is here to help.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/orders/track">
                <Button variant="outline">Track an Order</Button>
              </Link>
              <Link href="/returns">
                <Button variant="outline">Return Policy</Button>
              </Link>
              <Link href="/support">
                <Button>Contact Support</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
