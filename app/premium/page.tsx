"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Download, Headphones, Palette, Tag, Check, Crown, X, Lock } from "lucide-react"

// Premium themes with tier classification
const premiumThemes = [
  {
    id: "light",
    name: "Light",
    description: "Default light theme",
    colors: ["#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6"],
    tier: "free",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Default dark theme",
    colors: ["#1a1a1a", "#2d2d2d", "#404040", "#666666"],
    tier: "free",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "A deeper dark theme with blue and purple hues",
    colors: ["#0f172a", "#1e293b", "#334155", "#94a3b8"],
    tier: "monthly",
  },
  {
    id: "retro-storm",
    name: "Retro Storm",
    description: "Inspired by old-school tech and CRT monitors",
    colors: ["#0a0a0a", "#003300", "#00ff00", "#66ff66"],
    tier: "monthly",
  },
  {
    id: "crimson-moon",
    name: "Crimson Moon",
    description: "A red-toned dark theme with a moody, stylish aesthetic",
    colors: ["#1a0505", "#2d0a0a", "#4a0f0f", "#8c1c1c"],
    tier: "monthly",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and pink gradient hues for a cozy feel",
    colors: ["#7d2a2a", "#a73e3e", "#cf6a6a", "#f8a170"],
    tier: "yearly",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Earthy green theme, calming for long reading sessions",
    colors: ["#0f2417", "#1e3a2f", "#2d5646", "#4a7c64"],
    tier: "yearly",
  },
  {
    id: "amoled-dark",
    name: "AMOLED Dark",
    description: "Pure dark background, designed to save battery on OLED screens",
    colors: ["#000000", "#0a0a0a", "#1a1a1a", "#2a2a2a"],
    tier: "yearly",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    description: "Cool blue tones inspired by ocean waves",
    colors: ["#0c4a6e", "#0369a1", "#0284c7", "#38bdf8"],
    tier: "yearly",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    description: "Warm golden tones perfect for evening reading",
    colors: ["#451a03", "#92400e", "#d97706", "#fbbf24"],
    tier: "yearly",
  },
]

// Subscription plans
const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Basic reading experience",
    features: ["Access to free books", "2 basic themes (Light & Dark)", "Limited reading time", "Ads supported"],
    themeCount: 2,
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly Premium",
    price: 9.99,
    description: "Billed monthly",
    features: [
      "Unlimited reading",
      "Ad-free experience",
      "5 exclusive themes",
      "Offline reading",
      "Early access to new releases",
      "Basic customer support",
    ],
    themeCount: 5,
    popular: true,
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    price: 99.99,
    description: "Billed annually (Save 17%)",
    features: [
      "Everything in Monthly Premium",
      "All 10 exclusive themes",
      "Audiobooks included",
      "10% discount on physical books",
      "Premium badge",
      "Priority customer support",
      "Exclusive author content",
    ],
    themeCount: 10,
    popular: false,
  },
]

