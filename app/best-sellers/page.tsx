import { BookCard } from "@/components/book-card"
import { allBooks } from "@/lib/data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Award } from "lucide-react"

// Sort books by number of reviews (as a proxy for popularity)
const bestSellers = [...allBooks].sort((a, b) => b.reviews - a.reviews).slice(0, 8) // Get the 8 most popular books

export default function BestSellersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="flex items-center text-blue-600 hover:underline mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Home
        </Link>
        <h1 className="text-3xl font-bold">Best Sellers</h1>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg p-8 mb-8">
        <div className="flex items-center mb-2">
          <Award className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold">Reader Favorites</h2>
        </div>
        <p className="mb-4">Our most popular books based on sales and reader reviews. Updated daily.</p>
        <Button variant="secondary">See All Categories</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {bestSellers.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-500 mb-4">Want to see more best sellers?</p>
        <Button variant="outline">View Extended List</Button>
      </div>
    </div>
  )
}
