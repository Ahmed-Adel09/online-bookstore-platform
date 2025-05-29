"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Book } from "@/lib/types"

interface BookmarksContextType {
  bookmarks: Book[]
  addBookmark: (book: Book) => void
  removeBookmark: (bookId: string) => void
  isBookmarked: (bookId: string) => boolean
  clearBookmarks: () => void
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Book[]>([])

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarks")
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch (error) {
        console.error("Error loading bookmarks:", error)
      }
    }
  }, [])

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
  }, [bookmarks])

  const addBookmark = (book: Book) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === book.id)) {
        return prev // Already bookmarked
      }
      return [...prev, book]
    })
  }

  const removeBookmark = (bookId: string) => {
    setBookmarks((prev) => prev.filter((book) => book.id !== bookId))
  }

  const isBookmarked = (bookId: string) => {
    return bookmarks.some((book) => book.id === bookId)
  }

  const clearBookmarks = () => {
    setBookmarks([])
  }

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        clearBookmarks,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarksContext)
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarksProvider")
  }
  return context
}
