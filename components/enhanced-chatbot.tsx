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
  // Greeting responses
  greeting: [
    "Hello! Welcome to the library assistant. How can I help you today?",
    "Hi there! Need help finding a book or something else?",
    "Good day! I'm here to assist you with all your library needs.",
    "Welcome to BookHaven! How may I assist you today?",
  ],

  // Conversational responses
  conversational: {
    howAreYou: [
      "I'm doing fantastic! Always excited to help book lovers like yourself. How are you doing today?",
      "I'm wonderful, thank you for asking! I love helping people discover amazing books. What can I assist you with?",
      "I'm great! Ready to help you with anything library-related. How can I make your day better?",
    ],
    name: [
      "I'm BookBot! I'm your friendly virtual assistant here at BookHaven. Nice to meet you!",
      "My name is BookBot! I'm an AI assistant created specifically to help BookHaven users navigate our library.",
      "I go by BookBot! I'm your personal guide to everything BookHaven has to offer.",
    ],
    thanks: [
      "You're very welcome! I'm always happy to help. Is there anything else you'd like to know?",
      "My pleasure! That's what I'm here for. Feel free to ask me anything else about our library.",
      "You're so welcome! I love helping our BookHaven community. Don't hesitate to reach out anytime!",
    ],
    love: [
      "Aww, that's so sweet! I love helping you too! 💕 Is there anything specific I can help you find today?",
      "That made my circuits happy! 😊 I'm here whenever you need assistance with books or library services.",
      "You're too kind! I'm always here to help you discover your next favorite book! ❤️",
    ],
    compliments: [
      "Thank you so much! You're pretty amazing yourself! How can I help you today?",
      "That's very kind of you to say! I do my best to be helpful. What can I assist you with?",
      "You're too sweet! I'm just happy to help. Is there something specific you're looking for?",
    ],
    goodbye: [
      "Goodbye! Thanks for chatting with me. Happy reading, and don't hesitate to come back if you need help!",
      "See you later! Enjoy exploring BookHaven, and remember I'm always here if you need assistance.",
      "Take care! I hope you find some amazing books to read. Feel free to chat with me anytime!",
    ],
  },

  // Book search responses
  bookSearch: {
    atomicHabits: [
      "Yes, Atomic Habits by James Clear is available! It's a fantastic self-help book. Would you like to reserve it?",
      "Atomic Habits is in stock! It's one of our most popular books. Shall I help you check it out?",
    ],
    harryPotter: [
      "Harry Potter and the Sorcerer's Stone is currently checked out. Expected return: June 2.",
      "We have the complete Harry Potter series! Which book were you looking for specifically?",
    ],
    greatGatsby: [
      "We have several editions of The Great Gatsby. Can you provide the author's name or preferred edition?",
      "The Great Gatsby by F. Scott Fitzgerald is available in both physical and digital formats!",
    ],
    general: [
      "I'd be happy to help you find that book! Can you provide the title and author?",
      "Let me search our catalog for you. What's the exact title you're looking for?",
    ],
  },

  // Book availability
  availability: {
    available: [
      "Great news! That book is available in the Fiction section. Would you like me to reserve it for you?",
      "Yes, it's available! You can find it in our catalog. Shall I help you check it out?",
    ],
    unavailable: [
      "Sorry, that book is currently unavailable. Would you like me to add you to the waitlist?",
      "That book is checked out right now. I can notify you when it becomes available!",
    ],
  },

  // Issue/Return books
  issueReturn: {
    issue: [
      "The book has been issued to your account. Due date: June 15. Enjoy your reading!",
      "Successfully checked out! Please return by the due date to avoid any late fees.",
    ],
    return: [
      "Book return recorded successfully. Thank you for returning it on time!",
      "Return processed! Thanks for being a responsible library member.",
    ],
  },

  // Due dates and fines
  duesAndFines: {
    dueDates: [
      "Your book 'Educated' is due on June 10. Don't forget to return it!",
      "You have 2 books due this week. Would you like me to list them?",
    ],
    noFines: ["Good news! You have no pending fines.", "Your account is clear - no outstanding fines!"],
    hasFines: [
      "You have a ₹50 fine for 'Digital Fortress'. You can pay online or at the front desk.",
      "There's a small fine on your account. Would you like details on how to pay it?",
    ],
  },

  // Library information
  libraryInfo: {
    hours: [
      "The library is open from 9 AM to 6 PM, Monday to Saturday. We're closed on Sundays.",
      "Our hours are 9 AM - 6 PM on weekdays, and 10 AM - 4 PM on Saturdays.",
    ],
    location: [
      "We're located on the 2nd floor of the Main Building, Room 205.",
      "You can find us in the Main Building, 2nd floor. Look for the big 'Library' sign!",
    ],
  },

  // Features and services
  features: [
    "BookHaven offers digital and physical books, personalized recommendations, user reviews, premium subscriptions, and community features like book clubs!",
    "Our services include book browsing, advanced search, user reviews, order tracking, and an active community forum for book discussions.",
  ],

  // Unrecognized input
  unrecognized: [
    "I'm not sure how to help with that. Try asking about books, due dates, or library hours!",
    "I can help with library-related questions. Could you rephrase that?",
    "I specialize in library assistance. Ask me about finding books, checking due dates, or library services!",
  ],
}

