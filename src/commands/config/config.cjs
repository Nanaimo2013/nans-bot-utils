/**
 * JMF Hosting Discord Bot
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js")
const fs = require("fs").promises
const path = require("path")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Manage bot configuration")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View current configuration")
        .addStringOption((option) =>
          option
            .setName("section")
            .setDescription("Configuration section to view")
            .setRequired(false)
            .addChoices(
              { name: "General", value: "general" },
              { name: "Channels", value: "channels" },
              { name: "Roles", value: "roles" },
              { name: "Leveling", value: "levelSystem" },
              { name: "Economy", value: "economy" },
              { name: "Mining", value: "miningGame" },
              { name: "Verification", value: "verification" },
              { name: "Tickets", value: "tickets" },
              { name: "AI Chat", value: "aiChat" },
              { name: "Database", value: "database" },
              { name: "Logging", value: "logging" },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set a configuration value")
        .addStringOption((option) =>
          option.setName("path").setDescription("Configuration path (e.g., levelSystem.enabled)").setRequired(true),
        )
        .addStringOption((option) =>
          option.setName("value").setDescription('New value (use "true", "false", numbers, or text)').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("reload").setDescription("Reload configuration from file"))
    .addSubcommand((subcommand) => subcommand.setName("dashboard").setDescription("Open the configuration dashboard"))
    .addSubcommand((subcommand) => subcommand.setName("reset").setDescription("Reset all bot configurations"))
    .addSubcommand((subcommand) => subcommand.setName("export").setDescription("Export current configuration"))
    .addSubcommand((subcommand) => subcommand.setName("status").setDescription("View all current settings")),

  async execute(interaction, client, db) {
    // Get managers from global object if available
    const { logger, database, bot } = global.managers || {}

    try {
      const subcommand = interaction.options.getSubcommand()

      if (["view", "set", "reload"].includes(subcommand)) {
        return await this.handleJMFCommand(interaction, subcommand, logger, database || db, bot)
      }

      // Handle original subcommands
      switch (subcommand) {
        case "dashboard":
          await this.showConfigDashboard(interaction, client, db)
          break
        case "reset":
          await this.resetConfiguration(interaction, client, db)
          break
        case "export":
          await this.exportConfiguration(interaction, client, db)
          break
        case "status":
          await this.showConfigStatus(interaction, client, db)
          break
      }
    } catch (error) {
      // Log error
      if (logger) {
        logger.error("commands", `Error in config command: ${error.message}`, error.stack)
      }

      return interaction.reply({
        content: `❌ An error occurred: ${error.message}`,
        ephemeral: true,
      })
    }
  },

  async handleJMFCommand(interaction, subcommand, logger, database, bot) {
    const config = bot ? bot.getConfigManager().getConfig() : require("../../config.json")

    if (subcommand === "view") {
      const section = interaction.options.getString("section")

      if (section) {
        // View specific section
        if (!config[section]) {
          return interaction.reply({
            content: `❌ Configuration section '${section}' not found.`,
            ephemeral: true,
          })
        }

        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(`${section.charAt(0).toUpperCase() + section.slice(1)} Configuration`)
          .setDescription(this.formatConfigSection(config[section], section))
          .setTimestamp()
          .setFooter({ text: "JMF Hosting Bot Configuration" })

        return interaction.reply({ embeds: [embed], ephemeral: true })
      } else {
        // View all sections
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("Bot Configuration")
          .setDescription("Here is the current bot configuration:")
          .setTimestamp()
          .setFooter({ text: "JMF Hosting Bot Configuration" })

        // Add fields for each section
        Object.keys(config).forEach((section) => {
          if (typeof config[section] === "object" && !Array.isArray(config[section])) {
            embed.addFields({
              name: section.charAt(0).toUpperCase() + section.slice(1),
              value: this.formatConfigSection(config[section], section),
            })
          }
        })

        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
    }

    // Handle other JMF subcommands...
    else {
      return interaction.reply({
        content: `❌ Subcommand ${subcommand} not fully implemented yet.`,
        ephemeral: true,
      })
    }
  },

  formatConfigSection(section, sectionName) {
    if (!section || typeof section !== "object") {
      return "No configuration available"
    }

    let formatted = ""

    Object.keys(section).forEach((key) => {
      const value = section[key]

      if (typeof value === "object" && value !== null) {
        formatted += `**${key}**: \`${JSON.stringify(value)}\`\n`
      } else {
        formatted += `**${key}**: \`${value}\`\n`
      }
    })

    return formatted || "No configuration available"
  },

  async showConfigDashboard(interaction, client, db) {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("⚙️ Server Configuration Dashboard")
      .setDescription(
        `Welcome to the **${interaction.guild.name}** configuration panel!\n\n` +
          "Use the buttons below to configure different aspects of your server bot settings. " +
          "All changes are saved automatically and take effect immediately.",
      )
      .addFields(
        {
          name: "🛡️ Moderation",
          value: "Automod, warnings, timeouts, and moderation logging",
          inline: true,
        },
        {
          name: "🎫 Tickets",
          value: "Support ticket system and categories",
          inline: true,
        },
        {
          name: "👋 Welcome",
          value: "Member join/leave messages and auto-roles",
          inline: true,
        },
        {
          name: "📝 Embeds",
          value: "Custom embeds and announcement system",
          inline: true,
        },
        {
          name: "📊 Logging",
          value: "Activity logs and audit trails",
          inline: true,
        },
        {
          name: "🎮 Unturned",
          value: "Game-specific features and integrations",
          inline: true,
        },
      )
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    const configRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("config_moderation")
        .setLabel("Moderation")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🛡️"),
      new ButtonBuilder()
        .setCustomId("config_tickets")
        .setLabel("Tickets")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎫"),
      new ButtonBuilder()
        .setCustomId("config_welcome")
        .setLabel("Welcome")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👋"),
    )

    const configRow2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("config_embeds")
        .setLabel("Embeds")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("📝"),
      new ButtonBuilder()
        .setCustomId("config_logging")
        .setLabel("Logging")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("📊"),
      new ButtonBuilder()
        .setCustomId("config_unturned")
        .setLabel("Unturned")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🎮"),
    )

    const configRow3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("config_overview")
        .setLabel("Overview")
        .setStyle(ButtonStyle.Success)
        .setEmoji("📋"),
      new ButtonBuilder().setCustomId("config_backup").setLabel("Backup").setStyle(ButtonStyle.Success).setEmoji("💾"),
      new ButtonBuilder().setCustomId("config_help").setLabel("Help").setStyle(ButtonStyle.Success).setEmoji("❓"),
    )

    await interaction.reply({
      embeds: [embed],
      components: [configRow1, configRow2, configRow3],
      ephemeral: true,
    })
  },

  async showConfigStatus(interaction, client, db) {
    try {
      const guildConfig = await db.get("SELECT * FROM guild_config WHERE guild_id = ?", [interaction.guild.id])
      const automodConfig = await db.get("SELECT * FROM automod_config WHERE guild_id = ?", [interaction.guild.id])

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("📊 Configuration Status")
        .setDescription(`Current settings for **${interaction.guild.name}**`)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: "Nans Bot Utils by NansStudios" })

      // General Settings
      embed.addFields({
        name: "⚙️ General Settings",
        value: `**Prefix:** ${guildConfig?.prefix || "/"}\n**Logs Channel:** ${guildConfig?.logs_channel ? `<#${guildConfig.logs_channel}>` : "Not set"}`,
        inline: false,
      })

      // Automod Status
      const automodStatus = automodConfig?.spam_protection ? "✅ Enabled" : "❌ Disabled"
      embed.addFields({
        name: "🛡️ Automod System",
        value: `**Status:** ${automodStatus}\n**Spam Protection:** ${automodConfig?.spam_protection ? "✅" : "❌"}\n**Link Protection:** ${automodConfig?.link_protection ? "✅" : "❌"}\n**Caps Protection:** ${automodConfig?.caps_protection ? "✅" : "❌"}`,
        inline: true,
      })

      // Welcome System
      const welcomeStatus = guildConfig?.welcome_channel ? "✅ Enabled" : "❌ Disabled"
      embed.addFields({
        name: "👋 Welcome System",
        value: `**Status:** ${welcomeStatus}\n**Welcome Channel:** ${guildConfig?.welcome_channel ? `<#${guildConfig.welcome_channel}>` : "Not set"}\n**Leave Channel:** ${guildConfig?.leave_channel ? `<#${guildConfig.leave_channel}>` : "Not set"}`,
        inline: true,
      })

      // Ticket System
      const ticketStatus = guildConfig?.ticket_category ? "✅ Enabled" : "❌ Disabled"
      embed.addFields({
        name: "🎫 Ticket System",
        value: `**Status:** ${ticketStatus}\n**Category:** ${guildConfig?.ticket_category ? `<#${guildConfig.ticket_category}>` : "Not set"}\n**Logs:** ${guildConfig?.ticket_logs_channel ? `<#${guildConfig.ticket_logs_channel}>` : "Not set"}`,
        inline: false,
      })

      // Statistics
      const ticketCount = await db.get("SELECT COUNT(*) as count FROM tickets WHERE guild_id = ?", [
        interaction.guild.id,
      ])
      const modLogCount = await db.get("SELECT COUNT(*) as count FROM mod_logs WHERE guild_id = ?", [
        interaction.guild.id,
      ])

      embed.addFields({
        name: "📈 Statistics",
        value: `**Total Tickets:** ${ticketCount?.count || 0}\n**Mod Actions:** ${modLogCount?.count || 0}\n**Members:** ${interaction.guild.memberCount}`,
        inline: true,
      })

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      console.error("Error showing config status:", error)
      await interaction.reply({ content: "❌ An error occurred while fetching configuration status.", ephemeral: true })
    }
  },

  async resetConfiguration(interaction, client, db) {
    const confirmEmbed = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("⚠️ Reset Configuration")
      .setDescription(
        "**WARNING:** This will reset ALL bot configurations for this server!\n\n" +
          "**This includes:**\n" +
          "• Automod settings\n" +
          "• Welcome/leave messages\n" +
          "• Ticket system setup\n" +
          "• Custom embeds\n" +
          "• Logging channels\n\n" +
          "**This action cannot be undone!**",
      )
      .setTimestamp()

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_reset")
        .setLabel("Yes, Reset Everything")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("⚠️"),
      new ButtonBuilder().setCustomId("cancel_reset").setLabel("Cancel").setStyle(ButtonStyle.Secondary).setEmoji("❌"),
    )

    await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], ephemeral: true })
  },

  async exportConfiguration(interaction, client, db) {
    try {
      const guildConfig = await db.get("SELECT * FROM guild_config WHERE guild_id = ?", [interaction.guild.id])
      const automodConfig = await db.get("SELECT * FROM automod_config WHERE guild_id = ?", [interaction.guild.id])
      const customEmbeds = await db.all("SELECT * FROM custom_embeds WHERE guild_id = ?", [interaction.guild.id])

      const configData = {
        server: {
          name: interaction.guild.name,
          id: interaction.guild.id,
          exportDate: new Date().toISOString(),
        },
        general: guildConfig || {},
        automod: automodConfig || {},
        embeds: customEmbeds || [],
        version: "1.0.0",
      }

      const configJson = JSON.stringify(configData, null, 2)
      const fileName = `${interaction.guild.name.replace(/[^a-zA-Z0-9]/g, "_")}_config_${Date.now()}.json`

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("📤 Configuration Exported")
        .setDescription("Your server configuration has been exported successfully!")
        .addFields(
          { name: "Export Date", value: new Date().toLocaleString(), inline: true },
          { name: "File Size", value: `${Math.round(configJson.length / 1024)} KB`, inline: true },
          { name: "Items Exported", value: `${Object.keys(configData).length} categories`, inline: true },
        )
        .setTimestamp()

      await interaction.reply({
        embeds: [embed],
        files: [{ attachment: Buffer.from(configJson), name: fileName }],
        ephemeral: true,
      })
    } catch (error) {
      console.error("Error exporting configuration:", error)
      await interaction.reply({ content: "❌ An error occurred while exporting configuration.", ephemeral: true })
    }
  },
}
