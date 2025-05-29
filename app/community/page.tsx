"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DiscussionsTab } from "@/components/community/discussions-tab"
import { BookClubsTab } from "@/components/community/book-clubs-tab"
import { MessageSquare, Users, BookOpen, TrendingUp, Search, Plus } from "lucide-react"
import Link from "next/link"

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const communityStats = [
    {
      title: "Active Discussions",
      value: "1,247",
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      title: "Community Members",
      value: "15,432",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Book Clubs",
      value: "89",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Posts This Week",
      value: "342",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const featuredDiscussions = [
    {
      id: 1,
      title: "What's your favorite sci-fi book of 2024?",
      author: "BookLover42",
      replies: 23,
      likes: 45,
      category: "Science Fiction",
      timeAgo: "2 hours ago",
    },
    {
      id: 2,
      title: "Discussion: The Seven Husbands of Evelyn Hugo",
      author: "ReadingQueen",
      replies: 67,
      likes: 89,
      category: "Fiction",
      timeAgo: "4 hours ago",
    },
    {
      id: 3,
      title: "Book recommendations for productivity and self-help",
      author: "GrowthMindset",
      replies: 34,
      likes: 56,
      category: "Self-Help",
      timeAgo: "6 hours ago",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BookHaven Community</h1>
        <p className="text-gray-600">Connect with fellow book lovers, join discussions, and discover new reads</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {communityStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search discussions, book clubs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Link href="/community/new-post">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="discussions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="book-clubs">Book Clubs</TabsTrigger>
            </TabsList>

            <TabsContent value="discussions">
              <DiscussionsTab searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="book-clubs">
              <BookClubsTab searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Discussions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending Discussions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredDiscussions.map((discussion) => (
                <div key={discussion.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <h4 className="font-medium text-sm mb-2 hover:text-blue-600 cursor-pointer">{discussion.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {discussion.author.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{discussion.author}</span>
                    </div>
                    <span>{discussion.timeAgo}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {discussion.category}
                    </Badge>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{discussion.replies} replies</span>
                      <span>{discussion.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• Be respectful and kind to all members</p>
              <p>• Stay on topic and avoid spam</p>
              <p>• Use spoiler tags when discussing plot details</p>
              <p>• Give credit when sharing recommendations</p>
              <p>• Report inappropriate content</p>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Fiction", "Mystery", "Romance", "Sci-Fi", "Fantasy", "Non-Fiction", "Biography", "Self-Help"].map(
                  (category) => (
                    <Badge key={category} variant="outline" className="cursor-pointer hover:bg-blue-50">
                      {category}
                    </Badge>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
