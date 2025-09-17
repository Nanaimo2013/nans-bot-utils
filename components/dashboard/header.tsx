"use client"

import { LoginButton } from "@/components/auth/login-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Bot, Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Nans Bot Utils</span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
              <Button variant="ghost" size="sm">
                Servers
              </Button>
              <Button variant="ghost" size="sm">
                Analytics
              </Button>
              <Button variant="ghost" size="sm">
                Documentation
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search servers..." className="pl-8 w-64" />
              </div>
            </div>

            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <ThemeToggle />
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  )
}
