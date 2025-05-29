"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/theme-provider"
import { Crown, Palette, Lock, Check, ArrowLeft, Sparkles, Star } from "lucide-react"
import Link from "next/link"

// All available themes with tier classification
const allThemes = [
  {
    id: "light",
    name: "Light",
    description: "Clean and bright default theme",
    colors: ["#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6"],
    tier: "free",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes default dark theme",
    colors: ["#1a1a1a", "#2d2d2d", "#404040", "#666666"],
    tier: "free",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "A deeper dark theme with blue and purple hues",
    colors: ["#0f172a", "#1e293b", "#334155", "#3b82f6"],
    tier: "monthly",
  },
  {
    id: "retro-storm",
    name: "Retro Storm",
    description: "Inspired by old-school tech and CRT monitors",
    colors: ["#000000", "#001400", "#00ff00", "#66ff66"],
    tier: "monthly",
  },
  {
    id: "crimson-moon",
    name: "Crimson Moon",
    description: "A red-toned dark theme with a moody, stylish aesthetic",
    colors: ["#140505", "#280a0a", "#dc2626", "#f87171"],
    tier: "monthly",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and pink gradient hues for a cozy feel",
    colors: ["#451a03", "#92400e", "#f59e0b", "#fbbf24"],
    tier: "yearly",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Earthy green theme, calming for long reading sessions",
    colors: ["#0f2417", "#166534", "#22c55e", "#86efac"],
    tier: "yearly",
  },
  {
    id: "amoled-dark",
    name: "AMOLED Dark",
    description: "Pure dark background, designed to save battery on OLED screens",
    colors: ["#000000", "#0a0a0a", "#3b82f6", "#ffffff"],
    tier: "yearly",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    description: "Cool blue tones inspired by ocean waves",
    colors: ["#0c4a6e", "#0369a1", "#0ea5e9", "#7dd3fc"],
    tier: "yearly",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    description: "Warm golden tones perfect for evening reading",
    colors: ["#451a03", "#92400e", "#f59e0b", "#fbbf24"],
    tier: "yearly",
  },
]

