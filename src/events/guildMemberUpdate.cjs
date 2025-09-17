const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember, client, db) {
    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [newMember.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = newMember.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      const changes = []
      let embed

      // Check for nickname changes
      if (oldMember.nickname !== newMember.nickname) {
        changes.push({
          field: "Nickname",
          old: oldMember.nickname || "None",
          new: newMember.nickname || "None",
        })
      }

      // Check for role changes
      const oldRoles = oldMember.roles.cache
      const newRoles = newMember.roles.cache

      const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id))
      const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id))

      if (addedRoles.size > 0) {
        changes.push({
          field: "Roles Added",
          old: "",
          new: addedRoles.map((role) => role.name).join(", "),
        })
      }

      if (removedRoles.size > 0) {
        changes.push({
          field: "Roles Removed",
          old: removedRoles.map((role) => role.name).join(", "),
          new: "",
        })
      }

      // Check for timeout changes
      if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
        const oldTimeout = oldMember.communicationDisabledUntil
        const newTimeout = newMember.communicationDisabledUntil

        if (!oldTimeout && newTimeout) {
          changes.push({
            field: "Timeout",
            old: "None",
            new: `Until <t:${Math.floor(newTimeout.getTime() / 1000)}:F>`,
          })
        } else if (oldTimeout && !newTimeout) {
          changes.push({
            field: "Timeout",
            old: "Active",
            new: "Removed",
          })
        }
      }

      if (changes.length > 0) {
        embed = new EmbedBuilder()
          .setColor("#ffa500")
          .setTitle("👤 Member Updated")
          .addFields({ name: "User", value: `<@${newMember.id}> (${newMember.user.tag})`, inline: true })
          .setThumbnail(newMember.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: "Nans Bot Utils by NansStudios" })

        // Add change fields
        changes.forEach((change) => {
          if (change.old && change.new) {
            embed.addFields({
              name: change.field,
              value: `**Before:** ${change.old}\n**After:** ${change.new}`,
              inline: false,
            })
          } else if (change.new) {
            embed.addFields({ name: change.field, value: change.new, inline: false })
          } else if (change.old) {
            embed.addFields({ name: change.field, value: `Removed: ${change.old}`, inline: false })
          }
        })

        await logChannel.send({ embeds: [embed] })

        // Store member update in database
        await db.run(
          "INSERT INTO member_updates (guild_id, user_id, changes, timestamp) VALUES (?, ?, ?, datetime('now'))",
          [newMember.guild.id, newMember.id, JSON.stringify(changes)],
        )
      }
    } catch (error) {
      console.error("Error in guildMemberUpdate event:", error)
    }
  },
}
