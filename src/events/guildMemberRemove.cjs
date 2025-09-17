const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client, db) {
    try {
      const config = await db.get("SELECT leave_channel FROM guild_config WHERE guild_id = ?", [member.guild.id])

      // Leave message
      if (config?.leave_channel) {
        const leaveChannel = member.guild.channels.cache.get(config.leave_channel)
        if (leaveChannel) {
          const embed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("👋 Goodbye!")
            .setDescription(`**${member.user.tag}** has left the server.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: "Member Count", value: `${member.guild.memberCount}`, inline: true },
              {
                name: "Time in Server",
                value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown",
                inline: true,
              },
            )
            .setTimestamp()
            .setFooter({ text: "Nans Bot Utils by NansStudios" })

          await leaveChannel.send({ embeds: [embed] })
        }
      }

      // Log member leave
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [member.guild.id])
      if (guildConfig?.logs_channel) {
        const logChannel = member.guild.channels.cache.get(guildConfig.logs_channel)
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("📤 Member Left")
            .addFields(
              { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
              {
                name: "Joined",
                value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown",
                inline: true,
              },
              { name: "Member Count", value: `${member.guild.memberCount}`, inline: true },
              {
                name: "Roles",
                value:
                  member.roles.cache
                    .filter((r) => r.id !== member.guild.id)
                    .map((r) => r.name)
                    .join(", ") || "None",
                inline: false,
              },
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: "Nans Bot Utils by NansStudios" })

          await logChannel.send({ embeds: [logEmbed] })
        }
      }

      // Store member leave in database
      await db.run(
        "INSERT INTO member_leaves (guild_id, user_id, username, left_at) VALUES (?, ?, ?, datetime('now'))",
        [member.guild.id, member.id, member.user.tag],
      )
    } catch (error) {
      console.error("Error in guildMemberRemove event:", error)
    }
  },
}
