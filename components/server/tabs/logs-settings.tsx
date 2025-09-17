"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, FileText, Eye, MessageSquare, UserPlus, Settings } from "lucide-react"

interface LogsSettingsProps {
  serverId: string
}

export function LogsSettings({ serverId }: LogsSettingsProps) {
  const [settings, setSettings] = useState({
    loggingEnabled: true,
    messageLogsEnabled: true,
    memberLogsEnabled: true,
    moderationLogsEnabled: true,
    serverLogsEnabled: true,
    voiceLogsEnabled: false,
    messageLogChannel: "",
    memberLogChannel: "",
    moderationLogChannel: "",
    serverLogChannel: "",
    voiceLogChannel: "",
    logDeletedMessages: true,
    logEditedMessages: true,
    logBulkDeletes: true,
    ignoreBots: true,
  })

  const logTypes = [
    {
      key: "messageLogsEnabled",
      title: "Message Logs",
      description: "Log message edits, deletions, and bulk deletes",
      icon: MessageSquare,
      channelKey: "messageLogChannel",
    },
    {
      key: "memberLogsEnabled",
      title: "Member Logs",
      description: "Log member joins, leaves, and profile changes",
      icon: UserPlus,
      channelKey: "memberLogChannel",
    },
    {
      key: "moderationLogsEnabled",
      title: "Moderation Logs",
      description: "Log bans, kicks, mutes, and warnings",
      icon: Eye,
      channelKey: "moderationLogChannel",
    },
    {
      key: "serverLogsEnabled",
      title: "Server Logs",
      description: "Log server settings changes and role updates",
      icon: Settings,
      channelKey: "serverLogChannel",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Logging System</span>
          </CardTitle>
          <CardDescription>Configure comprehensive logging for server events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Master Logging</Label>
              <p className="text-sm text-muted-foreground">Enable logging system for this server</p>
            </div>
            <Switch
              checked={settings.loggingEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, loggingEnabled: checked })}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Logging Status</h4>
              <Badge variant={settings.loggingEnabled ? "default" : "secondary"}>
                {settings.loggingEnabled ? "Active" : "Disabled"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {settings.loggingEnabled
                ? "Logging system is active and monitoring server events"
                : "Logging system is disabled - no events will be recorded"}
            </p>
          </div>
        </CardContent>
      </Card>

      {logTypes.map((logType) => (
        <Card key={logType.key}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <logType.icon className="h-5 w-5" />
              <span>{logType.title}</span>
            </CardTitle>
            <CardDescription>{logType.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{logType.title}</Label>
                <p className="text-sm text-muted-foreground">Enable {logType.title.toLowerCase()}</p>
              </div>
              <Switch
                checked={settings[logType.key as keyof typeof settings] as boolean}
                onCheckedChange={(checked) => setSettings({ ...settings, [logType.key]: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={logType.channelKey}>Log Channel</Label>
              <Select
                value={settings[logType.channelKey as keyof typeof settings] as string}
                onValueChange={(value) => setSettings({ ...settings, [logType.channelKey]: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select log channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit-log">#audit-log</SelectItem>
                  <SelectItem value="mod-logs">#mod-logs</SelectItem>
                  <SelectItem value="server-logs">#server-logs</SelectItem>
                  <SelectItem value="bot-logs">#bot-logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Message Logging Options</CardTitle>
          <CardDescription>Configure specific message logging behaviors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Deleted Messages</Label>
                <p className="text-xs text-muted-foreground">Log when messages are deleted</p>
              </div>
              <Switch
                checked={settings.logDeletedMessages}
                onCheckedChange={(checked) => setSettings({ ...settings, logDeletedMessages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Edited Messages</Label>
                <p className="text-xs text-muted-foreground">Log when messages are edited</p>
              </div>
              <Switch
                checked={settings.logEditedMessages}
                onCheckedChange={(checked) => setSettings({ ...settings, logEditedMessages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Bulk Deletes</Label>
                <p className="text-xs text-muted-foreground">Log bulk message deletions</p>
              </div>
              <Switch
                checked={settings.logBulkDeletes}
                onCheckedChange={(checked) => setSettings({ ...settings, logBulkDeletes: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Ignore Bots</Label>
                <p className="text-xs text-muted-foreground">Don't log bot messages</p>
              </div>
              <Switch
                checked={settings.ignoreBots}
                onCheckedChange={(checked) => setSettings({ ...settings, ignoreBots: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Log Activity</CardTitle>
          <CardDescription>Overview of recent logging activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Messages logged today</span>
              <Badge variant="outline">1,247</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Member events logged</span>
              <Badge variant="outline">23</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Moderation actions logged</span>
              <Badge variant="outline">5</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Server changes logged</span>
              <Badge variant="outline">2</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Logging Settings
        </Button>
      </div>
    </div>
  )
}
