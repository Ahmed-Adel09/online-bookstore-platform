import { BookService } from "./book-service"
import type { BookInsert } from "./types"

export const sampleBooks: BookInsert[] = [
  {
    title: "Dune",
    author: "Frank Herbert",
    description:
      'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    price: 18.99,
    category: "science fiction",
    format: "both",
    rating: 4.9,
    reviews: 3421,
    publisher: "Ace Books",
    publication_date: "1965-08-01",
    isbn: "978-0441172719",
    pages: 688,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "3.2 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 35,
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description:
      "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know. It's about how you behave.",
    price: 16.99,
    category: "business",
    format: "both",
    rating: 4.6,
    reviews: 1876,
    publisher: "Harriman House",
    publication_date: "2020-09-08",
    isbn: "978-0857197689",
    pages: 256,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.1 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 28,
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    description:
      "Reclusive Hollywood icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.",
    price: 13.99,
    category: "fiction",
    format: "both",
    rating: 4.7,
    reviews: 2987,
    publisher: "Atria Books",
    publication_date: "2017-06-13",
    isbn: "978-1501161933",
    pages: 400,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.8 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 42,
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    description:
      "In her memoir, a work of deep reflection and mesmerizing storytelling, Michelle Obama invites readers into her world.",
    price: 19.99,
    category: "memoir",
    format: "both",
    rating: 4.8,
    reviews: 4521,
    publisher: "Crown Publishing",
    publication_date: "2018-11-13",
    isbn: "978-1524763138",
    pages: 448,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "3.5 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 18,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description:
      "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole.",
    price: 12.99,
    category: "fantasy",
    format: "both",
    rating: 4.8,
    reviews: 5432,
    publisher: "Houghton Mifflin",
    publication_date: "1937-09-21",
    isbn: "978-0547928227",
    pages: 366,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.6 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 31,
  },
  {
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    description:
      "In a peaceful retirement village, four unlikely friends meet weekly in the Jigsaw Room to discuss unsolved crimes.",
    price: 15.99,
    category: "mystery",
    format: "both",
    rating: 4.4,
    reviews: 1654,
    publisher: "Viking",
    publication_date: "2020-09-03",
    isbn: "978-0241425442",
    pages: 368,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.9 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 24,
  },
  {
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    description:
      "From her place in the store, Klara, an artificial friend with outstanding observational qualities, watches carefully the behavior of those who come in to browse.",
    price: 17.99,
    category: "science fiction",
    format: "both",
    rating: 4.3,
    reviews: 987,
    publisher: "Knopf",
    publication_date: "2021-03-02",
    isbn: "978-0303943181",
    pages: 320,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.7 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 19,
  },
  {
    title: "The Vanishing Half",
    author: "Brit Bennett",
    description:
      "The Vignes twin sisters will always be identical. But after growing up together in a small, southern black community and running away at age sixteen, it's not just the shape of their daily lives that is different as adults.",
    price: 14.99,
    category: "fiction",
    format: "both",
    rating: 4.5,
    reviews: 2198,
    publisher: "Riverhead Books",
    publication_date: "2020-06-02",
    isbn: "978-0525536291",
    pages: 352,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.8 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 27,
  },
  {
    title: "Think Again",
    author: "Adam Grant",
    description:
      "Intelligence is usually seen as the ability to think and learn, but in a rapidly changing world, there's another set of cognitive skills that might matter more: the ability to rethink and unlearn.",
    price: 16.99,
    category: "business",
    format: "both",
    rating: 4.6,
    reviews: 1432,
    publisher: "Viking",
    publication_date: "2021-02-02",
    isbn: "978-1984878106",
    pages: 320,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.5 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 33,
  },
  {
    title: "The Guest List",
    author: "Lucy Foley",
    description:
      "On an island off the coast of Ireland, guests gather to celebrate two people joining their lives together as one.",
    price: 13.99,
    category: "thriller",
    format: "both",
    rating: 4.2,
    reviews: 1876,
    publisher: "William Morrow",
    publication_date: "2020-06-02",
    isbn: "978-0062868930",
    pages: 320,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.6 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 21,
  },
  {
    title: "Circe",
    author: "Madeline Miller",
    description:
      "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child—not powerful, like her father, nor viciously alluring like her mother.",
    price: 15.99,
    category: "fantasy",
    format: "both",
    rating: 4.7,
    reviews: 3210,
    publisher: "Little, Brown and Company",
    publication_date: "2018-04-10",
    isbn: "978-0316556347",
    pages: 416,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "3.1 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 26,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description:
      "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
    price: 10.99,
    category: "fiction",
    format: "both",
    rating: 4.6,
    reviews: 4987,
    publisher: "HarperOne",
    publication_date: "1988-01-01",
    isbn: "978-0062315007",
    pages: 208,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "1.8 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 45,
  },
  {
    title: "Normal People",
    author: "Sally Rooney",
    description:
      "At school Connell and Marianne pretend not to know each other. He's popular and well-adjusted, star of the school football team, while she is lonely, proud, and intensely private.",
    price: 14.99,
    category: "fiction",
    format: "both",
    rating: 4.4,
    reviews: 2654,
    publisher: "Hogarth",
    publication_date: "2018-08-28",
    isbn: "978-1984822178",
    pages: 288,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.3 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 29,
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    description:
      "The Power of Now shows you that every minute you spend worrying about the future or regretting the past is a minute lost, because really all you have to live in is the present.",
    price: 12.99,
    category: "self-help",
    format: "both",
    rating: 4.5,
    reviews: 3876,
    publisher: "New World Library",
    publication_date: "1997-01-01",
    isbn: "978-1577314806",
    pages: 236,
    cover_image: "/placeholder.svg?height=250&width=180",
    file_size: "2.0 MB",
    file_format: "PDF, EPUB",
    stock_quantity: 38,
  },
]

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Check if books already exist
    const existingBooks = await BookService.getBooks({ limit: 1 })
    if (existingBooks.length > 0) {
      console.log("Database already has books, skipping seeding")
      return { success: true, message: "Database already seeded", count: existingBooks.length }
    }

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const book of sampleBooks) {
      try {
        await BookService.addBook(book)
        successCount++
        console.log(`Added book: ${book.title}`)
      } catch (error) {
        errorCount++
        const errorMessage = `Failed to add "${book.title}": ${error instanceof Error ? error.message : "Unknown error"}`
        errors.push(errorMessage)
        console.error(errorMessage)
      }
    }

    console.log(`Seeding completed: ${successCount} books added, ${errorCount} errors`)

    return {
      success: errorCount === 0,
      message: `Successfully added ${successCount} books${errorCount > 0 ? ` with ${errorCount} errors` : ""}`,
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    console.error("Database seeding failed:", error)
    return {
      success: false,
      message: `Database seeding failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      count: 0,
    }
  }
}
