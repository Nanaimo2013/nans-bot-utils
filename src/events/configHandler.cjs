const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
} = require("discord.js")

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client, db) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return

    // Handle config dashboard interactions
    if (interaction.customId?.startsWith("config_")) {
      await handleConfigInteraction(interaction, client, db)
    }

    // Handle logs setup interactions
    if (interaction.customId?.startsWith("logs_")) {
      await handleLogsInteraction(interaction, client, db)
    }

    // Handle confirmation interactions
    if (interaction.customId?.startsWith("confirm_") || interaction.customId?.startsWith("cancel_")) {
      await handleConfirmationInteraction(interaction, client, db)
    }
  },
}

async function handleConfigInteraction(interaction, client, db) {
  const { customId } = interaction

  switch (customId) {
    case "config_moderation":
      await showModerationConfig(interaction, client, db)
      break
    case "config_tickets":
      await showTicketsConfig(interaction, client, db)
      break
    case "config_welcome":
      await showWelcomeConfig(interaction, client, db)
      break
    case "config_embeds":
      await showEmbedsConfig(interaction, client, db)
      break
    case "config_logging":
      await showLoggingConfig(interaction, client, db)
      break
    case "config_unturned":
      await showUnturnedConfig(interaction, client, db)
      break
    case "config_overview":
      await showConfigOverview(interaction, client, db)
      break
    case "config_backup":
      await showBackupOptions(interaction, client, db)
      break
    case "config_help":
      await showConfigHelp(interaction, client, db)
      break
  }
}

async function handleLogsInteraction(interaction, client, db) {
  const { customId } = interaction

  switch (customId) {
    case "logs_channel_setup":
      await setupLogsChannel(interaction, client, db)
      break
    case "logs_categories_setup":
      await setupLogCategories(interaction, client, db)
      break
    case "logs_settings_setup":
      await setupLogSettings(interaction, client, db)
      break
    case "logs_test":
      await testLogging(interaction, client, db)
      break
    case "logs_status":
      await showLogsStatus(interaction, client, db)
      break
    case "logs_disable":
      await disableLogging(interaction, client, db)
      break
  }
}

async function handleConfirmationInteraction(interaction, client, db) {
  const { customId } = interaction

  switch (customId) {
    case "confirm_reset":
      await executeConfigReset(interaction, client, db)
      break
    case "cancel_reset":
      await interaction.update({
        content: "❌ Configuration reset cancelled.",
        embeds: [],
        components: [],
      })
      break
    case "confirm_clear_logs":
      await executeClearLogs(interaction, client, db)
      break
    case "cancel_clear_logs":
      await interaction.update({
        content: "❌ Log clearing cancelled.",
        embeds: [],
        components: [],
      })
      break
  }
}

async function showModerationConfig(interaction, client, db) {
  const automodConfig = await db.get("SELECT * FROM automod_config WHERE guild_id = ?", [interaction.guild.id])

  const embed = new EmbedBuilder()
    .setColor("#ff6b35")
    .setTitle("🛡️ Moderation Configuration")
    .setDescription("Configure automod and moderation settings for your server.")
    .addFields(
      {
        name: "Current Status",
        value: `**Automod:** ${automodConfig?.spam_protection ? "✅ Enabled" : "❌ Disabled"}\n**Spam Protection:** ${automodConfig?.spam_protection ? "✅" : "❌"}\n**Link Protection:** ${automodConfig?.link_protection ? "✅" : "❌"}`,
        inline: true,
      },
      {
        name: "Quick Actions",
        value:
          "Use the buttons below to configure moderation settings or use `/automod setup` for detailed configuration.",
        inline: false,
      },
    )
    .setTimestamp()

  const moderationRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("automod_quick_setup")
      .setLabel("Setup Automod")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🛡️"),
    new ButtonBuilder()
      .setCustomId("moderation_roles")
      .setLabel("Mod Roles")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👮"),
    new ButtonBuilder()
      .setCustomId("punishment_settings")
      .setLabel("Punishments")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⚖️"),
  )

  await interaction.update({ embeds: [embed], components: [moderationRow] })
}

