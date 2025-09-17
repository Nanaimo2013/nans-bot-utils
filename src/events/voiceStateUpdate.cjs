const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState, client, db) {
    try {
      // Get guild config for logs channel
      const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [newState.guild.id])

      if (!guildConfig?.logs_channel) return

      const logChannel = newState.guild.channels.cache.get(guildConfig.logs_channel)
      if (!logChannel) return

      const member = newState.member
      let embed

      // User joined a voice channel
      if (!oldState.channel && newState.channel) {
        embed = new EmbedBuilder()
          .setTitle("🔊 Voice Channel Joined")
          .setColor("#00FF00")
          .addFields(
            { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
            { name: "Channel", value: `<#${newState.channel.id}>`, inline: true },
            { name: "Members in Channel", value: newState.channel.members.size.toString(), inline: true },
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: "Nans Bot Utils by NansStudios" })

        // Log voice join to database
        await db.run(
          "INSERT INTO voice_logs (guild_id, user_id, channel_id, action, timestamp) VALUES (?, ?, ?, ?, datetime('now'))",
          [newState.guild.id, member.id, newState.channel.id, "joined"],
        )
      }
      // User left a voice channel
      else if (oldState.channel && !newState.channel) {
        embed = new EmbedBuilder()
          .setTitle("🔇 Voice Channel Left")
          .setColor("#FF0000")
          .addFields(
            { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
            { name: "Channel", value: `<#${oldState.channel.id}>`, inline: true },
            { name: "Members in Channel", value: oldState.channel.members.size.toString(), inline: true },
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: "Nans Bot Utils by NansStudios" })

        // Log voice leave to database
        await db.run(
          "INSERT INTO voice_logs (guild_id, user_id, channel_id, action, timestamp) VALUES (?, ?, ?, ?, datetime('now'))",
          [oldState.guild.id, member.id, oldState.channel.id, "left"],
        )
      }
      // User switched voice channels
      else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        embed = new EmbedBuilder()
          .setTitle("🔄 Voice Channel Switched")
          .setColor("#FFA500")
          .addFields(
            { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
            { name: "From", value: `<#${oldState.channel.id}>`, inline: true },
            { name: "To", value: `<#${newState.channel.id}>`, inline: true },
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: "Nans Bot Utils by NansStudios" })

        // Log voice switch to database
        await db.run(
          "INSERT INTO voice_logs (guild_id, user_id, channel_id, action, timestamp, old_channel_id) VALUES (?, ?, ?, ?, datetime('now'), ?)",
          [newState.guild.id, member.id, newState.channel.id, "switched", oldState.channel.id],
        )
      }
      // User muted/unmuted or deafened/undeafened
      else if (oldState.channel && newState.channel && oldState.channel.id === newState.channel.id) {
        const changes = []

        if (oldState.mute !== newState.mute) {
          changes.push(`${newState.mute ? "Muted" : "Unmuted"}`)
        }
        if (oldState.deaf !== newState.deaf) {
          changes.push(`${newState.deaf ? "Deafened" : "Undeafened"}`)
        }
        if (oldState.selfMute !== newState.selfMute) {
          changes.push(`${newState.selfMute ? "Self-muted" : "Self-unmuted"}`)
        }
        if (oldState.selfDeaf !== newState.selfDeaf) {
          changes.push(`${newState.selfDeaf ? "Self-deafened" : "Self-undeafened"}`)
        }

        if (changes.length > 0) {
          embed = new EmbedBuilder()
            .setTitle("🎙️ Voice State Changed")
            .setColor("#0099ff")
            .addFields(
              { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
              { name: "Channel", value: `<#${newState.channel.id}>`, inline: true },
              { name: "Changes", value: changes.join(", "), inline: true },
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: "Nans Bot Utils by NansStudios" })
        }
      }

      if (embed) {
        await logChannel.send({ embeds: [embed] })
      }
    } catch (error) {
      console.error("Error logging voice state update:", error)
    }
  },
}
