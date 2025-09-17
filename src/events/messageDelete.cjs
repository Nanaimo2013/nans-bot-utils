const { EmbedBuilder, Events } = require("discord.js")

module.exports = {
  name: Events.MessageDelete,
  async execute(message, client, db) {
    // Skip if message is from a bot or in DMs
    if (message.author?.bot || !message.guild) return

    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [message.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = message.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      const embed = new EmbedBuilder()
        .setTitle("🗑️ Message Deleted")
        .setColor("#FF0000")
        .addFields(
          {
            name: "Author",
            value: `${message.author?.tag || "Unknown"} (${message.author?.id || "Unknown"})`,
            inline: true,
          },
          { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
          { name: "Message ID", value: message.id, inline: true },
          { name: "Content", value: message.content?.substring(0, 1000) || "*No content*", inline: false },
        )
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      if (message.attachments.size > 0) {
        embed.addFields({
          name: "Attachments",
          value: message.attachments.map((att) => `${att.name} (${att.size} bytes)`).join("\n"),
          inline: false,
        })
      }

      if (message.embeds.length > 0) {
        embed.addFields({
          name: "Embeds",
          value: `${message.embeds.length} embed(s)`,
          inline: true,
        })
      }

      await logChannel.send({ embeds: [embed] })

      // Store deleted message in database for audit trail
      await db.run(
        "INSERT INTO deleted_messages (guild_id, channel_id, user_id, message_id, content, deleted_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
        [message.guild.id, message.channel.id, message.author?.id, message.id, message.content],
      )
    } catch (error) {
      console.error("Error logging deleted message:", error)
    }
  },
}
