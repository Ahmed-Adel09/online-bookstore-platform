"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BookService } from "@/lib/book-service"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import type { Book, BookInsert } from "@/lib/types"

export function BookManagement() {
  const { toast } = useToast()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [formatFilter, setFormatFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState<BookInsert>({
    title: "",
    author: "",
    isbn: "",
    price: 0,
    category: "",
    format: "paperback",
    description: "",
    image_url: "",
    stock_quantity: 0,
    publication_date: "",
    publisher: "",
    language: "English",
    pages: 0,
    rating: 0,
  })

  useEffect(() => {
    loadBooks()
    loadCategories()
  }, [searchQuery, categoryFilter, formatFilter])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const data = await BookService.getBooks({
        search: searchQuery || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        format: formatFilter !== "all" ? formatFilter : undefined,
      })
      setBooks(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await BookService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBook) {
        await BookService.updateBook(editingBook.id, formData)
        toast({
          title: "Success",
          description: "Book updated successfully",
        })
        setIsEditDialogOpen(false)
      } else {
        await BookService.addBook(formData)
        toast({
          title: "Success",
          description: "Book added successfully",
        })
        setIsAddDialogOpen(false)
      }

      resetForm()
      loadBooks()
    } catch (error) {
      toast({
        title: "Error",
        description: editingBook ? "Failed to update book" : "Failed to add book",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      price: book.price || 0,
      category: book.category || "",
      format: book.format || "paperback",
      description: book.description || "",
      image_url: book.image_url || "",
      stock_quantity: book.stock_quantity || 0,
      publication_date: book.publication_date || "",
      publisher: book.publisher || "",
      language: book.language || "English",
      pages: book.pages || 0,
      rating: book.rating || 0,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await BookService.deleteBook(id)
        toast({
          title: "Success",
          description: "Book deleted successfully",
        })
        loadBooks()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete book",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      price: 0,
      category: "",
      format: "paperback",
      description: "",
      image_url: "",
      stock_quantity: 0,
      publication_date: "",
      publisher: "",
      language: "English",
      pages: 0,
      rating: 0,
    })
    setEditingBook(null)
  }

  const handleInputChange = (field: keyof BookInsert, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Book Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
            </DialogHeader>
            <BookForm
              formData={formData}
              categories={categories}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
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
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="paperback">Paperback</SelectItem>
                <SelectItem value="hardcover">Hardcover</SelectItem>
                <SelectItem value="ebook">E-book</SelectItem>
                <SelectItem value="audiobook">Audiobook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading books...
                  </TableCell>
                </TableRow>
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No books found
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.category && <Badge variant="secondary">{book.category}</Badge>}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{book.format}</Badge>
                    </TableCell>
                    <TableCell>${book.price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={book.stock_quantity && book.stock_quantity < 10 ? "destructive" : "default"}>
                        {book.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(book)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(book.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          <BookForm
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface BookFormProps {
  formData: BookInsert
  categories: string[]
  onInputChange: (field: keyof BookInsert, value: string | number) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isEditing?: boolean
}

function BookForm({ formData, categories, onInputChange, onSubmit, onCancel, isEditing }: BookFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={formData.title} onChange={(e) => onInputChange("title", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => onInputChange("author", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input id="isbn" value={formData.isbn} onChange={(e) => onInputChange("isbn", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => onInputChange("price", Number.parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => onInputChange("category", value)}>
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
          <Label htmlFor="format">Format</Label>
          <Select value={formData.format} onValueChange={(value) => onInputChange("format", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paperback">Paperback</SelectItem>
              <SelectItem value="hardcover">Hardcover</SelectItem>
              <SelectItem value="ebook">E-book</SelectItem>
              <SelectItem value="audiobook">Audiobook</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => onInputChange("stock_quantity", Number.parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="pages">Pages</Label>
          <Input
            id="pages"
            type="number"
            value={formData.pages}
            onChange={(e) => onInputChange("pages", Number.parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="publication_date">Publication Date</Label>
          <Input
            id="publication_date"
            type="date"
            value={formData.publication_date}
            onChange={(e) => onInputChange("publication_date", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="publisher">Publisher</Label>
          <Input
            id="publisher"
            value={formData.publisher}
            onChange={(e) => onInputChange("publisher", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Input id="language" value={formData.language} onChange={(e) => onInputChange("language", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) => onInputChange("rating", Number.parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" value={formData.image_url} onChange={(e) => onInputChange("image_url", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={3}
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? "Update Book" : "Add Book"}</Button>
      </div>
    </form>
  )
}
