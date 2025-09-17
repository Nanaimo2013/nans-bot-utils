const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildBanAdd,
  async execute(ban, client, db) {
    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [ban.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = ban.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      // Try to get audit log entry for ban reason and moderator
      let moderator = "Unknown"
      let reason = ban.reason || "No reason provided"

      try {
        const auditLogs = await ban.guild.fetchAuditLogs({
          type: 22, // MEMBER_BAN_ADD
          limit: 1,
        })

        const banLog = auditLogs.entries.first()
        if (banLog && banLog.target.id === ban.user.id && Date.now() - banLog.createdTimestamp < 5000) {
          moderator = banLog.executor.tag
          reason = banLog.reason || "No reason provided"
        }
      } catch (error) {
        console.error("Error fetching audit logs for ban:", error)
      }

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("🔨 Member Banned")
        .addFields(
          { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: true },
          { name: "Moderator", value: moderator, inline: true },
          { name: "Reason", value: reason.substring(0, 1000), inline: false },
          { name: "Account Created", value: `<t:${Math.floor(ban.user.createdTimestamp / 1000)}:R>`, inline: true },
        )
        .setThumbnail(ban.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      await logChannel.send({ embeds: [embed] })

      // Store ban in database
      await db.run(
        "INSERT INTO mod_logs (guild_id, user_id, moderator_id, action, reason, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))",
        [ban.guild.id, ban.user.id, moderator, "ban", reason],
      )
    } catch (error) {
      console.error("Error in guildBanAdd event:", error)
    }
  },
}
