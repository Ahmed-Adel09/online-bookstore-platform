import type { Book } from "./types"

// Simple recommendation algorithm based on book categories and popularity
export function getRecommendedBooks(
  books: Book[],
  userPreferences: {
    recentlyViewed?: string[]
    purchaseHistory?: string[]
    favoriteCategories?: string[]
  } = {},
): Book[] {
  // Create a scoring system for books
  const scoredBooks = books.map((book) => {
    let score = 0

    // Base score from reviews and ratings
    score += book.reviews * 0.1
    score += book.rating * 10

    // Boost score based on user's favorite categories
    if (userPreferences.favoriteCategories?.includes(book.category)) {
      score += 50
    }

    // Boost score if user has viewed the book recently
    if (userPreferences.recentlyViewed?.includes(book.id)) {
      score += 20
    }

    // Lower score if user has already purchased the book
    if (userPreferences.purchaseHistory?.includes(book.id)) {
      score -= 100
    }

    return { book, score }
  })

  // Sort by score and return top books
  return scoredBooks
    .sort((a, b) => b.score - a.score)
    .filter((item) => !userPreferences.purchaseHistory?.includes(item.book.id))
    .slice(0, 4)
    .map((item) => item.book)
}

// Get books in the same category
export function getSimilarBooks(book: Book, allBooks: Book[], limit = 4): Book[] {
  return allBooks
    .filter((b) => b.id !== book.id && b.category === book.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}

// Get books by the same author
export function getBooksByAuthor(author: string, allBooks: Book[], limit = 4): Book[] {
  return allBooks
    .filter((book) => book.author === author)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}

// Get trending books based on reviews and ratings
export function getTrendingBooks(allBooks: Book[], limit = 4): Book[] {
  return [...allBooks]
    .sort((a, b) => {
      // Calculate a trending score based on reviews and ratings
      const scoreA = a.reviews * a.rating
      const scoreB = b.reviews * b.rating
      return scoreB - scoreA
    })
    .slice(0, limit)
}
