"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Save, RefreshCw } from "lucide-react"

interface GeneralSettingsProps {
  serverId: string
  server: any
}

export function GeneralSettings({ serverId, server }: GeneralSettingsProps) {
  const [settings, setSettings] = useState({
    prefix: "!",
    language: "en",
    timezone: "UTC",
    botEnabled: true,
    welcomeMessage: "Welcome to the server!",
    farewellMessage: "Goodbye!",
    welcomeChannel: "",
    farewellChannel: "",
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Configuration</CardTitle>
          <CardDescription>Configure basic bot settings for {server.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">Command Prefix</Label>
              <Input
                id="prefix"
                value={settings.prefix}
                onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                placeholder="!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="bot-enabled"
              checked={settings.botEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, botEnabled: checked })}
            />
            <Label htmlFor="bot-enabled">Bot Enabled</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Welcome & Farewell Messages</CardTitle>
          <CardDescription>Configure messages for new members joining and leaving</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              placeholder="Welcome {user} to {server}!"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="farewell-message">Farewell Message</Label>
            <Textarea
              id="farewell-message"
              value={settings.farewellMessage}
              onChange={(e) => setSettings({ ...settings, farewellMessage: e.target.value })}
              placeholder="Goodbye {user}!"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="welcome-channel">Welcome Channel</Label>
              <Select
                value={settings.welcomeChannel}
                onValueChange={(value) => setSettings({ ...settings, welcomeChannel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">#general</SelectItem>
                  <SelectItem value="welcome">#welcome</SelectItem>
                  <SelectItem value="lobby">#lobby</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="farewell-channel">Farewell Channel</Label>
              <Select
                value={settings.farewellChannel}
                onValueChange={(value) => setSettings({ ...settings, farewellChannel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">#general</SelectItem>
                  <SelectItem value="goodbye">#goodbye</SelectItem>
                  <SelectItem value="lobby">#lobby</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
