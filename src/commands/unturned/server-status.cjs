/**
 * JMF Hosting Discord Bot
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const logger = require("../../utils/logger.cjs")
const config = require("../../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-status")
    .setDescription("View Unturned server status and join information")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("Server to check status for")
        .setRequired(false)
        .addChoices(
          { name: "PvP Server", value: "pvp" },
          { name: "PvE Server", value: "pve" },
          { name: "Creative Server", value: "creative" },
          { name: "All Servers", value: "all" },
        ),
    ),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const serverType = interaction.options.getString("server") || "all"
      const serverData = await this.getServerStatus(serverType, interaction.client)

      if (serverType === "all") {
        // Show all servers
        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("🎮 JMF Hosting Unturned Servers")
          .setDescription("Live server status and player information")
          .setTimestamp()
          .setFooter({ text: config.footerText })

        for (const server of serverData) {
          const statusEmoji = server.online ? "🟢" : "🔴"
          const playerInfo = server.online ? `${server.players}/${server.maxPlayers}` : "Offline"

          embed.addFields({
            name: `${statusEmoji} ${server.name}`,
            value: `**Players:** ${playerInfo}\n**Map:** ${server.map || "Unknown"}\n**Mode:** ${server.mode || "Unknown"}\n**IP:** \`${server.ip}:${server.port}\``,
            inline: true,
          })
        }

        // Add join buttons for online servers
        const components = []
        const onlineServers = serverData.filter((s) => s.online)

        if (onlineServers.length > 0) {
          const row = new ActionRowBuilder()

          for (const server of onlineServers.slice(0, 5)) {
            // Max 5 buttons per row
            row.addComponents(
              new ButtonBuilder()
                .setCustomId(`join_server_${server.id}`)
                .setLabel(`Join ${server.name}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🎮"),
            )
          }

          components.push(row)
        }

        await interaction.editReply({ embeds: [embed], components })
      } else {
        // Show specific server
        const server = serverData[0]
        if (!server) {
          return interaction.editReply({ content: "❌ Server not found." })
        }

        const statusEmoji = server.online ? "🟢" : "🔴"
        const statusText = server.online ? "Online" : "Offline"

        const embed = new EmbedBuilder()
          .setColor(server.online ? "#00FF00" : "#FF0000")
          .setTitle(`${statusEmoji} ${server.name}`)
          .setDescription(`**Status:** ${statusText}`)
          .addFields(
            { name: "👥 Players", value: `${server.players}/${server.maxPlayers}`, inline: true },
            { name: "🗺️ Map", value: server.map || "Unknown", inline: true },
            { name: "🎯 Mode", value: server.mode || "Unknown", inline: true },
            { name: "🌐 IP Address", value: `\`${server.ip}:${server.port}\``, inline: true },
            { name: "⏱️ Uptime", value: server.uptime || "Unknown", inline: true },
            { name: "📊 Performance", value: `CPU: ${server.cpu || 0}%\nRAM: ${server.ram || 0}%`, inline: true },
          )
          .setTimestamp()
          .setFooter({ text: config.footerText })

        // Add player list if available
        if (server.online && server.playerList && server.playerList.length > 0) {
          const playerNames = server.playerList
            .slice(0, 10)
            .map((p) => p.name)
            .join("\n")
          embed.addFields({
            name: "🎮 Online Players",
            value:
              playerNames + (server.playerList.length > 10 ? `\n... and ${server.playerList.length - 10} more` : ""),
            inline: false,
          })
        }

        const components = []
        if (server.online) {
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`join_server_${server.id}`)
              .setLabel(`Join ${server.name}`)
              .setStyle(ButtonStyle.Primary)
              .setEmoji("🎮"),
            new ButtonBuilder()
              .setCustomId(`refresh_server_${server.id}`)
              .setLabel("Refresh")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("🔄"),
          )

          components.push(row)
        }

        await interaction.editReply({ embeds: [embed], components })
      }
    } catch (error) {
      logger.error(`Error in server-status command: ${error.message}`)
      await interaction.editReply({ content: "❌ An error occurred while fetching server status." })
    }
  },

  async getServerStatus(serverType, client) {
    try {
      // Mock server data - replace with actual API calls
      const servers = [
        {
          id: "pvp",
          name: "PvP Server",
          ip: "192.168.1.100",
          port: 27015,
          online: true,
          players: 24,
          maxPlayers: 50,
          map: "Russia",
          mode: "PvP",
          uptime: "2d 14h 32m",
          cpu: 45,
          ram: 67,
          playerList: [
            { name: "Player1", steamId: "76561198000000001" },
            { name: "Player2", steamId: "76561198000000002" },
            { name: "Player3", steamId: "76561198000000003" },
          ],
        },
        {
          id: "pve",
          name: "PvE Server",
          ip: "192.168.1.101",
          port: 27016,
          online: true,
          players: 18,
          maxPlayers: 40,
          map: "Washington",
          mode: "PvE",
          uptime: "1d 8h 15m",
          cpu: 32,
          ram: 54,
          playerList: [
            { name: "Builder1", steamId: "76561198000000004" },
            { name: "Explorer2", steamId: "76561198000000005" },
          ],
        },
        {
          id: "creative",
          name: "Creative Server",
          ip: "192.168.1.102",
          port: 27017,
          online: false,
          players: 0,
          maxPlayers: 20,
          map: "Germany",
          mode: "Creative",
          uptime: "0m",
          cpu: 0,
          ram: 0,
          playerList: [],
        },
      ]

      if (serverType === "all") {
        return servers
      } else {
        return servers.filter((s) => s.id === serverType)
      }
    } catch (error) {
      logger.error(`Error getting server status: ${error.message}`)
      return []
    }
  },
}