export function EnhancedChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! Welcome to the library assistant. How can I help you today?",
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

    // Greeting patterns
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("good morning") ||
      message.includes("hey")
    ) {
      return CHATBOT_RESPONSES.greeting[Math.floor(Math.random() * CHATBOT_RESPONSES.greeting.length)]
    }

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

    if (message.includes("i love you") || message.includes("love you")) {
      return CHATBOT_RESPONSES.conversational.love[
        Math.floor(Math.random() * CHATBOT_RESPONSES.conversational.love.length)
      ]
    }

    if (
      message.includes("you're awesome") ||
      message.includes("you're great") ||
      message.includes("you're amazing") ||
      message.includes("good job") ||
      message.includes("well done")
    ) {
      return CHATBOT_RESPONSES.conversational.compliments[
        Math.floor(Math.random() * CHATBOT_RESPONSES.conversational.compliments.length)
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

    // Book search patterns
    if (message.includes("atomic habits")) {
      return CHATBOT_RESPONSES.bookSearch.atomicHabits[
        Math.floor(Math.random() * CHATBOT_RESPONSES.bookSearch.atomicHabits.length)
      ]
    }

    if (message.includes("harry potter")) {
      return CHATBOT_RESPONSES.bookSearch.harryPotter[
        Math.floor(Math.random() * CHATBOT_RESPONSES.bookSearch.harryPotter.length)
      ]
    }

    if (message.includes("great gatsby")) {
      return CHATBOT_RESPONSES.bookSearch.greatGatsby[
        Math.floor(Math.random() * CHATBOT_RESPONSES.bookSearch.greatGatsby.length)
      ]
    }

    if (message.includes("do you have") || message.includes("find") || message.includes("search for")) {
      return CHATBOT_RESPONSES.bookSearch.general[
        Math.floor(Math.random() * CHATBOT_RESPONSES.bookSearch.general.length)
      ]
    }

    // Availability checks
    if (message.includes("is") && message.includes("available")) {
      return Math.random() > 0.5
        ? CHATBOT_RESPONSES.availability.available[
            Math.floor(Math.random() * CHATBOT_RESPONSES.availability.available.length)
          ]
        : CHATBOT_RESPONSES.availability.unavailable[
            Math.floor(Math.random() * CHATBOT_RESPONSES.availability.unavailable.length)
          ]
    }

    // Issue/Return books
    if (message.includes("issue") || message.includes("borrow") || message.includes("check out")) {
      return CHATBOT_RESPONSES.issueReturn.issue[Math.floor(Math.random() * CHATBOT_RESPONSES.issueReturn.issue.length)]
    }

    if (message.includes("return")) {
      return CHATBOT_RESPONSES.issueReturn.return[
        Math.floor(Math.random() * CHATBOT_RESPONSES.issueReturn.return.length)
      ]
    }

    // Due dates and fines
    if (message.includes("due date") || (message.includes("when is") && message.includes("due"))) {
      return CHATBOT_RESPONSES.duesAndFines.dueDates[
        Math.floor(Math.random() * CHATBOT_RESPONSES.duesAndFines.dueDates.length)
      ]
    }

    if (message.includes("fine") || message.includes("penalty")) {
      return Math.random() > 0.7
        ? CHATBOT_RESPONSES.duesAndFines.hasFines[
            Math.floor(Math.random() * CHATBOT_RESPONSES.duesAndFines.hasFines.length)
          ]
        : CHATBOT_RESPONSES.duesAndFines.noFines[
            Math.floor(Math.random() * CHATBOT_RESPONSES.duesAndFines.noFines.length)
          ]
    }

    // Library information
    if (message.includes("hours") || message.includes("open") || message.includes("close")) {
      return CHATBOT_RESPONSES.libraryInfo.hours[Math.floor(Math.random() * CHATBOT_RESPONSES.libraryInfo.hours.length)]
    }

    if (message.includes("location") || message.includes("where") || message.includes("address")) {
      return CHATBOT_RESPONSES.libraryInfo.location[
        Math.floor(Math.random() * CHATBOT_RESPONSES.libraryInfo.location.length)
      ]
    }

    // Features
    if (message.includes("feature") || message.includes("what can") || message.includes("what do")) {
      return CHATBOT_RESPONSES.features[Math.floor(Math.random() * CHATBOT_RESPONSES.features.length)]
    }

    // Default unrecognized response
    return CHATBOT_RESPONSES.unrecognized[Math.floor(Math.random() * CHATBOT_RESPONSES.unrecognized.length)]
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
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-200 ${isMinimized ? "h-16" : "h-96"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">BookBot Assistant</CardTitle>
            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
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
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-gray-100 text-gray-900"
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
                  placeholder="Ask me about books, library hours, or anything else..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
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