async function showTicketsConfig(interaction, client, db) {
  const guildConfig = await db.get("SELECT ticket_category, ticket_logs_channel FROM guild_config WHERE guild_id = ?", [
    interaction.guild.id,
  ])

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("🎫 Ticket System Configuration")
    .setDescription("Configure the support ticket system for your server.")
    .addFields({
      name: "Current Status",
      value: `**System:** ${guildConfig?.ticket_category ? "✅ Enabled" : "❌ Disabled"}\n**Category:** ${guildConfig?.ticket_category ? `<#${guildConfig.ticket_category}>` : "Not set"}\n**Logs:** ${guildConfig?.ticket_logs_channel ? `<#${guildConfig.ticket_logs_channel}>` : "Not set"}`,
      inline: false,
    })
    .setTimestamp()

  const ticketRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_quick_setup")
      .setLabel("Setup Tickets")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎫"),
    new ButtonBuilder()
      .setCustomId("ticket_categories")
      .setLabel("Categories")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📋"),
    new ButtonBuilder()
      .setCustomId("ticket_panel_create")
      .setLabel("Create Panel")
      .setStyle(ButtonStyle.Success)
      .setEmoji("📝"),
  )

  await interaction.update({ embeds: [embed], components: [ticketRow] })
}

async function showWelcomeConfig(interaction, client, db) {
  const guildConfig = await db.get(
    "SELECT welcome_channel, welcome_message, leave_channel, leave_message FROM guild_config WHERE guild_id = ?",
    [interaction.guild.id],
  )

  const embed = new EmbedBuilder()
    .setColor("#00ff00")
    .setTitle("👋 Welcome System Configuration")
    .setDescription("Configure welcome and leave messages for your server.")
    .addFields(
      {
        name: "Welcome Messages",
        value: `**Status:** ${guildConfig?.welcome_channel ? "✅ Enabled" : "❌ Disabled"}\n**Channel:** ${guildConfig?.welcome_channel ? `<#${guildConfig.welcome_channel}>` : "Not set"}`,
        inline: true,
      },
      {
        name: "Leave Messages",
        value: `**Status:** ${guildConfig?.leave_channel ? "✅ Enabled" : "❌ Disabled"}\n**Channel:** ${guildConfig?.leave_channel ? `<#${guildConfig.leave_channel}>` : "Not set"}`,
        inline: true,
      },
    )
    .setTimestamp()

  const welcomeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("welcome_quick_setup")
      .setLabel("Setup Welcome")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("👋"),
    new ButtonBuilder()
      .setCustomId("welcome_test_message")
      .setLabel("Test Message")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🧪"),
    new ButtonBuilder()
      .setCustomId("welcome_auto_roles")
      .setLabel("Auto Roles")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👥"),
  )

  await interaction.update({ embeds: [embed], components: [welcomeRow] })
}

async function showEmbedsConfig(interaction, client, db) {
  const embedCount = await db.get("SELECT COUNT(*) as count FROM custom_embeds WHERE guild_id = ?", [
    interaction.guild.id,
  ])

  const embed = new EmbedBuilder()
    .setColor("#9b59b6")
    .setTitle("📝 Embed & Announcement Configuration")
    .setDescription("Manage custom embeds and announcement system.")
    .addFields({
      name: "Current Status",
      value: `**Saved Embeds:** ${embedCount?.count || 0}\n**Announcement System:** ✅ Available\n**Embed Builder:** ✅ Available`,
      inline: false,
    })
    .setTimestamp()

  const embedRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("embed_create_new")
      .setLabel("Create Embed")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📝"),
    new ButtonBuilder()
      .setCustomId("embed_list_all")
      .setLabel("List Embeds")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📋"),
    new ButtonBuilder()
      .setCustomId("announcement_create")
      .setLabel("Send Announcement")
      .setStyle(ButtonStyle.Success)
      .setEmoji("📢"),
  )

  await interaction.update({ embeds: [embed], components: [embedRow] })
}

async function showLoggingConfig(interaction, client, db) {
  const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [interaction.guild.id])
  const logCount = await db.get("SELECT COUNT(*) as count FROM mod_logs WHERE guild_id = ?", [interaction.guild.id])

  const embed = new EmbedBuilder()
    .setColor("#e67e22")
    .setTitle("📊 Logging System Configuration")
    .setDescription("Configure comprehensive logging for your server.")
    .addFields({
      name: "Current Status",
      value: `**Main Logs:** ${guildConfig?.logs_channel ? `<#${guildConfig.logs_channel}>` : "Not set"}\n**Total Logs:** ${logCount?.count || 0}\n**System:** ${guildConfig?.logs_channel ? "✅ Active" : "❌ Inactive"}`,
      inline: false,
    })
    .setTimestamp()

  const loggingRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("logging_setup_main")
      .setLabel("Setup Logging")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📊"),
    new ButtonBuilder()
      .setCustomId("logging_view_recent")
      .setLabel("Recent Logs")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📋"),
    new ButtonBuilder()
      .setCustomId("logging_export_all")
      .setLabel("Export Logs")
      .setStyle(ButtonStyle.Success)
      .setEmoji("📤"),
  )

  await interaction.update({ embeds: [embed], components: [loggingRow] })
}

