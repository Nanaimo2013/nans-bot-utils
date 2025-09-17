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

    // Handle welcome system interactions
    if (interaction.customId?.startsWith("welcome_")) {
      await handleWelcomeInteraction(interaction, client, db)
    }
  },
}

async function handleWelcomeInteraction(interaction, client, db) {
  const { customId } = interaction

  switch (customId) {
    case "welcome_channel_setup":
      await showChannelSelectMenu(interaction, client, "welcome")
      break
    case "welcome_message_setup":
      await showWelcomeMessageModal(interaction)
      break
    case "leave_setup":
      await showLeaveSetupMenu(interaction, client)
      break
    case "welcome_embed_setup":
      await showEmbedStyleMenu(interaction, client)
      break
    case "welcome_roles_setup":
      await showAutoRolesMenu(interaction, client)
      break
    case "welcome_preview":
      await previewWelcomeMessage(interaction, client, db)
      break
  }

  // Handle select menu interactions
  if (interaction.isStringSelectMenu()) {
    if (customId === "welcome_channel_select") {
      await setWelcomeChannel(interaction, client, db)
    } else if (customId === "leave_channel_select") {
      await setLeaveChannel(interaction, client, db)
    }
  }

  // Handle modal submissions
  if (interaction.isModalSubmit()) {
    if (customId === "welcome_message_modal") {
      await saveWelcomeMessage(interaction, client, db)
    } else if (customId === "leave_message_modal") {
      await saveLeaveMessage(interaction, client, db)
    }
  }
}

async function showChannelSelectMenu(interaction, client, type) {
  const channels = interaction.guild.channels.cache
    .filter(
      (channel) => channel.type === ChannelType.GuildText && channel.permissionsFor(client.user).has("SendMessages"),
    )
    .first(25) // Discord limit

  if (channels.length === 0) {
    return interaction.reply({
      content: "❌ No suitable text channels found where I can send messages.",
      ephemeral: true,
    })
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${type}_channel_select`)
    .setPlaceholder(`Select a channel for ${type} messages`)

  for (const channel of channels) {
    selectMenu.addOptions({
      label: `#${channel.name}`,
      description: `${channel.topic || "No description"}`.substring(0, 100),
      value: channel.id,
    })
  }

  const row = new ActionRowBuilder().addComponents(selectMenu)

  await interaction.reply({
    content: `📺 Select a channel for ${type} messages:`,
    components: [row],
    ephemeral: true,
  })
}

async function showWelcomeMessageModal(interaction) {
  const modal = new ModalBuilder().setCustomId("welcome_message_modal").setTitle("Set Welcome Message")

  const messageInput = new TextInputBuilder()
    .setCustomId("welcome_message_input")
    .setLabel("Welcome Message")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(
      "Welcome to {server}, {user}! We're glad to have you here. 🎉\n\nAvailable variables: {user}, {username}, {server}, {membercount}, {date}",
    )
    .setMaxLength(2000)
    .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(messageInput))
  await interaction.showModal(modal)
}

async function showLeaveSetupMenu(interaction, client) {
  const embed = new EmbedBuilder()
    .setColor("#ff6b35")
    .setTitle("📤 Leave Message Setup")
    .setDescription("Configure messages when members leave your server.")
    .addFields({
      name: "Available Variables",
      value:
        "`{user}` - User's name\n`{username}` - Display name\n`{server}` - Server name\n`{membercount}` - Member count\n`{date}` - Current date",
      inline: false,
    })
    .setTimestamp()

  const leaveRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("leave_channel_setup")
      .setLabel("Set Leave Channel")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📺"),
    new ButtonBuilder()
      .setCustomId("leave_message_setup")
      .setLabel("Set Leave Message")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("💬"),
    new ButtonBuilder()
      .setCustomId("leave_toggle")
      .setLabel("Toggle Leave Messages")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🔄"),
  )

  await interaction.update({ embeds: [embed], components: [leaveRow] })
}

async function setWelcomeChannel(interaction, client, db) {
  const channelId = interaction.values[0]
  const channel = interaction.guild.channels.cache.get(channelId)

  if (!channel) {
    return interaction.reply({ content: "❌ Channel not found.", ephemeral: true })
  }

  try {
    await db.run("UPDATE guild_config SET welcome_channel = ? WHERE guild_id = ?", [channelId, interaction.guild.id])

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("✅ Welcome Channel Set")
      .setDescription(`Welcome messages will now be sent to ${channel}.`)
      .addFields({
        name: "Next Steps",
        value:
          "• Set a custom welcome message with `/welcome setup`\n• Test the message with `/welcome test`\n• Configure leave messages if desired",
        inline: false,
      })
      .setTimestamp()

    await interaction.update({ embeds: [embed], components: [] })
  } catch (error) {
    console.error("Error setting welcome channel:", error)
    await interaction.reply({ content: "❌ An error occurred while setting the welcome channel.", ephemeral: true })
  }
}

