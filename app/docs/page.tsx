import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardHeader } from "@/components/dashboard/header"
import { Book, Search, Bot, Shield, Coins, TrendingUp, Brain, FileText, ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const docSections = [
    {
      title: "Getting Started",
      description: "Learn the basics of setting up and using Nans Bot Utils",
      icon: Bot,
      articles: [
        { title: "Installation Guide", href: "/docs/installation", new: true },
        { title: "Initial Setup", href: "/docs/setup" },
        { title: "Inviting the Bot", href: "/docs/invite" },
        { title: "Basic Configuration", href: "/docs/basic-config" },
      ],
    },
    {
      title: "Moderation",
      description: "Advanced moderation tools and auto-moderation features",
      icon: Shield,
      articles: [
        { title: "Auto Moderation Setup", href: "/docs/automod" },
        { title: "Warning System", href: "/docs/warnings" },
        { title: "Raid Protection", href: "/docs/raid-protection" },
        { title: "Custom Filters", href: "/docs/filters" },
      ],
    },
    {
      title: "Economy System",
      description: "Configure currency, rewards, and economy features",
      icon: Coins,
      articles: [
        { title: "Economy Setup", href: "/docs/economy-setup" },
        { title: "Currency Configuration", href: "/docs/currency" },
        { title: "Shop System", href: "/docs/shop" },
        { title: "Daily Rewards", href: "/docs/daily-rewards" },
      ],
    },
    {
      title: "Leveling System",
      description: "XP, levels, and role rewards configuration",
      icon: TrendingUp,
      articles: [
        { title: "Leveling Setup", href: "/docs/leveling-setup" },
        { title: "XP Configuration", href: "/docs/xp-config" },
        { title: "Role Rewards", href: "/docs/role-rewards" },
        { title: "Leaderboards", href: "/docs/leaderboards" },
      ],
    },
    {
      title: "AI Features",
      description: "AI chat, moderation, and smart responses",
      icon: Brain,
      articles: [
        { title: "AI Setup", href: "/docs/ai-setup", new: true },
        { title: "AI Chat Configuration", href: "/docs/ai-chat" },
        { title: "AI Moderation", href: "/docs/ai-moderation" },
        { title: "Custom Prompts", href: "/docs/custom-prompts" },
      ],
    },
    {
      title: "Logging & Analytics",
      description: "Comprehensive logging and server analytics",
      icon: FileText,
      articles: [
        { title: "Logging Setup", href: "/docs/logging" },
        { title: "Event Types", href: "/docs/event-types" },
        { title: "Analytics Dashboard", href: "/docs/analytics" },
        { title: "Export Logs", href: "/docs/export-logs" },
      ],
    },
  ]

  const quickLinks = [
    { title: "Command List", href: "/docs/commands", icon: Bot },
    { title: "API Reference", href: "/docs/api", icon: ExternalLink },
    { title: "Troubleshooting", href: "/docs/troubleshooting", icon: Shield },
    { title: "FAQ", href: "/docs/faq", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
              <Book className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete guide to setting up and using Nans Bot Utils for your Discord server
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documentation..." className="pl-10" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {quickLinks.map((link) => (
              <Card key={link.href} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Button variant="ghost" className="w-full h-auto p-0" asChild>
                    <Link href={link.href}>
                      <div className="flex items-center space-x-3">
                        <link.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{link.title}</span>
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section) => (
              <Card key={section.title} className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {section.articles.map((article) => (
                      <Button key={article.href} variant="ghost" className="w-full justify-start h-auto p-2" asChild>
                        <Link href={article.href}>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm">{article.title}</span>
                            <div className="flex items-center space-x-1">
                              {article.new && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                              <ChevronRight className="h-3 w-3" />
                            </div>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Support Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Can't find what you're looking for? Get additional support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 bg-transparent" asChild>
                  <Link href="/support">
                    <div className="text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Support Ticket</div>
                      <div className="text-xs text-muted-foreground">Get personalized help</div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 bg-transparent" asChild>
                  <a href="https://discord.gg/your-server" target="_blank" rel="noopener noreferrer">
                    <div className="text-center">
                      <Bot className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Discord Server</div>
                      <div className="text-xs text-muted-foreground">Join our community</div>
                    </div>
                  </a>
                </Button>

                <Button variant="outline" className="h-auto p-4 bg-transparent" asChild>
                  <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
                    <div className="text-center">
                      <ExternalLink className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">GitHub</div>
                      <div className="text-xs text-muted-foreground">Report issues</div>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
