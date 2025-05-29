"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ChevronRight, ChevronLeft, Check, BookOpen } from "lucide-react"

// Expanded list of book genres including comic books
const genres = [
  "Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical Fiction",
  "Non-Fiction",
  "Biography",
  "Self-Help",
  "Business",
  "Science",
  "Philosophy",
  "Poetry",
  "Horror",
  "Young Adult",
  "Comic Books",
  "Health & Fitness",
  "Travel",
  "Memoir",
]

// Book formats
const bookFormats = [
  { id: "novel", label: "Novel" },
  { id: "light-novel", label: "Light Novel" },
  { id: "audio-book", label: "Audio Book" },
  { id: "comic-book", label: "Comic Book" },
  { id: "ebook", label: "eBook" },
  { id: "physical", label: "Physical Book" },
]

// Reading frequency options
const readingFrequencies = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Few times a week" },
  { id: "monthly", label: "Few times a month" },
  { id: "occasionally", label: "Occasionally" },
  { id: "rarely", label: "Rarely" },
]

// Budget ranges
const budgetRanges = [
  { id: "under-20", label: "Under $20/month" },
  { id: "20-50", label: "$20-50/month" },
  { id: "50-100", label: "$50-100/month" },
  { id: "over-100", label: "Over $100/month" },
  { id: "no-budget", label: "No specific budget" },
]

