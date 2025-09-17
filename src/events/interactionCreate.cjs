const {
  Events,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
} = require("discord.js")

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client, db) {
    // Handle button interactions
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction, client, db)
    }

    // Handle select menu interactions
    if (interaction.isStringSelectMenu()) {
      await handleSelectMenuInteraction(interaction, client, db)
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction, client, db)
    }
  },
}

async function handleButtonInteraction(interaction, client, db) {
  const { customId } = interaction

  switch (customId) {
    case "create_ticket_panel":
      await createTicketFromPanel(interaction, client, db)
      break
    case "close_ticket":
      await closeTicketButton(interaction, client, db)
      break
    case "claim_ticket":
      await claimTicket(interaction, client, db)
      break
    case "transcript_ticket":
      await generateTranscriptButton(interaction, client, db)
      break
  }
}

async function createTicketFromPanel(interaction, client, db) {
  const userId = interaction.user.id
  const guildId = interaction.guild.id

  // Check if user already has an open ticket
  const existingTicket = await db.get(
    "SELECT channel_id FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'",
    [guildId, userId],
  )

  if (existingTicket) {
    return interaction.reply({
      content: `You already have an open ticket: <#${existingTicket.channel_id}>`,
      ephemeral: true,
    })
  }

  // Show category selection
  const categorySelect = new StringSelectMenuBuilder()
    .setCustomId("ticket_category_select")
    .setPlaceholder("Select a ticket category")
    .addOptions([
      {
        label: "General Support",
        description: "General questions and help",
        value: "general",
        emoji: "🔧",
      },
      {
        label: "Bug Report",
        description: "Report bugs or issues",
        value: "bug",
        emoji: "🐛",
      },
      {
        label: "Feature Request",
        description: "Suggest new features",
        value: "feature",
        emoji: "💡",
      },
      {
        label: "Player Report",
        description: "Report rule violations",
        value: "report",
        emoji: "⚠️",
      },
      {
        label: "Unban Request",
        description: "Appeal a ban",
        value: "unban",
        emoji: "🔓",
      },
      {
        label: "Other",
        description: "Anything else",
        value: "other",
        emoji: "❓",
      },
    ])

  const row = new ActionRowBuilder().addComponents(categorySelect)

  await interaction.reply({
    content: "Please select a category for your ticket:",
    components: [row],
    ephemeral: true,
  })
}

async function handleSelectMenuInteraction(interaction, client, db) {
  if (interaction.customId === "ticket_category_select") {
    const category = interaction.values[0]

    // Show description modal
    const modal = new ModalBuilder().setCustomId(`ticket_description_${category}`).setTitle("Create Ticket")

    const descriptionInput = new TextInputBuilder()
      .setCustomId("ticket_description")
      .setLabel("Describe your issue")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Please provide details about your issue...")
      .setRequired(true)
      .setMaxLength(1000)

    const firstActionRow = new ActionRowBuilder().addComponents(descriptionInput)
    modal.addComponents(firstActionRow)

    await interaction.showModal(modal)
  }

  if (interaction.customId === "embed_select") {
    const embedType = interaction.values[0]
    const session = interaction.client.embedSessions?.get(interaction.user.id)

    if (!session) {
      return interaction.reply({
        content: "❌ Session expired. Please run the command again.",
        ephemeral: true,
      })
    }

    const channel = session.channel
    let embed

    try {
      switch (embedType) {
        case "rules":
          const { createRulesEmbed } = require("../embeds/rules")
          embed = createRulesEmbed()
          break
        case "faq":
          const { createFAQEmbed } = require("../embeds/faq")
          embed = createFAQEmbed()
          break
        case "roles":
          const { createRolesEmbed } = require("../embeds/roles")
          embed = createRolesEmbed()
          break
        case "verify":
          const { createVerifyEmbed } = require("../embeds/verify")
          embed = createVerifyEmbed()
          break
        case "node_status":
          const { createNodeStatusEmbed } = require("../embeds/nodeStatus")
          embed = await createNodeStatusEmbed()
          break
        default:
          return interaction.reply({
            content: "❌ Unknown embed type selected.",
            ephemeral: true,
          })
      }

      await channel.send({ embeds: [embed] })

      // Clean up session
      interaction.client.embedSessions.delete(interaction.user.id)

      await interaction.reply({
        content: `✅ ${embedType.charAt(0).toUpperCase() + embedType.slice(1)} embed posted to ${channel}!`,
        ephemeral: true,
      })
    } catch (error) {
      console.error("Error posting embed:", error)
      await interaction.reply({
        content: "❌ Failed to post embed. Please check my permissions.",
        ephemeral: true,
      })
    }
  }

  if (interaction.customId === "announce_channel_select") {
    const channelId = interaction.values[0]
    const session = interaction.client.announcementSessions?.get(interaction.user.id)

    if (!session) {
      return interaction.reply({
        content: "❌ Session expired. Please run the command again.",
        ephemeral: true,
      })
    }

    session.announcementData.channel = channelId

    await interaction.reply({
      content: `✅ Channel set to <#${channelId}>!`,
      ephemeral: true,
    })
  }

  if (interaction.customId === "announce_role_select") {
    const selectedValues = interaction.values
    const session = interaction.client.announcementSessions?.get(interaction.user.id)

    if (!session) {
      return interaction.reply({
        content: "❌ Session expired. Please run the command again.",
        ephemeral: true,
      })
    }

    if (selectedValues.includes("everyone")) {
      session.announcementData.everyonePing = true
      session.announcementData.rolePings = selectedValues.filter((v) => v !== "everyone")
    } else {
      session.announcementData.everyonePing = false
      session.announcementData.rolePings = selectedValues
    }

    const pingText = session.announcementData.everyonePing ? "@everyone" : ""
    const roleText = session.announcementData.rolePings.map((id) => `<@&${id}>`).join(", ")
    const finalText = [pingText, roleText].filter(Boolean).join(", ") || "None"

    await interaction.reply({
      content: `✅ Role pings set to: ${finalText}`,
      ephemeral: true,
    })
  }
}

