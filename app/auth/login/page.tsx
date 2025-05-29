"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { logger } from "@/lib/logging-service"
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, isAuthenticated, userRole } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const returnUrl = searchParams.get("returnUrl")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const redirectTo = userRole === "admin" ? "/admin/dashboard" : "/profile"
      router.push(returnUrl || redirectTo)
    }
  }, [isAuthenticated, userRole, router, returnUrl])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError("")

      try {
        // Log form submission attempt
        await logger.logUserInteraction("login_form_submit", undefined, {
          email,
          has_return_url: !!returnUrl,
        })

        const result = await login(email, password)

        if (result.success) {
          const isAdmin = email === "drshima123@gmail.com"

          toast({
            title: isAdmin ? "Admin Login Successful!" : "Welcome Back!",
            description: isAdmin ? "Redirecting to admin dashboard..." : "Successfully signed in to your account",
          })

          // Use the redirectTo from the login result
          if (result.redirectTo) {
            router.push(result.redirectTo)
          } else {
            // Fallback redirect logic
            const redirectTo = returnUrl || (isAdmin ? "/admin/dashboard" : "/profile")
            router.push(redirectTo)
          }
        } else {
          setError(result.error || "Invalid email or password")
          toast({
            title: "Login Failed",
            description: result.error || "Please check your credentials and try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
        setError("Authentication failed. Please try again.")

        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })

        await logger.logError(error as Error, "login_form", undefined)
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, login, router, returnUrl, toast],
  )

  const handleInputChange = useCallback(async (field: string, value: string) => {
    if (field === "email") {
      setEmail(value)
    } else if (field === "password") {
      setPassword(value)
    }

    setError("")

    // Log user interaction (but don't await to avoid blocking UI)
    logger
      .logUserInteraction("form_input_change", undefined, {
        field,
        form: "login",
      })
      .catch(() => {
        // Silently handle logging errors
      })
  }, [])

  const fillAdminCredentials = () => {
    setEmail("drshima123@gmail.com")
    setPassword("drshima123")
    setError("")
  }

  const fillUserCredentials = () => {
    setEmail("user@example.com")
    setPassword("password123")
    setError("")
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Sign in to your BookHaven account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">🔑 Admin Access</h4>
              <div className="text-sm text-red-800 space-y-1 mb-3">
                <p>
                  <strong>Email:</strong> drshima123@gmail.com
                </p>
                <p>
                  <strong>Password:</strong> drshima123
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillAdminCredentials}
                className="w-full border-red-300 text-red-700 hover:bg-red-100"
              >
                Use Admin Credentials
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">👤 Demo User</h4>
              <div className="text-sm text-blue-800 space-y-1 mb-3">
                <p>
                  <strong>Email:</strong> user@example.com
                </p>
                <p>
                  <strong>Password:</strong> password123
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillUserCredentials}
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Use Demo User Credentials
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm mt-2">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
