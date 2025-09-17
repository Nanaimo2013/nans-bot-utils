import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Settings, HelpCircle, Zap } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Add Bot to Server",
      description: "Invite the bot to a new Discord server",
      icon: Plus,
      action: "invite",
    },
    {
      title: "Bot Configuration",
      description: "Configure global bot settings",
      icon: Settings,
      action: "config",
    },
    {
      title: "View Documentation",
      description: "Learn how to use all features",
      icon: FileText,
      action: "docs",
    },
    {
      title: "Test Commands",
      description: "Test bot functionality",
      icon: Zap,
      action: "test",
    },
    {
      title: "Support",
      description: "Get help and support",
      icon: HelpCircle,
      action: "support",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button key={action.action} variant="ghost" className="w-full justify-start h-auto p-3">
            <action.icon className="h-4 w-4 mr-3 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium text-sm">{action.title}</div>
              <div className="text-xs text-muted-foreground">{action.description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
