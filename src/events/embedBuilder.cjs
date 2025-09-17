const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  ChannelType,
} = require("discord.js")

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client, db) {
    if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return

    // Handle embed builder interactions
    if (interaction.customId?.startsWith("embed_")) {
      await handleEmbedBuilder(interaction, client, db)
    }

    // Handle announcement builder interactions
    if (interaction.customId?.startsWith("announce_") || interaction.customId === "start_announcement") {
      await handleAnnouncementBuilder(interaction, client, db)
    }
  },
}

async function handleEmbedBuilder(interaction, client, db) {
  if (!client.embedSessions?.has(interaction.user.id)) {
    return interaction.reply({ content: "❌ No active embed session found. Please start a new one.", ephemeral: true })
  }

  const session = client.embedSessions.get(interaction.user.id)
  const { customId } = interaction

  switch (customId) {
    case "embed_title":
      await showEmbedTitleModal(interaction)
      break
    case "embed_description":
      await showEmbedDescriptionModal(interaction)
      break
    case "embed_color":
      await showEmbedColorModal(interaction)
      break
    case "embed_fields":
      await showEmbedFieldsModal(interaction)
      break
    case "embed_image":
      await showEmbedImageModal(interaction)
      break
    case "embed_thumbnail":
      await showEmbedThumbnailModal(interaction)
      break
    case "embed_footer":
      await showEmbedFooterModal(interaction)
      break
    case "embed_preview":
      await previewEmbed(interaction, client)
      break
    case "embed_save":
      await saveEmbed(interaction, client, db)
      break
  }
}

async function handleAnnouncementBuilder(interaction, client, db) {
  const { customId } = interaction

  if (customId === "start_announcement") {
    await showAnnouncementBuilder(interaction, client)
    return
  }

  if (!client.announcementSessions?.has(interaction.user.id)) {
    return interaction.reply({
      content: "❌ No active announcement session found. Please start a new one.",
      ephemeral: true,
    })
  }

  switch (customId) {
    case "announce_title":
      await showAnnouncementTitleModal(interaction)
      break
    case "announce_description":
      await showAnnouncementDescriptionModal(interaction)
      break
    case "announce_channel":
      await showChannelSelect(interaction, client)
      break
    case "announce_roles":
      await showRoleSelect(interaction, client)
      break
    case "announce_preview":
      await previewAnnouncement(interaction, client)
      break
    case "announce_send":
      await sendAnnouncement(interaction, client, db)
      break
  }
}

// Embed Builder Modals
async function showEmbedTitleModal(interaction) {
  const modal = new ModalBuilder().setCustomId("embed_title_modal").setTitle("Set Embed Title")

  const titleInput = new TextInputBuilder()
    .setCustomId("title_input")
    .setLabel("Embed Title")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter the embed title...")
    .setMaxLength(256)
    .setRequired(false)

  modal.addComponents(new ActionRowBuilder().addComponents(titleInput))
  await interaction.showModal(modal)
}

async function showEmbedDescriptionModal(interaction) {
  const modal = new ModalBuilder().setCustomId("embed_description_modal").setTitle("Set Embed Description")

  const descriptionInput = new TextInputBuilder()
    .setCustomId("description_input")
    .setLabel("Embed Description")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Enter the embed description...")
    .setMaxLength(4000)
    .setRequired(false)

  modal.addComponents(new ActionRowBuilder().addComponents(descriptionInput))
  await interaction.showModal(modal)
}

async function showEmbedColorModal(interaction) {
  const modal = new ModalBuilder().setCustomId("embed_color_modal").setTitle("Set Embed Color")

  const colorInput = new TextInputBuilder()
    .setCustomId("color_input")
    .setLabel("Embed Color (hex code)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("#0099ff")
    .setMaxLength(7)
    .setRequired(false)

  modal.addComponents(new ActionRowBuilder().addComponents(colorInput))
  await interaction.showModal(modal)
}

async function showEmbedFieldsModal(interaction) {
  // Placeholder for showEmbedFieldsModal implementation
}

async function showEmbedImageModal(interaction) {
  // Placeholder for showEmbedImageModal implementation
}

async function showEmbedThumbnailModal(interaction) {
  // Placeholder for showEmbedThumbnailModal implementation
}

async function showEmbedFooterModal(interaction) {
  // Placeholder for showEmbedFooterModal implementation
}

async function showAnnouncementBuilder(interaction, client) {
  const embed = new EmbedBuilder()
    .setColor("#ff6b35")
    .setTitle("📢 Build Your Announcement")
    .setDescription("Configure your announcement using the buttons below:")
    .addFields(
      { name: "📝 Title", value: "Not set", inline: true },
      { name: "📄 Description", value: "Not set", inline: true },
      { name: "📺 Channel", value: "Not selected", inline: true },
      { name: "👥 Role Pings", value: "None", inline: true },
      { name: "🎨 Style", value: "Default", inline: true },
      { name: "📊 Status", value: "🔧 Building...", inline: true },
    )
    .setTimestamp()

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("announce_title")
      .setLabel("Set Title")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📝"),
    new ButtonBuilder()
      .setCustomId("announce_description")
      .setLabel("Set Description")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📄"),
    new ButtonBuilder()
      .setCustomId("announce_channel")
      .setLabel("Select Channel")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📺"),
  )

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("announce_roles")
      .setLabel("Role Pings")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👥"),
    new ButtonBuilder().setCustomId("announce_preview").setLabel("Preview").setStyle(ButtonStyle.Success).setEmoji("👁️"),
    new ButtonBuilder().setCustomId("announce_send").setLabel("Send Now").setStyle(ButtonStyle.Danger).setEmoji("🚀"),
  )

  await interaction.update({ embeds: [embed], components: [row1, row2] })
}

