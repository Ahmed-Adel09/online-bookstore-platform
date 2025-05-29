"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, BookOpen, FileText, Smartphone, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DigitalBook {
  book_id: string
  book_title: string
  format: string
  download_url: string
  expires_at: string
  file_size?: string
  downloaded_at?: string
}

interface DigitalLibraryProps {
  userId: string
  recentPurchases?: DigitalBook[]
}

export function DigitalLibrary({ userId, recentPurchases = [] }: DigitalLibraryProps) {
  const { toast } = useToast()
  const [digitalBooks, setDigitalBooks] = useState<DigitalBook[]>(recentPurchases)
  const [downloadingBooks, setDownloadingBooks] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDigitalLibrary()
  }, [userId])

  const loadDigitalLibrary = async () => {
    try {
      // In a real app, this would fetch from the backend
      const storedBooks = localStorage.getItem(`digitalLibrary_${userId}`)
      if (storedBooks) {
        const books = JSON.parse(storedBooks)
        setDigitalBooks([...recentPurchases, ...books])
      } else {
        setDigitalBooks(recentPurchases)
      }
    } catch (error) {
      console.error("Error loading digital library:", error)
    }
  }

  const downloadBook = async (book: DigitalBook) => {
    const downloadKey = `${book.book_id}-${book.format}`

    if (downloadingBooks.has(downloadKey)) return

    setDownloadingBooks((prev) => new Set(prev).add(downloadKey))

    try {
      // Check if download link is still valid
      const expiryDate = new Date(book.expires_at)
      if (expiryDate < new Date()) {
        toast({
          title: "Download Expired",
          description: "This download link has expired. Please contact support.",
          variant: "destructive",
        })
        return
      }

      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, this would download the actual file
      const blob = new Blob([`Mock ${book.format.toUpperCase()} content for ${book.book_title}`], {
        type: getContentType(book.format),
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${book.book_title}.${book.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update download timestamp
      const updatedBook = { ...book, downloaded_at: new Date().toISOString() }
      const updatedBooks = digitalBooks.map((b) =>
        b.book_id === book.book_id && b.format === book.format ? updatedBook : b,
      )
      setDigitalBooks(updatedBooks)

      // Save to localStorage
      const booksToStore = updatedBooks.filter((b) => !recentPurchases.includes(b))
      localStorage.setItem(`digitalLibrary_${userId}`, JSON.stringify(booksToStore))

      toast({
        title: "Download Complete",
        description: `${book.book_title} (${book.format.toUpperCase()}) has been downloaded`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingBooks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(downloadKey)
        return newSet
      })
    }
  }

  const getContentType = (format: string) => {
    switch (format.toLowerCase()) {
      case "epub":
        return "application/epub+zip"
      case "pdf":
        return "application/pdf"
      case "mobi":
        return "application/x-mobipocket-ebook"
      default:
        return "application/octet-stream"
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "epub":
        return <BookOpen className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "mobi":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format.toLowerCase()) {
      case "epub":
        return "Compatible with most e-readers and apps"
      case "pdf":
        return "Universal format, preserves layout"
      case "mobi":
        return "Optimized for Kindle devices"
      default:
        return "Digital book format"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const groupedBooks = digitalBooks.reduce(
    (acc, book) => {
      if (!acc[book.book_id]) {
        acc[book.book_id] = {
          title: book.book_title,
          formats: [],
        }
      }
      acc[book.book_id].formats.push(book)
      return acc
    },
    {} as Record<string, { title: string; formats: DigitalBook[] }>,
  )

  if (digitalBooks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Digital Library
          </CardTitle>
          <CardDescription>Your purchased e-books will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No E-books Yet</h3>
            <p className="text-muted-foreground mb-4">Purchase e-books to build your digital library</p>
            <Button onClick={() => (window.location.href = "/books")}>Browse E-books</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Digital Library
        </CardTitle>
        <CardDescription>Download and manage your purchased e-books</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Books ({Object.keys(groupedBooks).length})</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="formats">By Format</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {Object.entries(groupedBooks).map(([bookId, bookData]) => (
              <Card key={bookId}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{bookData.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {bookData.formats.length} format{bookData.formats.length !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bookData.formats.map((book, index) => {
                      const downloadKey = `${book.book_id}-${book.format}`
                      const isDownloading = downloadingBooks.has(downloadKey)
                      const expired = isExpired(book.expires_at)

                      return (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getFormatIcon(book.format)}
                              <Badge variant="outline" className="uppercase">
                                {book.format}
                              </Badge>
                            </div>
                            {book.downloaded_at && (
                              <Badge variant="secondary" className="text-xs">
                                Downloaded
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mb-3">{getFormatDescription(book.format)}</p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Expires: {formatDate(book.expires_at)}</span>
                            </div>

                            {book.downloaded_at && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Downloaded: {formatDate(book.downloaded_at)}</span>
                              </div>
                            )}
                          </div>

                          <Button
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => downloadBook(book)}
                            disabled={isDownloading || expired}
                            variant={expired ? "outline" : "default"}
                          >
                            {isDownloading ? (
                              "Downloading..."
                            ) : expired ? (
                              "Expired"
                            ) : (
                              <>
                                <Download className="mr-2 h-3 w-3" />
                                Download {book.format.toUpperCase()}
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4 mt-6">
            {recentPurchases.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 Recent Purchases</h3>
                  <p className="text-sm text-green-700">Your newly purchased e-books are ready for download!</p>
                </div>

                {recentPurchases.map((book, index) => {
                  const downloadKey = `${book.book_id}-${book.format}`
                  const isDownloading = downloadingBooks.has(downloadKey)

                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFormatIcon(book.format)}
                            <div>
                              <h3 className="font-semibold">{book.book_title}</h3>
                              <p className="text-sm text-muted-foreground">{book.format.toUpperCase()} format</p>
                            </div>
                          </div>
                          <Button onClick={() => downloadBook(book)} disabled={isDownloading} className="ml-4">
                            {isDownloading ? (
                              "Downloading..."
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent purchases</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="formats" className="space-y-4 mt-6">
            {["epub", "pdf", "mobi"].map((format) => {
              const formatBooks = digitalBooks.filter((book) => book.format === format)

              if (formatBooks.length === 0) return null

              return (
                <Card key={format}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getFormatIcon(format)}
                      {format.toUpperCase()} Books ({formatBooks.length})
                    </CardTitle>
                    <CardDescription>{getFormatDescription(format)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formatBooks.map((book, index) => {
                        const downloadKey = `${book.book_id}-${book.format}`
                        const isDownloading = downloadingBooks.has(downloadKey)
                        const expired = isExpired(book.expires_at)

                        return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{book.book_title}</h4>
                              <p className="text-xs text-muted-foreground">Expires: {formatDate(book.expires_at)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => downloadBook(book)}
                              disabled={isDownloading || expired}
                              variant={expired ? "outline" : "default"}
                            >
                              {isDownloading ? "..." : expired ? "Expired" : "Download"}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
