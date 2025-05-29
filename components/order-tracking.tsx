"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, Search, MapPin, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ecommerceAPI, type TrackingInfo } from "@/lib/ecommerce-api"

interface OrderTrackingProps {
  orderId?: string
  embedded?: boolean
}

export function OrderTracking({ orderId: initialOrderId, embedded = false }: OrderTrackingProps) {
  const { toast } = useToast()
  const [orderId, setOrderId] = useState(initialOrderId || "")
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialOrderId) {
      trackOrder(initialOrderId)
    }
  }, [initialOrderId])

  const trackOrder = async (id: string = orderId) => {
    if (!id.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter a valid order ID",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await ecommerceAPI.trackOrder(id).catch(() => {
        // Fallback mock data
        return {
          success: true,
          order_id: id,
          status: "shipped",
          tracking_number: `TRK-${id.slice(-8).toUpperCase()}`,
          estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          tracking_events: [
            {
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: "Order Confirmed",
              description: "Your order has been confirmed and is being prepared",
            },
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: "Processing",
              description: "Your order is being prepared for shipment",
            },
            {
              date: new Date().toISOString(),
              status: "Shipped",
              description: "Your order has been shipped and is on its way",
            },
          ],
          items: [
            {
              title: "Sample Book",
              quantity: 1,
              type: "physical",
            },
          ],
        }
      })

      if (result.success) {
        setTrackingInfo(result)
      } else {
        toast({
          title: "Order Not Found",
          description: result.error || "Unable to find order with that ID",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Tracking Error",
        description: "Unable to retrieve tracking information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "shipped":
      case "in transit":
      case "out for delivery":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "processing":
        return <Package className="h-5 w-5 text-amber-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (embedded && !trackingInfo) {
    return null
  }

  return (
    <Card className={embedded ? "" : "max-w-4xl mx-auto"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Tracking
        </CardTitle>
        <CardDescription>
          {embedded ? "Track your order status" : "Enter your order ID to track your shipment"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!embedded && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="order-id" className="sr-only">
                Order ID
              </Label>
              <Input
                id="order-id"
                placeholder="Enter order ID (e.g., ORD-12345678)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && trackOrder()}
              />
            </div>
            <Button onClick={() => trackOrder()} disabled={isLoading}>
              {isLoading ? "Tracking..." : "Track"}
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {trackingInfo && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Order Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(trackingInfo.status || "")}
                    <Badge className={getStatusColor(trackingInfo.status || "")}>
                      {trackingInfo.status?.charAt(0).toUpperCase() + trackingInfo.status?.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tracking Number</span>
                  </div>
                  <p className="font-mono text-sm">{trackingInfo.tracking_number}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estimated Delivery</span>
                  </div>
                  <p className="text-sm">{trackingInfo.estimated_delivery}</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-2">
                {trackingInfo.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center">
                        {item.type === "physical" ? (
                          <Package className="h-5 w-5 text-slate-600" />
                        ) : (
                          <span className="text-xs font-bold text-slate-600">📱</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} • {item.type === "physical" ? "Physical Book" : "E-book"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tracking Timeline */}
            <div>
              <h3 className="font-semibold mb-4">Tracking Timeline</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 h-full w-0.5 bg-slate-200"></div>

                <div className="space-y-6">
                  {trackingInfo.tracking_events?.map((event, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-slate-200">
                        {index === 0 ? (
                          getStatusIcon(event.status)
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{event.status}</p>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(event.date)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button variant="outline" size="sm">
                <MapPin className="mr-2 h-4 w-4" />
                View on Map
              </Button>
              <Button variant="outline" size="sm">
                <Package className="mr-2 h-4 w-4" />
                Delivery Instructions
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        )}

        {!trackingInfo && !embedded && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter your order ID above to track your shipment</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
