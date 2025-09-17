import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { ServerGrid } from "@/components/dashboard/server-grid"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginButton } from "@/components/auth/login-button"
import { Bot, Shield, Zap, Users, Settings } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Nans Bot Utils</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Professional Discord bot management platform with advanced moderation, economy, and AI integration
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <Shield className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Advanced Moderation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comprehensive automod, logging, and moderation tools with AI-powered content filtering
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Economy & Leveling</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Engaging economy system with leveling, rewards, and customizable progression
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <Zap className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">AI Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Smart AI chat, content moderation, and automated responses powered by OpenAI
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <LoginButton />
              <p className="text-sm text-muted-foreground">Secure authentication via Discord OAuth2</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage your Discord servers and bot configuration</p>
          </div>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Bot Settings
          </Button>
        </div>

        <Suspense fallback={<div>Loading stats...</div>}>
          <StatsOverview />
        </Suspense>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<div>Loading servers...</div>}>
              <ServerGrid />
            </Suspense>
          </div>

          <div className="space-y-8">
            <QuickActions />
            <Suspense fallback={<div>Loading activity...</div>}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
