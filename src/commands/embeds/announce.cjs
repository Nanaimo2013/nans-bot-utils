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
    .setName("announce")
    .setDescription("Create and send announcements with interactive builder")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client, db) {
    const embed = new EmbedBuilder()
      .setColor("#ff6b35")
      .setTitle("📢 Announcement Builder")
      .setDescription(
        "Create a professional announcement with our interactive builder!\n\n" +
          "**Features:**\n" +
          "• Rich embed formatting\n" +
          "• Role mentions and pings\n" +
          "• Live preview before sending\n" +
          "• Channel selection\n" +
          "• Custom styling options",
      )
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    const startButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("start_announcement")
        .setLabel("Start Building")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🚀"),
    )

    await interaction.reply({ embeds: [embed], components: [startButton], ephemeral: true })

    // Initialize announcement session
    if (!client.announcementSessions) client.announcementSessions = new Map()
    client.announcementSessions.set(interaction.user.id, {
      guildId: interaction.guild.id,
      announcementData: {
        title: "",
        description: "",
        color: "#ff6b35",
        image: null,
        thumbnail: null,
        footer: null,
        channel: null,
        rolePings: [],
        everyonePing: false,
      },
      lastInteraction: interaction,
    })
  },
}