async function setLeaveChannel(interaction, client, db) {
  const channelId = interaction.values[0]
  const channel = interaction.guild.channels.cache.get(channelId)

  if (!channel) {
    return interaction.reply({ content: "❌ Channel not found.", ephemeral: true })
  }

  try {
    await db.run("UPDATE guild_config SET leave_channel = ? WHERE guild_id = ?", [channelId, interaction.guild.id])

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("✅ Leave Channel Set")
      .setDescription(`Leave messages will now be sent to ${channel}.`)
      .setTimestamp()

    await interaction.update({ embeds: [embed], components: [] })
  } catch (error) {
    console.error("Error setting leave channel:", error)
    await interaction.reply({ content: "❌ An error occurred while setting the leave channel.", ephemeral: true })
  }
}

async function saveWelcomeMessage(interaction, client, db) {
  const message = interaction.fields.getTextInputValue("welcome_message_input")

  try {
    await db.run("UPDATE guild_config SET welcome_message = ? WHERE guild_id = ?", [message, interaction.guild.id])

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("✅ Welcome Message Saved")
      .setDescription("Your custom welcome message has been saved!")
      .addFields(
        { name: "Preview", value: message.substring(0, 1000), inline: false },
        { name: "Test It", value: "Use `/welcome test` to see how it looks!", inline: false },
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed], ephemeral: true })
  } catch (error) {
    console.error("Error saving welcome message:", error)
    await interaction.reply({ content: "❌ An error occurred while saving the welcome message.", ephemeral: true })
  }
}

async function saveLeaveMessage(interaction, client, db) {
  const message = interaction.fields.getTextInputValue("leave_message_input")

  try {
    await db.run("UPDATE guild_config SET leave_message = ? WHERE guild_id = ?", [message, interaction.guild.id])

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("✅ Leave Message Saved")
      .setDescription("Your custom leave message has been saved!")
      .addFields({ name: "Preview", value: message.substring(0, 1000), inline: false })
      .setTimestamp()

    await interaction.reply({ embeds: [embed], ephemeral: true })
  } catch (error) {
    console.error("Error saving leave message:", error)
    await interaction.reply({ content: "❌ An error occurred while saving the leave message.", ephemeral: true })
  }
}

async function previewWelcomeMessage(interaction, client, db) {
  try {
    const config = await db.get("SELECT welcome_channel, welcome_message FROM guild_config WHERE guild_id = ?", [
      interaction.guild.id,
    ])

    if (!config?.welcome_channel) {
      return interaction.reply({
        content: "❌ Welcome channel not set. Please configure it first.",
        ephemeral: true,
      })
    }

    const welcomeMessage = config.welcome_message || `Welcome to **{server}**, {user}! We're glad to have you here. 🎉`

    const processedMessage = welcomeMessage
      .replace(/{user}/g, `<@${interaction.user.id}>`)
      .replace(/{username}/g, interaction.user.displayName)
      .replace(/{server}/g, interaction.guild.name)
      .replace(/{membercount}/g, interaction.guild.memberCount.toString())
      .replace(/{date}/g, new Date().toLocaleDateString())

    const previewEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("👁️ Welcome Message Preview")
      .setDescription("Here's how your welcome message will look:")
      .setTimestamp()

    const welcomeEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("👋 Welcome!")
      .setDescription(processedMessage)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Member Count", value: `${interaction.guild.memberCount}`, inline: true },
        {
          name: "Account Created",
          value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
      )
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    await interaction.reply({ embeds: [previewEmbed, welcomeEmbed], ephemeral: true })
  } catch (error) {
    console.error("Error previewing welcome message:", error)
    await interaction.reply({ content: "❌ An error occurred while previewing the welcome message.", ephemeral: true })
  }
}

async function showEmbedStyleMenu(interaction, client) {
  // Placeholder function for showEmbedStyleMenu
  await interaction.reply({ content: "Embed style setup is not implemented yet.", ephemeral: true })
}

async function showAutoRolesMenu(interaction, client) {
  // Placeholder function for showAutoRolesMenu
  await interaction.reply({ content: "Auto roles setup is not implemented yet.", ephemeral: true })
}
