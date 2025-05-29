import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumBadgeProps {
  className?: string
}

export function PremiumBadge({ className }: PremiumBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full text-xs font-medium",
        className,
      )}
    >
      <Crown className="h-3 w-3" />
      <span>Premium</span>
    </div>
  )
}
