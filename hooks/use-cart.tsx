"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Book } from "@/lib/types"

type CartItem = {
  book: Book
  quantity: number
  format: "physical" | "ebook"
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (book: Book, quantity: number, format: "physical" | "ebook") => void
  removeFromCart: (bookId: string, format: string) => void
  updateQuantity: (bookId: string, format: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("bookstore-cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bookstore-cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (book: Book, quantity: number, format: "physical" | "ebook") => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.book.id === book.id && item.format === format)

      if (existingItem) {
        return prevCart.map((item) =>
          item.book.id === book.id && item.format === format ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        return [...prevCart, { book, quantity, format }]
      }
    })
  }

  const removeFromCart = (bookId: string, format: string) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.book.id === bookId && item.format === format)))
  }

  const updateQuantity = (bookId: string, format: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId, format)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.book.id === bookId && item.format === format ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // Apply discount for ebooks
      const price = item.format === "ebook" ? item.book.price * 0.7 : item.book.price
      return total + price * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