async function showUnturnedConfig(interaction, client, db) {
  const embed = new EmbedBuilder()
    .setColor("#2ecc71")
    .setTitle("🎮 Unturned Server Configuration")
    .setDescription(
      "Configure Unturned-specific features for your gaming community.\n\n" +
        "**Available Features:**\n" +
        "🖥️ Server status monitoring\n" +
        "👥 Player management\n" +
        "📊 Statistics tracking\n" +
        "🎯 Custom commands\n" +
        "🔗 Game integrations",
    )
    .addFields({
      name: "Coming Soon",
      value: "Unturned-specific features are currently in development and will be available in a future update!",
      inline: false,
    })
    .setTimestamp()

  const unturnedRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("unturned_server_setup")
      .setLabel("Server Setup")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🖥️")
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("unturned_player_mgmt")
      .setLabel("Player Management")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👥")
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("unturned_stats")
      .setLabel("Statistics")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📊")
      .setDisabled(true),
  )

  await interaction.update({ embeds: [embed], components: [unturnedRow] })
}

async function showConfigOverview(interaction, client, db) {
  // Implementation for showConfigOverview
  await interaction.reply({ content: "Configuration overview is not implemented yet.", ephemeral: true })
}

async function showBackupOptions(interaction, client, db) {
  // Implementation for showBackupOptions
  await interaction.reply({ content: "Backup options are not implemented yet.", ephemeral: true })
}

async function showConfigHelp(interaction, client, db) {
  // Implementation for showConfigHelp
  await interaction.reply({ content: "Configuration help is not implemented yet.", ephemeral: true })
}

async function setupLogsChannel(interaction, client, db) {
  // Implementation for setupLogsChannel
  await interaction.reply({ content: "Logs channel setup is not implemented yet.", ephemeral: true })
}

async function setupLogCategories(interaction, client, db) {
  // Implementation for setupLogCategories
  await interaction.reply({ content: "Log categories setup is not implemented yet.", ephemeral: true })
}

async function setupLogSettings(interaction, client, db) {
  // Implementation for setupLogSettings
  await interaction.reply({ content: "Log settings setup is not implemented yet.", ephemeral: true })
}

async function testLogging(interaction, client, db) {
  // Implementation for testLogging
  await interaction.reply({ content: "Logging test is not implemented yet.", ephemeral: true })
}

async function showLogsStatus(interaction, client, db) {
  // Implementation for showLogsStatus
  await interaction.reply({ content: "Logs status is not implemented yet.", ephemeral: true })
}

async function disableLogging(interaction, client, db) {
  // Implementation for disableLogging
  await interaction.reply({ content: "Disable logging is not implemented yet.", ephemeral: true })
}

async function executeConfigReset(interaction, client, db) {
  try {
    await interaction.deferUpdate()

    // Reset all configurations
    await db.run("DELETE FROM guild_config WHERE guild_id = ?", [interaction.guild.id])
    await db.run("DELETE FROM automod_config WHERE guild_id = ?", [interaction.guild.id])
    await db.run("DELETE FROM custom_embeds WHERE guild_id = ?", [interaction.guild.id])

    // Reinitialize with defaults
    await db.run("INSERT INTO guild_config (guild_id) VALUES (?)", [interaction.guild.id])
    await db.run("INSERT INTO automod_config (guild_id) VALUES (?)", [interaction.guild.id])

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("✅ Configuration Reset Complete")
      .setDescription("All bot configurations have been reset to default values.")
      .addFields({
        name: "Next Steps",
        value:
          "• Run `/config dashboard` to reconfigure your settings\n• Use `/welcome setup` for welcome messages\n• Use `/ticket setup` for the ticket system\n• Use `/automod setup` for moderation",
        inline: false,
      })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed], components: [] })
  } catch (error) {
    console.error("Error resetting configuration:", error)
    await interaction.editReply({ content: "❌ An error occurred while resetting configuration.", components: [] })
  }
}

async function executeClearLogs(interaction, client, db) {
  try {
    await interaction.deferUpdate()

    // Clear all logs
    await db.run("DELETE FROM mod_logs WHERE guild_id = ?", [interaction.guild.id])
    await db.run("DELETE FROM ticket_transcripts WHERE ticket_id IN (SELECT id FROM tickets WHERE guild_id = ?)", [
      interaction.guild.id,
    ])

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("✅ Logs Cleared")
      .setDescription("All log history has been permanently deleted.")
      .setTimestamp()

    await interaction.editReply({ embeds: [embed], components: [] })
  } catch (error) {
    console.error("Error clearing logs:", error)
    await interaction.editReply({ content: "❌ An error occurred while clearing logs.", components: [] })
  }
}
