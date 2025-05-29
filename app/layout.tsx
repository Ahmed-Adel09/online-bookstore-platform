import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"
import { CartProvider } from "@/hooks/use-cart"
import { BookmarksProvider } from "@/hooks/use-bookmarks"
import { BookshelfProvider } from "@/hooks/use-bookshelf"
import { ReadingStatsProvider } from "@/hooks/use-reading-stats"
import { TranslationProvider } from "@/hooks/use-translation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ShoppingCart, User, Menu } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BookHaven - Your Digital Library",
  description: "Discover, read, and enjoy thousands of books in our digital library",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          <TranslationProvider>
            <AuthProvider>
              <CartProvider>
                <BookmarksProvider>
                  <BookshelfProvider>
                    <ReadingStatsProvider>
                      <div className="min-h-screen bg-background">
                        {/* Navigation */}
                        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                          <div className="container mx-auto px-4">
                            <div className="flex h-16 items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Link href="/" className="flex items-center space-x-2">
                                  <BookOpen className="h-6 w-6" />
                                  <span className="font-bold text-xl">BookHaven</span>
                                </Link>
                                <div className="hidden md:flex items-center space-x-4">
                                  <Link href="/books" className="text-sm font-medium hover:underline">
                                    Books
                                  </Link>
                                  <Link href="/new-releases" className="text-sm font-medium hover:underline">
                                    New Releases
                                  </Link>
                                  <Link href="/best-sellers" className="text-sm font-medium hover:underline">
                                    Best Sellers
                                  </Link>
                                  <Link href="/community" className="text-sm font-medium hover:underline">
                                    Community
                                  </Link>
                                  <Link href="/premium" className="text-sm font-medium hover:underline text-amber-600">
                                    Premium
                                  </Link>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <LanguageSelector />
                                <ThemeToggle />
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href="/cart">
                                    <ShoppingCart className="h-4 w-4" />
                                  </Link>
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <User className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href="/profile">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/orders">Orders</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/exclusive-themes">Themes</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/auth/login">Login</Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                      <Menu className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href="/books">Books</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/new-releases">New Releases</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/best-sellers">Best Sellers</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/community">Community</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href="/premium">Premium</Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </nav>

                        {/* Main Content */}
                        <main>{children}</main>

                        {/* Footer */}
                        <footer className="border-t bg-muted/50 mt-16">
                          <div className="container mx-auto px-4 py-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              <div>
                                <h3 className="font-semibold mb-4">BookHaven</h3>
                                <p className="text-sm text-muted-foreground">
                                  Your digital library for discovering and enjoying thousands of books.
                                </p>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-4">Quick Links</h3>
                                <ul className="space-y-2 text-sm">
                                  <li>
                                    <Link href="/books" className="text-muted-foreground hover:underline">
                                      Browse Books
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/premium" className="text-muted-foreground hover:underline">
                                      Premium Plans
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/exclusive-themes" className="text-muted-foreground hover:underline">
                                      Themes
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/about" className="text-muted-foreground hover:underline">
                                      About Us
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-4">Support</h3>
                                <ul className="space-y-2 text-sm">
                                  <li>
                                    <Link href="/orders" className="text-muted-foreground hover:underline">
                                      Order Tracking
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/returns" className="text-muted-foreground hover:underline">
                                      Returns
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/profile" className="text-muted-foreground hover:underline">
                                      Account
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-4">Connect</h3>
                                <p className="text-sm text-muted-foreground">Follow us for updates and new releases.</p>
                              </div>
                            </div>
                            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                              <p>&copy; 2024 BookHaven. All rights reserved.</p>
                            </div>
                          </div>
                        </footer>
                      </div>
                      <Toaster />
                    </ReadingStatsProvider>
                  </BookshelfProvider>
                </BookmarksProvider>
              </CartProvider>
            </AuthProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
