"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const CHATBOT_RESPONSES = {
  greeting: [
    "Hello! I'm BookBot, your virtual assistant for BookHaven. How can I help you today?",
    "Hi there! Welcome to BookHaven. I'm here to help you with any questions about our library.",
    "Greetings! I'm BookBot. Feel free to ask me anything about BookHaven's features and services.",
  ],
  conversational: {
    howAreYou: [
      "I'm doing great, thank you for asking! I'm here and ready to help you with anything about BookHaven. How are you doing today?",
      "I'm fantastic! Always excited to help book lovers like yourself. What can I assist you with today?",
      "I'm doing wonderful! I love helping people discover amazing books and navigate BookHaven. How can I help you?",
    ],
    name: [
      "I'm BookBot! I'm your friendly virtual assistant here at BookHaven. I'm designed to help you with all things related to our digital library.",
      "My name is BookBot! I'm an AI assistant created specifically to help BookHaven users. Nice to meet you!",
      "I go by BookBot! I'm your personal guide to everything BookHaven has to offer. What would you like to know?",
    ],
    thanks: [
      "You're very welcome! I'm always happy to help. Is there anything else you'd like to know about BookHaven?",
      "My pleasure! That's what I'm here for. Feel free to ask me anything else about our library and services.",
      "You're so welcome! I love helping our BookHaven community. Don't hesitate to reach out if you need anything else!",
    ],
    goodbye: [
      "Goodbye! Thanks for chatting with me. Happy reading, and don't hesitate to come back if you need any help!",
      "See you later! Enjoy exploring BookHaven, and remember I'm always here if you need assistance.",
      "Take care! I hope you find some amazing books to read. Feel free to chat with me anytime!",
    ],
  },
  features: [
    "BookHaven offers a comprehensive digital library with physical and ebook formats, personalized recommendations, user reviews, premium subscriptions, and community features like book clubs and discussions.",
    "Our main features include: book browsing and search, personalized recommendations, user reviews and ratings, premium membership benefits, order tracking, and an active community forum.",
  ],
  api: [
    "Our API provides endpoints for book management, user authentication, order processing, and recommendation systems. You can access book data, manage user accounts, and integrate with our recommendation engine.",
    "The BookHaven API includes RESTful endpoints for books, users, orders, and recommendations. Authentication is handled through JWT tokens with role-based access control.",
  ],
  components: [
    "BookHaven uses modern React components including book cards, search filters, user dashboards, shopping cart, order tracking, and community discussion boards.",
    "Our component library includes reusable UI elements like BookCard, SearchFilters, UserProfile, ShoppingCart, OrderTracker, and CommunityForum components.",
  ],
  documentation: [
    "You can find our documentation in the developer section, which includes API references, component guides, integration examples, and best practices for using BookHaven's features.",
    "Our documentation covers API endpoints, component usage, authentication flows, and integration guides. Check the /docs section for detailed information.",
  ],
  premium: [
    "Premium membership includes unlimited ebook downloads, exclusive content access, priority customer support, advanced recommendation features, and early access to new releases.",
    "Premium benefits: unlimited ebook access, exclusive titles, priority support, enhanced recommendations, early releases, and special community features.",
  ],
  orders: [
    "You can track your orders in the 'My Orders' section of your profile. We provide real-time updates on order status, shipping information, and delivery tracking.",
    "Order management includes order history, tracking information, refund requests, and digital library access for ebook purchases.",
  ],
  community: [
    "Our community features include book discussions, reading groups, author Q&As, book recommendations from other readers, and seasonal reading challenges.",
    "Join our community to participate in book clubs, share reviews, discuss your favorite reads, and connect with fellow book lovers.",
  ],
  support: [
    "For additional support, you can contact our customer service team through the contact form, email support@bookhaven.com, or use the live chat during business hours.",
    "Need more help? Contact us at support@bookhaven.com, use our contact form, or speak with our customer service team during business hours (9 AM - 6 PM EST).",
  ],
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm BookBot, your virtual assistant for BookHaven. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    // Conversational responses
    if (message.includes("how are you") || message.includes("how're you") || message.includes("how do you do")) {
      return CHATBOT_RESPONSES.conversational.howAreYou[
        Math.floor(Math.random() * CHATBOT_RESPONSES.conversational.howAreYou.length)
      ]
    }

    if (
      message.includes("what's your name") ||
      message.includes("what is your name") ||
      message.includes("who are you")
    ) {
      return CHATBOT_RESPONSES.conversational.name[
        Math.floor(Math.random() * CHATBOT_RESPONSES.conversational.name.length)
      ]
    }

    if (message.includes("thank") || message.includes("thanks") || message.includes("appreciate")) {
      return CHATBOT_RESPONSES.conversational.thanks[
        Math.floor(Math.random() * CHATBOT_RESPONSES.conversational.thanks.length)
      ]
    }

    if (
      message.includes("bye") ||
      message.includes("goodbye") ||
      message.includes("see you") ||
      message.includes("farewell")
    ) {
      return CHATBOT_RESPONSES.conversational.goodbye[
        Math.floor(Math.random() * CHATBOT_RESPONSES.conversational.goodbye.length)
      ]
    }

    // Greeting patterns
    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return CHATBOT_RESPONSES.greeting[Math.floor(Math.random() * CHATBOT_RESPONSES.greeting.length)]
    }

    // Feature inquiries
    if (message.includes("feature") || message.includes("what can") || message.includes("what do")) {
      return CHATBOT_RESPONSES.features[Math.floor(Math.random() * CHATBOT_RESPONSES.features.length)]
    }

    // API questions
    if (message.includes("api") || message.includes("endpoint") || message.includes("integration")) {
      return CHATBOT_RESPONSES.api[Math.floor(Math.random() * CHATBOT_RESPONSES.api.length)]
    }

    // Component questions
    if (message.includes("component") || message.includes("ui") || message.includes("interface")) {
      return CHATBOT_RESPONSES.components[Math.floor(Math.random() * CHATBOT_RESPONSES.components.length)]
    }

    // Documentation
    if (message.includes("documentation") || message.includes("docs") || message.includes("guide")) {
      return CHATBOT_RESPONSES.documentation[Math.floor(Math.random() * CHATBOT_RESPONSES.documentation.length)]
    }

    // Premium questions
    if (message.includes("premium") || message.includes("subscription") || message.includes("membership")) {
      return CHATBOT_RESPONSES.premium[Math.floor(Math.random() * CHATBOT_RESPONSES.premium.length)]
    }

    // Order questions
    if (message.includes("order") || message.includes("track") || message.includes("shipping")) {
      return CHATBOT_RESPONSES.orders[Math.floor(Math.random() * CHATBOT_RESPONSES.orders.length)]
    }

    // Community questions
    if (message.includes("community") || message.includes("discussion") || message.includes("book club")) {
      return CHATBOT_RESPONSES.community[Math.floor(Math.random() * CHATBOT_RESPONSES.community.length)]
    }

    // Support questions
    if (message.includes("support") || message.includes("help") || message.includes("contact")) {
      return CHATBOT_RESPONSES.support[Math.floor(Math.random() * CHATBOT_RESPONSES.support.length)]
    }

    // Default response
    return "I'd be happy to help! You can ask me about BookHaven's features, API documentation, components, premium membership, orders, community features, or general support. What would you like to know more about?"
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(
      () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateResponse(inputValue),
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-200 ${isMinimized ? "h-16" : "h-96"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">BookBot Assistant</CardTitle>
            <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
              Online
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-white hover:bg-blue-500"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 text-white hover:bg-blue-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === "bot" && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.sender === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about BookHaven..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
