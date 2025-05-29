import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public routes that don't require authentication
const publicRoutes = ["/auth/login", "/auth/register", "/", "/books", "/about"]

// Admin-only routes
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.has("auth")

  // If the route is public, allow access
  if (publicRoutes.some((route) => pathname === route || (route !== "/" && pathname.startsWith(route)))) {
    return NextResponse.next()
  }

  // If the user is not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && !pathname.startsWith("/auth")) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For admin routes, we'll let the client-side handle role verification
  // since we can't easily access user role from cookies in middleware
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("returnUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow access to authenticated users
  return NextResponse.next()
}

export const config = {
  // Skip middleware for static files and api routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
