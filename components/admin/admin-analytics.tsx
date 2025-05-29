"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, ShoppingCart, BookOpen, Activity, Clock } from "lucide-react"

export function AdminAnalytics() {
  const recentActivity = [
    {
      id: 1,
      type: "order",
      description: "New order #1234 placed",
      user: "john@example.com",
      amount: "$29.99",
      time: "2 minutes ago",
      status: "completed",
    },
    {
      id: 2,
      type: "user",
      description: "New user registration",
      user: "jane@example.com",
      time: "5 minutes ago",
      status: "active",
    },
    {
      id: 3,
      type: "book",
      description: "Book added to inventory",
      user: "admin",
      time: "10 minutes ago",
      status: "completed",
    },
    {
      id: 4,
      type: "order",
      description: "Order #1233 shipped",
      user: "mike@example.com",
      amount: "$45.99",
      time: "15 minutes ago",
      status: "shipped",
    },
    {
      id: 5,
      type: "review",
      description: "New book review submitted",
      user: "sarah@example.com",
      time: "20 minutes ago",
      status: "pending",
    },
  ]

  const topBooks = [
    { title: "The Midnight Library", author: "Matt Haig", sales: 156, revenue: "$2,184" },
    { title: "Atomic Habits", author: "James Clear", sales: 142, revenue: "$1,988" },
    { title: "Project Hail Mary", author: "Andy Weir", sales: 128, revenue: "$1,792" },
    { title: "Educated", author: "Tara Westover", sales: 115, revenue: "$1,610" },
    { title: "The Silent Patient", author: "Alex Michaelides", sales: 98, revenue: "$1,372" },
  ]

  const salesData = [
    { month: "Jan", sales: 4200, revenue: 58800 },
    { month: "Feb", sales: 3800, revenue: 53200 },
    { month: "Mar", sales: 4600, revenue: 64400 },
    { month: "Apr", sales: 5200, revenue: 72800 },
    { month: "May", sales: 4900, revenue: 68600 },
    { month: "Jun", sales: 5800, revenue: 81200 },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "book":
        return <BookOpen className="h-4 w-4" />
      case "review":
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Sales Overview</span>
          </CardTitle>
          <CardDescription>Monthly sales and revenue trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="font-medium w-12">{data.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600">Sales:</div>
                      <div className="font-medium">{data.sales.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600">Revenue:</div>
                      <div className="font-medium text-green-600">${data.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(data.sales / 6000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Selling Books</span>
          </CardTitle>
          <CardDescription>Best performing books this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topBooks.map((book, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{book.title}</div>
                    <div className="text-xs text-gray-500">{book.author}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{book.sales} sold</div>
                  <div className="text-xs text-green-600">{book.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{activity.description}</div>
                  <div className="text-xs text-gray-500 flex items-center space-x-2">
                    <span>{activity.user}</span>
                    {activity.amount && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">{activity.amount}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-400">{activity.time}</span>
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>{activity.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
