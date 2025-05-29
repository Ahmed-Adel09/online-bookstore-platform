"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logging-service"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  isAuthenticated: boolean
  isPremium: boolean
  premiumPlan: string | null
  user: User | null
  userRole: "user" | "admin" | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string; error?: string }>
  logout: () => void
  setPremiumStatus: (status: boolean, plan?: string) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin credentials for demo
const ADMIN_CREDENTIALS = {
  email: "drshima123@gmail.com",
  password: "drshima123",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [premiumPlan, setPremiumPlan] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Determine user role
  const determineUserRole = useCallback((email: string): "user" | "admin" => {
    return email === ADMIN_CREDENTIALS.email || email === "admin@bookhaven.com" ? "admin" : "user"
  }, [])

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          setIsAuthenticated(true)

          const role = determineUserRole(session.user.email || "")
          setUserRole(role)

          const metadata = session.user.user_metadata || {}
          setIsPremium(metadata.is_premium || false)
          setPremiumPlan(metadata.premium_plan || null)

          await logger.logAuth({
            user_id: session.user.id,
            email: session.user.email || "",
            event_type: "login_success",
          })
        } else {
          // Check localStorage for demo session
          const storedAuth = localStorage.getItem("isAuthenticated") === "true"
          const storedUserData = localStorage.getItem("userData")

          if (storedAuth && storedUserData) {
            const userData = JSON.parse(storedUserData)
            setUser(userData as User)
            setIsAuthenticated(true)

            const role = determineUserRole(userData.email)
            setUserRole(role)

            const metadata = userData.user_metadata || {}
            setIsPremium(metadata.is_premium || false)
            setPremiumPlan(metadata.premium_plan || null)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        await logger.logError(error as Error, "auth_check")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        setIsAuthenticated(true)

        const role = determineUserRole(session.user.email || "")
        setUserRole(role)

        const metadata = session.user.user_metadata || {}
        setIsPremium(metadata.is_premium || false)
        setPremiumPlan(metadata.premium_plan || null)

        await logger.logAuth({
          user_id: session.user.id,
          email: session.user.email || "",
          event_type: event === "SIGNED_IN" ? "login_success" : "login_success",
        })
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAuthenticated(false)
        setUserRole(null)
        setIsPremium(false)
        setPremiumPlan(null)

        // Clear localStorage
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("userData")
        localStorage.removeItem("userEmail")

        await logger.logSystemEvent("user_signed_out")
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [determineUserRole])

  // Redirect logic based on authentication and role
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && userRole) {
      const currentPath = pathname

      // If user is on login page, redirect to appropriate dashboard
      if (currentPath === "/auth/login" || currentPath === "/admin/login") {
        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/profile")
        }
        return
      }

      // Protect admin routes
      if (currentPath.startsWith("/admin") && userRole !== "admin") {
        router.push("/profile")
        return
      }
    }

    // Redirect unauthenticated users from protected routes
    if (!isLoading && !isAuthenticated) {
      const protectedRoutes = ["/profile", "/admin", "/orders", "/premium", "/exclusive-themes"]
      const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

      if (isProtectedRoute && !pathname.startsWith("/auth")) {
        const loginPath = pathname.startsWith("/admin") ? "/auth/login" : "/auth/login"
        router.push(`${loginPath}?returnUrl=${encodeURIComponent(pathname)}`)
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user, userRole])

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; redirectTo?: string; error?: string }> => {
      try {
        setIsLoading(true)

        // Log login attempt
        await logger.logAuth({
          email,
          event_type: "login_attempt",
        })

        // Check for admin credentials first
        if (
          (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) ||
          (email === "admin@bookhaven.com" && password === "admin123")
        ) {
          const adminEmail = email === ADMIN_CREDENTIALS.email ? ADMIN_CREDENTIALS.email : "admin@bookhaven.com"

          // Create admin user object
          const adminUser = {
            id: "admin-001",
            email: adminEmail,
            user_metadata: {
              first_name: "Dr",
              last_name: "Shima",
              role: "admin",
              is_premium: true,
              premium_plan: "enterprise",
            },
            created_at: new Date().toISOString(),
          } as User

          setUser(adminUser)
          setIsAuthenticated(true)
          setUserRole("admin")
          setIsPremium(true)
          setPremiumPlan("enterprise")

          // Store in localStorage for persistence
          localStorage.setItem("isAuthenticated", "true")
          localStorage.setItem("userData", JSON.stringify(adminUser))
          localStorage.setItem("userEmail", adminUser.email || "")

          await logger.logAuth({
            user_id: adminUser.id,
            email: adminUser.email || "",
            event_type: "login_success",
          })

          await logger.logUserInteraction("login", adminUser.id, {
            role: "admin",
            login_method: "demo_credentials",
          })

          return { success: true, redirectTo: "/admin/dashboard" }
        }

        // Try Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          await logger.logAuth({
            email,
            event_type: "login_failure",
            failure_reason: error.message,
          })
          return { success: false, error: "Invalid email or password" }
        }

        if (data.user) {
          setUser(data.user)
          setIsAuthenticated(true)

          const role = determineUserRole(data.user.email || "")
          setUserRole(role)

          const metadata = data.user.user_metadata || {}
          setIsPremium(metadata.is_premium || false)
          setPremiumPlan(metadata.premium_plan || null)

          await logger.logAuth({
            user_id: data.user.id,
            email: data.user.email || "",
            event_type: "login_success",
          })

          await logger.logUserInteraction("login", data.user.id, {
            role,
            login_method: "supabase",
          })

          const redirectTo = role === "admin" ? "/admin/dashboard" : "/profile"
          return { success: true, redirectTo }
        }

        return { success: false, error: "Authentication failed" }
      } catch (error) {
        console.error("Login error:", error)
        await logger.logError(error as Error, "login", undefined)
        await logger.logAuth({
          email,
          event_type: "login_failure",
          failure_reason: (error as Error).message,
        })
        return { success: false, error: "Authentication failed" }
      } finally {
        setIsLoading(false)
      }
    },
    [determineUserRole],
  )

  const logout = useCallback(async () => {
    try {
      const currentUser = user

      // Clear localStorage first
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("userData")
      localStorage.removeItem("userEmail")

      // Try to sign out from Supabase
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.warn("Supabase signout failed:", error)
      }

      // Log logout
      if (currentUser) {
        await logger.logAuth({
          user_id: currentUser.id,
          email: currentUser.email || "",
          event_type: "logout",
        })

        await logger.logUserInteraction("logout", currentUser.id)
      }

      setIsAuthenticated(false)
      setUser(null)
      setUserRole(null)
      setIsPremium(false)
      setPremiumPlan(null)

      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
      await logger.logError(error as Error, "logout", user?.id)
    }
  }, [router, user])

  const setPremiumStatus = useCallback(
    async (status: boolean, plan?: string) => {
      setIsPremium(status)
      if (plan) {
        setPremiumPlan(plan)
      }

      // Log premium status change
      if (user) {
        await logger.logUserInteraction("premium_status_change", user.id, {
          is_premium: status,
          plan,
        })
      }
    },
    [user],
  )

  const refreshUser = useCallback(async () => {
    if (!user) return

    try {
      // For demo users, just refresh from localStorage
      const storedUserData = localStorage.getItem("userData")
      if (storedUserData) {
        const userData = JSON.parse(storedUserData)
        setUser(userData)
        const role = determineUserRole(userData.email)
        setUserRole(role)

        const metadata = userData.user_metadata || {}
        setIsPremium(metadata.is_premium || false)
        setPremiumPlan(metadata.premium_plan || null)

        await logger.logUserInteraction("user_refresh", userData.id)
        return
      }

      // Try Supabase refresh as fallback
      const {
        data: { user: refreshedUser },
      } = await supabase.auth.getUser()

      if (refreshedUser) {
        setUser(refreshedUser)
        const role = determineUserRole(refreshedUser.email || "")
        setUserRole(role)

        const metadata = refreshedUser.user_metadata || {}
        setIsPremium(metadata.is_premium || false)
        setPremiumPlan(metadata.premium_plan || null)

        await logger.logUserInteraction("user_refresh", refreshedUser.id)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      await logger.logError(error as Error, "user_refresh", user.id)
    }
  }, [user, determineUserRole])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPremium,
        premiumPlan,
        user,
        userRole,
        isLoading,
        login,
        logout,
        setPremiumStatus,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
