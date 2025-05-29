// Mock forum service for version 7
export interface Discussion {
  id: string
  title: string
  content: string
  author: string
  category: string
  replies: number
  likes: number
  views: number
  created_at: string
  updated_at: string
  tags: string[]
  is_pinned: boolean
  is_locked: boolean
}

export interface BookClub {
  id: string
  name: string
  description: string
  book_title: string
  book_author: string
  book_image: string
  organizer: string
  members: number
  max_members: number
  meeting_date: string
  meeting_time: string
  location: string
  status: "upcoming" | "ongoing" | "completed"
  created_at: string
}

export interface Reply {
  id: string
  discussion_id: string
  content: string
  author: string
  likes: number
  created_at: string
  updated_at: string
}

// Mock data
const mockDiscussions: Discussion[] = [
  {
    id: "1",
    title: "What's your favorite sci-fi book of 2024?",
    content: "I'm looking for some great sci-fi recommendations for this year. What have you been reading?",
    author: "BookLover42",
    category: "Science Fiction",
    replies: 23,
    likes: 45,
    views: 156,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    tags: ["sci-fi", "2024", "recommendations"],
    is_pinned: false,
    is_locked: false,
  },
  {
    id: "2",
    title: "Discussion: The Seven Husbands of Evelyn Hugo",
    content: "Just finished this amazing book! Let's discuss the themes and characters.",
    author: "ReadingQueen",
    category: "Fiction",
    replies: 67,
    likes: 89,
    views: 234,
    created_at: "2024-01-14T15:45:00Z",
    updated_at: "2024-01-14T15:45:00Z",
    tags: ["fiction", "book-discussion", "evelyn-hugo"],
    is_pinned: true,
    is_locked: false,
  },
]

const mockBookClubs: BookClub[] = [
  {
    id: "1",
    name: "Sci-Fi Enthusiasts",
    description: "A club for lovers of science fiction and futuristic stories",
    book_title: "Project Hail Mary",
    book_author: "Andy Weir",
    book_image: "/images/project-hail-mary.jpg",
    organizer: "SciFiMaster",
    members: 15,
    max_members: 20,
    meeting_date: "2024-02-15",
    meeting_time: "19:00",
    location: "Central Library - Room 203",
    status: "upcoming",
    created_at: "2024-01-10T12:00:00Z",
  },
  {
    id: "2",
    name: "Mystery Readers Circle",
    description: "Dive into thrilling mysteries and detective stories",
    book_title: "The Silent Patient",
    book_author: "Alex Michaelides",
    book_image: "/images/silent-patient.jpg",
    organizer: "MysteryFan",
    members: 12,
    max_members: 15,
    meeting_date: "2024-02-20",
    meeting_time: "18:30",
    location: "BookHaven Café",
    status: "upcoming",
    created_at: "2024-01-12T14:30:00Z",
  },
]

export class ForumService {
  // Discussions
  static async getDiscussions(options?: {
    category?: string
    search?: string
    sortBy?: string
    limit?: number
    offset?: number
  }) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    let filtered = [...mockDiscussions]

    if (options?.category && options.category !== "all") {
      filtered = filtered.filter((d) => d.category === options.category)
    }

    if (options?.search) {
      const search = options.search.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          d.content.toLowerCase().includes(search) ||
          d.tags.some((tag) => tag.toLowerCase().includes(search)),
      )
    }

    // Sort by created_at desc by default
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (options?.limit) {
      const start = options.offset || 0
      filtered = filtered.slice(start, start + options.limit)
    }

    return filtered
  }

  static async getDiscussionById(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return mockDiscussions.find((d) => d.id === id)
  }

  static async createDiscussion(
    discussion: Omit<Discussion, "id" | "created_at" | "updated_at" | "replies" | "likes" | "views">,
  ) {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const newDiscussion: Discussion = {
      ...discussion,
      id: Date.now().toString(),
      replies: 0,
      likes: 0,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockDiscussions.unshift(newDiscussion)
    return newDiscussion
  }

  // Book Clubs
  static async getBookClubs(options?: {
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    await new Promise((resolve) => setTimeout(resolve, 100))

    let filtered = [...mockBookClubs]

    if (options?.status && options.status !== "all") {
      filtered = filtered.filter((bc) => bc.status === options.status)
    }

    if (options?.search) {
      const search = options.search.toLowerCase()
      filtered = filtered.filter(
        (bc) =>
          bc.name.toLowerCase().includes(search) ||
          bc.description.toLowerCase().includes(search) ||
          bc.book_title.toLowerCase().includes(search),
      )
    }

    if (options?.limit) {
      const start = options.offset || 0
      filtered = filtered.slice(start, start + options.limit)
    }

    return filtered
  }

  static async getBookClubById(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return mockBookClubs.find((bc) => bc.id === id)
  }

  static async joinBookClub(clubId: string, userId: string) {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const club = mockBookClubs.find((bc) => bc.id === clubId)
    if (club && club.members < club.max_members) {
      club.members += 1
      return { success: true, message: "Successfully joined the book club!" }
    }

    return { success: false, message: "Unable to join book club" }
  }

  static async createBookClub(bookClub: Omit<BookClub, "id" | "created_at" | "members">) {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const newBookClub: BookClub = {
      ...bookClub,
      id: Date.now().toString(),
      members: 1, // Creator is the first member
      created_at: new Date().toISOString(),
    }

    mockBookClubs.unshift(newBookClub)
    return newBookClub
  }

  // Categories
  static async getCategories() {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return ["Fiction", "Science Fiction", "Mystery", "Romance", "Fantasy", "Non-Fiction", "Biography", "Self-Help"]
  }
}
