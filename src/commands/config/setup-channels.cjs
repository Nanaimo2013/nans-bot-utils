/**
 * JMF Hosting Discord Bot - Channel Setup Command
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require("discord.js")
const logger = require("../../utils/logger.cjs")
const config = require("../../config.json")
const configManager = require("../../utils/configManager.cjs")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-channels")
    .setDescription("Setup and configure bot channels")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("tickets")
        .setDescription("Setup ticket system channels")
        .addChannelOption((option) =>
          option
            .setName("create-channel")
            .setDescription("Channel for creating tickets")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        )
        .addChannelOption((option) =>
          option
            .setName("log-channel")
            .setDescription("Channel for ticket logs")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("welcome")
        .setDescription("Setup welcome system channels")
        .addChannelOption((option) =>
          option
            .setName("welcome-channel")
            .setDescription("Channel for welcome messages")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        )
        .addChannelOption((option) =>
          option
            .setName("leave-channel")
            .setDescription("Channel for leave messages")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("moderation")
        .setDescription("Setup moderation channels")
        .addChannelOption((option) =>
          option
            .setName("mod-log")
            .setDescription("Channel for moderation logs")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        )
        .addChannelOption((option) =>
          option
            .setName("automod-log")
            .setDescription("Channel for automod logs")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("verification")
        .setDescription("Setup verification channel")
        .addChannelOption((option) =>
          option
            .setName("verify-channel")
            .setDescription("Channel for user verification")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("create-all").setDescription("Create all necessary channels automatically"),
    ),

  adminOnly: true,

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand()

    try {
      switch (subcommand) {
        case "tickets":
          await setupTicketChannels(interaction, client)
          break
        case "welcome":
          await setupWelcomeChannels(interaction, client)
          break
        case "moderation":
          await setupModerationChannels(interaction, client)
          break
        case "verification":
          await setupVerificationChannel(interaction, client)
          break
        case "create-all":
          await createAllChannels(interaction, client)
          break
        default:
          await interaction.reply({
            content: "❌ Unknown setup subcommand.",
            ephemeral: true,
          })
      }
    } catch (error) {
      logger.error(`Setup channels error: ${error.message}`)
      await interaction.reply({
        content: `❌ Setup failed: ${error.message}`,
        ephemeral: true,
      })
    }
  },
}

async function setupTicketChannels(interaction, client) {
  await interaction.deferReply({ ephemeral: true })

  const createChannel = interaction.options.getChannel("create-channel")
  const logChannel = interaction.options.getChannel("log-channel")

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket System Setup")
    .setColor(config.embedColor || "#00AAFF")
    .setTimestamp()

  const fields = []

  if (createChannel) {
    // Setup ticket creation panel
    if (client.tickets && client.tickets.isInitialized) {
      await client.tickets.createTicketPanel(createChannel)
      fields.push({ name: "✅ Create Channel", value: `${createChannel}`, inline: true })
    } else {
      fields.push({ name: "❌ Create Channel", value: "Ticket system not initialized", inline: true })
    }
  }

  if (logChannel) {
    // Update config with log channel
    await configManager.updateConfig("ticketSystem.logChannel", logChannel.id)
    fields.push({ name: "✅ Log Channel", value: `${logChannel}`, inline: true })
  }

  if (fields.length === 0) {
    fields.push({ name: "ℹ️ No Changes", value: "No channels were specified for setup.", inline: false })
  }

  embed.addFields(fields)
  await interaction.editReply({ embeds: [embed] })
}

async function setupWelcomeChannels(interaction, client) {
  await interaction.deferReply({ ephemeral: true })

  const welcomeChannel = interaction.options.getChannel("welcome-channel")
  const leaveChannel = interaction.options.getChannel("leave-channel")

  const embed = new EmbedBuilder()
    .setTitle("👋 Welcome System Setup")
    .setColor(config.embedColor || "#00AAFF")
    .setTimestamp()

  const fields = []

  if (welcomeChannel) {
    await configManager.updateConfig("welcomeSystem.channelId", welcomeChannel.id)
    fields.push({ name: "✅ Welcome Channel", value: `${welcomeChannel}`, inline: true })
  }

  if (leaveChannel) {
    await configManager.updateConfig("leaveSystem.channelId", leaveChannel.id)
    fields.push({ name: "✅ Leave Channel", value: `${leaveChannel}`, inline: true })
  }

  if (fields.length === 0) {
    fields.push({ name: "ℹ️ No Changes", value: "No channels were specified for setup.", inline: false })
  }

  embed.addFields(fields)
  await interaction.editReply({ embeds: [embed] })
}

async function setupModerationChannels(interaction, client) {
  await interaction.deferReply({ ephemeral: true })

  const modLogChannel = interaction.options.getChannel("mod-log")
  const automodLogChannel = interaction.options.getChannel("automod-log")

  const embed = new EmbedBuilder()
    .setTitle("🛡️ Moderation Setup")
    .setColor(config.embedColor || "#00AAFF")
    .setTimestamp()

  const fields = []

  if (modLogChannel) {
    await configManager.updateConfig("moderation.logChannel", modLogChannel.id)
    fields.push({ name: "✅ Mod Log Channel", value: `${modLogChannel}`, inline: true })
  }

  if (automodLogChannel) {
    await configManager.updateConfig("autoMod.logChannel", automodLogChannel.id)
    fields.push({ name: "✅ AutoMod Log Channel", value: `${automodLogChannel}`, inline: true })
  }

  if (fields.length === 0) {
    fields.push({ name: "ℹ️ No Changes", value: "No channels were specified for setup.", inline: false })
  }

  embed.addFields(fields)
  await interaction.editReply({ embeds: [embed] })
}

async function setupVerificationChannel(interaction, client) {
  await interaction.deferReply({ ephemeral: true })

  const verifyChannel = interaction.options.getChannel("verify-channel")

  const embed = new EmbedBuilder()
    .setTitle("✅ Verification Setup")
    .setColor(config.embedColor || "#00AAFF")
    .setTimestamp()

  if (verifyChannel) {
    // Setup verification panel
    if (client.verification && client.verification.isInitialized) {
      await client.verification.createVerificationMessage(verifyChannel)
      await configManager.updateConfig("verification.channelId", verifyChannel.id)
      embed.addFields({ name: "✅ Verification Channel", value: `${verifyChannel}`, inline: false })
    } else {
      embed.addFields({ name: "❌ Verification Channel", value: "Verification system not initialized", inline: false })
    }
  } else {
    embed.addFields({ name: "ℹ️ No Changes", value: "No verification channel specified.", inline: false })
  }

  await interaction.editReply({ embeds: [embed] })
}

async function createAllChannels(interaction, client) {
  await interaction.deferReply({ ephemeral: true })

  const guild = interaction.guild
  const createdChannels = []
  const errors = []

  try {
    // Create JMF Hosting category
    const category = await guild.channels.create({
      name: "🏢 JMF Hosting",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    })
    createdChannels.push(`📁 ${category.name}`)

    // Create ticket channels
    const ticketCategory = await guild.channels.create({
      name: "🎫 Support Tickets",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    })
    createdChannels.push(`📁 ${ticketCategory.name}`)

    const createTicketChannel = await guild.channels.create({
      name: "create-ticket",
      type: ChannelType.GuildText,
      parent: category,
      topic: "Create support tickets here",
    })
    createdChannels.push(`🎫 ${createTicketChannel.name}`)

    // Create welcome/leave channel
    const welcomeChannel = await guild.channels.create({
      name: "welcome-goodbye",
      type: ChannelType.GuildText,
      parent: category,
      topic: "Welcome new members and goodbye messages",
    })
    createdChannels.push(`👋 ${welcomeChannel.name}`)

    // Create verification channel
    const verificationChannel = await guild.channels.create({
      name: "verification",
      type: ChannelType.GuildText,
      parent: category,
      topic: "Verify yourself to access the server",
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages],
        },
      ],
    })
    createdChannels.push(`✅ ${verificationChannel.name}`)

    // Create moderation category
    const modCategory = await guild.channels.create({
      name: "🛡️ Moderation",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    })
    createdChannels.push(`📁 ${modCategory.name}`)

    // Create mod log channel
    const modLogChannel = await guild.channels.create({
      name: "mod-logs",
      type: ChannelType.GuildText,
      parent: modCategory,
      topic: "Moderation action logs",
    })
    createdChannels.push(`📋 ${modLogChannel.name}`)

    // Create automod log channel
    const automodLogChannel = await guild.channels.create({
      name: "automod-logs",
      type: ChannelType.GuildText,
      parent: modCategory,
      topic: "Automatic moderation logs",
    })
    createdChannels.push(`🤖 ${automodLogChannel.name}`)

    // Update configuration
    await configManager.updateConfig("ticketSystem.categoryName", ticketCategory.name)
    await configManager.updateConfig("ticketSystem.logChannel", modLogChannel.id)
    await configManager.updateConfig("welcomeSystem.channelId", welcomeChannel.id)
    await configManager.updateConfig("leaveSystem.channelId", welcomeChannel.id)
    await configManager.updateConfig("verification.channelId", verificationChannel.id)
    await configManager.updateConfig("moderation.logChannel", modLogChannel.id)
    await configManager.updateConfig("autoMod.logChannel", automodLogChannel.id)

    // Setup systems
    if (client.tickets && client.tickets.isInitialized) {
      await client.tickets.createTicketPanel(createTicketChannel)
    }

    if (client.verification && client.verification.isInitialized) {
      await client.verification.createVerificationMessage(verificationChannel)
    }

    const embed = new EmbedBuilder()
      .setTitle("✅ Channel Setup Complete")
      .setDescription("All necessary channels have been created and configured.")
      .setColor("#00FF00")
      .addFields({ name: "Created Channels", value: createdChannels.join("\n"), inline: false })
      .setTimestamp()

    if (errors.length > 0) {
      embed.addFields({ name: "⚠️ Errors", value: errors.join("\n"), inline: false })
      embed.setColor("#FFAA00")
    }

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    logger.error(`Failed to create all channels: ${error.message}`)

    const embed = new EmbedBuilder()
      .setTitle("❌ Channel Setup Failed")
      .setDescription("An error occurred while creating channels.")
      .setColor("#FF0000")
      .addFields({ name: "Error", value: error.message, inline: false })

    if (createdChannels.length > 0) {
      embed.addFields({ name: "Partially Created", value: createdChannels.join("\n"), inline: false })
    }

    await interaction.editReply({ embeds: [embed] })
  }
}
