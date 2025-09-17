const { EmbedBuilder, Events } = require("discord.js")

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage, client, db) {
    // Skip if message is from a bot, in DMs, or content didn't change
    if (newMessage.author?.bot || !newMessage.guild || oldMessage.content === newMessage.content) return

    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [
        newMessage.guild.id,
      ])

      if (!guildConfig?.logs_channel) return

      const logChannel = newMessage.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      const embed = new EmbedBuilder()
        .setTitle("✏️ Message Edited")
        .setColor("#FFA500")
        .addFields(
          { name: "Author", value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
          { name: "Channel", value: `<#${newMessage.channel.id}>`, inline: true },
          { name: "Message ID", value: newMessage.id, inline: true },
          { name: "Before", value: oldMessage.content?.substring(0, 500) || "*No content*", inline: false },
          { name: "After", value: newMessage.content?.substring(0, 500) || "*No content*", inline: false },
          { name: "Jump to Message", value: `[Click here](${newMessage.url})`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      await logChannel.send({ embeds: [embed] })

      // Store message edit in database for audit trail
      await db.run(
        "INSERT INTO message_edits (guild_id, channel_id, user_id, message_id, old_content, new_content, edited_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
        [
          newMessage.guild.id,
          newMessage.channel.id,
          newMessage.author.id,
          newMessage.id,
          oldMessage.content,
          newMessage.content,
        ],
      )
    } catch (error) {
      console.error("Error logging edited message:", error)
    }
  },
}
