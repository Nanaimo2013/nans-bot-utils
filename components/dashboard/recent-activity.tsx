import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Shield, MessageSquare, UserPlus, Settings } from "lucide-react"

export function RecentActivity() {
  // Mock activity data - replace with real API
  const activities = [
    {
      id: 1,
      type: "moderation",
      action: "User banned",
      server: "Gaming Community",
      user: "SpamBot123",
      timestamp: "2 minutes ago",
      icon: Shield,
      severity: "high",
    },
    {
      id: 2,
      type: "member",
      action: "New member joined",
      server: "Tech Support",
      user: "NewUser456",
      timestamp: "5 minutes ago",
      icon: UserPlus,
      severity: "low",
    },
    {
      id: 3,
      type: "message",
      action: "Auto-mod triggered",
      server: "General Chat",
      user: "ChatUser789",
      timestamp: "12 minutes ago",
      icon: MessageSquare,
      severity: "medium",
    },
    {
      id: 4,
      type: "config",
      action: "Settings updated",
      server: "Admin Server",
      user: "AdminUser",
      timestamp: "1 hour ago",
      icon: Settings,
      severity: "low",
    },
    {
      id: 5,
      type: "moderation",
      action: "Message deleted",
      server: "Gaming Community",
      user: "RuleBreaker",
      timestamp: "2 hours ago",
      icon: Shield,
      severity: "medium",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>Latest events across your servers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <activity.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.action}</p>
                <Badge variant={getSeverityColor(activity.severity) as any} className="text-xs">
                  {activity.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {activity.user} in {activity.server}
              </p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <button className="text-sm text-primary hover:underline">View all activity →</button>
        </div>
      </CardContent>
    </Card>
  )
}
