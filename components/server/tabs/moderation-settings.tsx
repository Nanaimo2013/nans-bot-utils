"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Shield, AlertTriangle, Ban } from "lucide-react"

interface ModerationSettingsProps {
  serverId: string
}

export function ModerationSettings({ serverId }: ModerationSettingsProps) {
  const [settings, setSettings] = useState({
    autoModEnabled: true,
    spamProtection: true,
    linkProtection: false,
    capsProtection: true,
    profanityFilter: true,
    raidProtection: true,
    maxWarnings: 3,
    muteRole: "",
    modLogChannel: "",
    autoDeleteSpam: true,
    slowModeThreshold: 5,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Auto Moderation</span>
          </CardTitle>
          <CardDescription>Automated moderation features to keep your server safe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto Moderation</Label>
              <p className="text-sm text-muted-foreground">Enable automatic moderation features</p>
            </div>
            <Switch
              checked={settings.autoModEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, autoModEnabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Spam Protection</Label>
                <p className="text-xs text-muted-foreground">Detect and prevent spam</p>
              </div>
              <Switch
                checked={settings.spamProtection}
                onCheckedChange={(checked) => setSettings({ ...settings, spamProtection: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Link Protection</Label>
                <p className="text-xs text-muted-foreground">Block suspicious links</p>
              </div>
              <Switch
                checked={settings.linkProtection}
                onCheckedChange={(checked) => setSettings({ ...settings, linkProtection: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Caps Protection</Label>
                <p className="text-xs text-muted-foreground">Limit excessive caps</p>
              </div>
              <Switch
                checked={settings.capsProtection}
                onCheckedChange={(checked) => setSettings({ ...settings, capsProtection: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Profanity Filter</Label>
                <p className="text-xs text-muted-foreground">Filter inappropriate language</p>
              </div>
              <Switch
                checked={settings.profanityFilter}
                onCheckedChange={(checked) => setSettings({ ...settings, profanityFilter: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Warning System</span>
          </CardTitle>
          <CardDescription>Configure the warning and punishment system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-warnings">Max Warnings Before Action</Label>
              <Input
                id="max-warnings"
                type="number"
                value={settings.maxWarnings}
                onChange={(e) => setSettings({ ...settings, maxWarnings: Number.parseInt(e.target.value) })}
                min="1"
                max="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mute-role">Mute Role</Label>
              <Select
                value={settings.muteRole}
                onValueChange={(value) => setSettings({ ...settings, muteRole: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mute role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muted">@Muted</SelectItem>
                  <SelectItem value="timeout">@Timeout</SelectItem>
                  <SelectItem value="restricted">@Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mod-log-channel">Moderation Log Channel</Label>
            <Select
              value={settings.modLogChannel}
              onValueChange={(value) => setSettings({ ...settings, modLogChannel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select log channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mod-logs">#mod-logs</SelectItem>
                <SelectItem value="admin-logs">#admin-logs</SelectItem>
                <SelectItem value="audit-log">#audit-log</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ban className="h-5 w-5" />
            <span>Raid Protection</span>
          </CardTitle>
          <CardDescription>Protect against server raids and mass joins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Raid Protection</Label>
              <p className="text-sm text-muted-foreground">Automatically detect and prevent raids</p>
            </div>
            <Switch
              checked={settings.raidProtection}
              onCheckedChange={(checked) => setSettings({ ...settings, raidProtection: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slowmode-threshold">Slowmode Threshold (joins/minute)</Label>
            <Input
              id="slowmode-threshold"
              type="number"
              value={settings.slowModeThreshold}
              onChange={(e) => setSettings({ ...settings, slowModeThreshold: Number.parseInt(e.target.value) })}
              min="1"
              max="20"
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Protection Status</h4>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-green-600">
                <Shield className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Badge variant="secondary">0 threats blocked today</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Moderation Settings
        </Button>
      </div>
    </div>
  )
}
