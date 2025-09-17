const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildBanRemove,
  async execute(ban, client, db) {
    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [ban.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = ban.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      // Try to get audit log entry for unban moderator
      let moderator = "Unknown"

      try {
        const auditLogs = await ban.guild.fetchAuditLogs({
          type: 23, // MEMBER_BAN_REMOVE
          limit: 1,
        })

        const unbanLog = auditLogs.entries.first()
        if (unbanLog && unbanLog.target.id === ban.user.id && Date.now() - unbanLog.createdTimestamp < 5000) {
          moderator = unbanLog.executor.tag
        }
      } catch (error) {
        console.error("Error fetching audit logs for unban:", error)
      }

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("🔓 Member Unbanned")
        .addFields(
          { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: true },
          { name: "Moderator", value: moderator, inline: true },
          { name: "Account Created", value: `<t:${Math.floor(ban.user.createdTimestamp / 1000)}:R>`, inline: true },
        )
        .setThumbnail(ban.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      await logChannel.send({ embeds: [embed] })

      // Store unban in database
      await db.run(
        "INSERT INTO mod_logs (guild_id, user_id, moderator_id, action, reason, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))",
        [ban.guild.id, ban.user.id, moderator, "unban", "User unbanned"],
      )
    } catch (error) {
      console.error("Error in guildBanRemove event:", error)
    }
  },
}
