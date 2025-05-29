"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { loggingService } from "@/lib/logging-service"
import { Upload, Download, FileText, Database, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

export function AdminDataManager() {
  const { toast } = useToast()
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExportBooks = async () => {
    try {
      setExporting(true)

      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const sampleData = [
        {
          id: "1",
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          category: "Fiction",
          price: 12.99,
          stock: 25,
          isbn: "978-0-7432-7356-5",
        },
        {
          id: "2",
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          category: "Fiction",
          price: 14.99,
          stock: 18,
          isbn: "978-0-06-112008-4",
        },
      ]

      const csvContent = [
        ["ID", "Title", "Author", "Category", "Price", "Stock", "ISBN"].join(","),
        ...sampleData.map((book) =>
          [book.id, `"${book.title}"`, `"${book.author}"`, book.category, book.price, book.stock, book.isbn].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `books-export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      await loggingService.logEvent({
        event_type: "admin_action",
        event_name: "data_exported",
        details: { type: "books", format: "csv", count: sampleData.length },
      })

      toast({
        title: "Export Successful",
        description: "Books data has been exported to CSV file",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export books data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleExportUsers = async () => {
    try {
      setExporting(true)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const sampleUsers = [
        {
          id: "1",
          email: "user@example.com",
          name: "John Doe",
          created_at: "2024-01-15",
          last_login: "2024-01-20",
        },
        {
          id: "2",
          email: "jane@example.com",
          name: "Jane Smith",
          created_at: "2024-01-18",
          last_login: "2024-01-21",
        },
      ]

      const csvContent = [
        ["ID", "Email", "Name", "Created At", "Last Login"].join(","),
        ...sampleUsers.map((user) =>
          [user.id, user.email, `"${user.name}"`, user.created_at, user.last_login].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      await loggingService.logEvent({
        event_type: "admin_action",
        event_name: "data_exported",
        details: { type: "users", format: "csv", count: sampleUsers.length },
      })

      toast({
        title: "Export Successful",
        description: "Users data has been exported to CSV file",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export users data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleImportData = async (file: File) => {
    try {
      setImporting(true)

      // Simulate import process
      await new Promise((resolve) => setTimeout(resolve, 3000))

      await loggingService.logEvent({
        event_type: "admin_action",
        event_name: "data_imported",
        details: { filename: file.name, size: file.size },
      })

      toast({
        title: "Import Successful",
        description: `Successfully imported data from ${file.name}`,
      })
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import Failed",
        description: "Failed to import data",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleImportData(file)
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>Import and export data, manage backups, and perform bulk operations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Export Data</TabsTrigger>
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Export Books</span>
                    </CardTitle>
                    <CardDescription>Download all book data in CSV format</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleExportBooks} disabled={exporting} className="w-full">
                      {exporting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export Books
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Export Users</span>
                    </CardTitle>
                    <CardDescription>Download all user data in CSV format</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleExportUsers} disabled={exporting} className="w-full">
                      {exporting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export Users
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Import Data</span>
                  </CardTitle>
                  <CardDescription>Upload CSV files to import books or user data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Select CSV File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={importing}
                      className="mt-1"
                    />
                  </div>

                  {importing && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Importing data...</span>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Import Guidelines</h4>
                        <ul className="mt-2 text-sm text-blue-800 space-y-1">
                          <li>• CSV files must include proper headers</li>
                          <li>• Maximum file size: 10MB</li>
                          <li>• Duplicate entries will be skipped</li>
                          <li>• Invalid data will be reported</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span>Create Backup</span>
                    </CardTitle>
                    <CardDescription>Create a full backup of all system data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Create Full Backup
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Restore Data</span>
                    </CardTitle>
                    <CardDescription>Restore system from a previous backup</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore from Backup
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Backups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "2024-01-21", size: "2.4 MB", status: "completed" },
                      { date: "2024-01-20", size: "2.3 MB", status: "completed" },
                      { date: "2024-01-19", size: "2.2 MB", status: "completed" },
                    ].map((backup, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">Backup - {backup.date}</div>
                            <div className="text-sm text-gray-500">{backup.size}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
