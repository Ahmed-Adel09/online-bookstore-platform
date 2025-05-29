"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminAuth } from "@/lib/admin-auth"
import { useToast } from "@/hooks/use-toast"
import {
  BookOpen,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Upload,
  LogOut,
  Settings,
  BarChart3,
} from "lucide-react"
import { AdminAnalytics } from "@/components/admin/admin-analytics"
import { AdminBookManager } from "@/components/admin/admin-book-manager"
import { AdminDataManager } from "@/components/admin/admin-data-manager"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentAdmin, setCurrentAdmin] = useState(adminAuth.getCurrentAdmin())
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      router.push("/admin/login")
      return
    }
    setCurrentAdmin(adminAuth.getCurrentAdmin())
  }, [router])

  const handleSignOut = async () => {
    await adminAuth.signOut()
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    })
    router.push("/admin/login")
  }

  if (!currentAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Books",
      value: "2,847",
      change: "+12%",
      changeType: "increase",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+8%",
      changeType: "increase",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Orders Today",
      value: "89",
      change: "+23%",
      changeType: "increase",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Revenue",
      value: "$12,847",
      change: "+15%",
      changeType: "increase",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{currentAdmin.first_name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Books</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Data</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">{stat.change}</span>
                          <span className="text-sm text-gray-500 ml-1">from last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analytics */}
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="books" className="space-y-6">
            <AdminBookManager />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <AdminDataManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Manage your admin account and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Account Information</h4>
                    <div className="mt-2 space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Name:</strong> {currentAdmin.first_name} {currentAdmin.last_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {currentAdmin.email}
                      </p>
                      <p>
                        <strong>Role:</strong> {currentAdmin.role}
                      </p>
                      <p>
                        <strong>Last Login:</strong> {new Date(currentAdmin.last_login).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Permissions</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentAdmin.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
