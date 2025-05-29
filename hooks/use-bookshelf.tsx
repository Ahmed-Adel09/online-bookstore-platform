"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Book } from "@/lib/types"

interface PurchasedBook extends Book {
  purchaseDate: string
  downloadUrl?: string
  readingProgress: number
  lastReadDate?: string
  isDownloaded: boolean
}

interface BookshelfContextType {
  purchasedBooks: PurchasedBook[]
  addPurchasedBook: (book: Book) => void
  updateReadingProgress: (bookId: string, progress: number) => void
  downloadBook: (bookId: string) => Promise<void>
  getBookProgress: (bookId: string) => number
}

const BookshelfContext = createContext<BookshelfContextType | undefined>(undefined)

export function BookshelfProvider({ children }: { children: ReactNode }) {
  const [purchasedBooks, setPurchasedBooks] = useState<PurchasedBook[]>([])

  // Load purchased books from localStorage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem("purchasedBooks")
    if (savedBooks) {
      try {
        setPurchasedBooks(JSON.parse(savedBooks))
      } catch (error) {
        console.error("Error loading purchased books:", error)
      }
    }
  }, [])

  // Save purchased books to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("purchasedBooks", JSON.stringify(purchasedBooks))
  }, [purchasedBooks])

  const addPurchasedBook = (book: Book) => {
    const purchasedBook: PurchasedBook = {
      ...book,
      purchaseDate: new Date().toISOString(),
      readingProgress: 0,
      isDownloaded: false,
    }

    setPurchasedBooks((prev) => {
      if (prev.some((b) => b.id === book.id)) {
        return prev // Already purchased
      }
      return [...prev, purchasedBook]
    })
  }

  const updateReadingProgress = (bookId: string, progress: number) => {
    setPurchasedBooks((prev) =>
      prev.map((book) =>
        book.id === bookId ? { ...book, readingProgress: progress, lastReadDate: new Date().toISOString() } : book,
      ),
    )
  }

  const downloadBook = async (bookId: string) => {
    // Simulate download process
    setPurchasedBooks((prev) =>
      prev.map((book) =>
        book.id === bookId ? { ...book, isDownloaded: true, downloadUrl: `/downloads/${bookId}.epub` } : book,
      ),
    )
  }

  const getBookProgress = (bookId: string) => {
    const book = purchasedBooks.find((b) => b.id === bookId)
    return book?.readingProgress || 0
  }

  return (
    <BookshelfContext.Provider
      value={{
        purchasedBooks,
        addPurchasedBook,
        updateReadingProgress,
        downloadBook,
        getBookProgress,
      }}
    >
      {children}
    </BookshelfContext.Provider>
  )
}

export function useBookshelf() {
  const context = useContext(BookshelfContext)
  if (context === undefined) {
    throw new Error("useBookshelf must be used within a BookshelfProvider")
  }
  return context
}