export function UserSurvey() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    favoriteGenres: [] as string[],
    preferredFormats: [] as string[],
    role: "",
    readingFrequency: "",
    budget: "",
    readingGoals: "",
    discoveryMethod: "",
  })

  const totalSteps = 7

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (Number.parseInt(value) <= 120 || value === "") {
      setFormData((prev) => ({ ...prev, age: value }))
    }
  }

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      // Don't allow more than 5 genres
      if (formData.favoriteGenres.length >= 5) {
        toast({
          title: "Maximum genres reached",
          description: "You can select up to 5 favorite genres",
          variant: "destructive",
        })
        return
      }
      setFormData((prev) => ({
        ...prev,
        favoriteGenres: [...prev.favoriteGenres, genre],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        favoriteGenres: prev.favoriteGenres.filter((g) => g !== genre),
      }))
    }
  }

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        preferredFormats: [...prev.preferredFormats, format],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        preferredFormats: prev.preferredFormats.filter((f) => f !== format),
      }))
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleReadingFrequencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, readingFrequency: value }))
  }

  const handleBudgetChange = (value: string) => {
    setFormData((prev) => ({ ...prev, budget: value }))
  }

  const handleDiscoveryMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, discoveryMethod: value }))
  }

  const handleNext = () => {
    // Validation for each step
    if (step === 1 && !formData.gender) {
      toast({
        title: "Please select your gender",
        description: "This helps us understand our user demographics",
        variant: "destructive",
      })
      return
    }

    if (step === 2 && (!formData.age || Number.parseInt(formData.age) < 13)) {
      toast({
        title: "Please enter a valid age",
        description: "You must be at least 13 years old to use our platform",
        variant: "destructive",
      })
      return
    }

    if (step === 3 && !formData.role) {
      toast({
        title: "Please select your role",
        description: "This helps us customize your experience",
        variant: "destructive",
      })
      return
    }

    if (step === 4 && !formData.readingFrequency) {
      toast({
        title: "Please select your reading frequency",
        description: "This helps us understand your reading habits",
        variant: "destructive",
      })
      return
    }

    if (step === 5 && formData.favoriteGenres.length === 0) {
      toast({
        title: "Please select at least one genre",
        description: "We need to know your preferences to provide recommendations",
        variant: "destructive",
      })
      return
    }

    if (step === 6 && formData.preferredFormats.length === 0) {
      toast({
        title: "Please select at least one book format",
        description: "This helps us show you the right content",
        variant: "destructive",
      })
      return
    }

    if (step === 7 && !formData.budget) {
      toast({
        title: "Please select your budget range",
        description: "This helps us recommend books within your price range",
        variant: "destructive",
      })
      return
    }

    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Complete the survey
      completeSurvey()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const completeSurvey = () => {
    // Get existing user data
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")

    // Update user data with survey information
    const updatedUserData = {
      ...userData,
      gender: formData.gender,
      age: formData.age,
      favoriteGenres: formData.favoriteGenres,
      preferredFormats: formData.preferredFormats,
      role: formData.role,
      readingFrequency: formData.readingFrequency,
      budget: formData.budget,
      readingGoals: formData.readingGoals,
      discoveryMethod: formData.discoveryMethod,
      surveyCompleted: true,
      surveyCompletedDate: new Date().toISOString(),
    }

    // Save updated user data
    localStorage.setItem("userData", JSON.stringify(updatedUserData))

    // Show success message
    toast({
      title: "Survey completed!",
      description: "Thank you for sharing your preferences. We'll now personalize your experience!",
    })

    // Redirect to home page with personalized recommendations
    router.push("/?survey=completed")
  }

  const handleSkip = () => {
    // Log that user skipped the survey
    console.log("User skipped the survey")

    // Show message
    toast({
      title: "Survey skipped",
      description: "You can always complete your preferences in your profile settings",
    })

    // Redirect to home page
    router.push("/")
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Tell us about yourself"
      case 2:
        return "What's your age?"
      case 3:
        return "How will you use BookHaven?"
      case 4:
        return "How often do you read?"
      case 5:
        return "What genres do you love?"
      case 6:
        return "Preferred book formats"
      case 7:
        return "What's your reading budget?"
      default:
        return "User Survey"
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "This helps us understand our community better"
      case 2:
        return "We use this to recommend age-appropriate content"
      case 3:
        return "This helps us customize your experience"
      case 4:
        return "Understanding your reading habits helps us make better recommendations"
      case 5:
        return "Select up to 5 genres you enjoy most (required for recommendations)"
      case 6:
        return "Choose all formats you're interested in"
      case 7:
        return "This helps us recommend books within your price range"
      default:
        return "Help us personalize your BookHaven experience"
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}% complete</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
        <CardDescription>{getStepDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <RadioGroup value={formData.gender} onValueChange={handleGenderChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-binary" id="non-binary" />
                <Label htmlFor="non-binary">Non-binary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleAgeChange}
              maxLength={3}
              inputMode="numeric"
              pattern="[0-9]*"
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">You must be at least 13 years old to use our platform</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reader" id="reader" />
                <Label htmlFor="reader" className="cursor-pointer">
                  <div>
                    <div className="font-medium">I'm a Reader</div>
                    <div className="text-sm text-muted-foreground">I love discovering and reading new books</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="author" id="author" />
                <Label htmlFor="author" className="cursor-pointer">
                  <div>
                    <div className="font-medium">I'm an Author</div>
                    <div className="text-sm text-muted-foreground">I write and publish books</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer">
                  <div>
                    <div className="font-medium">I'm Both</div>
                    <div className="text-sm text-muted-foreground">I read books and write them too</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <RadioGroup value={formData.readingFrequency} onValueChange={handleReadingFrequencyChange}>
              {readingFrequencies.map((frequency) => (
                <div key={frequency.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={frequency.id} id={frequency.id} />
                  <Label htmlFor={frequency.id}>{frequency.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Selected: {formData.favoriteGenres.length}/5</p>
              {formData.favoriteGenres.length === 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">Required for recommendations</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {genres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={genre}
                    checked={formData.favoriteGenres.includes(genre)}
                    onCheckedChange={(checked) => handleGenreChange(genre, checked as boolean)}
                  />
                  <Label htmlFor={genre} className="text-sm cursor-pointer">
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 gap-3">
              {bookFormats.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={format.id}
                    checked={formData.preferredFormats.includes(format.id)}
                    onCheckedChange={(checked) => handleFormatChange(format.id, checked as boolean)}
                  />
                  <Label htmlFor={format.id} className="cursor-pointer">
                    {format.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <RadioGroup value={formData.budget} onValueChange={handleBudgetChange}>
              {budgetRanges.map((budget) => (
                <div key={budget.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={budget.id} id={budget.id} />
                  <Label htmlFor={budget.id}>{budget.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleSkip}>
              Skip Survey
            </Button>
          )}
        </div>
        <Button onClick={handleNext}>
          {step < totalSteps ? (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Complete Survey
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
