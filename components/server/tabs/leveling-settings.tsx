"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, TrendingUp, Award, Star } from "lucide-react"

interface LevelingSettingsProps {
  serverId: string
}

export function LevelingSettings({ serverId }: LevelingSettingsProps) {
  const [settings, setSettings] = useState({
    levelingEnabled: true,
    xpPerMessage: 15,
    xpCooldown: 60, // seconds
    levelUpMultiplier: 100,
    levelUpChannel: "",
    levelUpMessage: "Congratulations {user}! You reached level {level}!",
    roleRewards: true,
    xpBoostRoles: [],
    ignoredChannels: [],
    levelUpNotifications: true,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Leveling System</span>
          </CardTitle>
          <CardDescription>Configure XP and leveling system for member engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Leveling System</Label>
              <p className="text-sm text-muted-foreground">Enable XP and leveling for this server</p>
            </div>
            <Switch
              checked={settings.levelingEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, levelingEnabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="xp-per-message">XP Per Message</Label>
              <Input
                id="xp-per-message"
                type="number"
                value={settings.xpPerMessage}
                onChange={(e) => setSettings({ ...settings, xpPerMessage: Number.parseInt(e.target.value) })}
                min="1"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xp-cooldown">XP Cooldown (seconds)</Label>
              <Input
                id="xp-cooldown"
                type="number"
                value={settings.xpCooldown}
                onChange={(e) => setSettings({ ...settings, xpCooldown: Number.parseInt(e.target.value) })}
                min="1"
                max="300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level-multiplier">Level Up Multiplier</Label>
            <Input
              id="level-multiplier"
              type="number"
              value={settings.levelUpMultiplier}
              onChange={(e) => setSettings({ ...settings, levelUpMultiplier: Number.parseInt(e.target.value) })}
              min="50"
              max="1000"
            />
            <p className="text-xs text-muted-foreground">XP required for next level = current level × multiplier</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Level Up Notifications</span>
          </CardTitle>
          <CardDescription>Configure how level up notifications are handled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Level Up Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications when users level up</p>
            </div>
            <Switch
              checked={settings.levelUpNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, levelUpNotifications: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="levelup-channel">Level Up Channel</Label>
            <Select
              value={settings.levelUpChannel}
              onValueChange={(value) => setSettings({ ...settings, levelUpChannel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select channel (or current channel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Channel</SelectItem>
                <SelectItem value="general">#general</SelectItem>
                <SelectItem value="levelup">#level-up</SelectItem>
                <SelectItem value="bot-spam">#bot-spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="levelup-message">Level Up Message</Label>
            <Input
              id="levelup-message"
              value={settings.levelUpMessage}
              onChange={(e) => setSettings({ ...settings, levelUpMessage: e.target.value })}
              placeholder="Congratulations {user}! You reached level {level}!"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{user}"} for username and {"{level}"} for level number
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Role Rewards</span>
          </CardTitle>
          <CardDescription>Configure automatic role rewards for reaching certain levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Role Rewards</Label>
              <p className="text-sm text-muted-foreground">Automatically assign roles when users level up</p>
            </div>
            <Switch
              checked={settings.roleRewards}
              onCheckedChange={(checked) => setSettings({ ...settings, roleRewards: checked })}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Role Rewards</h4>
            <p className="text-sm text-muted-foreground mb-3">No role rewards configured yet.</p>
            <Button variant="outline" size="sm">
              Add Role Reward
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>Configure advanced leveling options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>XP Boost Roles</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select roles that get XP boost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">@Premium</SelectItem>
                <SelectItem value="supporter">@Supporter</SelectItem>
                <SelectItem value="vip">@VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ignored Channels</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select channels to ignore for XP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bot-commands">#bot-commands</SelectItem>
                <SelectItem value="spam">#spam</SelectItem>
                <SelectItem value="music">#music</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Leveling Settings
        </Button>
      </div>
    </div>
  )
}
