import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Book = Database["public"]["Tables"]["books"]["Row"]
type BookInsert = Database["public"]["Tables"]["books"]["Insert"]
type BookUpdate = Database["public"]["Tables"]["books"]["Update"]

export class BookService {
  // Get all books with optional filtering and sorting
  static async getBooks(options?: {
    category?: string
    format?: string
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    limit?: number
    offset?: number
  }) {
    try {
      let query = supabase.from("books").select("*")

      // Apply filters
      if (options?.category && options.category !== "all") {
        query = query.eq("category", options.category)
      }

      if (options?.format && options.format !== "all") {
        query = query.eq("format", options.format)
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,author.ilike.%${options.search}%`)
      }

      // Apply sorting
      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options?.sortOrder !== "desc" })
      } else {
        query = query.order("title")
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.warn("Supabase error, using mock data:", error.message)
        return this.getMockBooks()
      }

      return data || []
    } catch (error) {
      console.warn("Database connection failed, using mock data")
      return this.getMockBooks()
    }
  }

  // Get all books (simplified method for admin)
  static async getAllBooks() {
    try {
      const { data, error } = await supabase.from("books").select("*").order("title")

      if (error) {
        console.warn("Supabase error, using mock data:", error.message)
        return this.getMockBooks()
      }

      return data || []
    } catch (error) {
      console.warn("Database connection failed, using mock data")
      return this.getMockBooks()
    }
  }

  // Mock books for demo purposes
  static getMockBooks() {
    return [
      {
        id: "1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Fiction",
        price: 12.99,
        stock_quantity: 25,
        rating: 4.2,
        description: "A classic American novel set in the Jazz Age.",
        image_url: "/placeholder.svg?height=200&width=150",
        isbn: "978-0-7432-7356-5",
        publisher: "Scribner",
        publication_date: "1925-04-10",
        pages: 180,
        language: "English",
        format: "Paperback",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        price: 14.99,
        stock_quantity: 18,
        rating: 4.5,
        description: "A gripping tale of racial injustice and childhood innocence.",
        image_url: "/placeholder.svg?height=200&width=150",
        isbn: "978-0-06-112008-4",
        publisher: "J.B. Lippincott & Co.",
        publication_date: "1960-07-11",
        pages: 281,
        language: "English",
        format: "Hardcover",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        title: "1984",
        author: "George Orwell",
        category: "Science Fiction",
        price: 13.99,
        stock_quantity: 30,
        rating: 4.4,
        description: "A dystopian social science fiction novel and cautionary tale.",
        image_url: "/placeholder.svg?height=200&width=150",
        isbn: "978-0-452-28423-4",
        publisher: "Secker & Warburg",
        publication_date: "1949-06-08",
        pages: 328,
        language: "English",
        format: "Paperback",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "4",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "Romance",
        price: 11.99,
        stock_quantity: 22,
        rating: 4.3,
        description: "A romantic novel of manners written by Jane Austen.",
        image_url: "/placeholder.svg?height=200&width=150",
        isbn: "978-0-14-143951-8",
        publisher: "T. Egerton",
        publication_date: "1813-01-28",
        pages: 432,
        language: "English",
        format: "Paperback",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "5",
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        category: "Fiction",
        price: 15.99,
        stock_quantity: 12,
        rating: 3.8,
        description: "A controversial novel originally published for adults.",
        image_url: "/placeholder.svg?height=200&width=150",
        isbn: "978-0-316-76948-0",
        publisher: "Little, Brown and Company",
        publication_date: "1951-07-16",
        pages: 277,
        language: "English",
        format: "Hardcover",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  }

  // Get a single book by ID
  static async getBookById(id: string) {
    try {
      const { data, error } = await supabase.from("books").select("*").eq("id", id).single()

      if (error) {
        // Fallback to mock data
        const mockBooks = this.getMockBooks()
        const book = mockBooks.find((b) => b.id === id)
        if (!book) {
          throw new Error(`Book with ID ${id} not found`)
        }
        return book
      }

      return data
    } catch (error) {
      // Fallback to mock data
      const mockBooks = this.getMockBooks()
      const book = mockBooks.find((b) => b.id === id)
      if (!book) {
        throw new Error(`Book with ID ${id} not found`)
      }
      return book
    }
  }

  // Add a new book
  static async addBook(book: Omit<BookInsert, "id" | "created_at" | "updated_at">) {
    try {
      const bookData: BookInsert = {
        ...book,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("books").insert([bookData]).select().single()

      if (error) {
        console.warn("Failed to add book to database:", error.message)
        // For demo purposes, simulate adding to mock data
        const newBook = {
          ...bookData,
          id: `mock-${Date.now()}`,
          rating: 0,
        }
        console.log("Added book (mock):", newBook)
        return newBook
      }

      return data
    } catch (error) {
      console.warn("Database error, using mock:", error)
      // For demo purposes, simulate adding to mock data
      const newBook = {
        ...book,
        id: `mock-${Date.now()}`,
        rating: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      console.log("Added book (mock):", newBook)
      return newBook
    }
  }

  // Update a book
  static async updateBook(id: string, updates: BookUpdate) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("books").update(updateData).eq("id", id).select().single()

      if (error) {
        console.warn("Failed to update book in database:", error.message)
        // For demo purposes, simulate update
        const updatedBook = { id, ...updates }
        console.log("Updated book (mock):", updatedBook)
        return updatedBook
      }

      return data
    } catch (error) {
      console.warn("Database error, using mock:", error)
      // For demo purposes, simulate update
      const updatedBook = { id, ...updates }
      console.log("Updated book (mock):", updatedBook)
      return updatedBook
    }
  }

  // Delete a book
  static async deleteBook(id: string) {
    try {
      const { error } = await supabase.from("books").delete().eq("id", id)

      if (error) {
        console.warn("Failed to delete book from database:", error.message)
        console.log("Deleted book (mock):", id)
        return true
      }

      return true
    } catch (error) {
      console.warn("Database error, using mock:", error)
      console.log("Deleted book (mock):", id)
      return true
    }
  }

  // Bulk delete books
  static async deleteBooksById(ids: string[]) {
    try {
      const { error } = await supabase.from("books").delete().in("id", ids)

      if (error) {
        console.warn("Failed to bulk delete books from database:", error.message)
        console.log("Bulk deleted books (mock):", ids)
        return true
      }

      return true
    } catch (error) {
      console.warn("Database error, using mock:", error)
      console.log("Bulk deleted books (mock):", ids)
      return true
    }
  }

  // Bulk update books
  static async bulkUpdateBooks(ids: string[], updates: BookUpdate) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("books").update(updateData).in("id", ids).select()

      if (error) {
        console.warn("Failed to bulk update books in database:", error.message)
        console.log("Bulk updated books (mock):", ids, updates)
        return []
      }

      return data || []
    } catch (error) {
      console.warn("Database error, using mock:", error)
      console.log("Bulk updated books (mock):", ids, updates)
      return []
    }
  }

  // Get book categories
  static async getCategories() {
    try {
      const { data, error } = await supabase.from("books").select("category").not("category", "is", null)

      if (error) {
        return ["Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery", "Romance", "Biography"]
      }

      const categories = [...new Set(data.map((item) => item.category))]
      return categories.sort()
    } catch (error) {
      return ["Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery", "Romance", "Biography"]
    }
  }

  // Get book statistics
  static async getBookStats() {
    try {
      const { data, error } = await supabase.from("books").select("price, stock_quantity, category, format")

      if (error) {
        // Return mock stats
        return {
          totalBooks: 5,
          totalValue: 68.95,
          lowStockCount: 1,
          categoryDistribution: {
            Fiction: 3,
            "Science Fiction": 1,
            Romance: 1,
          },
          formatDistribution: {
            Paperback: 3,
            Hardcover: 2,
          },
        }
      }

      const totalBooks = data.length
      const totalValue = data.reduce((sum, book) => sum + (book.price || 0), 0)
      const lowStockCount = data.filter((book) => (book.stock_quantity || 0) < 10).length

      const categoryDistribution = data.reduce(
        (acc, book) => {
          if (book.category) {
            acc[book.category] = (acc[book.category] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>,
      )

      const formatDistribution = data.reduce(
        (acc, book) => {
          if (book.format) {
            acc[book.format] = (acc[book.format] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>,
      )

      return {
        totalBooks,
        totalValue,
        lowStockCount,
        categoryDistribution,
        formatDistribution,
      }
    } catch (error) {
      // Return mock stats
      return {
        totalBooks: 5,
        totalValue: 68.95,
        lowStockCount: 1,
        categoryDistribution: {
          Fiction: 3,
          "Science Fiction": 1,
          Romance: 1,
        },
        formatDistribution: {
          Paperback: 3,
          Hardcover: 2,
        },
      }
    }
  }
}

// Export both the class and a default instance
export const bookService = new BookService()
export default BookService
