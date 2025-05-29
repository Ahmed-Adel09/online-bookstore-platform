// E-commerce API client for comprehensive book platform
export interface ShippingAddress {
  first_name: string
  last_name: string
  street_address: string
  apartment?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

export interface PaymentInfo {
  method: "credit_card" | "debit_card" | "paypal" | "apple_pay" | "google_pay"
  card_number?: string
  card_name?: string
  expiry?: string
  cvc?: string
  billing_address?: ShippingAddress
}

export interface CartItem {
  book: {
    id: string
    title: string
    author: string
    price: number
    book_type: "physical" | "ebook" | "both"
    weight_oz?: number
    digital_formats?: string[]
    stock_quantity: number
  }
  quantity: number
  selected_format?: "epub" | "pdf" | "mobi"
}

export interface ShippingOption {
  method: string
  name: string
  description: string
  base_cost: number
  delivery_days: string
}

export interface OrderResult {
  success: boolean
  order_id?: string
  transaction_id?: string
  total?: number
  digital_downloads?: Array<{
    book_id: string
    book_title: string
    format: string
    download_url: string
    expires_at: string
  }>
  tracking_number?: string
  estimated_delivery?: string
  error?: string
  message?: string
}

export interface TrackingInfo {
  success: boolean
  order_id?: string
  status?: string
  tracking_number?: string
  estimated_delivery?: string
  tracking_events?: Array<{
    date: string
    status: string
    description: string
  }>
  items?: Array<{
    title: string
    quantity: number
    type: string
  }>
  error?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_API_URL || "http://localhost:8001"

class EcommerceAPI {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async calculateShipping(
    items: CartItem[],
    shippingMethod: string,
    destinationCountry = "United States",
  ): Promise<{
    cost: number
    method: string
    description: string
    delivery_estimate: string
    weight_oz?: number
    free_shipping_eligible?: boolean
    error?: string
  }> {
    return this.makeRequest("/api/shipping/calculate", {
      method: "POST",
      body: JSON.stringify({
        items,
        shipping_method: shippingMethod,
        destination_country: destinationCountry,
      }),
    })
  }

  async getShippingMethods(destinationCountry = "United States"): Promise<ShippingOption[]> {
    return this.makeRequest(`/api/shipping/methods?country=${encodeURIComponent(destinationCountry)}`)
  }

  async checkInventory(items: CartItem[]): Promise<{
    all_available: boolean
    items: Record<
      string,
      {
        available: boolean
        requested: number
        in_stock: number
        type: string
      }
    >
  }> {
    return this.makeRequest("/api/inventory/check", {
      method: "POST",
      body: JSON.stringify({ items }),
    })
  }

  async processOrder(
    userId: string,
    items: CartItem[],
    shippingAddress: ShippingAddress | null,
    paymentInfo: PaymentInfo,
    shippingMethod?: string,
  ): Promise<OrderResult> {
    return this.makeRequest("/api/orders/process", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        items,
        shipping_address: shippingAddress,
        payment_info: paymentInfo,
        shipping_method: shippingMethod,
      }),
    })
  }

  async trackOrder(orderId: string): Promise<TrackingInfo> {
    return this.makeRequest(`/api/orders/track/${orderId}`)
  }

  async processReturn(
    orderId: string,
    returnItems: string[],
    reason: string,
  ): Promise<{
    success: boolean
    return_id?: string
    refund_amount?: number
    processing_time?: string
    message?: string
    error?: string
  }> {
    return this.makeRequest("/api/returns/process", {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        return_items: returnItems,
        reason,
      }),
    })
  }

  async downloadEbook(downloadToken: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/download/${downloadToken}`)
    if (!response.ok) {
      throw new Error("Download failed")
    }
    return response.blob()
  }

  // Fallback methods for when backend is not available
  async calculateShippingFallback(items: CartItem[], shippingMethod: string, destinationCountry = "United States") {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const physicalItems = items.filter((item) => item.book.book_type === "physical" || item.book.book_type === "both")

    if (physicalItems.length === 0) {
      return {
        cost: 0,
        method: "digital_delivery",
        description: "Digital delivery - no shipping required",
        delivery_estimate: "Immediate",
      }
    }

    const subtotal = physicalItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0)
    const isInternational = destinationCountry.toLowerCase() !== "united states"

    let cost = 0
    let description = ""
    let deliveryEstimate = ""

    switch (shippingMethod) {
      case "standard":
        cost = isInternational ? 24.99 : subtotal >= 35 ? 0 : 4.99
        description = isInternational ? "7-14 business days" : "3-5 business days"
        deliveryEstimate = isInternational ? "7-14 business days" : "3-5 business days"
        break
      case "expedited":
        cost = isInternational ? 39.99 : 9.99
        description = isInternational ? "3-7 business days" : "1-2 business days"
        deliveryEstimate = isInternational ? "3-7 business days" : "1-2 business days"
        break
      case "overnight":
        cost = isInternational ? 59.99 : 19.99
        description = isInternational ? "1-3 business days" : "Next business day"
        deliveryEstimate = isInternational ? "1-3 business days" : "Next business day"
        break
      default:
        cost = 4.99
        description = "3-5 business days"
        deliveryEstimate = "3-5 business days"
    }

    return {
      cost,
      method: shippingMethod,
      description,
      delivery_estimate: deliveryEstimate,
      free_shipping_eligible: subtotal >= 35 && !isInternational,
    }
  }

  async processOrderFallback(
    userId: string,
    items: CartItem[],
    shippingAddress: ShippingAddress | null,
    paymentInfo: PaymentInfo,
    shippingMethod?: string,
  ): Promise<OrderResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const orderId = `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 12).toUpperCase()}`

    const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0)
    const shippingCost = shippingMethod ? await this.calculateShippingFallback(items, shippingMethod) : { cost: 0 }
    const tax = subtotal * 0.08
    const total = subtotal + shippingCost.cost + tax

    // Generate digital downloads for e-books
    const digitalDownloads = items
      .filter((item) => item.book.book_type === "ebook" || item.book.book_type === "both")
      .flatMap((item) =>
        (item.book.digital_formats || ["epub"]).map((format) => ({
          book_id: item.book.id,
          book_title: item.book.title,
          format,
          download_url: `/api/download/${Math.random().toString(36).substr(2, 32)}`,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      )

    return {
      success: true,
      order_id: orderId,
      transaction_id: transactionId,
      total,
      digital_downloads: digitalDownloads,
      tracking_number: shippingMethod ? `TRK-${Math.random().toString(36).substr(2, 10).toUpperCase()}` : "",
      estimated_delivery: shippingMethod
        ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
        : "Immediate",
      message: "Order processed successfully",
    }
  }
}

export const ecommerceAPI = new EcommerceAPI()
