const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Manage welcome messages and settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand.setName("setup").setDescription("Interactive setup for welcome/leave system"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("test")
        .setDescription("Test the welcome message")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to test the welcome message for (defaults to you)")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Set the welcome channel")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("The channel to send welcome messages to").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Toggle welcome messages on or off")
        .addBooleanOption((option) =>
          option.setName("enabled").setDescription("Whether welcome messages should be enabled").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("message")
        .setDescription("Set the welcome message")
        .addStringOption((option) =>
          option.setName("message").setDescription("The welcome message to use").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("status").setDescription("View current welcome/leave settings")),

  async execute(interaction, client, db) {
    try {
      const subcommand = interaction.options.getSubcommand()

      if (["test", "channel", "toggle", "message"].includes(subcommand)) {
        return await this.handleJMFCommand(interaction, subcommand, client, db)
      }

      // Handle original subcommands
      switch (subcommand) {
        case "setup":
          await this.setupWelcomeSystem(interaction, client, db)
          break
        case "status":
          await this.showWelcomeStatus(interaction, client, db)
          break
      }
    } catch (error) {
      console.error(`Error in welcome command: ${error.message}`)
      await interaction.reply({
        content: "An error occurred while executing this command.",
        ephemeral: true,
      })
    }
  },

  async handleJMFCommand(interaction, subcommand, client, db) {
    switch (subcommand) {
      case "test":
        await this.handleWelcomeTest(interaction, client, db)
        break
      case "channel":
        await this.handleSetChannel(interaction, client, db)
        break
      case "toggle":
        await this.handleToggle(interaction, client, db)
        break
      case "message":
        await this.handleSetMessage(interaction, client, db)
        break
    }
  },

  async handleWelcomeTest(interaction, client, db) {
    await interaction.deferReply()

    try {
      // Get the target user (defaults to the command user)
      const targetUser = interaction.options.getUser("user") || interaction.user
      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null)

      if (!member) {
        return interaction.editReply({ content: "That user is not in this server.", ephemeral: true })
      }

      // Get welcome settings from config or database
      const welcomeSettings = await db.get(
        "SELECT welcome_enabled, welcome_message FROM guild_config WHERE guild_id = ?",
        [interaction.guild.id],
      )
      const welcomeEnabled = welcomeSettings?.welcome_enabled !== false
      const welcomeMessage = welcomeSettings?.welcome_message || "Welcome to {server}, {user}!"

      if (!welcomeEnabled) {
        return interaction.editReply({ content: "Welcome messages are currently disabled.", ephemeral: true })
      }

      // Create the welcome embed using our custom embed
      const { createWelcomeMemberEmbed } = require("../../embeds/welcomeMember")
      const welcomeEmbed = createWelcomeMemberEmbed(member, welcomeMessage)

      await interaction.editReply({
        content: "Here's a preview of the welcome message:",
        embeds: [welcomeEmbed],
      })
    } catch (error) {
      console.error(`Error testing welcome message: ${error.message}`)
      await interaction.editReply({ content: "An error occurred while testing the welcome message.", ephemeral: true })
    }
  },

  async handleSetChannel(interaction, client, db) {
    await interaction.deferReply()

    try {
      const channel = interaction.options.getChannel("channel")
      if (!channel || channel.type !== ChannelType.GuildText) {
        return interaction.editReply({ content: "Please provide a valid text channel.", ephemeral: true })
      }

      await db.run("UPDATE guild_config SET welcome_channel = ? WHERE guild_id = ?", [channel.id, interaction.guild.id])

      await interaction.editReply({
        content: `Welcome channel set to ${channel}.`,
      })
    } catch (error) {
      console.error(`Error setting welcome channel: ${error.message}`)
      await interaction.editReply({ content: "An error occurred while setting the welcome channel.", ephemeral: true })
    }
  },

  async handleToggle(interaction, client, db) {
    await interaction.deferReply()

    try {
      const enabled = interaction.options.getBoolean("enabled")

      await db.run("UPDATE guild_config SET welcome_enabled = ? WHERE guild_id = ?", [enabled, interaction.guild.id])

      await interaction.editReply({
        content: `Welcome messages ${enabled ? "enabled" : "disabled"}.`,
      })
    } catch (error) {
      console.error(`Error toggling welcome messages: ${error.message}`)
      await interaction.editReply({ content: "An error occurred while toggling welcome messages.", ephemeral: true })
    }
  },

  async handleSetMessage(interaction, client, db) {
    await interaction.deferReply()

    try {
      const message = interaction.options.getString("message")

      await db.run("UPDATE guild_config SET welcome_message = ? WHERE guild_id = ?", [message, interaction.guild.id])

      await interaction.editReply({
        content: "Welcome message updated.",
      })
    } catch (error) {
      console.error(`Error setting welcome message: ${error.message}`)
      await interaction.editReply({ content: "An error occurred while setting the welcome message.", ephemeral: true })
    }
  },

  async setupWelcomeSystem(interaction, client, db) {
    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("👋 Welcome System Setup")
      .setDescription(
        "Configure your server's welcome and leave messages!\n\n" +
          "**Available Variables:**\n" +
          "`{user}` - Mentions the user\n" +
          "`{username}` - User's display name\n" +
          "`{server}` - Server name\n" +
          "`{membercount}` - Current member count\n" +
          "`{date}` - Current date",
      )
      .addFields(
        { name: "📥 Welcome Messages", value: "Greet new members when they join", inline: true },
        { name: "📤 Leave Messages", value: "Say goodbye when members leave", inline: true },
        { name: "🎨 Custom Styling", value: "Rich embeds with images and colors", inline: true },
      )
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    const setupRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("welcome_channel_setup")
        .setLabel("Set Welcome Channel")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📥"),
      new ButtonBuilder()
        .setCustomId("welcome_message_setup")
        .setLabel("Set Welcome Message")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("💬"),
      new ButtonBuilder()
        .setCustomId("leave_setup")
        .setLabel("Configure Leave Messages")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("📤"),
    )

    const advancedRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("welcome_embed_setup")
        .setLabel("Embed Styling")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🎨"),
      new ButtonBuilder()
        .setCustomId("welcome_roles_setup")
        .setLabel("Auto Roles")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("👥"),
      new ButtonBuilder()
        .setCustomId("welcome_preview")
        .setLabel("Preview & Test")
        .setStyle(ButtonStyle.Success)
        .setEmoji("👁️"),
    )

    await interaction.reply({ embeds: [embed], components: [setupRow, advancedRow], ephemeral: true })

    // Initialize welcome session
    if (!client.welcomeSessions) client.welcomeSessions = new Map()
    client.welcomeSessions.set(interaction.user.id, {
      guildId: interaction.guild.id,
      lastInteraction: interaction,
    })
  },

  async showWelcomeStatus(interaction, client, db) {
    try {
      const config = await db.get(
        "SELECT welcome_channel, welcome_message, leave_channel, leave_message, welcome_enabled FROM guild_config WHERE guild_id = ?",
        [interaction.guild.id],
      )

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("👋 Welcome System Status")
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      // Welcome settings
      if (config?.welcome_channel) {
        const welcomeChannel = interaction.guild.channels.cache.get(config.welcome_channel)
        embed.addFields({
          name: "📥 Welcome Messages",
          value: `**Status:** ✅ Enabled\n**Channel:** ${welcomeChannel ? `<#${config.welcome_channel}>` : "❌ Channel not found"}\n**Message:** ${config.welcome_message ? "Custom message set" : "Using default message"}`,
          inline: false,
        })
      } else {
        embed.addFields({
          name: "📥 Welcome Messages",
          value: `**Status:** ${config?.welcome_enabled === false ? "❌ Disabled" : "❓ Not Configured"}\n**Channel:** Not set\n**Message:** Not configured`,
          inline: false,
        })
      }

      // Leave settings
      if (config?.leave_channel) {
        const leaveChannel = interaction.guild.channels.cache.get(config.leave_channel)
        embed.addFields({
          name: "📤 Leave Messages",
          value: `**Status:** ✅ Enabled\n**Channel:** ${leaveChannel ? `<#${config.leave_channel}>` : "❌ Channel not found"}\n**Message:** ${config.leave_message ? "Custom message set" : "Using default message"}`,
          inline: false,
        })
      } else {
        embed.addFields({
          name: "📤 Leave Messages",
          value: "**Status:** ❌ Disabled\n**Channel:** Not set\n**Message:** Not configured",
          inline: false,
        })
      }

      embed.addFields({
        name: "📊 Statistics",
        value: `**Current Members:** ${interaction.guild.memberCount}\n**Server Created:** <t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:R>`,
        inline: false,
      })

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error("Error showing welcome status:", error)
      await interaction.reply({ content: "❌ An error occurred while fetching welcome status.", ephemeral: true })
    }
  },

  async toggleWelcomeSystem(interaction, client, db) {
    try {
      const config = await db.get("SELECT welcome_channel FROM guild_config WHERE guild_id = ?", [interaction.guild.id])

      if (config?.welcome_channel) {
        // Disable welcome system
        await db.run(
          "UPDATE guild_config SET welcome_channel = NULL, welcome_message = NULL, welcome_enabled = FALSE WHERE guild_id = ?",
          [interaction.guild.id],
        )

        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("👋 Welcome System Disabled")
          .setDescription("Welcome messages have been disabled for this server.")
          .setTimestamp()

        await interaction.reply({ embeds: [embed] })
      } else {
        // Show setup instructions
        const embed = new EmbedBuilder()
          .setColor("#ff9900")
          .setTitle("👋 Welcome System Not Configured")
          .setDescription("Welcome system is not set up yet. Use `/welcome setup` to configure it.")
          .setTimestamp()

        await interaction.reply({ embeds: [embed], ephemeral: true })
      }
    } catch (error) {
      console.error("Error toggling welcome system:", error)
      await interaction.reply({ content: "❌ An error occurred while toggling the welcome system.", ephemeral: true })
    }
  },
}
