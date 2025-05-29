"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
  onStrengthChange?: (strength: number) => void
}

interface PasswordCriteria {
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  hasMinLength: boolean
}

export function PasswordStrengthIndicator({ password, onStrengthChange }: PasswordStrengthProps) {
  const [criteria, setCriteria] = useState<PasswordCriteria>({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
  })

  const [strength, setStrength] = useState(0)

  useEffect(() => {
    const newCriteria: PasswordCriteria = {
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      hasMinLength: password.length >= 8,
    }

    setCriteria(newCriteria)

    // Calculate strength (0-5)
    const strengthScore = Object.values(newCriteria).filter(Boolean).length
    setStrength(strengthScore)
    onStrengthChange?.(strengthScore)
  }, [password, onStrengthChange])

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  const criteriaItems = [
    { key: "hasMinLength", label: "At least 8 characters", met: criteria.hasMinLength },
    { key: "hasUppercase", label: "Uppercase letter (A-Z)", met: criteria.hasUppercase },
    { key: "hasLowercase", label: "Lowercase letter (a-z)", met: criteria.hasLowercase },
    { key: "hasNumber", label: "Number (0-9)", met: criteria.hasNumber },
    { key: "hasSpecialChar", label: "Special character (!@#$%^&*)", met: criteria.hasSpecialChar },
  ]

  if (!password) return null

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password Strength</span>
          <span
            className={`font-medium ${strength <= 2 ? "text-red-600" : strength <= 3 ? "text-yellow-600" : strength <= 4 ? "text-blue-600" : "text-green-600"}`}
          >
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
        <div className="space-y-1">
          {criteriaItems.map((item) => (
            <div key={item.key} className="flex items-center space-x-2 text-sm">
              {item.met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-400" />}
              <span className={item.met ? "text-green-700" : "text-gray-500"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
