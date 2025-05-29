import { supabase } from "./supabase"

export interface LogEntry {
  id?: string
  event_type: string
  user_id?: string
  user_email?: string
  ip_address?: string
  user_agent?: string
  session_id?: string
  event_data: Record<string, any>
  severity: "info" | "warning" | "error" | "critical"
  timestamp: string
  module: string
  action: string
  status: "success" | "failure" | "pending"
  metadata?: Record<string, any>
}

export interface ShippingLog {
  user_id: string
  order_id: string
  shipping_method: string
  shipping_address: Record<string, any>
  tracking_number?: string
  estimated_delivery?: string
  cost: number
  timestamp: string
}

export interface PaymentLog {
  user_id: string
  order_id: string
  payment_method: string
  amount: number
  currency: string
  transaction_id?: string
  card_last_four?: string
  billing_address: Record<string, any>
  status: "pending" | "completed" | "failed" | "refunded"
  timestamp: string
}

export interface AuthLog {
  user_id?: string
  email: string
  event_type:
    | "login_attempt"
    | "login_success"
    | "login_failure"
    | "logout"
    | "signup_attempt"
    | "signup_success"
    | "signup_failure"
  ip_address?: string
  user_agent?: string
  failure_reason?: string
  timestamp: string
}

class LoggingService {
  private static instance: LoggingService
  private sessionId: string
  private ipAddress = "unknown"
  private userAgent = "unknown"
  private isClient = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isClient = typeof window !== "undefined"
    this.initializeClientInfo()
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService()
    }
    return LoggingService.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async initializeClientInfo() {
    if (this.isClient) {
      this.userAgent = navigator.userAgent || "unknown"

      // Try to get IP address, but don't fail if it doesn't work
      try {
        const response = await fetch("https://api.ipify.org?format=json")
        const data = await response.json()
        this.ipAddress = data.ip || "unknown"
      } catch (error) {
        // Silently fail - IP address is not critical
        this.ipAddress = "unknown"
      }
    }
  }

  private isDevelopment(): boolean {
    // Check multiple ways to determine if we're in development
    if (this.isClient) {
      return (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("localhost") ||
        window.location.port === "3000"
      )
    }
    return false
  }

  async logEvent(entry: Omit<LogEntry, "timestamp" | "ip_address" | "user_agent" | "session_id">): Promise<void> {
    try {
      const logEntry: LogEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        ip_address: this.ipAddress,
        user_agent: this.userAgent,
        session_id: this.sessionId,
      }

      // Try to store in Supabase
      try {
        const { error } = await supabase.from("system_logs").insert([logEntry])

        if (error) {
          console.warn("Failed to log event to database:", error.message)
          this.fallbackLog(logEntry)
        } else if (this.isDevelopment()) {
          console.log("📝 Event Logged to Supabase:", {
            type: logEntry.event_type,
            action: logEntry.action,
            user: logEntry.user_email || logEntry.user_id,
            data: logEntry.event_data,
          })
        }
      } catch (dbError) {
        console.warn("Database logging failed, using fallback:", dbError)
        this.fallbackLog(logEntry)
      }
    } catch (error) {
      console.warn("Logging service error:", error)
      // Don't throw - logging should never break the application
    }
  }

  async logShipping(shippingData: Omit<ShippingLog, "timestamp">): Promise<void> {
    try {
      const shippingLog: ShippingLog = {
        ...shippingData,
        timestamp: new Date().toISOString(),
      }

      try {
        const { error } = await supabase.from("shipping_logs").insert([shippingLog])
        if (error) {
          console.warn("Failed to log shipping:", error.message)
        }
      } catch (dbError) {
        console.warn("Shipping logging failed:", dbError)
      }

      await this.logEvent({
        event_type: "shipping_created",
        user_id: shippingData.user_id,
        module: "shipping",
        action: "create_shipping",
        status: "success",
        severity: "info",
        event_data: {
          order_id: shippingData.order_id,
          shipping_method: shippingData.shipping_method,
          cost: shippingData.cost,
        },
      })
    } catch (error) {
      console.warn("Shipping logging error:", error)
    }
  }

  async logPayment(paymentData: Omit<PaymentLog, "timestamp">): Promise<void> {
    try {
      const paymentLog: PaymentLog = {
        ...paymentData,
        timestamp: new Date().toISOString(),
      }

      // Sanitize sensitive data before storing
      const sanitizedLog = {
        ...paymentLog,
        billing_address: {
          ...paymentLog.billing_address,
          card_number: undefined,
          cvc: undefined,
        },
      }

      try {
        const { error } = await supabase.from("payment_logs").insert([sanitizedLog])
        if (error) {
          console.warn("Failed to log payment:", error.message)
        }
      } catch (dbError) {
        console.warn("Payment logging failed:", dbError)
      }

      await this.logEvent({
        event_type: "payment_processed",
        user_id: paymentData.user_id,
        module: "payment",
        action: "process_payment",
        status: paymentData.status === "completed" ? "success" : "failure",
        severity: paymentData.status === "failed" ? "error" : "info",
        event_data: {
          order_id: paymentData.order_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id,
        },
      })
    } catch (error) {
      console.warn("Payment logging error:", error)
    }
  }

  async logAuth(authData: Omit<AuthLog, "timestamp" | "ip_address" | "user_agent">): Promise<void> {
    try {
      const authLog: AuthLog = {
        ...authData,
        timestamp: new Date().toISOString(),
        ip_address: this.ipAddress,
        user_agent: this.userAgent,
      }

      try {
        const { error } = await supabase.from("auth_logs").insert([authLog])
        if (error) {
          console.warn("Failed to log auth event:", error.message)
        }
      } catch (dbError) {
        console.warn("Auth logging failed:", dbError)
      }

      await this.logEvent({
        event_type: authData.event_type,
        user_id: authData.user_id,
        user_email: authData.email,
        module: "authentication",
        action: authData.event_type,
        status: authData.event_type.includes("success") ? "success" : "failure",
        severity: authData.event_type.includes("failure") ? "warning" : "info",
        event_data: {
          email: authData.email,
          failure_reason: authData.failure_reason,
        },
      })
    } catch (error) {
      console.warn("Auth logging error:", error)
    }
  }

  async logUserInteraction(action: string, userId?: string, data?: Record<string, any>): Promise<void> {
    try {
      await this.logEvent({
        event_type: "user_interaction",
        user_id: userId,
        module: "user_interface",
        action,
        status: "success",
        severity: "info",
        event_data: data || {},
      })
    } catch (error) {
      console.warn("User interaction logging error:", error)
    }
  }

  async logSystemEvent(
    event: string,
    severity: LogEntry["severity"] = "info",
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.logEvent({
        event_type: "system_event",
        module: "system",
        action: event,
        status: "success",
        severity,
        event_data: data || {},
      })
    } catch (error) {
      console.warn("System event logging error:", error)
    }
  }

  async logError(error: Error, context?: string, userId?: string): Promise<void> {
    try {
      await this.logEvent({
        event_type: "error",
        user_id: userId,
        module: context || "unknown",
        action: "error_occurred",
        status: "failure",
        severity: "error",
        event_data: {
          error_message: error.message,
          error_stack: error.stack,
          context,
        },
      })
    } catch (logError) {
      console.warn("Error logging failed:", logError)
    }
  }

  private fallbackLog(entry: LogEntry): void {
    if (!this.isClient) return

    try {
      const logs = JSON.parse(localStorage.getItem("fallback_logs") || "[]")
      logs.push(entry)

      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }

      localStorage.setItem("fallback_logs", JSON.stringify(logs))
    } catch (error) {
      console.warn("Fallback logging failed:", error)
    }
  }

  async getRecentLogs(limit = 50): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) {
        console.warn("Failed to fetch logs:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.warn("Error fetching logs:", error)
      return []
    }
  }

  async getLogsByUser(userId: string, limit = 50): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) {
        console.warn("Failed to fetch user logs:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.warn("Error fetching user logs:", error)
      return []
    }
  }
}

export const loggingService = LoggingService.getInstance()
export const logger = loggingService
