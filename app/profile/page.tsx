"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Package, CreditCard, User, Settings, LogOut, Crown, Upload, Bookmark, Palette, RotateCcw } from "lucide-react"
import { PremiumBadge } from "@/components/premium-badge"
import { useToast } from "@/hooks/use-toast"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { BookCard } from "@/components/book-card"
import { useTheme } from "@/components/theme-provider"

// Mock order history data
const orderHistory = [
  {
    id: "ORD-123456",
    date: "May 2, 2023",
    total: 42.97,
    status: "Delivered",
    items: [
      { id: "1", title: "The Midnight Library", price: 14.99, quantity: 1 },
      { id: "2", title: "Atomic Habits", price: 11.98, quantity: 1 },
      { id: "7", title: "Sapiens: A Brief History of Humankind", price: 15.99, quantity: 1 },
    ],
  },
  {
    id: "ORD-789012",
    date: "April 15, 2023",
    total: 29.88,
    status: "Delivered",
    items: [
      { id: "3", title: "Project Hail Mary", price: 16.89, quantity: 1 },
      { id: "5", title: "The Silent Patient", price: 12.99, quantity: 1 },
    ],
  },
  {
    id: "ORD-345678",
    date: "March 28, 2023",
    total: 14.49,
    status: "Delivered",
    items: [{ id: "8", title: "The Four Winds", price: 14.49, quantity: 1 }],
  },
]

// Available themes with metadata
const themeOptions = [
  {
    id: "light",
    name: "Light",
    description: "Clean and bright",
    premium: false,
    colors: ["#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6"],
  },
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes",
    premium: false,
    colors: ["#1a1a1a", "#2d2d2d", "#404040", "#666666"],
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue tones",
    premium: true,
    colors: ["#0f172a", "#1e293b", "#334155", "#94a3b8"],
  },
  {
    id: "retro-storm",
    name: "Retro Storm",
    description: "Classic terminal green",
    premium: true,
    colors: ["#0a0a0a", "#003300", "#00ff00", "#66ff66"],
  },
  {
    id: "crimson-moon",
    name: "Crimson Moon",
    description: "Dark red aesthetic",
    premium: true,
    colors: ["#1a0505", "#2d0a0a", "#4a0f0f", "#8c1c1c"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and pink",
    premium: true,
    colors: ["#7d2a2a", "#a73e3e", "#cf6a6a", "#f8a170"],
  },
  {
    id: "forest",
    name: "Forest",
    description: "Calming green tones",
    premium: true,
    colors: ["#0f2417", "#1e3a2f", "#2d5646", "#4a7c64"],
  },
  {
    id: "amoled-dark",
    name: "AMOLED Dark",
    description: "Pure black for OLED",
    premium: true,
    colors: ["#000000", "#0a0a0a", "#1a1a1a", "#2a2a2a"],
  },
]

