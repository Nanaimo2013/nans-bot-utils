import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch guilds")
    }

    const guilds = await response.json()

    // Filter guilds where user has admin permissions
    const adminGuilds = guilds.filter((guild: any) => (guild.permissions & 0x8) === 0x8 || guild.owner)

    return NextResponse.json(adminGuilds)
  } catch (error) {
    console.error("Error fetching guilds:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
