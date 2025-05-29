"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Menu, X, BookOpen, Bookmark, BarChart3, Download, Clock, Star, TrendingUp } from "lucide-react"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useBookshelf } from "@/hooks/use-bookshelf"
import { useReadingStats } from "@/hooks/use-reading-stats"

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"bookshelf" | "bookmarks" | "stats">("bookshelf")

  const { bookmarks } = useBookmarks()
  const { purchasedBooks, updateReadingProgress, downloadBook } = useBookshelf()
  const { stats } = useReadingStats()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatReadingTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    }
    return `${Math.round(hours)}h`
  }

  return (
    <>
      {/* Hamburger Menu Button */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="fixed top-4 left-4 z-50 md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Hamburger Button */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex fixed top-4 left-4 z-50">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b">
            <Button
              variant={activeSection === "bookshelf" ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => setActiveSection("bookshelf")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Bookshelf
            </Button>
            <Button
              variant={activeSection === "bookmarks" ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => setActiveSection("bookmarks")}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Wishlist
            </Button>
            <Button
              variant={activeSection === "stats" ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => setActiveSection("stats")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {activeSection === "bookshelf" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">My eBooks</h3>
                  <Badge variant="secondary">{purchasedBooks.length}</Badge>
                </div>

                {purchasedBooks.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No eBooks purchased yet</p>
                    <Button onClick={() => (window.location.href = "/books")}>Browse Books</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedBooks.map((book) => (
                      <Card key={book.id} className="p-3">
                        <div className="flex gap-3">
                          <img
                            src={book.image || "/placeholder.svg"}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{book.title}</h4>
                            <p className="text-xs text-gray-500 truncate">{book.author}</p>

                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>Progress</span>
                                <span>{Math.round(book.readingProgress)}%</span>
                              </div>
                              <Progress value={book.readingProgress} className="h-1" />
                            </div>

                            <div className="flex gap-1 mt-2">
                              <Button size="sm" variant="outline" className="text-xs h-6">
                                Read
                              </Button>
                              {!book.isDownloaded && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6"
                                  onClick={() => downloadBook(book.id)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "bookmarks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Wishlist</h3>
                  <Badge variant="secondary">{bookmarks.length}</Badge>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No bookmarks yet</p>
                    <Button onClick={() => (window.location.href = "/books")}>Discover Books</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map((book) => (
                      <Card key={book.id} className="p-3">
                        <div className="flex gap-3">
                          <img
                            src={book.image || "/placeholder.svg"}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{book.title}</h4>
                            <p className="text-xs text-gray-500 truncate">{book.author}</p>
                            <p className="text-sm font-medium mt-1">${book.price}</p>
                            <Button size="sm" className="text-xs h-6 mt-2">
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "stats" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Reading Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Books Read</p>
                          <p className="font-semibold">{stats.totalBooksRead}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Reading Time</p>
                          <p className="font-semibold">{formatReadingTime(stats.hoursSpentReading)}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-xs text-gray-500">Avg Rating</p>
                          <p className="font-semibold">{stats.averageRating.toFixed(1)}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-500">Streak</p>
                          <p className="font-semibold">{stats.currentStreak} days</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Reading Goal</h4>
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Annual Goal</span>
                      <span className="text-sm font-medium">
                        {stats.totalBooksRead} / {stats.readingGoal}
                      </span>
                    </div>
                    <Progress value={stats.goalProgress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{Math.round(stats.goalProgress)}% complete</p>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Achievements</h4>
                  {stats.badges.length === 0 ? (
                    <p className="text-sm text-gray-500">No badges earned yet</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.badges.map((badge) => (
                        <Card key={badge.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{badge.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm">{badge.name}</h5>
                                <Badge variant="secondary" className={`text-xs ${getRarityColor(badge.rarity)}`}>
                                  {badge.rarity}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">{badge.description}</p>
                              {badge.unlockedAt && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">This Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Books completed</span>
                      <span className="font-medium">{stats.booksThisMonth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Favorite genre</span>
                      <span className="font-medium">{stats.favoriteGenre || "None yet"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Longest streak</span>
                      <span className="font-medium">{stats.longestStreak} days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
