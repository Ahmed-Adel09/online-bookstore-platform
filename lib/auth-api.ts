// Simple auth API - version 7 implementation
export async function loginUser(email: string, password: string) {
  // Demo admin user
  if (email === "drshima123@gmail.com" && password === "drshima123") {
    return {
      success: true,
      user: {
        id: "admin-1",
        email: "drshima123@gmail.com",
        name: "Dr. Shima",
        role: "admin",
        is_premium: true,
      },
    }
  }

  // Fallback admin user
  if (email === "admin@bookhaven.com" && password === "admin123") {
    return {
      success: true,
      user: {
        id: "admin-2",
        email: "admin@bookhaven.com",
        name: "Admin User",
        role: "admin",
        is_premium: true,
      },
    }
  }

  // Regular user login
  if (email && password) {
    return {
      success: true,
      user: {
        id: "user-1",
        email: email,
        name: "Test User",
        role: "user",
        is_premium: false,
      },
    }
  }

  return { success: false, error: "Invalid credentials" }
}

export async function registerUser(email: string, name: string, password: string) {
  if (email && name && password) {
    return {
      success: true,
      user: {
        id: "user-2",
        email: email,
        name: name,
        role: "user",
        is_premium: false,
      },
    }
  }

  return { success: false, error: "Registration failed" }
}

// Export for compatibility
export const authAPI = {
  loginUser,
  registerUser,
}
