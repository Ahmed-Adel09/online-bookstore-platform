"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material"
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material"

interface Book {
  id: number
  title: string
  author: string
  genre: string
  publicationYear: number
}

const EnhancedBookManagement = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newBook, setNewBook] = useState<Omit<Book, "id">>({
    title: "",
    author: "",
    genre: "",
    publicationYear: 2023,
  })
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  useEffect(() => {
    // Fetch books from API (replace with your actual API endpoint)
    const fetchBooks = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch("/api/books")
        const data = await response.json()
        setBooks(data)
      } catch (error) {
        console.error("Error fetching books:", error)
      }
    }

    fetchBooks()
  }, [])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setNewBook({ title: "", author: "", genre: "", publicationYear: 2023 })
  }

  const handleEditClickOpen = (book: Book) => {
    setSelectedBook(book)
    setEditOpen(true)
  }

  const handleEditClose = () => {
    setEditOpen(false)
    setSelectedBook(null)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewBook((prevBook) => ({
      ...prevBook,
      [name]: name === "publicationYear" ? Number.parseInt(value, 10) : value,
    }))
  }

  const handleEditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSelectedBook((prevBook) => {
      if (!prevBook) return prevBook
      return {
        ...prevBook,
        [name]: name === "publicationYear" ? Number.parseInt(value, 10) : value,
      }
    })
  }

  const handleAddBook = async () => {
    try {
      // Replace with your actual API call to add a book
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBook),
      })

      if (response.ok) {
        const addedBook: Book = await response.json()
        setBooks([...books, addedBook])
        handleClose()
      } else {
        console.error("Failed to add book:", response.status)
      }
    } catch (error) {
      console.error("Error adding book:", error)
    }
  }

  const handleUpdateBook = async () => {
    if (!selectedBook) return

    try {
      // Replace with your actual API call to update a book
      const response = await fetch(`/api/books/${selectedBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedBook),
      })

      if (response.ok) {
        // Update the book in the local state
        setBooks(books.map((book) => (book.id === selectedBook.id ? selectedBook : book)))
        handleEditClose()
      } else {
        console.error("Failed to update book:", response.status)
      }
    } catch (error) {
      console.error("Error updating book:", error)
    }
  }

  const handleDeleteBook = async (id: number) => {
    try {
      // Replace with your actual API call to delete a book
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the book from the local state
        setBooks(books.filter((book) => book.id !== id))
      } else {
        console.error("Failed to delete book:", response.status)
      }
    } catch (error) {
      console.error("Error deleting book:", error)
    }
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Add Book
      </Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell align="right">Author</TableCell>
              <TableCell align="right">Genre</TableCell>
              <TableCell align="right">Publication Year</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {book.title}
                </TableCell>
                <TableCell align="right">{book.author}</TableCell>
                <TableCell align="right">{book.genre}</TableCell>
                <TableCell align="right">{book.publicationYear}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" onClick={() => handleEditClickOpen(book)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteBook(book.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Book</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            value={newBook.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="author"
            label="Author"
            type="text"
            fullWidth
            variant="standard"
            value={newBook.author}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="genre"
            label="Genre"
            type="text"
            fullWidth
            variant="standard"
            value={newBook.genre}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="publicationYear"
            label="Publication Year"
            type="number"
            fullWidth
            variant="standard"
            value={newBook.publicationYear}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddBook}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            value={selectedBook?.title || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            name="author"
            label="Author"
            type="text"
            fullWidth
            variant="standard"
            value={selectedBook?.author || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            name="genre"
            label="Genre"
            type="text"
            fullWidth
            variant="standard"
            value={selectedBook?.genre || ""}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            name="publicationYear"
            label="Publication Year"
            type="number"
            fullWidth
            variant="standard"
            value={selectedBook?.publicationYear || ""}
            onChange={handleEditInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdateBook}>Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export { EnhancedBookManagement }
