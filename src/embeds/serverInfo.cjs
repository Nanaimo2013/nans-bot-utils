/**
 * Nans Bot Utils By NansStudios
 *
 * © 2025 NansStudios. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { EmbedBuilder } = require("discord.js")

/**
 * Creates a server info embed for posting server IP and connection details
 * @param {Object} serverData - The server information
 * @returns {EmbedBuilder} The server info embed
 */
function createServerInfoEmbed(serverData = {}) {
  const {
    serverName = "Unturned Server",
    serverIP = "your-server-ip.com",
    serverPort = "27015",
    maxPlayers = "24",
    currentPlayers = "0",
    gameMode = "PvP",
    map = "Washington",
    version = "3.23.8.0",
    mods = [],
    rules = [],
    features = [],
    status = "online",
    uptime = "99.9%",
    lastWipe = null,
    nextWipe = null,
    adminContact = "Create a ticket for admin support",
  } = serverData

  // Determine status color and emoji
  let statusColor, statusEmoji
  switch (status.toLowerCase()) {
    case "online":
      statusColor = "#00FF00"
      statusEmoji = "🟢"
      break
    case "offline":
      statusColor = "#FF0000"
      statusEmoji = "🔴"
      break
    case "maintenance":
      statusColor = "#FFA500"
      statusEmoji = "🟡"
      break
    default:
      statusColor = "#808080"
      statusEmoji = "⚪"
  }

  const serverInfoEmbed = new EmbedBuilder()
    .setTitle(`🎮 ${serverName}`)
    .setColor(statusColor)
    .setDescription(
      `**Status:** ${statusEmoji} ${status.charAt(0).toUpperCase() + status.slice(1)}\n\nJoin our Unturned server for an amazing gaming experience!`,
    )
    .addFields(
      {
        name: "🌐 Connection Info",
        value: `**IP:** \`${serverIP}:${serverPort}\`\n**Players:** ${currentPlayers}/${maxPlayers}\n**Map:** ${map}\n**Game Mode:** ${gameMode}`,
        inline: true,
      },
      {
        name: "📊 Server Stats",
        value: `**Version:** ${version}\n**Uptime:** ${uptime}\n**Mods:** ${mods.length > 0 ? mods.length : "Vanilla"}`,
        inline: true,
      },
      {
        name: "⚙️ Server Features",
        value:
          features.length > 0
            ? features.map((feature) => `• ${feature}`).join("\n")
            : "• Custom gameplay experience\n• Active admin support\n• Regular events\n• Fair play enforcement",
        inline: false,
      },
    )

  // Add mods if available
  if (mods.length > 0) {
    const modList = mods
      .slice(0, 10)
      .map((mod) => `• ${mod}`)
      .join("\n")
    const extraMods = mods.length > 10 ? `\n*...and ${mods.length - 10} more mods*` : ""

    serverInfoEmbed.addFields({
      name: "🔧 Installed Mods",
      value: modList + extraMods,
      inline: false,
    })
  }

  // Add server rules if available
  if (rules.length > 0) {
    const rulesList = rules
      .slice(0, 5)
      .map((rule, index) => `${index + 1}. ${rule}`)
      .join("\n")
    const extraRules = rules.length > 5 ? `\n*...and ${rules.length - 5} more rules*` : ""

    serverInfoEmbed.addFields({
      name: "📜 Server Rules",
      value: rulesList + extraRules,
      inline: false,
    })
  }

  // Add wipe information if available
  if (lastWipe || nextWipe) {
    let wipeInfo = ""
    if (lastWipe) {
      wipeInfo += `**Last Wipe:** <t:${Math.floor(new Date(lastWipe).getTime() / 1000)}:R>\n`
    }
    if (nextWipe) {
      wipeInfo += `**Next Wipe:** <t:${Math.floor(new Date(nextWipe).getTime() / 1000)}:R>`
    }

    serverInfoEmbed.addFields({
      name: "🔄 Wipe Schedule",
      value: wipeInfo,
      inline: false,
    })
  }

  serverInfoEmbed.addFields({
    name: "📞 Need Help?",
    value: adminContact,
    inline: false,
  })

  serverInfoEmbed.setFooter({
    text: "Nans Bot Utils By NansStudios | Server Info",
  })

  serverInfoEmbed.setTimestamp()

  return serverInfoEmbed
}

module.exports = { createServerInfoEmbed }
