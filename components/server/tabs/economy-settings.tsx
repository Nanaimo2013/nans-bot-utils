"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Coins, Gift, TrendingUp } from "lucide-react"

interface EconomySettingsProps {
  serverId: string
}

export function EconomySettings({ serverId }: EconomySettingsProps) {
  const [settings, setSettings] = useState({
    economyEnabled: true,
    currencyName: "coins",
    currencySymbol: "🪙",
    dailyRewardMin: 100,
    dailyRewardMax: 500,
    workRewardMin: 50,
    workRewardMax: 200,
    workCooldown: 3600, // 1 hour in seconds
    dailyCooldown: 86400, // 24 hours in seconds
    startingBalance: 1000,
    bankInterest: 5,
    shopEnabled: true,
    gamblingEnabled: false,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Economy System</span>
          </CardTitle>
          <CardDescription>Configure the server economy and currency system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Economy System</Label>
              <p className="text-sm text-muted-foreground">Enable economy features for this server</p>
            </div>
            <Switch
              checked={settings.economyEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, economyEnabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency-name">Currency Name</Label>
              <Input
                id="currency-name"
                value={settings.currencyName}
                onChange={(e) => setSettings({ ...settings, currencyName: e.target.value })}
                placeholder="coins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency-symbol">Currency Symbol</Label>
              <Input
                id="currency-symbol"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                placeholder="🪙"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="starting-balance">Starting Balance</Label>
            <Input
              id="starting-balance"
              type="number"
              value={settings.startingBalance}
              onChange={(e) => setSettings({ ...settings, startingBalance: Number.parseInt(e.target.value) })}
              min="0"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Daily Rewards</span>
          </CardTitle>
          <CardDescription>Configure daily reward amounts and cooldowns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-min">Daily Reward Min</Label>
              <Input
                id="daily-min"
                type="number"
                value={settings.dailyRewardMin}
                onChange={(e) => setSettings({ ...settings, dailyRewardMin: Number.parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily-max">Daily Reward Max</Label>
              <Input
                id="daily-max"
                type="number"
                value={settings.dailyRewardMax}
                onChange={(e) => setSettings({ ...settings, dailyRewardMax: Number.parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily-cooldown">Daily Cooldown (hours)</Label>
            <Input
              id="daily-cooldown"
              type="number"
              value={settings.dailyCooldown / 3600}
              onChange={(e) => setSettings({ ...settings, dailyCooldown: Number.parseInt(e.target.value) * 3600 })}
              min="1"
              max="48"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Work System</span>
          </CardTitle>
          <CardDescription>Configure work command rewards and cooldowns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-min">Work Reward Min</Label>
              <Input
                id="work-min"
                type="number"
                value={settings.workRewardMin}
                onChange={(e) => setSettings({ ...settings, workRewardMin: Number.parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work-max">Work Reward Max</Label>
              <Input
                id="work-max"
                type="number"
                value={settings.workRewardMax}
                onChange={(e) => setSettings({ ...settings, workRewardMax: Number.parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work-cooldown">Work Cooldown (minutes)</Label>
            <Input
              id="work-cooldown"
              type="number"
              value={settings.workCooldown / 60}
              onChange={(e) => setSettings({ ...settings, workCooldown: Number.parseInt(e.target.value) * 60 })}
              min="1"
              max="1440"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
          <CardDescription>Enable or disable additional economy features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Shop System</Label>
              <p className="text-sm text-muted-foreground">Allow users to buy items with currency</p>
            </div>
            <Switch
              checked={settings.shopEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, shopEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Gambling Commands</Label>
              <p className="text-sm text-muted-foreground">Enable gambling features (use with caution)</p>
            </div>
            <Switch
              checked={settings.gamblingEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, gamblingEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-interest">Bank Interest Rate (%)</Label>
            <Input
              id="bank-interest"
              type="number"
              value={settings.bankInterest}
              onChange={(e) => setSettings({ ...settings, bankInterest: Number.parseInt(e.target.value) })}
              min="0"
              max="100"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Economy Settings
        </Button>
      </div>
    </div>
  )
}
