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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Configure logging system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand.setName("setup").setDescription("Setup logging channels"))
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View recent logs"))
    .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear log history"))
    .addSubcommand((subcommand) => subcommand.setName("export").setDescription("Export logs to file")),

  async execute(interaction, client, db) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case "setup":
        await setupLogging(interaction, client, db)
        break
      case "view":
        await viewRecentLogs(interaction, client, db)
        break
      case "clear":
        await clearLogs(interaction, client, db)
        break
      case "export":
        await exportLogs(interaction, client, db)
        break
    }
  },
}

async function setupLogging(interaction, client, db) {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("📊 Logging System Setup")
    .setDescription(
      "Configure comprehensive logging for your server!\n\n" +
        "**Available Log Types:**\n" +
        "🛡️ **Moderation Logs** - Warns, timeouts, bans, kicks\n" +
        "🎫 **Ticket Logs** - Ticket creation, closure, transcripts\n" +
        "👋 **Member Logs** - Joins, leaves, role changes\n" +
        "💬 **Message Logs** - Edits, deletions, bulk deletes\n" +
        "⚙️ **Server Logs** - Channel/role changes, settings\n" +
        "🤖 **Bot Logs** - Command usage, errors, updates",
    )
    .addFields(
      {
        name: "📈 Benefits",
        value:
          "• Track all server activity\n• Audit trail for moderation\n• Troubleshoot issues\n• Monitor bot performance",
        inline: true,
      },
      {
        name: "🔒 Privacy",
        value: "• Logs stay in your server\n• Staff-only access\n• Configurable retention\n• Export capabilities",
        inline: true,
      },
    )
    .setThumbnail(interaction.guild.iconURL())
    .setTimestamp()
    .setFooter({ text: "Nans Bot Utils by NansStudios" })

  const setupRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("logs_channel_setup")
      .setLabel("Set Main Logs Channel")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📊"),
    new ButtonBuilder()
      .setCustomId("logs_categories_setup")
      .setLabel("Configure Categories")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📋"),
    new ButtonBuilder()
      .setCustomId("logs_settings_setup")
      .setLabel("Advanced Settings")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⚙️"),
  )

  const setupRow2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("logs_test").setLabel("Test Logging").setStyle(ButtonStyle.Success).setEmoji("🧪"),
    new ButtonBuilder().setCustomId("logs_status").setLabel("View Status").setStyle(ButtonStyle.Success).setEmoji("📈"),
    new ButtonBuilder()
      .setCustomId("logs_disable")
      .setLabel("Disable Logging")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🔴"),
  )

  await interaction.reply({ embeds: [embed], components: [setupRow1, setupRow2], ephemeral: true })
}

async function viewRecentLogs(interaction, client, db) {
  try {
    const recentLogs = await db.all("SELECT * FROM mod_logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT 10", [
      interaction.guild.id,
    ])

    if (recentLogs.length === 0) {
      return interaction.reply({ content: "📊 No recent logs found for this server.", ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("📊 Recent Activity Logs")
      .setDescription(`Showing the last ${recentLogs.length} log entries:`)
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    for (const log of recentLogs.slice(0, 5)) {
      const user = await client.users.fetch(log.user_id).catch(() => null)
      const moderator = await client.users.fetch(log.moderator_id).catch(() => null)
      const timestamp = new Date(log.created_at).toLocaleString()

      embed.addFields({
        name: `${getActionEmoji(log.action)} ${log.action.toUpperCase()}`,
        value: `**User:** ${user ? user.tag : `Unknown (${log.user_id})`}\n**Moderator:** ${moderator ? moderator.tag : `Unknown (${log.moderator_id})`}\n**Reason:** ${log.reason || "No reason"}\n**Time:** ${timestamp}`,
        inline: false,
      })
    }

    if (recentLogs.length > 5) {
      embed.addFields({
        name: "📋 More Logs",
        value: `${recentLogs.length - 5} more entries available. Use \`/logs export\` for full history.`,
        inline: false,
      })
    }

    await interaction.reply({ embeds: [embed], ephemeral: true })
  } catch (error) {
    console.error("Error viewing logs:", error)
    await interaction.reply({ content: "❌ An error occurred while fetching logs.", ephemeral: true })
  }
}

async function clearLogs(interaction, client, db) {
  const confirmEmbed = new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle("⚠️ Clear Log History")
    .setDescription(
      "**WARNING:** This will permanently delete all log history for this server!\n\n" +
        "**This includes:**\n" +
        "• All moderation logs\n" +
        "• Ticket transcripts\n" +
        "• Activity records\n" +
        "• Audit trails\n\n" +
        "**This action cannot be undone!**\n" +
        "Consider exporting logs first with `/logs export`.",
    )
    .setTimestamp()

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_clear_logs")
      .setLabel("Yes, Clear All Logs")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("⚠️"),
    new ButtonBuilder()
      .setCustomId("cancel_clear_logs")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("❌"),
  )

  await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], ephemeral: true })
}

async function exportLogs(interaction, client, db) {
  try {
    await interaction.deferReply({ ephemeral: true })

    const modLogs = await db.all("SELECT * FROM mod_logs WHERE guild_id = ? ORDER BY created_at DESC", [
      interaction.guild.id,
    ])
    const tickets = await db.all("SELECT * FROM tickets WHERE guild_id = ? ORDER BY created_at DESC", [
      interaction.guild.id,
    ])

    const exportData = {
      server: {
        name: interaction.guild.name,
        id: interaction.guild.id,
        exportDate: new Date().toISOString(),
      },
      moderationLogs: modLogs,
      tickets: tickets,
      summary: {
        totalModActions: modLogs.length,
        totalTickets: tickets.length,
        dateRange: {
          oldest: modLogs.length > 0 ? modLogs[modLogs.length - 1].created_at : null,
          newest: modLogs.length > 0 ? modLogs[0].created_at : null,
        },
      },
    }

    const exportJson = JSON.stringify(exportData, null, 2)
    const fileName = `${interaction.guild.name.replace(/[^a-zA-Z0-9]/g, "_")}_logs_${Date.now()}.json`

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("📤 Logs Exported")
      .setDescription("Your server logs have been exported successfully!")
      .addFields(
        { name: "Export Date", value: new Date().toLocaleString(), inline: true },
        { name: "Mod Actions", value: modLogs.length.toString(), inline: true },
        { name: "Tickets", value: tickets.length.toString(), inline: true },
        { name: "File Size", value: `${Math.round(exportJson.length / 1024)} KB`, inline: true },
      )
      .setTimestamp()

    await interaction.editReply({
      embeds: [embed],
      files: [{ attachment: Buffer.from(exportJson), name: fileName }],
    })
  } catch (error) {
    console.error("Error exporting logs:", error)
    await interaction.editReply({ content: "❌ An error occurred while exporting logs." })
  }
}

function getActionEmoji(action) {
  const emojis = {
    warn: "⚠️",
    timeout: "⏰",
    kick: "👢",
    ban: "🔨",
    unban: "🔓",
    automod: "🛡️",
    ticket: "🎫",
    other: "📝",
  }
  return emojis[action] || "📝"
}
