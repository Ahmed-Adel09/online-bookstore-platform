"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, ShoppingCart, Bookmark, BookmarkCheck } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { BookPreviewModal } from "@/components/book-preview-modal"
import type { Book } from "@/lib/types"
import { FormatSelectionModal } from "@/components/format-selection-modal"

interface BookCardProps {
  book: Book
  showAddToCart?: boolean
  showBookmark?: boolean
  isBookmarked?: boolean
  onBookmarkToggle?: (book: Book) => void
}

export function BookCard({
  book,
  showAddToCart = true,
  showBookmark = true,
  isBookmarked = false,
  onBookmarkToggle,
}: BookCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false)

  const handleAddToCart = () => {
    // Check if book has multiple formats
    if (book.format === "both") {
      setIsFormatModalOpen(true)
    } else {
      // Single format - add directly
      const format = book.format === "ebook" ? "ebook" : "physical"
      addToCart(book, 1, format)
      toast({
        title: "Added to cart",
        description: `${book.title} (${format === "physical" ? "Physical Book" : "eBook"}) has been added to your cart.`,
      })
    }
  }

  const handleBookmarkToggle = () => {
    const newState = !bookmarked
    setBookmarked(newState)

    if (onBookmarkToggle) {
      onBookmarkToggle(book)
    }

    toast({
      title: newState ? "Added to bookmarks" : "Removed from bookmarks",
      description: `${book.title} has been ${newState ? "added to" : "removed from"} your bookmarks.`,
    })
  }

  const handleFormatConfirm = (format: "physical" | "ebook", quantity = 1) => {
    addToCart(book, quantity, format)
    toast({
      title: "Added to cart",
      description: `${quantity} ${book.title} (${format === "physical" ? "Physical Book" : "eBook"})${quantity > 1 ? "s" : ""} added to your cart.`,
    })
  }

  const openPreview = () => setIsPreviewOpen(true)
  const closePreview = () => setIsPreviewOpen(false)

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Link href={`/books/${book.id}`}>
            <Image
              src={
                book.coverImage && book.coverImage.startsWith("http")
                  ? book.coverImage
                  : book.coverImage || "/placeholder.svg?height=400&width=300"
              }
              alt={book.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=300"
              }}
            />
          </Link>
          {book.format === "ebook" && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              eBook
            </Badge>
          )}
          {book.format === "both" && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              eBook & Physical
            </Badge>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <div className="space-y-1">
            <Link href={`/books/${book.id}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-1">{book.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            <div className="flex items-center justify-between">
              <p className="font-medium">${book.price.toFixed(2)}</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{book.rating}</span>
                <span className="text-xs text-muted-foreground">({book.reviews})</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full" onClick={openPreview}>
            <BookOpen className="mr-2 h-4 w-4" />
            Preview
          </Button>

          {showAddToCart && (
            <Button size="sm" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}

          {showBookmark && (
            <Button variant="ghost" size="sm" className="w-full" onClick={handleBookmarkToggle}>
              {bookmarked ? (
                <>
                  <BookmarkCheck className="mr-2 h-4 w-4" />
                  Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Add to Bookmark
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      <BookPreviewModal book={book} isOpen={isPreviewOpen} onClose={closePreview} />
      <FormatSelectionModal
        book={book}
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        onConfirm={handleFormatConfirm}
      />
    </>
  )
}
