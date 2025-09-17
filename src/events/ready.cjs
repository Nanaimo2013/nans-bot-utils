const { Events, ActivityType } = require("discord.js")

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`🚀 Ready! Logged in as ${client.user.tag}`)
    console.log(`📊 Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`)

    // Set bot status
    const activities = [
      { name: "your server", type: ActivityType.Watching },
      { name: "for rule violations", type: ActivityType.Watching },
      { name: "/help for commands", type: ActivityType.Listening },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
    ]

    let activityIndex = 0
    const updateActivity = () => {
      client.user.setActivity(activities[activityIndex])
      activityIndex = (activityIndex + 1) % activities.length
    }

    updateActivity()
    setInterval(updateActivity, 30000) // Change every 30 seconds

    // Initialize guild configs for all servers the bot is in
    for (const guild of client.guilds.cache.values()) {
      try {
        const existingConfig = await client.db?.get("SELECT * FROM guild_config WHERE guild_id = ?", [guild.id])

        if (!existingConfig) {
          await client.db?.run("INSERT INTO guild_config (guild_id) VALUES (?)", [guild.id])
          console.log(`✅ Initialized config for guild: ${guild.name}`)
        }

        // Initialize automod config if it doesn't exist
        const automodConfig = await client.db?.get("SELECT * FROM automod_config WHERE guild_id = ?", [guild.id])
        if (!automodConfig) {
          await client.db?.run(
            `
            INSERT INTO automod_config (guild_id, spam_protection, caps_protection, link_protection, profanity_filter, max_mentions, max_duplicates, timeout_duration) 
            VALUES (?, 1, 1, 0, 1, 5, 3, 60)
          `,
            [guild.id],
          )
          console.log(`✅ Initialized automod config for guild: ${guild.name}`)
        }
      } catch (error) {
        console.error(`❌ Error initializing guild ${guild.name}:`, error)
      }
    }

    // Clean up old data periodically
    setInterval(async () => {
      try {
        await client.db?.run("DELETE FROM recent_messages WHERE created_at < datetime('now', '-1 hour')")
        await client.db?.run("DELETE FROM deleted_messages WHERE deleted_at < datetime('now', '-30 days')")
        await client.db?.run("DELETE FROM message_edits WHERE edited_at < datetime('now', '-30 days')")
      } catch (error) {
        console.error("Error cleaning up old data:", error)
      }
    }, 3600000) // Clean every hour

    console.log("🎉 Bot is fully initialized and ready!")
  },
}
