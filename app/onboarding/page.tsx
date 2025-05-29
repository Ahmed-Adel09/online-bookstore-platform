"use client"

import { UserSurvey } from "@/components/onboarding/user-survey"

export default function OnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[80vh]">
      <UserSurvey />
    </div>
  )
}
