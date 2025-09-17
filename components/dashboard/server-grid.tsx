"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Users, MessageSquare, Shield, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Guild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
  approximate_member_count?: number
}

export function ServerGrid() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGuilds() {
      try {
        const response = await fetch("/api/discord/guilds")
        if (response.ok) {
          const data = await response.json()
          setGuilds(data)
        }
      } catch (error) {
        console.error("Failed to fetch guilds:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuilds()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Servers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Servers</h2>
        <Badge variant="secondary">{guilds.length} servers</Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guilds.map((guild) => {
          const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null

          return (
            <Card key={guild.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={iconUrl || undefined} alt={guild.name} />
                      <AvatarFallback>{guild.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{guild.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        {guild.owner && (
                          <Badge variant="outline" className="text-xs">
                            Owner
                          </Badge>
                        )}
                        <span className="text-xs">ID: {guild.id}</span>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{guild.approximate_member_count || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Protected
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/dashboard/server/${guild.id}`}>
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {guilds.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No servers found</h3>
                <p className="text-muted-foreground">
                  You need administrator permissions to manage servers with this bot.
                </p>
              </div>
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Invite Bot to Server
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