async function showAnnouncementTitleModal(interaction) {
  const modal = new ModalBuilder().setCustomId("announce_title_modal").setTitle("Set Announcement Title")

  const titleInput = new TextInputBuilder()
    .setCustomId("title_input")
    .setLabel("Announcement Title")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter announcement title...")
    .setMaxLength(256)
    .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(titleInput))
  await interaction.showModal(modal)
}

async function showAnnouncementDescriptionModal(interaction) {
  const modal = new ModalBuilder().setCustomId("announce_description_modal").setTitle("Set Announcement Content")

  const descriptionInput = new TextInputBuilder()
    .setCustomId("description_input")
    .setLabel("Announcement Content")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Enter your announcement content...")
    .setMaxLength(4000)
    .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(descriptionInput))
  await interaction.showModal(modal)
}

async function previewAnnouncement(interaction, client) {
  const session = client.announcementSessions.get(interaction.user.id)
  const data = session.announcementData

  if (!data.title || !data.description) {
    return interaction.reply({
      content: "❌ Please set both title and description before previewing.",
      ephemeral: true,
    })
  }

  const { createAnnouncementEmbed } = require("../embeds/announcement")
  const previewEmbed = createAnnouncementEmbed("announcement")

  // Override with user's custom data
  previewEmbed.setTitle(data.title)
  previewEmbed.setDescription(data.description)
  previewEmbed.setColor(data.color)

  if (data.image) previewEmbed.setImage(data.image)
  if (data.thumbnail) previewEmbed.setThumbnail(data.thumbnail)

  let content = ""
  if (data.everyonePing) content += "@everyone "
  if (data.rolePings.length > 0) {
    content += data.rolePings.map((roleId) => `<@&${roleId}>`).join(" ")
  }

  const previewMessage = new EmbedBuilder()
    .setColor("#00ff00")
    .setTitle("👁️ Announcement Preview")
    .setDescription(
      `**Channel:** ${data.channel ? `<#${data.channel}>` : "Not selected"}\n` +
        `**Role Pings:** ${data.rolePings.length > 0 || data.everyonePing ? "Yes" : "None"}\n\n` +
        "**Preview:**",
    )

  await interaction.reply({
    content: content || undefined,
    embeds: [previewMessage, previewEmbed],
    ephemeral: true,
  })
}

async function sendAnnouncement(interaction, client, db) {
  const session = client.announcementSessions.get(interaction.user.id)
  const data = session.announcementData

  if (!data.title || !data.description) {
    return interaction.reply({
      content: "❌ Please set both title and description before sending.",
      ephemeral: true,
    })
  }

  if (!data.channel) {
    return interaction.reply({ content: "❌ Please select a channel before sending.", ephemeral: true })
  }

  try {
    const targetChannel = interaction.guild.channels.cache.get(data.channel)
    if (!targetChannel) {
      return interaction.reply({ content: "❌ Selected channel not found.", ephemeral: true })
    }

    const { createAnnouncementEmbed } = require("../embeds/announcement")
    const announcementEmbed = createAnnouncementEmbed("announcement")

    // Override with user's custom data
    announcementEmbed.setTitle(data.title)
    announcementEmbed.setDescription(data.description)
    announcementEmbed.setColor(data.color)

    if (data.image) announcementEmbed.setImage(data.image)
    if (data.thumbnail) announcementEmbed.setThumbnail(data.thumbnail)

    let content = ""
    if (data.everyonePing) content += "@everyone "
    if (data.rolePings.length > 0) {
      content += data.rolePings.map((roleId) => `<@&${roleId}>`).join(" ")
    }

    await targetChannel.send({
      content: content || undefined,
      embeds: [announcementEmbed],
    })

    // Clean up session
    client.announcementSessions.delete(interaction.user.id)

    await interaction.reply({
      content: `✅ Announcement sent successfully to ${targetChannel}!`,
      ephemeral: true,
    })

    // Log the announcement
    const guildConfig = await db.get("SELECT logs_channel FROM guild_config WHERE guild_id = ?", [interaction.guild.id])
    if (guildConfig?.logs_channel) {
      const logChannel = interaction.guild.channels.cache.get(guildConfig.logs_channel)
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor("#ff6b35")
          .setTitle("📢 Announcement Sent")
          .addFields(
            { name: "Sent By", value: `<@${interaction.user.id}>`, inline: true },
            { name: "Channel", value: `<#${data.channel}>`, inline: true },
            { name: "Title", value: data.title, inline: false },
          )
          .setTimestamp()

        await logChannel.send({ embeds: [logEmbed] })
      }
    }
  } catch (error) {
    console.error("Error sending announcement:", error)
    await interaction.reply({ content: "❌ An error occurred while sending the announcement.", ephemeral: true })
  }
}

