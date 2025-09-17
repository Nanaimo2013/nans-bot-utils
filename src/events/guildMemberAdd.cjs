const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client, db) {
    try {
      const config = await db.get(
        "SELECT welcome_channel, welcome_message, auto_role FROM guild_config WHERE guild_id = ?",
        [member.guild.id],
      )

      // Auto-role assignment
      if (config?.auto_role) {
        try {
          const role = member.guild.roles.cache.get(config.auto_role)
          if (role && role.position < member.guild.members.me.roles.highest.position) {
            await member.roles.add(role, "Auto-role on join")
          }
        } catch (error) {
          console.error("Error assigning auto-role:", error)
        }
      }

      // Welcome message
      if (config?.welcome_channel) {
        const welcomeChannel = member.guild.channels.cache.get(config.welcome_channel)
        if (welcomeChannel) {
          const welcomeMessage =
            config.welcome_message || `Welcome to **{server}**, {user}! We're glad to have you here. 🎉`

          // Process message variables
          const processedMessage = welcomeMessage
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{username}/g, member.displayName)
            .replace(/{server}/g, member.guild.name)
            .replace(/{membercount}/g, member.guild.memberCount.toString())
            .replace(/{date}/g, new Date().toLocaleDateString())

          const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("👋 Welcome!")
            .setDescription(processedMessage)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: "Member Count", value: `${member.guild.memberCount}`, inline: true },
              {
                name: "Account Created",
                value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                inline: true,
              },
              { name: "Joined Server", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: "Nans Bot Utils by NansStudios" })

          // Add server icon if available
          if (member.guild.iconURL()) {
            embed.setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
          }

          await welcomeChannel.send({ embeds: [embed] })
        }
      }

      // Log member join
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [member.guild.id])
      if (guildConfig?.logs_channel) {
        const logChannel = member.guild.channels.cache.get(guildConfig.logs_channel)
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("📥 Member Joined")
            .addFields(
              { name: "User", value: `<@${member.id}> (${member.user.tag})`, inline: true },
              { name: "Account Age", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
              { name: "Member Count", value: `${member.guild.memberCount}`, inline: true },
              { name: "User ID", value: member.id, inline: true },
              { name: "Bot Account", value: member.user.bot ? "Yes" : "No", inline: true },
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: "Nans Bot Utils by NansStudios" })

          await logChannel.send({ embeds: [logEmbed] })
        }
      }

      // Store member join in database
      await db.run(
        "INSERT INTO member_joins (guild_id, user_id, username, joined_at) VALUES (?, ?, ?, datetime('now'))",
        [member.guild.id, member.id, member.user.tag],
      )
    } catch (error) {
      console.error("Error in guildMemberAdd event:", error)
    }
  },
}
