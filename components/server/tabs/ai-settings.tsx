"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Save, Brain, MessageSquare, Shield } from "lucide-react"

interface AISettingsProps {
  serverId: string
}

export function AISettings({ serverId }: AISettingsProps) {
  const [settings, setSettings] = useState({
    aiEnabled: false,
    aiModel: "gpt-3.5-turbo",
    aiPersonality: "friendly",
    customPrompt: "",
    aiModerationEnabled: true,
    aiChatEnabled: true,
    aiChannel: "",
    maxTokens: 150,
    temperature: 0.7,
    aiPrefix: "@bot",
    autoRespond: false,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Integration</span>
          </CardTitle>
          <CardDescription>Configure AI-powered features for your server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>AI Features</Label>
              <p className="text-sm text-muted-foreground">Enable AI-powered bot features</p>
            </div>
            <Switch
              checked={settings.aiEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select value={settings.aiModel} onValueChange={(value) => setSettings({ ...settings, aiModel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-personality">AI Personality</Label>
              <Select
                value={settings.aiPersonality}
                onValueChange={(value) => setSettings({ ...settings, aiPersonality: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="helpful">Helpful</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Custom AI Prompt</Label>
            <Textarea
              id="custom-prompt"
              value={settings.customPrompt}
              onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
              placeholder="You are a helpful Discord bot assistant..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>AI Chat</span>
          </CardTitle>
          <CardDescription>Configure AI chat functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>AI Chat</Label>
              <p className="text-sm text-muted-foreground">Allow users to chat with AI</p>
            </div>
            <Switch
              checked={settings.aiChatEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, aiChatEnabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prefix">AI Trigger Prefix</Label>
              <Input
                id="ai-prefix"
                value={settings.aiPrefix}
                onChange={(e) => setSettings({ ...settings, aiPrefix: e.target.value })}
                placeholder="@bot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-channel">AI Chat Channel</Label>
              <Select
                value={settings.aiChannel}
                onValueChange={(value) => setSettings({ ...settings, aiChannel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Channel</SelectItem>
                  <SelectItem value="ai-chat">#ai-chat</SelectItem>
                  <SelectItem value="bot-commands">#bot-commands</SelectItem>
                  <SelectItem value="general">#general</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Respond</Label>
              <p className="text-sm text-muted-foreground">Automatically respond to mentions</p>
            </div>
            <Switch
              checked={settings.autoRespond}
              onCheckedChange={(checked) => setSettings({ ...settings, autoRespond: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>AI Moderation</span>
          </CardTitle>
          <CardDescription>Use AI to help moderate content automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>AI Moderation</Label>
              <p className="text-sm text-muted-foreground">Use AI to detect inappropriate content</p>
            </div>
            <Switch
              checked={settings.aiModerationEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, aiModerationEnabled: checked })}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">AI Moderation Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Toxicity detection</li>
              <li>• Spam identification</li>
              <li>• Context-aware content filtering</li>
              <li>• Sentiment analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced AI Settings</CardTitle>
          <CardDescription>Fine-tune AI behavior and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: Number.parseInt(e.target.value) })}
                min="50"
                max="500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: Number.parseFloat(e.target.value) })}
                min="0"
                max="2"
              />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> AI features require an OpenAI API key to be configured in the bot settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save AI Settings
        </Button>
      </div>
    </div>
  )
}