export default function ProfilePage() {
  const { toast } = useToast()
  const { bookmarks, removeBookmark } = useBookmarks()
  const { theme, setTheme, availableThemes, isPremiumTheme } = useTheme()

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "/placeholder.svg?height=96&width=96",
    isPremium: false,
    role: "reader", // can be "reader", "author", or "both"
    favoriteGenres: [] as string[],
    preferredFormats: [] as string[],
    gender: "",
    age: "",
    premiumPlan: "",
    premiumSince: "",
  })

  const [isUploading, setIsUploading] = useState(false)

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData")
    const isPremium = localStorage.getItem("isPremium") === "true"
    const premiumPlan = localStorage.getItem("premiumPlan") || ""
    const premiumSince = localStorage.getItem("premiumSince") || ""

    if (storedUserData) {
      const userData = JSON.parse(storedUserData)
      setUser({
        ...user,
        ...userData,
        isPremium,
        premiumPlan,
        premiumSince: premiumSince ? new Date(premiumSince).toLocaleDateString() : "",
      })
    }
  }, [])

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Create a FileReader to read the image file
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        // Update user avatar with the data URL
        setUser((prev) => ({
          ...prev,
          avatar: event.target!.result as string,
        }))

        // Save to localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.avatar = event.target!.result
        localStorage.setItem("userData", JSON.stringify(userData))

        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully",
        })

        setIsUploading(false)
      }
    }

    // Read the file as a data URL
    reader.readAsDataURL(file)
  }

  const handleRoleChange = (newRole: string) => {
    setUser({ ...user, role: newRole })

    // Update localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    userData.role = newRole
    localStorage.setItem("userData", JSON.stringify(userData))
  }

  const handleRemoveBookmark = (bookId: string) => {
    removeBookmark(bookId)
    toast({
      title: "Bookmark removed",
      description: "Book has been removed from your bookmarks",
    })
  }

  const handleThemeChange = (themeId: string) => {
    if (isPremiumTheme(themeId) && !user.isPremium) {
      toast({
        title: "Premium Theme",
        description: "This theme is only available for premium subscribers. Upgrade to access all themes!",
        variant: "destructive",
      })
      return
    }

    setTheme(themeId as any)
    toast({
      title: "Theme changed",
      description: `Switched to ${themeOptions.find((t) => t.id === themeId)?.name} theme`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>
                      {user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Change profile picture</span>
                    <input
                      type="file"
                      id="profile-picture"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <h2 className="text-xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {user.isPremium && <PremiumBadge />}
                  <Badge variant="outline">
                    {user.role === "both" ? "Reader & Author" : user.role === "author" ? "Author" : "Reader"}
                  </Badge>
                </div>
              </div>
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Bookmarks ({bookmarks.length})
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => (window.location.href = "/returns")}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  My Returns
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Palette className="mr-2 h-4 w-4" />
                  Themes
                </Button>
                {user.isPremium ? (
                  <Button variant="ghost" className="w-full justify-start">
                    <Crown className="mr-2 h-4 w-4" />
                    Premium
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => (window.location.href = "/premium")}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                )}
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-3/4">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="themes">Themes</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user.firstName} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user.lastName} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                    </div>
                    {user.gender && (
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Input id="gender" defaultValue={user.gender} readOnly />
                      </div>
                    )}
                    {user.age && (
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" defaultValue={user.age} readOnly />
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Label>Your Role</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <Button
                        variant={user.role === "reader" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleRoleChange("reader")}
                      >
                        Reader
                      </Button>
                      <Button
                        variant={user.role === "author" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleRoleChange("author")}
                      >
                        Author
                      </Button>
                      <Button
                        variant={user.role === "both" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleRoleChange("both")}
                      >
                        Both
                      </Button>
                    </div>
                  </div>

                  {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                    <div className="mt-4">
                      <Label>Favorite Genres</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.favoriteGenres.map((genre) => (
                          <Badge key={genre} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                        <Button variant="outline" size="sm">
                          Edit Genres
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.preferredFormats && user.preferredFormats.length > 0 && (
                    <div className="mt-4">
                      <Label>Preferred Formats</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.preferredFormats.map((format) => (
                          <Badge key={format} variant="outline">
                            {format === "light-novel"
                              ? "Light Novel"
                              : format === "audio-book"
                                ? "Audio Book"
                                : format === "comic-book"
                                  ? "Comic Book"
                                  : format.charAt(0).toUpperCase() + format.slice(1)}
                          </Badge>
                        ))}
                        <Button variant="outline" size="sm">
                          Edit Formats
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Address Book</CardTitle>
                  <CardDescription>Manage your shipping addresses.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Home Address</p>
                          <Badge variant="outline" className="mt-1">
                            Default
                          </Badge>
                        </div>
                        <div className="space-x-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p>123 Main Street</p>
                      <p>Apt 4B</p>
                      <p>New York, NY 10001</p>
                      <p>United States</p>
                    </div>
                    <Button variant="outline">Add New Address</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookmarks</CardTitle>
                  <CardDescription>
                    Books you've saved for later reading. You have {bookmarks.length} bookmarked books.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8">
                      <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No bookmarks yet</h3>
                      <p className="text-gray-500 mb-4">
                        Start exploring books and bookmark the ones you want to read later.
                      </p>
                      <Button onClick={() => (window.location.href = "/books")}>Browse Books</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bookmarks.map((book) => (
                        <div key={book.id} className="relative">
                          <BookCard book={book} />
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                            onClick={() => handleRemoveBookmark(book.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View your past orders and their status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border rounded-md p-4">
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">Placed on {order.date}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <Badge variant={order.status === "Delivered" ? "success" : "secondary"}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <p>
                                {item.title} <span className="text-gray-500">x{item.quantity}</span>
                              </p>
                              <p>${item.price.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="border-t mt-4 pt-4 flex justify-between">
                          <p className="font-medium">Total</p>
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Track Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="themes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Customization</CardTitle>
                  <CardDescription>
                    Personalize your reading experience with different themes.
                    {!user.isPremium && " Upgrade to Premium to unlock all themes!"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themeOptions.map((themeOption) => (
                      <div
                        key={themeOption.id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                          theme === themeOption.id ? "ring-2 ring-primary" : ""
                        } ${themeOption.premium && !user.isPremium ? "opacity-60" : ""}`}
                        onClick={() => handleThemeChange(themeOption.id)}
                      >
                        <div
                          className="h-20 w-full"
                          style={{
                            background: `linear-gradient(to right, ${themeOption.colors[0]}, ${themeOption.colors[1]})`,
                          }}
                        />
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{themeOption.name}</p>
                            {themeOption.premium && (
                              <Badge variant={user.isPremium ? "secondary" : "outline"} className="text-xs">
                                {user.isPremium ? "Premium" : "🔒"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{themeOption.description}</p>
                          <div className="flex gap-1 mb-2">
                            {themeOption.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          {theme === themeOption.id && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!user.isPremium && (
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-amber-600" />
                        <h3 className="font-medium text-amber-800 dark:text-amber-300">Unlock Premium Themes</h3>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                        Get access to {themeOptions.filter((t) => t.premium).length} exclusive premium themes with
                        beautiful color schemes designed for the perfect reading experience.
                      </p>
                      <Button onClick={() => (window.location.href = "/premium")} size="sm">
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="premium" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Premium Subscription</CardTitle>
                      <CardDescription>Manage your premium subscription.</CardDescription>
                    </div>
                    {user.isPremium && <PremiumBadge />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.isPremium ? (
                    <>
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
                        <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Active Subscription</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Plan:</span>
                            <span className="font-medium">
                              {user.premiumPlan === "yearly" ? "Yearly" : "Monthly"} Premium
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Member since:</span>
                            <span>{user.premiumSince || "January 15, 2023"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next billing date:</span>
                            <span>
                              {user.premiumSince
                                ? new Date(
                                    new Date(user.premiumSince).getTime() +
                                      (user.premiumPlan === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000,
                                  ).toLocaleDateString()
                                : "January 15, 2024"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span>${user.premiumPlan === "yearly" ? "99.99" : "9.99"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Premium Benefits</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Unlimited reading access to all books</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Ad-free experience across the platform</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>
                              Access to {themeOptions.filter((t) => t.premium).length} exclusive premium themes
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Early access to new releases</span>
                          </li>
                          {user.premiumPlan === "yearly" && (
                            <>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Audiobooks included</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>10% discount on physical books</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div className="flex gap-4">
                        <Button variant="outline">Change Plan</Button>
                        <Button variant="outline" className="text-red-500">
                          Cancel Subscription
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Unlock unlimited reading, exclusive books, premium themes, and more with a premium subscription.
                      </p>
                      <Button onClick={() => (window.location.href = "/premium")}>View Premium Plans</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
