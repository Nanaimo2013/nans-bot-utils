"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Crown, Shield, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ServerHeaderProps {
  server: {
    id: string
    name: string
    icon: string | null
    owner_id: string
    member_count?: number
    premium_tier?: number
    verification_level?: number
  }
}

export function ServerHeader({ server }: ServerHeaderProps) {
  const iconUrl = server.icon ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png` : null

  const getVerificationLevel = (level: number) => {
    const levels = ["None", "Low", "Medium", "High", "Very High"]
    return levels[level] || "Unknown"
  }

  const getPremiumTier = (tier: number) => {
    const tiers = ["None", "Tier 1", "Tier 2", "Tier 3"]
    return tiers[tier] || "None"
  }

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-start space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={iconUrl || undefined} alt={server.name} />
            <AvatarFallback className="text-2xl">{server.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">{server.name}</h1>
              <Badge variant="outline">
                <Crown className="h-3 w-3 mr-1" />
                Server Owner
              </Badge>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{server.member_count?.toLocaleString() || "N/A"} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Verification: {getVerificationLevel(server.verification_level || 0)}</span>
              </div>
              <div>
                <span>Boost: {getPremiumTier(server.premium_tier || 0)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Configure Bot
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Discord
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