// Handle modal submissions
module.exports.handleModalSubmit = async (interaction, client, db) => {
  if (interaction.customId.endsWith("_modal")) {
    if (interaction.customId.startsWith("embed_")) {
      await handleEmbedModalSubmit(interaction, client)
    } else if (interaction.customId.startsWith("announce_")) {
      await handleAnnouncementModalSubmit(interaction, client)
    }
  }
}

async function handleEmbedModalSubmit(interaction, client) {
  const session = client.embedSessions.get(interaction.user.id)
  if (!session) return

  const { customId } = interaction

  switch (customId) {
    case "embed_title_modal":
      session.embedData.title = interaction.fields.getTextInputValue("title_input")
      break
    case "embed_description_modal":
      session.embedData.description = interaction.fields.getTextInputValue("description_input")
      break
    case "embed_color_modal":
      session.embedData.color = interaction.fields.getTextInputValue("color_input") || "#0099ff"
      break
  }

  await interaction.reply({ content: "✅ Updated successfully!", ephemeral: true })
}

async function handleAnnouncementModalSubmit(interaction, client) {
  const session = client.announcementSessions.get(interaction.user.id)
  if (!session) return

  const { customId } = interaction

  switch (customId) {
    case "announce_title_modal":
      session.announcementData.title = interaction.fields.getTextInputValue("title_input")
      break
    case "announce_description_modal":
      session.announcementData.description = interaction.fields.getTextInputValue("description_input")
      break
  }

  await interaction.reply({ content: "✅ Updated successfully!", ephemeral: true })
}

async function showChannelSelect(interaction, client) {
  const channels = interaction.guild.channels.cache
    .filter((channel) => channel.type === 0 && channel.permissionsFor(interaction.guild.members.me).has("SendMessages"))
    .first(25)

  if (channels.length === 0) {
    return interaction.reply({
      content: "❌ No available text channels found.",
      ephemeral: true,
    })
  }

  const channelSelect = new StringSelectMenuBuilder()
    .setCustomId("announce_channel_select")
    .setPlaceholder("Select a channel to send the announcement")
    .addOptions(
      channels.map((channel) => ({
        label: `#${channel.name}`,
        description: channel.topic ? channel.topic.substring(0, 100) : "No description",
        value: channel.id,
      })),
    )

  const row = new ActionRowBuilder().addComponents(channelSelect)

  await interaction.reply({
    content: "Select a channel for your announcement:",
    components: [row],
    ephemeral: true,
  })
}

async function showRoleSelect(interaction, client) {
  const roles = interaction.guild.roles.cache
    .filter((role) => role.id !== interaction.guild.id && !role.managed)
    .first(25)

  if (roles.length === 0) {
    return interaction.reply({
      content: "❌ No available roles found.",
      ephemeral: true,
    })
  }

  const roleSelect = new StringSelectMenuBuilder()
    .setCustomId("announce_role_select")
    .setPlaceholder("Select roles to ping (optional)")
    .setMaxValues(Math.min(roles.length, 10))
    .addOptions([
      {
        label: "@everyone",
        description: "Ping everyone in the server",
        value: "everyone",
      },
      ...roles.map((role) => ({
        label: `@${role.name}`,
        description: `${role.members.size} members`,
        value: role.id,
      })),
    ])

  const row = new ActionRowBuilder().addComponents(roleSelect)

  await interaction.reply({
    content: "Select roles to ping with your announcement (optional):",
    components: [row],
    ephemeral: true,
  })
}

async function previewEmbed(interaction, client) {
  // Placeholder for previewEmbed implementation
}

async function saveEmbed(interaction, client, db) {
  // Placeholder for saveEmbed implementation
}
