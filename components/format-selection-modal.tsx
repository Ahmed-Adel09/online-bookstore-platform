"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Tablet, Truck, Download, Clock, CreditCard } from "lucide-react"
import type { Book } from "@/lib/types"

interface FormatSelectionModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
  onConfirm: (format: "physical" | "ebook", quantity?: number) => void
}

export function FormatSelectionModal({ book, isOpen, onClose, onConfirm }: FormatSelectionModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"physical" | "ebook">("physical")
  const [quantity, setQuantity] = useState(1)

  const physicalPrice = book.price
  const ebookPrice = book.price * 0.7

  const handleConfirm = () => {
    onConfirm(selectedFormat, quantity)
    onClose()
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + change))
    setQuantity(newQuantity)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Your Format</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Physical Book Option */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedFormat === "physical" ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" : ""
            }`}
            onClick={() => setSelectedFormat("physical")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Physical Book
                <Badge variant="secondary" className="ml-auto">
                  ${physicalPrice.toFixed(2)}
                </Badge>
              </CardTitle>
              <CardDescription>Traditional paperback or hardcover book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Ships in 2-5 business days</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Cash on Delivery available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-purple-600" />
                <span>Physical ownership</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Perfect for collectors and those who love the feel of real books
              </div>
            </CardContent>
          </Card>

          {/* eBook Option */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedFormat === "ebook" ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950" : ""
            }`}
            onClick={() => setSelectedFormat("ebook")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tablet className="h-5 w-5 text-green-600" />
                eBook
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="destructive" className="line-through text-xs">
                    ${physicalPrice.toFixed(2)}
                  </Badge>
                  <Badge variant="secondary">${ebookPrice.toFixed(2)}</Badge>
                </div>
              </CardTitle>
              <CardDescription>Digital version for all your devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-green-600" />
                <span>Instant download</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Available 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tablet className="h-4 w-4 text-purple-600" />
                <span>Works on all devices</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Eco-friendly option with search, bookmarks, and adjustable text size
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                30% OFF - Save ${(physicalPrice - ebookPrice).toFixed(2)}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quantity Selection */}
        <div className="flex items-center justify-center gap-4 py-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
              -
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button variant="outline" size="sm" onClick={() => handleQuantityChange(1)} disabled={quantity >= 10}>
              +
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedFormat === "ebook" ? (
              <span>⚠️ Note: Cash on Delivery not available for eBooks</span>
            ) : (
              <span>💡 Tip: Choose eBook for instant access and save 30%</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Add {quantity} {selectedFormat === "physical" ? "Physical Book" : "eBook"}
              {quantity > 1 ? "s" : ""} to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FormatSelectionModal