async function handleModalSubmit(interaction, client, db) {
  if (interaction.customId.startsWith("ticket_description_")) {
    const category = interaction.customId.split("_")[2]
    const description = interaction.fields.getTextInputValue("ticket_description")

    await createTicketWithDescription(interaction, client, db, category, description)
  }

  if (interaction.customId === "serverinfo_create") {
    const serverName = interaction.fields.getTextInputValue("server_name")
    const serverIP = interaction.fields.getTextInputValue("server_ip")
    const serverDetails = interaction.fields.getTextInputValue("server_details") || ""
    const serverFeatures = interaction.fields.getTextInputValue("server_features") || ""
    const serverRules = interaction.fields.getTextInputValue("server_rules") || ""

    // Parse server details
    const details = serverDetails.split(",").map((d) => d.trim())
    const [map = "Washington", gameMode = "PvP", maxPlayers = "24"] = details

    // Parse features and rules
    const features = serverFeatures
      .split("\n")
      .filter((f) => f.trim())
      .map((f) => f.trim())
    const rules = serverRules
      .split("\n")
      .filter((r) => r.trim())
      .map((r) => r.trim())

    // Parse IP and port
    const [ip, port = "27015"] = serverIP.split(":")

    const serverData = {
      serverName,
      serverIP: ip,
      serverPort: port,
      maxPlayers,
      currentPlayers: "0",
      gameMode,
      map,
      features,
      rules,
      status: "online",
    }

    const { createServerInfoEmbed } = require("../embeds/serverInfo")
    const embed = createServerInfoEmbed(serverData)

    await interaction.reply({
      content: "✅ Server info embed created! Here's a preview:",
      embeds: [embed],
      ephemeral: true,
    })
  }
}

async function createTicketWithDescription(interaction, client, db, category, description) {
  const userId = interaction.user.id
  const guildId = interaction.guild.id

  // Get guild config
  const config = await db.get("SELECT ticket_category FROM guild_config WHERE guild_id = ?", [guildId])
  if (!config?.ticket_category) {
    return interaction.reply({
      content: "Ticket system is not set up. Please ask an administrator to run `/ticket setup`.",
      ephemeral: true,
    })
  }

  const ticketCategory = interaction.guild.channels.cache.get(config.ticket_category)
  if (!ticketCategory) {
    return interaction.reply({
      content: "Ticket category not found. Please ask an administrator to reconfigure the ticket system.",
      ephemeral: true,
    })
  }

  try {
    // Create ticket channel
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}-${Date.now().toString().slice(-4)}`,
      type: 0, // Text channel
      parent: ticketCategory.id,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ["ViewChannel"],
        },
        {
          id: interaction.user.id,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        },
        {
          id: client.user.id,
          allow: ["ViewChannel", "SendMessages", "ManageChannels", "ReadMessageHistory"],
        },
      ],
    })

    // Add staff roles to ticket
    const staffRoles = interaction.guild.roles.cache.filter(
      (role) => role.permissions.has("ManageMessages") || role.permissions.has("Administrator"),
    )

    for (const role of staffRoles.values()) {
      await ticketChannel.permissionOverwrites.create(role.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      })
    }

    // Save ticket to database
    const result = await db.run(
      "INSERT INTO tickets (guild_id, channel_id, user_id, category, status) VALUES (?, ?, ?, ?, 'open')",
      [guildId, ticketChannel.id, userId, category],
    )

    // Create ticket embed with description
    const ticketEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`🎫 Ticket #${result.id}`)
      .setDescription(`Welcome <@${userId}>! A staff member will assist you shortly.`)
      .addFields(
        { name: "Category", value: getCategoryName(category), inline: true },
        { name: "Created", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        { name: "Status", value: "🟢 Open", inline: true },
        { name: "Issue Description", value: description, inline: false },
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    // Create control buttons
    const controlRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Close Ticket")
        .setStyle(4)
        .setEmoji("🔒"), // Danger style
      new ButtonBuilder()
        .setCustomId("claim_ticket")
        .setLabel("Claim Ticket")
        .setStyle(1)
        .setEmoji("👤"), // Primary style
      new ButtonBuilder()
        .setCustomId("transcript_ticket")
        .setLabel("Generate Transcript")
        .setStyle(2)
        .setEmoji("📄"), // Secondary style
    )

    await ticketChannel.send({ embeds: [ticketEmbed], components: [controlRow] })

    await interaction.reply({
      content: `✅ Ticket created successfully! Please check <#${ticketChannel.id}>`,
      ephemeral: true,
    })
  } catch (error) {
    console.error("Error creating ticket:", error)
    await interaction.reply({ content: "An error occurred while creating the ticket.", ephemeral: true })
  }
}

function getCategoryName(category) {
  const categories = {
    general: "🔧 General Support",
    bug: "🐛 Bug Report",
    feature: "💡 Feature Request",
    report: "⚠️ Player Report",
    unban: "🔓 Unban Request",
    other: "❓ Other",
  }
  return categories[category] || "❓ Other"
}

async function closeTicketButton(interaction, client, db) {
  // Implementation for closing a ticket
}

async function claimTicket(interaction, client, db) {
  // Implementation for claiming a ticket
}

async function generateTranscriptButton(interaction, client, db) {
  // Implementation for generating a transcript
}
