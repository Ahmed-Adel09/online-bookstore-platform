"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  admin: string
  action: string
  details: string
  timestamp: string
}

interface AdminActivityLogProps {
  activities: Activity[]
}

export function AdminActivityLog({ activities }: AdminActivityLogProps) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {activity.admin.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{activity.admin}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-1 text-sm">{activity.details}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
