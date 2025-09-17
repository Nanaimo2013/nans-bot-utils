"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button variant="ghost" disabled>
        Loading...
      </Button>
    )
  }

  if (!session) {
    return (
      <Button onClick={() => signIn("discord")} className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
        Login with Discord
      </Button>
    )
  }

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} alt={session.user.name || "User"} />
            <AvatarFallback>{session.user.name?.charAt(0) || session.user.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{session.user.name || session.user.username}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
