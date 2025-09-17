"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModerationSettings } from "./tabs/moderation-settings"
import { EconomySettings } from "./tabs/economy-settings"
import { LevelingSettings } from "./tabs/leveling-settings"
import { AISettings } from "./tabs/ai-settings"
import { GeneralSettings } from "./tabs/general-settings"
import { LogsSettings } from "./tabs/logs-settings"

interface ServerTabsProps {
  serverId: string
  server: any
}

export function ServerTabs({ serverId, server }: ServerTabsProps) {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="moderation">Moderation</TabsTrigger>
        <TabsTrigger value="economy">Economy</TabsTrigger>
        <TabsTrigger value="leveling">Leveling</TabsTrigger>
        <TabsTrigger value="ai">AI Features</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettings serverId={serverId} server={server} />
      </TabsContent>

      <TabsContent value="moderation">
        <ModerationSettings serverId={serverId} />
      </TabsContent>

      <TabsContent value="economy">
        <EconomySettings serverId={serverId} />
      </TabsContent>

      <TabsContent value="leveling">
        <LevelingSettings serverId={serverId} />
      </TabsContent>

      <TabsContent value="ai">
        <AISettings serverId={serverId} />
      </TabsContent>

      <TabsContent value="logs">
        <LogsSettings serverId={serverId} />
      </TabsContent>
    </Tabs>
  )
}
