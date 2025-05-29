"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface ReadingStats {
  totalBooksRead: number
  hoursSpentReading: number
  favoriteGenre: string
  currentStreak: number
  longestStreak: number
  booksThisMonth: number
  booksThisYear: number
  averageRating: number
  badges: Badge[]
  readingGoal: number
  goalProgress: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface ReadingStatsContextType {
  stats: ReadingStats
  updateStats: (updates: Partial<ReadingStats>) => void
  addReadingTime: (minutes: number) => void
  markBookAsRead: (bookId: string, genre: string, rating?: number) => void
  checkAndUnlockBadges: () => Badge[]
}

const ReadingStatsContext = createContext<ReadingStatsContextType | undefined>(undefined)

const defaultBadges: Badge[] = [
  {
    id: "first-book",
    name: "First Chapter",
    description: "Read your first book",
    icon: "📖",
    unlockedAt: "",
    rarity: "common",
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Read 10 books",
    icon: "🐛",
    unlockedAt: "",
    rarity: "rare",
  },
  {
    id: "speed-reader",
    name: "Speed Reader",
    description: "Read 5 books in a month",
    icon: "⚡",
    unlockedAt: "",
    rarity: "epic",
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Read for 100 hours",
    icon: "🦉",
    unlockedAt: "",
    rarity: "rare",
  },
  {
    id: "genre-explorer",
    name: "Genre Explorer",
    description: "Read books from 5 different genres",
    icon: "🗺️",
    unlockedAt: "",
    rarity: "epic",
  },
  {
    id: "marathon-reader",
    name: "Marathon Reader",
    description: "Read for 10 hours in a day",
    icon: "🏃",
    unlockedAt: "",
    rarity: "legendary",
  },
  {
    id: "critic",
    name: "Critic",
    description: "Rate 25 books",
    icon: "⭐",
    unlockedAt: "",
    rarity: "rare",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Maintain a 7-day reading streak",
    icon: "💎",
    unlockedAt: "",
    rarity: "epic",
  },
]

export function ReadingStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ReadingStats>({
    totalBooksRead: 0,
    hoursSpentReading: 0,
    favoriteGenre: "",
    currentStreak: 0,
    longestStreak: 0,
    booksThisMonth: 0,
    booksThisYear: 0,
    averageRating: 0,
    badges: [],
    readingGoal: 12,
    goalProgress: 0,
  })

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem("readingStats")
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats)
        setStats(parsedStats)
      } catch (error) {
        console.error("Error loading reading stats:", error)
      }
    }
  }, [])

  // Save stats to localStorage whenever stats change
  useEffect(() => {
    localStorage.setItem("readingStats", JSON.stringify(stats))
  }, [stats])

  const updateStats = (updates: Partial<ReadingStats>) => {
    setStats((prev) => ({ ...prev, ...updates }))
  }

  const addReadingTime = (minutes: number) => {
    const hours = minutes / 60
    setStats((prev) => ({
      ...prev,
      hoursSpentReading: prev.hoursSpentReading + hours,
    }))
  }

  const markBookAsRead = (bookId: string, genre: string, rating?: number) => {
    setStats((prev) => {
      const newStats = {
        ...prev,
        totalBooksRead: prev.totalBooksRead + 1,
        booksThisMonth: prev.booksThisMonth + 1,
        booksThisYear: prev.booksThisYear + 1,
        goalProgress: Math.min(100, ((prev.totalBooksRead + 1) / prev.readingGoal) * 100),
      }

      // Update favorite genre logic
      // This is simplified - in a real app, you'd track genre counts
      if (!prev.favoriteGenre) {
        newStats.favoriteGenre = genre
      }

      // Update average rating if rating provided
      if (rating) {
        const totalRatings = prev.averageRating * prev.totalBooksRead
        newStats.averageRating = (totalRatings + rating) / (prev.totalBooksRead + 1)
      }

      return newStats
    })
  }

  const checkAndUnlockBadges = (): Badge[] => {
    const newBadges: Badge[] = []
    const currentTime = new Date().toISOString()

    defaultBadges.forEach((badge) => {
      const alreadyUnlocked = stats.badges.some((b) => b.id === badge.id)
      if (alreadyUnlocked) return

      let shouldUnlock = false

      switch (badge.id) {
        case "first-book":
          shouldUnlock = stats.totalBooksRead >= 1
          break
        case "bookworm":
          shouldUnlock = stats.totalBooksRead >= 10
          break
        case "speed-reader":
          shouldUnlock = stats.booksThisMonth >= 5
          break
        case "night-owl":
          shouldUnlock = stats.hoursSpentReading >= 100
          break
        case "marathon-reader":
          shouldUnlock = stats.hoursSpentReading >= 10 // Simplified check
          break
        case "perfectionist":
          shouldUnlock = stats.currentStreak >= 7
          break
      }

      if (shouldUnlock) {
        const unlockedBadge = { ...badge, unlockedAt: currentTime }
        newBadges.push(unlockedBadge)
      }
    })

    if (newBadges.length > 0) {
      setStats((prev) => ({
        ...prev,
        badges: [...prev.badges, ...newBadges],
      }))
    }

    return newBadges
  }

  return (
    <ReadingStatsContext.Provider
      value={{
        stats,
        updateStats,
        addReadingTime,
        markBookAsRead,
        checkAndUnlockBadges,
      }}
    >
      {children}
    </ReadingStatsContext.Provider>
  )
}

export function useReadingStats() {
  const context = useContext(ReadingStatsContext)
  if (context === undefined) {
    throw new Error("useReadingStats must be used within a ReadingStatsProvider")
  }
  return context
}
