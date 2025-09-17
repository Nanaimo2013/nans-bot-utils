const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.ChannelCreate,
  async execute(channel, client, db) {
    // Only handle guild channels
    if (!channel.guild) return

    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [channel.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = channel.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("📝 Channel Created")
        .addFields(
          { name: "Channel", value: `<#${channel.id}> (${channel.name})`, inline: true },
          { name: "Type", value: getChannelType(channel.type), inline: true },
          { name: "Category", value: channel.parent?.name || "None", inline: true },
          { name: "Channel ID", value: channel.id, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      await logChannel.send({ embeds: [embed] })

      // Store channel creation in database
      await db.run(
        "INSERT INTO channel_logs (guild_id, channel_id, action, channel_name, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [channel.guild.id, channel.id, "created", channel.name],
      )
    } catch (error) {
      console.error("Error in channelCreate event:", error)
    }
  },
}

function getChannelType(type) {
  const types = {
    0: "Text Channel",
    2: "Voice Channel",
    4: "Category",
    5: "Announcement Channel",
    10: "News Thread",
    11: "Public Thread",
    12: "Private Thread",
    13: "Stage Channel",
    15: "Forum Channel",
  }
  return types[type] || "Unknown"
}
