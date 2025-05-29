"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ShoppingCart, Star, Bookmark, BookmarkCheck, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import { allBooks } from "@/lib/data"
import { BookPreviewModal } from "@/components/book-preview-modal"
import { FormatSelectionModal } from "@/components/format-selection-modal"

export default function BookPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [selectedFormat, setSelectedFormat] = useState<"physical" | "ebook">("physical")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false)

  // Get book data
  const book = allBooks.find((b) => b.id === params.id)

  if (!book) {
    return <div>Book not found</div>
  }

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

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: `${book.title} has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`,
    })
  }

  const openPreview = () => setIsPreviewOpen(true)
  const closePreview = () => setIsPreviewOpen(false)

  const handleFormatConfirm = (format: "physical" | "ebook") => {
    addToCart(book, 1, format)
    toast({
      title: "Added to cart",
      description: `${book.title} (${format === "physical" ? "Physical Book" : "eBook"}) has been added to your cart.`,
    })
  }

  // Determine available formats
  const hasPhysical = book.format === "physical" || book.format === "both"
  const hasEbook = book.format === "ebook" || book.format === "both"

  // Default to ebook if physical is not available
  if (!hasPhysical && hasEbook && selectedFormat === "physical") {
    setSelectedFormat("ebook")
  }

  return (
    <div className="container py-8">
      <Link href="/books" className="inline-flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Books
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-[3/4] md:aspect-auto md:h-[500px]">
          <Image
            src={book.coverImage || "/placeholder.svg?height=600&width=400"}
            alt={book.title}
            fill
            className="object-contain rounded-lg"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-xl text-muted-foreground">by {book.author}</p>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(book.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">({book.reviews} reviews)</span>
            </div>
          </div>

          <p className="text-lg">{book.description}</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Publisher</span>
              <span>{book.publisher}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Publication Date</span>
              <span>{book.publicationDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ISBN</span>
              <span>{book.isbn}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pages</span>
              <span>{book.pages}</span>
            </div>

            {/* Format selection */}
            {book.format === "both" && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Format</h3>
                <RadioGroup
                  value={selectedFormat}
                  onValueChange={(value) => setSelectedFormat(value as "physical" | "ebook")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="physical" id="physical" />
                    <Label htmlFor="physical">Physical Book</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ebook" id="ebook" />
                    <Label htmlFor="ebook">eBook</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* eBook specific details */}
            {selectedFormat === "ebook" && hasEbook && (
              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-medium mb-2">eBook Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">File Size</span>
                  <span>{book.fileSize || "2.4 MB"}</span>
                  <span className="text-muted-foreground">Format</span>
                  <span>{book.fileFormat || "EPUB, PDF"}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-3xl font-bold">
                ${selectedFormat === "ebook" && hasEbook ? (book.price * 0.7).toFixed(2) : book.price.toFixed(2)}
                {selectedFormat === "ebook" && hasEbook && (
                  <span className="text-sm text-muted-foreground ml-2 line-through">${book.price.toFixed(2)}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleBookmark}
                  title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                >
                  {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </Button>

                <Button variant="outline" onClick={openPreview}>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Preview
                </Button>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {book.format === "both" ? "Choose Format & Add to Cart" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-4">
          <div className="prose dark:prose-invert max-w-none">
            <p>{book.description}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="details" className="py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Book Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span>{book.title}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Author</span>
                  <span>{book.author}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Publisher</span>
                  <span>{book.publisher}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Publication Date</span>
                  <span>{book.publicationDate}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span>English</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Product Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">ISBN</span>
                  <span>{book.isbn}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Pages</span>
                  <span>{book.pages}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span>6 x 0.9 x 9 inches</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Weight</span>
                  <span>1.2 pounds</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span>{book.format === "both" ? "Physical & eBook" : book.format}</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-4">
          <div className="space-y-6">
            {book.reviewsData ? (
              book.reviewsData.map((review, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{review.title}</h4>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">By {review.author}</p>
                  <p>{review.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reviews yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <BookPreviewModal book={book} isOpen={isPreviewOpen} onClose={closePreview} />
      <FormatSelectionModal
        book={book}
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        onConfirm={handleFormatConfirm}
      />
    </div>
  )
}
