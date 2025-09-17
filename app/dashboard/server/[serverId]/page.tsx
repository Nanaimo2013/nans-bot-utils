import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ServerHeader } from "@/components/server/server-header"
import { ServerTabs } from "@/components/server/server-tabs"
import { Suspense } from "react"

interface ServerPageProps {
  params: {
    serverId: string
  }
}

async function getServerInfo(serverId: string, accessToken: string) {
  try {
    const response = await fetch(`https://discord.com/api/guilds/${serverId}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch server info")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching server info:", error)
    return null
  }
}

export default async function ServerPage({ params }: ServerPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const serverInfo = await getServerInfo(params.serverId, session.accessToken)

  if (!serverInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Server Not Found</h1>
          <p className="text-muted-foreground">
            Unable to access this server. Make sure the bot is invited and you have the necessary permissions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div>Loading server...</div>}>
        <ServerHeader server={serverInfo} />
      </Suspense>

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading configuration...</div>}>
          <ServerTabs serverId={params.serverId} server={serverInfo} />
        </Suspense>
      </main>
    </div>
  )
}
