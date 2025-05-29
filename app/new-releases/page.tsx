import { BookCard } from "@/components/book-card"
import { allBooks } from "@/lib/data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

// Sort books by publication date (newest first)
const newReleases = [...allBooks]
  .sort((a, b) => {
    const dateA = new Date(a.publicationDate)
    const dateB = new Date(b.publicationDate)
    return dateB.getTime() - dateA.getTime()
  })
  .slice(0, 8) // Get the 8 newest books

export default function NewReleasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="flex items-center text-blue-600 hover:underline mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Home
        </Link>
        <h1 className="text-3xl font-bold">New Releases</h1>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-2">Fresh Off the Press</h2>
        <p className="mb-4">
          Discover the latest additions to our bookstore. Updated weekly with the hottest new titles.
        </p>
        <Button variant="secondary">Subscribe to Updates</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {newReleases.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-500 mb-4">Looking for more new releases?</p>
        <Button variant="outline">Load More Books</Button>
      </div>
    </div>
  )
}
