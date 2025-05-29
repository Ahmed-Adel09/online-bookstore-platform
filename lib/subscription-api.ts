// API client for subscription and theme management
export interface PaymentData {
  user_id: string
  plan: "monthly" | "yearly"
  card_number: string
  card_name: string
  expiry: string
  cvc: string
  billing_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: string[]
  tier: "free" | "monthly" | "yearly"
}

export interface SubscriptionResponse {
  success: boolean
  message: string
  subscription: {
    tier: string
    start_date: string
    end_date: string
    transaction_id: string
  }
  unlocked_themes: Theme[]
  auto_applied_theme: Theme | null
  total_available_themes: number
}

export interface SubscriptionStatus {
  tier: string
  is_premium: boolean
  available_themes: Theme[]
  total_themes: number
  subscription_active: boolean
  end_date?: string
  newly_unlocked?: string[]
  auto_applied?: string
  unlock_timestamp?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class SubscriptionAPI {
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

  async processSubscription(paymentData: PaymentData): Promise<SubscriptionResponse> {
    return this.makeRequest<SubscriptionResponse>("/api/subscription/process", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    return this.makeRequest<SubscriptionStatus>(`/api/subscription/status/${userId}`)
  }

  async validateThemeAccess(
    userId: string,
    themeId: string,
  ): Promise<{ has_access: boolean; theme_name?: string; required_tier?: string }> {
    return this.makeRequest("/api/themes/validate-access", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, theme_id: themeId }),
    })
  }

  async getAvailableThemes(
    userId: string,
  ): Promise<{ available_themes: Theme[]; total_themes: number; subscription_tier: string; is_premium: boolean }> {
    return this.makeRequest(`/api/themes/available/${userId}`)
  }

  async getAllThemes(): Promise<{ themes: Theme[] }> {
    return this.makeRequest("/api/themes/all")
  }

  // Fallback methods for when backend is not available
  async processSubscriptionFallback(paymentData: PaymentData): Promise<SubscriptionResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockThemes: Theme[] =
      paymentData.plan === "yearly"
        ? [
            {
              id: "midnight",
              name: "Midnight",
              description: "Deep dark theme",
              colors: ["#0f172a", "#1e293b"],
              tier: "monthly",
            },
            {
              id: "retro-storm",
              name: "Retro Storm",
              description: "Retro green theme",
              colors: ["#0a0a0a", "#003300"],
              tier: "monthly",
            },
            {
              id: "crimson-moon",
              name: "Crimson Moon",
              description: "Red dark theme",
              colors: ["#1a0505", "#2d0a0a"],
              tier: "monthly",
            },
            {
              id: "sunset",
              name: "Sunset",
              description: "Warm sunset theme",
              colors: ["#7d2a2a", "#a73e3e"],
              tier: "yearly",
            },
            {
              id: "forest",
              name: "Forest",
              description: "Green forest theme",
              colors: ["#0f2417", "#1e3a2f"],
              tier: "yearly",
            },
            {
              id: "amoled-dark",
              name: "AMOLED Dark",
              description: "Pure black theme",
              colors: ["#000000", "#0a0a0a"],
              tier: "yearly",
            },
            {
              id: "ocean-breeze",
              name: "Ocean Breeze",
              description: "Blue ocean theme",
              colors: ["#0c4a6e", "#0369a1"],
              tier: "yearly",
            },
            {
              id: "golden-hour",
              name: "Golden Hour",
              description: "Golden warm theme",
              colors: ["#451a03", "#92400e"],
              tier: "yearly",
            },
          ]
        : [
            {
              id: "midnight",
              name: "Midnight",
              description: "Deep dark theme",
              colors: ["#0f172a", "#1e293b"],
              tier: "monthly",
            },
            {
              id: "retro-storm",
              name: "Retro Storm",
              description: "Retro green theme",
              colors: ["#0a0a0a", "#003300"],
              tier: "monthly",
            },
            {
              id: "crimson-moon",
              name: "Crimson Moon",
              description: "Red dark theme",
              colors: ["#1a0505", "#2d0a0a"],
              tier: "monthly",
            },
          ]

    return {
      success: true,
      message: `Successfully activated ${paymentData.plan} subscription with ${mockThemes.length} new themes!`,
      subscription: {
        tier: paymentData.plan,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + (paymentData.plan === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        transaction_id: `TXN-${Date.now()}`,
      },
      unlocked_themes: mockThemes,
      auto_applied_theme: mockThemes[0] || null,
      total_available_themes: mockThemes.length + 2, // +2 for free themes
    }
  }
}

export const subscriptionAPI = new SubscriptionAPI()
