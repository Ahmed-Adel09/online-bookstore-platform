"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BookService } from "@/lib/book-service"
import { logger } from "@/lib/logging-service"
import { Plus, Search, Edit, Trash2, BookOpen, Download, Star } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  category: string
  price: number
  stock_quantity: number
  rating: number
  description: string
  image_url: string
  isbn: string
  publisher: string
  publication_date: string
  pages: number
  language: string
  format: string
}

export function AdminBookManager() {
  const { toast } = useToast()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    stock_quantity: "",
    description: "",
    image_url: "",
    isbn: "",
    publisher: "",
    publication_date: "",
    pages: "",
    language: "English",
    format: "Paperback",
  })

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Romance",
    "Biography",
    "History",
    "Science",
    "Technology",
    "Business",
    "Self-Help",
    "Health",
    "Travel",
    "Children",
    "Young Adult",
    "Poetry",
    "Comics",
  ]

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const booksData = await BookService.getAllBooks()
      setBooks(booksData)
      await logger.logUserInteraction("books_loaded", undefined, { count: booksData.length })
    } catch (error) {
      console.error("Error loading books:", error)
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddBook = async () => {
    try {
      const bookData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock_quantity: Number.parseInt(formData.stock_quantity),
        pages: Number.parseInt(formData.pages),
        rating: 0,
      }

      const newBook = await BookService.addBook(bookData)
      setBooks([...books, newBook])
      setIsAddDialogOpen(false)
      resetForm()

      await logger.logUserInteraction("book_added", undefined, { book_id: newBook.id, title: newBook.title })

      toast({
        title: "Success",
        description: "Book added successfully",
      })
    } catch (error) {
      console.error("Error adding book:", error)
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      })
    }
  }

  const handleEditBook = async () => {
    if (!editingBook) return

    try {
      const bookData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock_quantity: Number.parseInt(formData.stock_quantity),
        pages: Number.parseInt(formData.pages),
      }

      const updatedBook = await BookService.updateBook(editingBook.id, bookData)
      setBooks(books.map((book) => (book.id === editingBook.id ? { ...book, ...updatedBook } : book)))
      setIsEditDialogOpen(false)
      setEditingBook(null)
      resetForm()

      await logger.logUserInteraction("book_updated", undefined, { book_id: editingBook.id, title: updatedBook.title })

      toast({
        title: "Success",
        description: "Book updated successfully",
      })
    } catch (error) {
      console.error("Error updating book:", error)
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return

    try {
      await BookService.deleteBook(book.id)
      setBooks(books.filter((b) => b.id !== book.id))

      await logger.logUserInteraction("book_deleted", undefined, { book_id: book.id, title: book.title })

      toast({
        title: "Success",
        description: "Book deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting book:", error)
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price.toString(),
      stock_quantity: book.stock_quantity.toString(),
      description: book.description,
      image_url: book.image_url,
      isbn: book.isbn,
      publisher: book.publisher,
      publication_date: book.publication_date,
      pages: book.pages.toString(),
      language: book.language,
      format: book.format,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      price: "",
      stock_quantity: "",
      description: "",
      image_url: "",
      isbn: "",
      publisher: "",
      publication_date: "",
      pages: "",
      language: "English",
      format: "Paperback",
    })
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const exportBooks = () => {
    const csvContent = [
      ["Title", "Author", "Category", "Price", "Stock", "Rating", "ISBN"].join(","),
      ...filteredBooks.map((book) =>
        [book.title, book.author, book.category, book.price, book.stock_quantity, book.rating, book.isbn].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "books.csv"
    a.click()
    URL.revokeObjectURL(url)

    logger.logUserInteraction("books_exported", undefined, { count: filteredBooks.length })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Book Management</span>
          </CardTitle>
          <CardDescription>Manage your book inventory, add new books, and update existing ones</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportBooks} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                  <DialogDescription>Fill in the details to add a new book to your inventory</DialogDescription>
                </DialogHeader>
                <BookForm
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  onSubmit={handleAddBook}
                  onCancel={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                  submitLabel="Add Book"
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Books Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={book.image_url || "/placeholder.svg?height=40&width=30"}
                            alt={book.title}
                            className="w-8 h-10 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{book.title}</div>
                            <div className="text-sm text-gray-500">{book.author}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{book.category}</Badge>
                      </TableCell>
                      <TableCell>${book.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            book.stock_quantity > 10 ? "default" : book.stock_quantity > 0 ? "secondary" : "destructive"
                          }
                        >
                          {book.stock_quantity} in stock
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{book.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(book)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBook(book)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredBooks.length === 0 && !loading && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first book"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the book details</DialogDescription>
          </DialogHeader>
          <BookForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleEditBook}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setEditingBook(null)
              resetForm()
            }}
            submitLabel="Update Book"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface BookFormProps {
  formData: any
  setFormData: (data: any) => void
  categories: string[]
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
}

function BookForm({ formData, setFormData, categories, onSubmit, onCancel, submitLabel }: BookFormProps) {
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Book title"
            required
          />
        </div>
        <div>
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => handleInputChange("author", e.target.value)}
            placeholder="Author name"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="stock_quantity">Stock *</Label>
          <Input
            id="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange("stock_quantity", e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={formData.isbn}
            onChange={(e) => handleInputChange("isbn", e.target.value)}
            placeholder="978-0000000000"
          />
        </div>
        <div>
          <Label htmlFor="publisher">Publisher</Label>
          <Input
            id="publisher"
            value={formData.publisher}
            onChange={(e) => handleInputChange("publisher", e.target.value)}
            placeholder="Publisher name"
          />
        </div>
        <div>
          <Label htmlFor="publication_date">Publication Date</Label>
          <Input
            id="publication_date"
            type="date"
            value={formData.publication_date}
            onChange={(e) => handleInputChange("publication_date", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pages">Pages</Label>
          <Input
            id="pages"
            type="number"
            value={formData.pages}
            onChange={(e) => handleInputChange("pages", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Italian">Italian</SelectItem>
              <SelectItem value="Portuguese">Portuguese</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Korean">Korean</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="format">Format</Label>
          <Select value={formData.format} onValueChange={(value) => handleInputChange("format", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paperback">Paperback</SelectItem>
              <SelectItem value="Hardcover">Hardcover</SelectItem>
              <SelectItem value="eBook">eBook</SelectItem>
              <SelectItem value="Audiobook">Audiobook</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) => handleInputChange("image_url", e.target.value)}
            placeholder="https://example.com/book-cover.jpg"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Book description..."
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  )
}
