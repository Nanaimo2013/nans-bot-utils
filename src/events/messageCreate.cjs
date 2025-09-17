const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client, db) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return

    // Check if automod is enabled
    const automodConfig = await db.get("SELECT * FROM automod_config WHERE guild_id = ?", [message.guild.id])
    if (!automodConfig || !automodConfig.spam_protection) return

    // Get guild config for logging
    const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [message.guild.id])

    try {
      // Check for spam (duplicate messages)
      if (automodConfig.spam_protection) {
        await checkSpam(message, automodConfig, guildConfig, db)
      }

      // Check for excessive caps
      if (automodConfig.caps_protection) {
        await checkCaps(message, automodConfig, guildConfig, db)
      }

      // Check for links
      if (automodConfig.link_protection) {
        await checkLinks(message, automodConfig, guildConfig, db)
      }

      // Check for excessive mentions
      if (automodConfig.max_mentions > 0) {
        await checkMentions(message, automodConfig, guildConfig, db)
      }

      // Check for profanity
      if (automodConfig.profanity_filter) {
        await checkProfanity(message, automodConfig, guildConfig, db)
      }
    } catch (error) {
      console.error("Error in automod:", error)
    }
  },
}

// Spam detection
async function checkSpam(message, config, guildConfig, db) {
  const userId = message.author.id
  const guildId = message.guild.id

  // Get recent messages from this user
  const recentMessages = await db.all(
    `SELECT content FROM recent_messages 
         WHERE user_id = ? AND guild_id = ? AND created_at > datetime('now', '-30 seconds')
         ORDER BY created_at DESC LIMIT ?`,
    [userId, guildId, config.max_duplicates],
  )

  // Count duplicate messages
  const duplicates = recentMessages.filter((msg) => msg.content === message.content).length

  if (duplicates >= config.max_duplicates) {
    await takeAction(message, "Spam Detection", "Sending duplicate messages", config, guildConfig, db)
    return true
  }

  // Store this message with additional metadata
  await db.run(
    "INSERT INTO recent_messages (user_id, guild_id, content, channel_id, message_id, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
    [userId, guildId, message.content, message.channel.id, message.id],
  )

  // Clean old messages
  await db.run("DELETE FROM recent_messages WHERE created_at < datetime('now', '-5 minutes')")

  return false
}

// Caps detection
async function checkCaps(message, config, guildConfig, db) {
  const content = message.content
  if (content.length < 10) return false

  const capsCount = (content.match(/[A-Z]/g) || []).length
  const capsPercentage = (capsCount / content.length) * 100

  if (capsPercentage > 70) {
    await takeAction(message, "Excessive Caps", "Message contains too many capital letters", config, guildConfig, db)
    return true
  }

  return false
}

// Link detection
async function checkLinks(message, config, guildConfig, db) {
  const linkRegex = /(https?:\/\/[^\s]+)/gi
  const links = message.content.match(linkRegex)

  if (links && links.length > 0) {
    // Check if user has permission to post links
    if (message.member.permissions.has("ManageMessages")) return false

    await takeAction(message, "Link Detection", "Unauthorized link posting", config, guildConfig, db)
    return true
  }

  return false
}

// Mention spam detection
async function checkMentions(message, config, guildConfig, db) {
  const mentions = message.mentions.users.size + message.mentions.roles.size

  if (mentions > config.max_mentions) {
    await takeAction(message, "Mention Spam", `Too many mentions (${mentions})`, config, guildConfig, db)
    return true
  }

  return false
}

// Profanity filter
async function checkProfanity(message, config, guildConfig, db) {
  const profanityWords = [
    "badword1",
    "badword2",
    // Add more words as needed
  ]

  const content = message.content.toLowerCase()
  const foundProfanity = profanityWords.some((word) => content.includes(word))

  if (foundProfanity) {
    await takeAction(message, "Profanity Filter", "Message contains inappropriate language", config, guildConfig, db)
    return true
  }

  return false
}

// Take moderation action
async function takeAction(message, reason, details, config, guildConfig, db) {
  try {
    // Delete the message
    await message.delete()

    // Timeout the user
    if (config.timeout_duration > 0) {
      await message.member.timeout(config.timeout_duration * 1000, `Automod: ${reason}`)
    }

    // Send warning to user
    const warningEmbed = new EmbedBuilder()
      .setColor("#ff9900")
      .setTitle("⚠️ Automod Warning")
      .setDescription(`Your message was removed by automod.\n\n**Reason:** ${reason}\n**Details:** ${details}`)
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    try {
      await message.author.send({ embeds: [warningEmbed] })
    } catch (error) {
      // User has DMs disabled
    }

    // Log the action
    if (guildConfig.logs_channel) {
      const logChannel = message.guild.channels.cache.get(guildConfig.logs_channel)
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("🛡️ Automod Action")
          .addFields(
            { name: "User", value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
            { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
            { name: "Reason", value: reason, inline: true },
            { name: "Details", value: details, inline: false },
            { name: "Message Content", value: message.content.substring(0, 1000) || "No content", inline: false },
          )
          .setTimestamp()
          .setFooter({ text: "Nans Bot Utils by NansStudios" })

        await logChannel.send({ embeds: [logEmbed] })
      }
    }

    // Log to database
    await db.run(
      "INSERT INTO mod_logs (guild_id, user_id, moderator_id, action, reason, duration) VALUES (?, ?, ?, ?, ?, ?)",
      [
        message.guild.id,
        message.author.id,
        message.client.user.id,
        "automod",
        `${reason}: ${details}`,
        config.timeout_duration,
      ],
    )
  } catch (error) {
    console.error("Error taking automod action:", error)
  }
}
