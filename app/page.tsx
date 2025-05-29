import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Chatbot } from "@/components/chatbot"
import { BookOpen, Star, TrendingUp, Users, Search, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const featuredBooks = [
    {
      id: 1,
      title: "Atomic Habits",
      author: "James Clear",
      price: "$18.99",
      rating: 4.8,
      image: "/images/atomic-habits.jpg",
      category: "Self-Help",
    },
    {
      id: 2,
      title: "The Midnight Library",
      author: "Matt Haig",
      price: "$16.99",
      rating: 4.6,
      image: "/images/midnight-library.jpg",
      category: "Fiction",
    },
    {
      id: 3,
      title: "Project Hail Mary",
      author: "Andy Weir",
      price: "$19.99",
      rating: 4.9,
      image: "/images/project-hail-mary.jpg",
      category: "Sci-Fi",
    },
    {
      id: 4,
      title: "Educated",
      author: "Tara Westover",
      price: "$17.99",
      rating: 4.7,
      image: "/images/educated.jpg",
      category: "Biography",
    },
  ]

  const categories = [
    { name: "Fiction", count: "2,450+ books", icon: BookOpen },
    { name: "Non-Fiction", count: "1,890+ books", icon: TrendingUp },
    { name: "Science", count: "980+ books", icon: Star },
    { name: "Biography", count: "750+ books", icon: Users },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BookHaven
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover your next favorite book from our vast collection of over 10,000 titles. From bestsellers to hidden
            gems, we have something for every reader.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/books">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Books
              </Button>
            </Link>
            <Link href="/best-sellers">
              <Button size="lg" variant="outline">
                <TrendingUp className="mr-2 h-5 w-5" />
                Best Sellers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Books</h2>
            <p className="text-gray-600">Handpicked selections from our curated collection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <Card
                key={book.id}
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Image
                      src={book.image || "/placeholder.svg"}
                      alt={book.title}
                      width={200}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-600">{book.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{book.rating}</span>
                    </div>
                    <span className="font-bold text-blue-600">{book.price}</span>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600">Explore our diverse collection across different genres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                    <category.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">{category.name}</CardTitle>
                  <p className="text-gray-600">{category.count}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">10,000+</h3>
              <p className="text-blue-100">Books Available</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">50,000+</h3>
              <p className="text-blue-100">Happy Readers</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">500+</h3>
              <p className="text-blue-100">New Arrivals Monthly</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">24/7</h3>
              <p className="text-blue-100">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Reading Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of book lovers who have discovered their next favorite read with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started Today
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Original Chatbot */}
      <Chatbot />
    </main>
  )
}
