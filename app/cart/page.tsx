"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ChevronLeft, ShoppingBag, BookOpen, Tablet } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart()
  const [promoCode, setPromoCode] = useState("")

  const handleQuantityChange = (bookId: string, format: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(bookId, format, newQuantity)
    }
  }

  const subtotal = getCartTotal()
  const shipping = subtotal > 35 ? 0 : 4.99
  const total = subtotal + shipping

  // Calculate if there are any physical books in the cart
  const hasPhysicalBooks = cart.some((item) => item.format === "physical")

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Product</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => {
                  // Calculate price based on format
                  const price = item.format === "ebook" ? item.book.price * 0.7 : item.book.price

                  return (
                    <TableRow key={`${item.book.id}-${item.format}`}>
                      <TableCell>
                        <div className="w-16 h-20 relative">
                          <img
                            src={item.book.coverImage || "/placeholder.svg"}
                            alt={item.book.title}
                            className="rounded-md object-cover w-full h-full"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/books/${item.book.id}`} className="font-medium hover:underline">
                          {item.book.title}
                        </Link>
                        <p className="text-sm text-gray-500">{item.book.author}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {item.format === "physical" ? (
                            <>
                              <BookOpen className="h-3 w-3" /> Physical
                            </>
                          ) : (
                            <>
                              <Tablet className="h-3 w-3" /> eBook
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>${price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.book.id, item.format, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.book.id, item.format, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${(price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.book.id, item.format)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="flex justify-between mt-6">
              <Link href="/books">
                <Button variant="outline" className="flex items-center">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>

          <div>
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {hasPhysicalBooks && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 border-gray-200">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <Input placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full">Proceed to Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any books to your cart yet.</p>
          <Link href="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
