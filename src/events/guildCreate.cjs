const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client, db) {
    console.log(`🎉 Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`)

    try {
      // Initialize guild configuration with default values
      await db.run(`INSERT OR IGNORE INTO guild_config (guild_id, prefix, welcome_message) VALUES (?, ?, ?)`, [
        guild.id,
        "!",
        "Welcome to **{server}**, {user}! We're glad to have you here. 🎉",
      ])

      // Initialize automod configuration with sensible defaults
      await db.run(
        `INSERT OR IGNORE INTO automod_config (
          guild_id, spam_protection, caps_protection, link_protection, 
          profanity_filter, max_mentions, max_duplicates, timeout_duration
        ) VALUES (?, 1, 1, 0, 1, 5, 3, 60)`,
        [guild.id],
      )

      console.log(`✅ Initialized configuration for ${guild.name}`)

      // Send a welcome message to the guild owner or system channel
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("🎉 Thanks for adding Nans Bot Utils!")
        .setDescription(
          `Hello! I'm **Nans Bot Utils**, your new server management assistant.\n\n` +
            `**Getting Started:**\n` +
            `• Use \`/help\` to see all available commands\n` +
            `• Set up logging with \`/config logs #channel\`\n` +
            `• Configure welcome messages with \`/config welcome\`\n` +
            `• Set up automod with \`/automod setup\`\n` +
            `• Create ticket system with \`/ticket setup\`\n\n` +
            `**Need Help?**\n` +
            `Join our support server or check the documentation for detailed setup guides.`,
        )
        .addFields(
          { name: "Server Info", value: `**${guild.name}**\n${guild.memberCount} members`, inline: true },
          { name: "Bot Features", value: "Moderation, Tickets, Logging,\nWelcome System, Automod", inline: true },
        )
        .setThumbnail(guild.iconURL() || client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      // Try to send to system channel first, then owner
      const welcomeChannel = guild.systemChannel
      if (!welcomeChannel && guild.ownerId) {
        try {
          const owner = await guild.fetchOwner()
          await owner.send({ embeds: [welcomeEmbed] })
          console.log(`📨 Sent welcome DM to ${guild.name} owner`)
          return
        } catch (error) {
          console.log(`❌ Could not DM owner of ${guild.name}`)
        }
      }

      if (welcomeChannel) {
        try {
          await welcomeChannel.send({ embeds: [welcomeEmbed] })
          console.log(`📨 Sent welcome message to ${guild.name} system channel`)
        } catch (error) {
          console.log(`❌ Could not send welcome message to ${guild.name} system channel`)
        }
      }
    } catch (error) {
      console.error(`❌ Error initializing guild ${guild.name}:`, error)
    }
  },
}
