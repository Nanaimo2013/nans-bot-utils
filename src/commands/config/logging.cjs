const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logging")
    .setDescription("Configure logging channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand.setName("setup").setDescription("Setup all logging channels"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set a specific logging channel")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Type of logging channel")
            .setRequired(true)
            .addChoices(
              { name: "Moderation Logs", value: "mod_logs" },
              { name: "Server Logs", value: "server_logs" },
              { name: "Join/Leave Logs", value: "member_logs" },
              { name: "Message Logs", value: "message_logs" },
              { name: "Voice Logs", value: "voice_logs" },
              { name: "Ticket Logs", value: "ticket_logs" },
              { name: "Automod Logs", value: "automod_logs" },
              { name: "Command Logs", value: "command_logs" },
            ),
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to use for logging")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View current logging configuration")),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "setup":
        await this.handleSetup(interaction)
        break
      case "set":
        await this.handleSet(interaction)
        break
      case "view":
        await this.handleView(interaction)
        break
    }
  },

  async handleSetup(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const guild = interaction.guild
      const logChannels = {}

      // Create logging category if it doesn't exist
      let logCategory = guild.channels.cache.find(
        (channel) => channel.type === ChannelType.GuildCategory && channel.name === "📋 Logs",
      )

      if (!logCategory) {
        logCategory = await guild.channels.create({
          name: "📋 Logs",
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: ["ViewChannel"],
            },
          ],
        })
      }

      // Create all logging channels
      const channelTypes = [
        { name: "mod-logs", emoji: "🔨", description: "Moderation actions" },
        { name: "server-logs", emoji: "🖥️", description: "Server management" },
        { name: "member-logs", emoji: "👥", description: "Member join/leave" },
        { name: "message-logs", emoji: "💬", description: "Message edits/deletes" },
        { name: "voice-logs", emoji: "🔊", description: "Voice channel activity" },
        { name: "ticket-logs", emoji: "🎫", description: "Ticket system" },
        { name: "automod-logs", emoji: "🤖", description: "Automod actions" },
        { name: "command-logs", emoji: "⚡", description: "Command usage" },
      ]

      for (const channelType of channelTypes) {
        let channel = guild.channels.cache.find((ch) => ch.name === channelType.name)

        if (!channel) {
          channel = await guild.channels.create({
            name: channelType.name,
            type: ChannelType.GuildText,
            parent: logCategory,
            topic: `${channelType.description} - Managed by Nans Bot Utils`,
            permissionOverwrites: [
              {
                id: guild.roles.everyone,
                deny: ["SendMessages", "ViewChannel"],
              },
            ],
          })
        }

        logChannels[channelType.name.replace("-", "_")] = channel.id
      }

      // Save to database/config
      await this.saveLoggingConfig(interaction.guild.id, logChannels)

      const embed = new EmbedBuilder()
        .setTitle("✅ Logging Setup Complete")
        .setColor("#00FF00")
        .setDescription("All logging channels have been created and configured!")
        .addFields(
          ...channelTypes.map((type) => ({
            name: `${type.emoji} ${type.name}`,
            value: `<#${logChannels[type.name.replace("-", "_")]}>`,
            inline: true,
          })),
        )
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error("Logging setup error:", error)
      await interaction.editReply({
        content: `❌ Error setting up logging: ${error.message}`,
      })
    }
  },

  async handleSet(interaction) {
    const type = interaction.options.getString("type")
    const channel = interaction.options.getChannel("channel")

    try {
      // Save to database/config
      await this.saveLoggingChannel(interaction.guild.id, type, channel.id)

      const embed = new EmbedBuilder()
        .setTitle("✅ Logging Channel Set")
        .setColor("#00FF00")
        .addFields(
          { name: "Type", value: type.replace("_", " ").toUpperCase(), inline: true },
          { name: "Channel", value: `<#${channel.id}>`, inline: true },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      console.error("Set logging channel error:", error)
      await interaction.reply({
        content: `❌ Error setting logging channel: ${error.message}`,
        ephemeral: true,
      })
    }
  },

  async handleView(interaction) {
    try {
      const config = await this.getLoggingConfig(interaction.guild.id)

      const embed = new EmbedBuilder()
        .setTitle("📋 Current Logging Configuration")
        .setColor("#0099FF")
        .setDescription("Here are your current logging channel settings:")
        .setTimestamp()

      const logTypes = [
        { key: "mod_logs", name: "🔨 Moderation Logs" },
        { key: "server_logs", name: "🖥️ Server Logs" },
        { key: "member_logs", name: "👥 Member Logs" },
        { key: "message_logs", name: "💬 Message Logs" },
        { key: "voice_logs", name: "🔊 Voice Logs" },
        { key: "ticket_logs", name: "🎫 Ticket Logs" },
        { key: "automod_logs", name: "🤖 Automod Logs" },
        { key: "command_logs", name: "⚡ Command Logs" },
      ]

      for (const logType of logTypes) {
        const channelId = config[logType.key]
        const channelMention = channelId ? `<#${channelId}>` : "Not set"
        embed.addFields({ name: logType.name, value: channelMention, inline: true })
      }

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      console.error("View logging config error:", error)
      await interaction.reply({
        content: `❌ Error viewing logging configuration: ${error.message}`,
        ephemeral: true,
      })
    }
  },

  async saveLoggingConfig(guildId, config) {
    // Save to database - implement your database logic here
    console.log("Saving logging config for guild:", guildId, config)
  },

  async saveLoggingChannel(guildId, type, channelId) {
    // Save single channel to database - implement your database logic here
    console.log("Saving logging channel:", guildId, type, channelId)
  },

  async getLoggingConfig(guildId) {
    // Get from database - implement your database logic here
    // Return mock data for now
    return {
      mod_logs: null,
      server_logs: null,
      member_logs: null,
      message_logs: null,
      voice_logs: null,
      ticket_logs: null,
      automod_logs: null,
      command_logs: null,
    }
  },
}
