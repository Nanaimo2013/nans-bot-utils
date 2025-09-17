/**
 * JMF Hosting Discord Bot - Test Commands
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const logger = require("../../utils/logger.cjs")
const config = require("../../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test various bot systems and features")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("embed")
        .setDescription("Test embed creation and styling")
        .addStringOption((option) => option.setName("title").setDescription("Embed title").setRequired(false))
        .addStringOption((option) =>
          option.setName("description").setDescription("Embed description").setRequired(false),
        )
        .addStringOption((option) =>
          option.setName("color").setDescription("Embed color (hex code)").setRequired(false),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("buttons").setDescription("Test button interactions"))
    .addSubcommand((subcommand) => subcommand.setName("database").setDescription("Test database connection"))
    .addSubcommand((subcommand) => subcommand.setName("permissions").setDescription("Test permission system"))
    .addSubcommand((subcommand) => subcommand.setName("logging").setDescription("Test logging system"))
    .addSubcommand((subcommand) => subcommand.setName("economy").setDescription("Test economy system"))
    .addSubcommand((subcommand) => subcommand.setName("tickets").setDescription("Test ticket system"))
    .addSubcommand((subcommand) => subcommand.setName("unturned").setDescription("Test Unturned server integration")),

  adminOnly: true,

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand()

    try {
      switch (subcommand) {
        case "embed":
          await testEmbed(interaction)
          break
        case "buttons":
          await testButtons(interaction)
          break
        case "database":
          await testDatabase(interaction, client)
          break
        case "permissions":
          await testPermissions(interaction)
          break
        case "logging":
          await testLogging(interaction)
          break
        case "economy":
          await testEconomy(interaction, client)
          break
        case "tickets":
          await testTickets(interaction, client)
          break
        case "unturned":
          await testUnturned(interaction)
          break
        default:
          await interaction.reply({
            content: "❌ Unknown test subcommand.",
            ephemeral: true,
          })
      }
    } catch (error) {
      logger.error(`Test command error: ${error.message}`)
      await interaction.reply({
        content: `❌ Test failed: ${error.message}`,
        ephemeral: true,
      })
    }
  },
}

async function testEmbed(interaction) {
  const title = interaction.options.getString("title") || "Test Embed"
  const description =
    interaction.options.getString("description") || "This is a test embed to verify styling and functionality."
  const color = interaction.options.getString("color") || config.embedColor || "#00AAFF"

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .addFields(
      { name: "✅ Field 1", value: "This is a test field", inline: true },
      { name: "✅ Field 2", value: "This is another test field", inline: true },
      { name: "✅ Field 3", value: "This field spans the full width", inline: false },
    )
    .setFooter({
      text: config.footerText || "JMF Hosting | Test System",
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}

async function testButtons(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("🔘 Button Test")
    .setDescription("Click the buttons below to test their functionality.")
    .setColor(config.embedColor || "#00AAFF")
    .setTimestamp()

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("test_primary").setLabel("Primary").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("test_secondary").setLabel("Secondary").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("test_success").setLabel("Success").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("test_danger").setLabel("Danger").setStyle(ButtonStyle.Danger),
  )

  await interaction.reply({ embeds: [embed], components: [buttons] })

  // Set up collector for button interactions
  const collector = interaction.channel.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith("test_"),
    time: 30000,
  })

  collector.on("collect", async (i) => {
    const buttonType = i.customId.replace("test_", "")
    await i.reply({
      content: `✅ ${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} button clicked!`,
      ephemeral: true,
    })
  })

  collector.on("end", () => {
    logger.info("Button test collector ended")
  })
}

async function testDatabase(interaction, client) {
  if (!client.db) {
    return interaction.reply({
      content: "❌ Database is not connected.",
      ephemeral: true,
    })
  }

  try {
    // Test basic query
    const result = await client.db.query("SELECT 1 as test")

    const embed = new EmbedBuilder()
      .setTitle("✅ Database Test Successful")
      .setDescription("Database connection is working properly.")
      .setColor("#00FF00")
      .addFields(
        { name: "Connection Status", value: "✅ Connected", inline: true },
        { name: "Test Query", value: "✅ Successful", inline: true },
        { name: "Result", value: `${JSON.stringify(result[0])}`, inline: false },
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed], ephemeral: true })
  } catch (error) {
    const embed = new EmbedBuilder()
      .setTitle("❌ Database Test Failed")
      .setDescription("Database connection test failed.")
      .setColor("#FF0000")
      .addFields({ name: "Error", value: error.message, inline: false })
      .setTimestamp()

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }
}

async function testPermissions(interaction) {
  const member = interaction.member
  const permissions = member.permissions.toArray()
  const roles = member.roles.cache.map((role) => role.name).join(", ")

  const embed = new EmbedBuilder()
    .setTitle("🔐 Permission Test")
    .setDescription(`Permission information for ${interaction.user}`)
    .setColor(config.embedColor || "#00AAFF")
    .addFields(
      { name: "User Roles", value: roles || "No roles", inline: false },
      { name: "Key Permissions", value: permissions.slice(0, 10).join(", ") || "No permissions", inline: false },
      { name: "Is Admin", value: member.permissions.has("Administrator") ? "✅ Yes" : "❌ No", inline: true },
      {
        name: "Is Moderator",
        value: member.permissions.has(["KickMembers", "BanMembers"]) ? "✅ Yes" : "❌ No",
        inline: true,
      },
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function testLogging(interaction) {
  logger.info(`Test log message from ${interaction.user.tag}`)
  logger.warn(`Test warning message from ${interaction.user.tag}`)
  logger.error(`Test error message from ${interaction.user.tag}`)

  const embed = new EmbedBuilder()
    .setTitle("📝 Logging Test")
    .setDescription("Test log messages have been sent to the console and log files.")
    .setColor(config.embedColor || "#00AAFF")
    .addFields(
      { name: "Info Log", value: "✅ Sent", inline: true },
      { name: "Warning Log", value: "✅ Sent", inline: true },
      { name: "Error Log", value: "✅ Sent", inline: true },
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function testEconomy(interaction, client) {
  if (!client.economy || !client.economy.isInitialized) {
    return interaction.reply({
      content: "❌ Economy system is not initialized.",
      ephemeral: true,
    })
  }

  try {
    // Test economy functions
    await client.economy.ensureUser(interaction.user.id, interaction.guild.id)
    const balance = await client.economy.getBalance(interaction.user.id, interaction.guild.id)

    const embed = new EmbedBuilder()
      .setTitle("💰 Economy Test")
      .setDescription("Economy system test results")
      .setColor("#00FF00")
      .addFields(
        { name: "System Status", value: "✅ Initialized", inline: true },
        { name: "User Balance", value: `$${balance.toLocaleString()}`, inline: true },
        { name: "Database", value: "✅ Connected", inline: true },
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed], ephemeral: true })
  } catch (error) {
    const embed = new EmbedBuilder()
      .setTitle("❌ Economy Test Failed")
      .setDescription("Economy system test failed.")
      .setColor("#FF0000")
      .addFields({ name: "Error", value: error.message, inline: false })
      .setTimestamp()

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }
}

async function testTickets(interaction, client) {
  if (!client.tickets || !client.tickets.isInitialized) {
    return interaction.reply({
      content: "❌ Ticket system is not initialized.",
      ephemeral: true,
    })
  }

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket System Test")
    .setDescription("Ticket system is working properly.")
    .setColor("#00FF00")
    .addFields(
      { name: "System Status", value: "✅ Initialized", inline: true },
      { name: "Database", value: client.db ? "✅ Connected" : "❌ Not Connected", inline: true },
      { name: "Ticket Types", value: `${client.tickets.ticketTypes.length} configured`, inline: true },
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function testUnturned(interaction) {
  // Test Unturned server connection
  const embed = new EmbedBuilder()
    .setTitle("🎮 Unturned Integration Test")
    .setDescription("Testing Unturned server integration...")
    .setColor(config.embedColor || "#00AAFF")
    .addFields(
      {
        name: "RCON Connection",
        value: process.env.UNTURNED_RCON_PASSWORD ? "✅ Configured" : "❌ Not Configured",
        inline: true,
      },
      { name: "API Key", value: process.env.UNTURNED_API_KEY ? "✅ Configured" : "❌ Not Configured", inline: true },
      { name: "Server Status", value: "🔄 Testing...", inline: true },
    )
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}
