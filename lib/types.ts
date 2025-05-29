export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  price: number
  category: string
  format: "physical" | "ebook" | "both"
  rating: number
  reviews: number
  publisher: string | null
  publication_date: string | null
  isbn: string | null
  pages: number | null
  cover_image: string | null
  file_size: string | null
  file_format: string | null
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface BookInsert {
  title: string
  author: string
  description?: string
  price: number
  category: string
  format: "physical" | "ebook" | "both"
  rating?: number
  reviews?: number
  publisher?: string
  publication_date?: string
  isbn?: string
  pages?: number
  cover_image?: string
  file_size?: string
  file_format?: string
  stock_quantity?: number
}
