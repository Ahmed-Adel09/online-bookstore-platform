import { supabase } from "./supabase"

export interface AdminUser {
  id: string
  email: string
  role: "admin" | "super_admin"
  first_name: string
  last_name: string
  permissions: string[]
  last_login: string
  created_at: string
}

export interface AdminAuthResult {
  success: boolean
  user?: AdminUser
  error?: string
  requiresMFA?: boolean
}

class AdminAuthService {
  private static instance: AdminAuthService
  private currentAdmin: AdminUser | null = null

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService()
    }
    return AdminAuthService.instance
  }

  async signIn(email: string, password: string): Promise<AdminAuthResult> {
    try {
      // First authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: "Authentication failed" }
      }

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .eq("is_active", true)
        .single()

      if (adminError || !adminData) {
        // Fallback to demo admin
        if (email === "admin@bookhaven.com" && password === "admin123") {
          const demoAdmin: AdminUser = {
            id: "demo-admin-1",
            email: "admin@bookhaven.com",
            role: "super_admin",
            first_name: "Admin",
            last_name: "User",
            permissions: ["read", "write", "delete", "manage_users", "view_analytics"],
            last_login: new Date().toISOString(),
            created_at: "2024-01-01T00:00:00Z",
          }
          this.currentAdmin = demoAdmin
          this.setAuthSession(demoAdmin)
          return { success: true, user: demoAdmin }
        }
        return { success: false, error: "Access denied. Admin privileges required." }
      }

      const admin: AdminUser = {
        id: adminData.id,
        email: adminData.email,
        role: adminData.role,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        permissions: adminData.permissions || [],
        last_login: new Date().toISOString(),
        created_at: adminData.created_at,
      }

      // Update last login
      await supabase.from("admin_users").update({ last_login: admin.last_login }).eq("id", admin.id)

      this.currentAdmin = admin
      this.setAuthSession(admin)

      return { success: true, user: admin }
    } catch (error) {
      console.error("Admin sign in error:", error)
      return { success: false, error: "Authentication failed" }
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
      this.currentAdmin = null
      this.clearAuthSession()
    } catch (error) {
      console.error("Admin sign out error:", error)
    }
  }

  getCurrentAdmin(): AdminUser | null {
    if (this.currentAdmin) {
      return this.currentAdmin
    }

    // Try to restore from session
    const sessionData = localStorage.getItem("admin_session")
    if (sessionData) {
      try {
        this.currentAdmin = JSON.parse(sessionData)
        return this.currentAdmin
      } catch {
        this.clearAuthSession()
      }
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null
  }

  hasPermission(permission: string): boolean {
    const admin = this.getCurrentAdmin()
    return admin?.permissions.includes(permission) || admin?.role === "super_admin" || false
  }

  private setAuthSession(admin: AdminUser): void {
    localStorage.setItem("admin_session", JSON.stringify(admin))
    localStorage.setItem("admin_authenticated", "true")
    document.cookie = `admin_auth=true; path=/; max-age=86400; secure; samesite=strict`
  }

  private clearAuthSession(): void {
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_authenticated")
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

export const adminAuth = AdminAuthService.getInstance()