export default function ExclusiveThemesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [userPlan, setUserPlan] = useState<"free" | "monthly" | "yearly">("free")
  const [isPremium, setIsPremium] = useState(false)
  const [isNewPurchase, setIsNewPurchase] = useState(false)
  const [newlyUnlockedThemes, setNewlyUnlockedThemes] = useState<string[]>([])
  const [isAutoActivated, setIsAutoActivated] = useState(false)

  useEffect(() => {
    try {
      // Check if this is a new purchase with auto-activation
      const newPurchase = searchParams.get("newPurchase") === "true"
      const autoActivated = searchParams.get("autoActivated") === "true"
      const backendPowered = searchParams.get("backend") === "true"
      const newlyUnlocked = localStorage.getItem("newlyUnlocked") === "true"

      // Get user's plan from localStorage
      const premiumStatus = localStorage.getItem("isPremium") === "true"
      const plan = localStorage.getItem("premiumPlan") || "free"

      setIsPremium(premiumStatus)
      setUserPlan(plan as "free" | "monthly" | "yearly")

      if (newPurchase || newlyUnlocked) {
        setIsNewPurchase(true)
        setIsAutoActivated(autoActivated)

        // Clear the flag after showing the celebration
        localStorage.removeItem("newlyUnlocked")

        // Get newly unlocked themes from storage (backend-provided) or calculate them
        const storedNewThemes = localStorage.getItem("newlyUnlockedThemes")
        let unlockedThemes: string[] = []

        if (storedNewThemes) {
          unlockedThemes = JSON.parse(storedNewThemes)
        } else {
          unlockedThemes = getNewlyUnlockedThemes(plan as "free" | "monthly" | "yearly")
        }

        setNewlyUnlockedThemes(unlockedThemes)

        // Show success toast only once
        const toastShown = sessionStorage.getItem("purchaseToastShown")
        if (!toastShown && autoActivated) {
          setTimeout(() => {
            const message = backendPowered
              ? `🎉 Backend-Powered Activation Complete! ${unlockedThemes.length} themes instantly unlocked!`
              : `🎉 Premium Themes Activated! ${unlockedThemes.length} new themes are now active and ready to use!`

            toast({
              title: message,
              description: "Your subscription has been processed and themes are immediately available.",
              duration: 5000,
            })
            sessionStorage.setItem("purchaseToastShown", "true")
          }, 500)
        }

        // Clean up stored data after a short delay
        setTimeout(() => {
          localStorage.removeItem("newlyUnlockedThemes")
        }, 10000)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      setUserPlan("free")
      setIsPremium(false)
    }
  }, [searchParams])
  const getNewlyUnlockedThemes = (plan: "free" | "monthly" | "yearly") => {
    switch (plan) {
      case "monthly":
        return ["midnight", "retro-storm", "crimson-moon"]
      case "yearly":
        return [
          "midnight",
          "retro-storm",
          "crimson-moon",
          "sunset",
          "forest",
          "amoled-dark",
          "ocean-breeze",
          "golden-hour",
        ]
      default:
        return []
    }
  }

  const getAccessibleThemes = () => {
    switch (userPlan) {
      case "yearly":
        return allThemes // All themes
      case "monthly":
        return allThemes.filter((theme) => theme.tier === "free" || theme.tier === "monthly")
      case "free":
      default:
        return allThemes.filter((theme) => theme.tier === "free")
    }
  }

  const getLockedThemes = () => {
    const accessible = getAccessibleThemes()
    return allThemes.filter((theme) => !accessible.includes(theme))
  }

  const handleThemeApply = (themeId: string) => {
    const selectedTheme = allThemes.find((t) => t.id === themeId)
    if (!selectedTheme) return

    // No access checks needed - themes are automatically unlocked
    setTheme(themeId as any)
    toast({
      title: "Theme Applied",
      description: `Successfully switched to ${selectedTheme.name} theme`,
    })
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "free":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Free
          </Badge>
        )
      case "monthly":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Monthly+
          </Badge>
        )
      case "yearly":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Yearly Only
          </Badge>
        )
      default:
        return null
    }
  }

  const getPlanDisplayName = () => {
    switch (userPlan) {
      case "yearly":
        return "Yearly Premium"
      case "monthly":
        return "Monthly Premium"
      case "free":
        return "Free Plan"
      default:
        return "Free Plan"
    }
  }

  const isNewlyUnlocked = (themeId: string) => {
    return newlyUnlockedThemes.includes(themeId)
  }

  const accessibleThemes = getAccessibleThemes()
  const lockedThemes = getLockedThemes()

  const displayTheme = allThemes.find((t) => t.id === theme)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Banner for New Purchases */}
        {isNewPurchase && isAutoActivated && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                ✨ {getPlanDisplayName()} Activated!
                {searchParams.get("backend") === "true" && (
                  <Badge className="ml-2 bg-blue-500 text-white">Backend-Powered</Badge>
                )}
              </h2>
            </div>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your subscription has been processed through our secure backend system and your{" "}
              {newlyUnlockedThemes.length} new themes have been automatically unlocked and activated!
              {theme !== "light" && theme !== "dark" && (
                <span className="font-medium"> We've already applied the {displayTheme?.name} theme for you.</span>
              )}
            </p>
            <div className="flex gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ {newlyUnlockedThemes.length} Themes Auto-Activated
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                ✓ Backend Integration
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                ✓ Instant Access
              </Badge>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/premium" className="flex items-center text-blue-600 mb-4 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Plans
            </Link>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              Your Theme Gallery
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Customize your reading experience with your {getPlanDisplayName()} themes
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              {isPremium && <Crown className="h-5 w-5 text-amber-500" />}
              <span className="font-medium">{getPlanDisplayName()}</span>
            </div>
            <Badge variant="secondary">
              {accessibleThemes.length} of {allThemes.length} themes unlocked
            </Badge>
          </div>
        </div>

        {/* Current Theme Display */}
        <Card className="mb-8 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Currently Active Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg border-2 border-primary"
                style={{
                  background: `linear-gradient(to right, ${displayTheme?.colors[0]}, ${displayTheme?.colors[1]})`,
                }}
              />
              <div>
                <h3 className="text-xl font-bold">{displayTheme?.name}</h3>
                <p className="text-muted-foreground">{displayTheme?.description}</p>
                <div className="flex gap-2 mt-2">
                  {getTierBadge(displayTheme?.tier || "free")}
                  {isNewlyUnlocked(theme) && (
                    <Badge className="bg-green-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Just Unlocked!
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Themes */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Your Available Themes ({accessibleThemes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accessibleThemes.map((themeOption) => (
                <Card
                  key={themeOption.id}
                  className={`overflow-hidden transition-all duration-200 hover:shadow-lg relative ${
                    theme === themeOption.id ? "ring-2 ring-primary" : ""
                  } ${
                    isNewlyUnlocked(themeOption.id)
                      ? "ring-2 ring-green-500 shadow-green-200 dark:shadow-green-900"
                      : ""
                  }`}
                >
                  {/* New Theme Badge */}
                  {isNewlyUnlocked(themeOption.id) && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-green-500 text-white animate-pulse">
                        <Star className="h-3 w-3 mr-1" />
                        NEW!
                      </Badge>
                    </div>
                  )}

                  <div
                    className="h-32 w-full relative cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${themeOption.colors[0]}, ${themeOption.colors[1]})`,
                    }}
                    onClick={() => handleThemeApply(themeOption.id)}
                  >
                    {theme === themeOption.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      </div>
                    )}
                    {isNewlyUnlocked(themeOption.id) && (
                      <div className="absolute bottom-2 left-2">
                        <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                          <Sparkles className="h-3 w-3" />
                          <span>Auto-Unlocked!</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{themeOption.name}</CardTitle>
                      {getTierBadge(themeOption.tier)}
                    </div>
                    <CardDescription>{themeOption.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      {themeOption.colors.map((color, index) => (
                        <div key={index} className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={theme === themeOption.id ? "default" : "secondary"}
                      className="w-full"
                      onClick={() => handleThemeApply(themeOption.id)}
                      disabled={theme === themeOption.id}
                    >
                      {theme === themeOption.id ? "Currently Active" : `Apply ${themeOption.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Locked Themes - Only show if user doesn't have premium */}
          {lockedThemes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lock className="h-6 w-6 text-muted-foreground" />
                Locked Themes ({lockedThemes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedThemes.map((themeOption) => (
                  <Card key={themeOption.id} className="overflow-hidden opacity-60 relative">
                    <div
                      className="h-32 w-full relative"
                      style={{
                        background: `linear-gradient(to right, ${themeOption.colors[0]}, ${themeOption.colors[1]})`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {themeOption.tier === "monthly" ? "Monthly+" : "Yearly Only"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{themeOption.name}</CardTitle>
                        {getTierBadge(themeOption.tier)}
                      </div>
                      <CardDescription>{themeOption.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        {themeOption.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border opacity-50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => router.push("/premium")}>
                        Upgrade to Unlock
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Prompt for Free Users */}
        {userPlan === "free" && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-950/30 dark:to-amber-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-500" />
                Unlock More Themes
              </CardTitle>
              <CardDescription>
                Upgrade to Premium to access {allThemes.length - accessibleThemes.length} additional exclusive themes
                with immediate activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">Monthly Premium</h4>
                  <p className="text-sm text-muted-foreground">
                    Instantly unlock 3 additional themes including Midnight, Retro Storm, and Crimson Moon
                  </p>
                  <p className="text-lg font-bold">$9.99/month</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-amber-600">Yearly Premium</h4>
                  <p className="text-sm text-muted-foreground">
                    Instantly unlock all {allThemes.length} themes including exclusive Sunset, Forest, and more
                  </p>
                  <p className="text-lg font-bold">
                    $99.99/year <span className="text-sm text-green-600">(Save 17%)</span>
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button onClick={() => router.push("/premium")} className="flex-1">
                View All Plans
              </Button>
              <Button variant="outline" onClick={() => router.push("/premium/checkout?plan=yearly")} className="flex-1">
                Upgrade to Yearly
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Upgrade Prompt for Monthly Users */}
        {userPlan === "monthly" && lockedThemes.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-500" />
                Unlock All Themes with Yearly Premium
              </CardTitle>
              <CardDescription>
                Upgrade to Yearly Premium to instantly access {lockedThemes.length} additional exclusive themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-amber-600">Yearly Premium Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Instant access to all {allThemes.length} exclusive themes</li>
                  <li>• Audiobooks included</li>
                  <li>• 10% discount on physical books</li>
                  <li>• Priority customer support</li>
                  <li>• Save 17% compared to monthly billing</li>
                </ul>
                <p className="text-lg font-bold text-amber-600">$99.99/year</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/premium/checkout?plan=yearly")} className="w-full">
                Upgrade to Yearly Premium
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
