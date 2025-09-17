const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildRoleDelete,
  async execute(role, client, db) {
    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [role.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = role.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("🗑️ Role Deleted")
        .addFields(
          { name: "Role Name", value: role.name, inline: true },
          { name: "Color", value: role.hexColor || "#000000", inline: true },
          { name: "Members", value: role.members.size.toString(), inline: true },
          { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
          { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
          { name: "Role ID", value: role.id, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      await logChannel.send({ embeds: [embed] })

      // Store role deletion in database
      await db.run(
        "INSERT INTO role_logs (guild_id, role_id, action, role_name, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [role.guild.id, role.id, "deleted", role.name],
      )
    } catch (error) {
      console.error("Error in roleDelete event:", error)
    }
  },
}