export default function PremiumPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState("monthly")
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const handleSubscribe = () => {
    if (selectedPlan === "free") {
      // For free plan, just update localStorage and redirect
      localStorage.setItem("isPremium", "false")
      localStorage.setItem("premiumPlan", "free")
      localStorage.setItem("premiumSince", new Date().toISOString())

      console.log("=== FREE PLAN SELECTION ===")
      console.log("Plan Details:", {
        plan: "free",
        amount: 0,
        features: plans[0].features,
        themesUnlocked: premiumThemes.filter((t) => t.tier === "free").length,
        selectionDate: new Date().toISOString(),
      })
      console.log("=== END FREE PLAN SELECTION ===")

      toast({
        title: "Free Plan Selected",
        description: "You're using the free plan with basic themes and features.",
      })

      router.push("/exclusive-themes")
    } else {
      // Redirect to checkout page with the selected plan
      router.push(`/premium/checkout?plan=${selectedPlan}`)
    }
  }

  const handleThemePreview = (themeId: string) => {
    setSelectedTheme(themeId === selectedTheme ? null : themeId)

    if (themeId !== selectedTheme) {
      const theme = premiumThemes.find((t) => t.id === themeId)

      // Apply theme preview temporarily
      const root = document.documentElement
      if (theme) {
        // Store current theme
        const currentTheme = root.className

        // Apply preview theme
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

        if (themeId === "light") {
          root.classList.add("light")
          root.style.removeProperty("--background")
          root.style.removeProperty("--foreground")
          root.style.removeProperty("--card")
        } else {
          root.classList.add("dark")

          // Apply theme-specific styles based on the theme colors
          switch (themeId) {
            case "dark":
              root.style.removeProperty("--background")
              root.style.removeProperty("--foreground")
              root.style.removeProperty("--card")
              break
            case "midnight":
              root.style.setProperty("--background", "15 23 42")
              root.style.setProperty("--foreground", "148 163 184")
              root.style.setProperty("--card", "30 41 59")
              break
            case "retro-storm":
              root.style.setProperty("--background", "10 10 10")
              root.style.setProperty("--foreground", "0 255 0")
              root.style.setProperty("--card", "0 51 0")
              break
            case "crimson-moon":
              root.style.setProperty("--background", "26 5 5")
              root.style.setProperty("--foreground", "248 113 113")
              root.style.setProperty("--card", "45 10 10")
              break
            case "sunset":
              root.style.setProperty("--background", "125 42 42")
              root.style.setProperty("--foreground", "248 161 112")
              root.style.setProperty("--card", "167 62 62")
              break
            case "forest":
              root.style.setProperty("--background", "15 36 23")
              root.style.setProperty("--foreground", "134 239 172")
              root.style.setProperty("--card", "30 58 70")
              break
            case "amoled-dark":
              root.style.setProperty("--background", "0 0 0")
              root.style.setProperty("--foreground", "255 255 255")
              root.style.setProperty("--card", "10 10 10")
              break
            case "ocean-breeze":
              root.style.setProperty("--background", "12 74 110")
              root.style.setProperty("--foreground", "56 189 248")
              root.style.setProperty("--card", "3 105 161")
              break
            case "golden-hour":
              root.style.setProperty("--background", "69 26 3")
              root.style.setProperty("--foreground", "251 191 36")
              root.style.setProperty("--card", "146 64 14")
              break
          }
        }

        // Reset preview after 3 seconds
        setTimeout(() => {
          if (selectedTheme === themeId) {
            root.className = currentTheme
            root.style.removeProperty("--background")
            root.style.removeProperty("--foreground")
            root.style.removeProperty("--card")
            setSelectedTheme(null)
          }
        }, 3000)
      }

      const tierLabel =
        theme?.tier === "free" ? "Free" : theme?.tier === "monthly" ? "Monthly Premium" : "Yearly Premium"
      toast({
        title: `${theme?.name} Theme Preview`,
        description: `This ${tierLabel} theme is ${theme?.tier === "free" ? "available to everyone" : `unlocked with ${tierLabel} subscription`}`,
      })
    } else {
      // Reset to original theme
      const root = document.documentElement
      root.style.removeProperty("--background")
      root.style.removeProperty("--foreground")
      root.style.removeProperty("--card")
    }
  }

  const getThemesByTier = (tier: string) => {
    return premiumThemes.filter((theme) => theme.tier === tier)
  }

  const getThemeBadgeColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-100 text-gray-800"
      case "monthly":
        return "bg-blue-100 text-blue-800"
      case "yearly":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your BookHaven Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your reading journey and unlock exclusive themes and features
          </p>
        </div>

        <Tabs defaultValue="plans" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="themes">Theme Gallery</TabsTrigger>
            <TabsTrigger value="features">Feature Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""} ${plan.popular ? "border-primary" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      {plan.id === "yearly" && <Crown className="h-5 w-5 text-amber-500" />}
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">/{plan.id === "monthly" ? "month" : "year"}</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className={getThemeBadgeColor(plan.id)}>
                        {plan.themeCount} Themes Included
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={selectedPlan === plan.id ? "default" : "outline"}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {selectedPlan === plan.id ? "Selected" : `Choose ${plan.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" onClick={handleSubscribe}>
                {selectedPlan === "free" ? "Continue with Free Plan" : "Subscribe Now"}
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                {selectedPlan === "free"
                  ? "No payment required. Upgrade anytime to unlock more features."
                  : "You can cancel your subscription at any time. No commitment required."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="themes" className="mt-6">
            <div className="space-y-8">
              {/* Free Themes */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  Free Themes ({getThemesByTier("free").length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getThemesByTier("free").map((theme) => (
                    <Card
                      key={theme.id}
                      className={`overflow-hidden transition-all duration-200 ${selectedTheme === theme.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <div
                        className="h-32 w-full relative"
                        style={{
                          background: `linear-gradient(to right, ${theme.colors[0]}, ${theme.colors[1]})`,
                        }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{theme.name}</CardTitle>
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Free
                          </Badge>
                        </div>
                        <CardDescription>{theme.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleThemePreview(theme.id)}>
                          {selectedTheme === theme.id ? "Close Preview" : `Preview ${theme.name}`}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Monthly Premium Themes */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  Monthly Premium Themes ({getThemesByTier("monthly").length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getThemesByTier("monthly").map((theme) => (
                    <Card
                      key={theme.id}
                      className={`overflow-hidden transition-all duration-200 ${selectedTheme === theme.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <div
                        className="h-32 w-full relative"
                        style={{
                          background: `linear-gradient(to right, ${theme.colors[0]}, ${theme.colors[1]})`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            <Crown className="h-3 w-3" />
                            <span className="text-xs font-medium">Monthly Premium</span>
                          </div>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{theme.name}</CardTitle>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Monthly+
                          </Badge>
                        </div>
                        <CardDescription>{theme.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleThemePreview(theme.id)}>
                          {selectedTheme === theme.id ? "Close Preview" : `Preview ${theme.name}`}
                          <Lock className="h-3 w-3 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Yearly Premium Themes */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  Yearly Premium Exclusive Themes ({getThemesByTier("yearly").length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getThemesByTier("yearly").map((theme) => (
                    <Card
                      key={theme.id}
                      className={`overflow-hidden transition-all duration-200 ${selectedTheme === theme.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <div
                        className="h-32 w-full relative"
                        style={{
                          background: `linear-gradient(to right, ${theme.colors[0]}, ${theme.colors[1]})`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            <Crown className="h-3 w-3" />
                            <span className="text-xs font-medium">Yearly Exclusive</span>
                          </div>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{theme.name}</CardTitle>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">
                            Yearly Only
                          </Badge>
                        </div>
                        <CardDescription>{theme.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleThemePreview(theme.id)}>
                          {selectedTheme === theme.id ? "Close Preview" : `Preview ${theme.name}`}
                          <Crown className="h-3 w-3 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Reading Access</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span className="text-muted-foreground">Limited books</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="text-green-600">Unlimited</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly:</span>
                      <span className="text-green-600">Unlimited + Early access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Theme Access</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span className="text-muted-foreground">2 basic themes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="text-blue-600">5 premium themes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly:</span>
                      <span className="text-amber-600">All 10 themes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <X className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Ad Experience</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span className="text-red-600">Ads supported</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="text-green-600">Ad-free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly:</span>
                      <span className="text-green-600">Ad-free</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Offline Reading</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span className="text-red-600">Not available</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="text-green-600">Available</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly:</span>
                      <span className="text-green-600">Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Audiobooks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span className="text-red-600">Not included</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="text-red-600">Not included</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly:</span>
                      <span className="text-green-600">Included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Book Discounts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span className="text-red-600">None</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="text-red-600">None</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yearly:</span>
                      <span className="text-green-600">10% off physical books</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
