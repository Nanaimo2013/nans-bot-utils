const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildRoleCreate,
  async execute(role, client, db) {
    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [role.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = role.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("🎭 Role Created")
        .addFields(
          { name: "Role", value: `<@&${role.id}> (${role.name})`, inline: true },
          { name: "Color", value: role.hexColor || "#000000", inline: true },
          { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
          { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
          { name: "Position", value: role.position.toString(), inline: true },
          { name: "Role ID", value: role.id, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      if (role.permissions.bitfield > 0) {
        const permissions = role.permissions.toArray().slice(0, 10) // Limit to first 10 permissions
        embed.addFields({
          name: "Key Permissions",
          value: permissions.join(", ") || "None",
          inline: false,
        })
      }

      await logChannel.send({ embeds: [embed] })

      // Store role creation in database
      await db.run(
        "INSERT INTO role_logs (guild_id, role_id, action, role_name, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [role.guild.id, role.id, "created", role.name],
      )
    } catch (error) {
      console.error("Error in roleCreate event:", error)
    }
  },
}
