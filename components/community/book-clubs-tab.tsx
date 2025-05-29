"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ForumService, type BookClub } from "@/lib/forum-service"
import { Users, Calendar, MapPin, BookOpen, Clock } from "lucide-react"
import Image from "next/image"

interface BookClubsTabProps {
  searchQuery?: string
}

export function BookClubsTab({ searchQuery }: BookClubsTabProps) {
  const [bookClubs, setBookClubs] = useState<BookClub[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadBookClubs()
  }, [searchQuery, statusFilter])

  const loadBookClubs = async () => {
    try {
      setLoading(true)
      const data = await ForumService.getBookClubs({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      setBookClubs(data)
    } catch (error) {
      console.error("Failed to load book clubs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClub = async (clubId: string) => {
    try {
      const result = await ForumService.joinBookClub(clubId, "current-user-id")
      if (result.success) {
        // Refresh the list
        loadBookClubs()
      }
    } catch (error) {
      console.error("Failed to join book club:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Book Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading book clubs...</div>
        ) : bookClubs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No book clubs found</p>
              <Button className="mt-4">Create a Book Club</Button>
            </CardContent>
          </Card>
        ) : (
          bookClubs.map((club) => (
            <Card key={club.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Image
                    src={club.book_image || "/placeholder.svg"}
                    alt={club.book_title}
                    width={80}
                    height={120}
                    className="rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{club.name}</h3>
                      <Badge className={getStatusColor(club.status)}>{club.status}</Badge>
                    </div>

                    <p className="text-gray-600 mb-3 text-sm">{club.description}</p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          <strong>{club.book_title}</strong> by {club.book_author}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {club.members}/{club.max_members} members
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(club.meeting_date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{club.meeting_time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{club.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {club.organizer.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">Organized by {club.organizer}</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleJoinClub(club.id)}
                        disabled={club.members >= club.max_members || club.status === "completed"}
                      >
                        {club.members >= club.max_members ? "Full" : "Join Club"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
