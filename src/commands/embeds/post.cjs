/**
 * Nans Bot Utils By NansStudios
 *
 * © 2025 NansStudios. All Rights Reserved.
 */

const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js")
const { createRulesEmbed } = require("../../embeds/rules.cjs")
const { createFAQEmbed } = require("../../embeds/faq.cjs")
const { createRolesEmbed } = require("../../embeds/roles.cjs")
const { createVerifyEmbed } = require("../../embeds/verify.cjs")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("post")
    .setDescription("Post pre-made embeds to channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Channel to post the embed to").setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel")

    // Create embed selection menu
    const embedSelect = new StringSelectMenuBuilder()
      .setCustomId("embed_select")
      .setPlaceholder("Choose an embed to post")
      .addOptions([
        {
          label: "Rules Embed",
          description: "Post the server rules embed",
          value: "rules",
          emoji: "📜",
        },
        {
          label: "FAQ Embed",
          description: "Post the frequently asked questions embed",
          value: "faq",
          emoji: "❓",
        },
        {
          label: "Roles Embed",
          description: "Post the server roles information embed",
          value: "roles",
          emoji: "🎭",
        },
        {
          label: "Verification Embed",
          description: "Post the verification embed",
          value: "verify",
          emoji: "🔐",
        },
        {
          label: "Node Status Embed",
          description: "Post the server node status embed",
          value: "node_status",
          emoji: "🖥️",
        },
      ])

    const row = new ActionRowBuilder().addComponents(embedSelect)

    // Store channel in a temporary session
    if (!interaction.client.embedSessions) {
      interaction.client.embedSessions = new Map()
    }

    interaction.client.embedSessions.set(interaction.user.id, {
      channel: channel,
      timestamp: Date.now(),
    })

    await interaction.reply({
      content: `Select an embed to post to ${channel}:`,
      components: [row],
      ephemeral: true,
    })
  },
}
