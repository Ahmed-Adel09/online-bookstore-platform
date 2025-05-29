"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme =
  | "light"
  | "dark"
  | "midnight"
  | "retro-storm"
  | "crimson-moon"
  | "sunset"
  | "forest"
  | "amoled-dark"
  | "ocean-breeze"
  | "golden-hour"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  availableThemes: Theme[]
  isPremiumTheme: (theme: Theme) => boolean
}

const freeThemes: Theme[] = ["light", "dark"]
const monthlyThemes: Theme[] = ["midnight", "retro-storm", "crimson-moon"]
const yearlyThemes: Theme[] = ["sunset", "forest", "amoled-dark", "ocean-breeze", "golden-hour"]

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  availableThemes: freeThemes,
  isPremiumTheme: () => false,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "bookstore-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })

  const [userPlan, setUserPlan] = useState<"free" | "monthly" | "yearly">("free")

  // Check user's plan status and listen for changes
  useEffect(() => {
    const updatePlanStatus = () => {
      if (typeof window !== "undefined") {
        const isPremium = localStorage.getItem("isPremium") === "true"
        const plan = localStorage.getItem("premiumPlan") || "free"

        if (isPremium) {
          setUserPlan(plan as "monthly" | "yearly")
        } else {
          setUserPlan("free")
        }
      }
    }

    // Initial check
    updatePlanStatus()

    // Listen for premium status changes
    const handlePremiumStatusChange = () => {
      updatePlanStatus()
    }

    const handleThemeUpdate = (event: CustomEvent) => {
      const newTheme = event.detail.theme
      if (newTheme) {
        setTheme(newTheme)
      }
    }

    // Add event listeners for immediate updates
    window.addEventListener("premiumStatusChanged", handlePremiumStatusChange)
    window.addEventListener("themeUpdated", handleThemeUpdate as EventListener)
    window.addEventListener("storage", updatePlanStatus)

    return () => {
      window.removeEventListener("premiumStatusChanged", handlePremiumStatusChange)
      window.removeEventListener("themeUpdated", handleThemeUpdate as EventListener)
      window.removeEventListener("storage", updatePlanStatus)
    }
  }, [])

  // Get available themes based on user's plan
  const getAvailableThemes = (): Theme[] => {
    switch (userPlan) {
      case "yearly":
        return [...freeThemes, ...monthlyThemes, ...yearlyThemes]
      case "monthly":
        return [...freeThemes, ...monthlyThemes]
      case "free":
      default:
        return freeThemes
    }
  }

  const availableThemes = getAvailableThemes()

  const isPremiumTheme = (themeToCheck: Theme) => {
    return !freeThemes.includes(themeToCheck)
  }

  const canAccessTheme = (themeToCheck: Theme) => {
    return availableThemes.includes(themeToCheck)
  }

  useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes first
    root.classList.remove(
      "light",
      "dark",
      "midnight",
      "retro-storm",
      "crimson-moon",
      "sunset",
      "forest",
      "amoled-dark",
      "ocean-breeze",
      "golden-hour",
    )

    if (theme === "dark") {
      root.classList.add("dark")
      // Reset any custom properties to use default dark theme
      root.style.removeProperty("--background")
      root.style.removeProperty("--foreground")
      root.style.removeProperty("--card")
      root.style.removeProperty("--card-foreground")
      root.style.removeProperty("--primary")
      root.style.removeProperty("--primary-foreground")
      root.style.removeProperty("--muted")
      root.style.removeProperty("--muted-foreground")
      root.style.removeProperty("--border")
      root.style.removeProperty("--accent")
      root.style.removeProperty("--accent-foreground")
      root.style.removeProperty("--destructive")
      root.style.removeProperty("--destructive-foreground")
      root.style.removeProperty("--ring")
      root.style.removeProperty("--input")
    } else if (theme === "light") {
      root.classList.add("light")
      // Reset any custom properties to use default light theme
      root.style.removeProperty("--background")
      root.style.removeProperty("--foreground")
      root.style.removeProperty("--card")
      root.style.removeProperty("--card-foreground")
      root.style.removeProperty("--primary")
      root.style.removeProperty("--primary-foreground")
      root.style.removeProperty("--muted")
      root.style.removeProperty("--muted-foreground")
      root.style.removeProperty("--border")
      root.style.removeProperty("--accent")
      root.style.removeProperty("--accent-foreground")
      root.style.removeProperty("--destructive")
      root.style.removeProperty("--destructive-foreground")
      root.style.removeProperty("--ring")
      root.style.removeProperty("--input")
    } else {
      // Premium themes - all based on dark mode foundation
      root.classList.add("dark")

      switch (theme) {
        case "midnight":
          // Deep blue midnight theme
          root.style.setProperty("--background", "15 23 42") // slate-900
          root.style.setProperty("--foreground", "148 163 184") // slate-400
          root.style.setProperty("--card", "30 41 59") // slate-800
          root.style.setProperty("--card-foreground", "203 213 225") // slate-300
          root.style.setProperty("--primary", "59 130 246") // blue-500
          root.style.setProperty("--primary-foreground", "255 255 255")
          root.style.setProperty("--muted", "51 65 85") // slate-700
          root.style.setProperty("--muted-foreground", "148 163 184") // slate-400
          root.style.setProperty("--border", "51 65 85") // slate-700
          root.style.setProperty("--input", "51 65 85") // slate-700
          root.style.setProperty("--ring", "59 130 246") // blue-500
          root.style.setProperty("--accent", "30 41 59") // slate-800
          root.style.setProperty("--accent-foreground", "203 213 225") // slate-300
          break

        case "retro-storm":
          // Matrix-style green on black theme
          root.style.setProperty("--background", "0 0 0") // pure black
          root.style.setProperty("--foreground", "0 255 0") // bright green
          root.style.setProperty("--card", "0 20 0") // very dark green
          root.style.setProperty("--card-foreground", "102 255 102") // light green
          root.style.setProperty("--primary", "0 255 0") // bright green
          root.style.setProperty("--primary-foreground", "0 0 0") // black
          root.style.setProperty("--muted", "0 51 0") // dark green
          root.style.setProperty("--muted-foreground", "0 204 0") // medium green
          root.style.setProperty("--border", "0 102 0") // medium green
          root.style.setProperty("--input", "0 20 0") // very dark green
          root.style.setProperty("--ring", "0 255 0") // bright green
          root.style.setProperty("--accent", "0 51 0") // dark green
          root.style.setProperty("--accent-foreground", "0 255 0") // bright green
          root.style.setProperty("--destructive", "255 0 0") // red
          root.style.setProperty("--destructive-foreground", "255 255 255") // white
          break

        case "crimson-moon":
          // Dark red theme with crimson accents
          root.style.setProperty("--background", "20 5 5") // very dark red
          root.style.setProperty("--foreground", "248 113 113") // red-400
          root.style.setProperty("--card", "40 10 10") // dark red
          root.style.setProperty("--card-foreground", "252 165 165") // red-300
          root.style.setProperty("--primary", "220 38 38") // red-600
          root.style.setProperty("--primary-foreground", "255 255 255")
          root.style.setProperty("--muted", "127 29 29") // red-900
          root.style.setProperty("--muted-foreground", "239 68 68") // red-500
          root.style.setProperty("--border", "127 29 29") // red-900
          root.style.setProperty("--input", "40 10 10") // dark red
          root.style.setProperty("--ring", "220 38 38") // red-600
          root.style.setProperty("--accent", "127 29 29") // red-900
          root.style.setProperty("--accent-foreground", "248 113 113") // red-400
          break

        case "sunset":
          // Warm orange and amber sunset theme
          root.style.setProperty("--background", "69 26 3") // amber-900
          root.style.setProperty("--foreground", "251 191 36") // amber-400
          root.style.setProperty("--card", "146 64 14") // amber-700
          root.style.setProperty("--card-foreground", "252 211 77") // amber-300
          root.style.setProperty("--primary", "245 158 11") // amber-500
          root.style.setProperty("--primary-foreground", "0 0 0")
          root.style.setProperty("--muted", "120 53 15") // amber-800
          root.style.setProperty("--muted-foreground", "251 191 36") // amber-400
          root.style.setProperty("--border", "120 53 15") // amber-800
          root.style.setProperty("--input", "146 64 14") // amber-700
          root.style.setProperty("--ring", "245 158 11") // amber-500
          root.style.setProperty("--accent", "120 53 15") // amber-800
          root.style.setProperty("--accent-foreground", "251 191 36") // amber-400
          break

        case "forest":
          // Deep green forest theme
          root.style.setProperty("--background", "15 36 23") // very dark green
          root.style.setProperty("--foreground", "134 239 172") // green-300
          root.style.setProperty("--card", "22 101 52") // green-800
          root.style.setProperty("--card-foreground", "187 247 208") // green-200
          root.style.setProperty("--primary", "34 197 94") // green-500
          root.style.setProperty("--primary-foreground", "0 0 0")
          root.style.setProperty("--muted", "20 83 45") // green-800
          root.style.setProperty("--muted-foreground", "74 222 128") // green-400
          root.style.setProperty("--border", "20 83 45") // green-800
          root.style.setProperty("--input", "22 101 52") // green-800
          root.style.setProperty("--ring", "34 197 94") // green-500
          root.style.setProperty("--accent", "20 83 45") // green-800
          root.style.setProperty("--accent-foreground", "134 239 172") // green-300
          break

        case "amoled-dark":
          // Pure black AMOLED theme
          root.style.setProperty("--background", "0 0 0") // pure black
          root.style.setProperty("--foreground", "255 255 255") // pure white
          root.style.setProperty("--card", "10 10 10") // very dark gray
          root.style.setProperty("--card-foreground", "245 245 245") // light gray
          root.style.setProperty("--primary", "59 130 246") // blue-500
          root.style.setProperty("--primary-foreground", "255 255 255")
          root.style.setProperty("--muted", "38 38 38") // gray-800
          root.style.setProperty("--muted-foreground", "163 163 163") // gray-400
          root.style.setProperty("--border", "38 38 38") // gray-800
          root.style.setProperty("--input", "10 10 10") // very dark gray
          root.style.setProperty("--ring", "59 130 246") // blue-500
          root.style.setProperty("--accent", "38 38 38") // gray-800
          root.style.setProperty("--accent-foreground", "255 255 255") // white
          break

        case "ocean-breeze":
          // Cool blue ocean theme
          root.style.setProperty("--background", "12 74 110") // deep blue
          root.style.setProperty("--foreground", "186 230 253") // sky-200
          root.style.setProperty("--card", "3 105 161") // blue-600
          root.style.setProperty("--card-foreground", "125 211 252") // blue-300
          root.style.setProperty("--primary", "14 165 233") // blue-500
          root.style.setProperty("--primary-foreground", "255 255 255")
          root.style.setProperty("--muted", "30 64 175") // blue-800
          root.style.setProperty("--muted-foreground", "147 197 253") // blue-300
          root.style.setProperty("--border", "30 64 175") // blue-800
          root.style.setProperty("--input", "3 105 161") // blue-600
          root.style.setProperty("--ring", "14 165 233") // blue-500
          root.style.setProperty("--accent", "30 64 175") // blue-800
          root.style.setProperty("--accent-foreground", "186 230 253") // sky-200
          break

        case "golden-hour":
          // Warm golden hour theme
          root.style.setProperty("--background", "69 26 3") // amber-900
          root.style.setProperty("--foreground", "251 191 36") // amber-400
          root.style.setProperty("--card", "146 64 14") // amber-700
          root.style.setProperty("--card-foreground", "252 211 77") // amber-300
          root.style.setProperty("--primary", "245 158 11") // amber-500
          root.style.setProperty("--primary-foreground", "0 0 0")
          root.style.setProperty("--muted", "120 53 15") // amber-800
          root.style.setProperty("--muted-foreground", "251 191 36") // amber-400
          root.style.setProperty("--border", "120 53 15") // amber-800
          root.style.setProperty("--input", "146 64 14") // amber-700
          root.style.setProperty("--ring", "245 158 11") // amber-500
          root.style.setProperty("--accent", "120 53 15") // amber-800
          root.style.setProperty("--accent-foreground", "251 191 36") // amber-400
          break

        default:
          // Fallback to dark theme
          root.style.removeProperty("--background")
          root.style.removeProperty("--foreground")
          root.style.removeProperty("--card")
          root.style.removeProperty("--card-foreground")
          root.style.removeProperty("--primary")
          root.style.removeProperty("--primary-foreground")
          root.style.removeProperty("--muted")
          root.style.removeProperty("--muted-foreground")
          root.style.removeProperty("--border")
          root.style.removeProperty("--accent")
          root.style.removeProperty("--accent-foreground")
          root.style.removeProperty("--destructive")
          root.style.removeProperty("--destructive-foreground")
          root.style.removeProperty("--ring")
          root.style.removeProperty("--input")
          break
      }
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    // Always allow theme changes now - no restrictions for premium users
    localStorage.setItem(storageKey, newTheme)
    setTheme(newTheme)
  }

  const value = {
    theme,
    setTheme: handleSetTheme,
    availableThemes,
    isPremiumTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
