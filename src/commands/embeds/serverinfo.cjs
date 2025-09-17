/**
 * Nans Bot Utils By NansStudios
 *
 * © 2025 NansStudios. All Rights Reserved.
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js")
const { createServerInfoEmbed } = require("../../embeds/serverInfo.cjs")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Create and send server information embeds")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) => subcommand.setName("create").setDescription("Create a new server info embed"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("Send a server info embed to a channel")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("Channel to send the server info to").setRequired(true),
        ),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === "create") {
      // Show server info creation modal
      const modal = new ModalBuilder().setCustomId("serverinfo_create").setTitle("Create Server Info Embed")

      const serverNameInput = new TextInputBuilder()
        .setCustomId("server_name")
        .setLabel("Server Name")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("My Awesome Unturned Server")
        .setRequired(true)

      const serverIPInput = new TextInputBuilder()
        .setCustomId("server_ip")
        .setLabel("Server IP:Port")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("123.456.789.0:27015")
        .setRequired(true)

      const serverDetailsInput = new TextInputBuilder()
        .setCustomId("server_details")
        .setLabel("Server Details (Map, Mode, Max Players)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Washington, PvP, 24")
        .setRequired(false)

      const serverFeaturesInput = new TextInputBuilder()
        .setCustomId("server_features")
        .setLabel("Server Features (one per line)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Custom loot tables\nActive admins\nRegular events")
        .setRequired(false)

      const serverRulesInput = new TextInputBuilder()
        .setCustomId("server_rules")
        .setLabel("Server Rules (one per line)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("No cheating\nRespect other players\nNo griefing")
        .setRequired(false)

      const firstRow = new ActionRowBuilder().addComponents(serverNameInput)
      const secondRow = new ActionRowBuilder().addComponents(serverIPInput)
      const thirdRow = new ActionRowBuilder().addComponents(serverDetailsInput)
      const fourthRow = new ActionRowBuilder().addComponents(serverFeaturesInput)
      const fifthRow = new ActionRowBuilder().addComponents(serverRulesInput)

      modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow)

      await interaction.showModal(modal)
    } else if (subcommand === "send") {
      const channel = interaction.options.getChannel("channel")

      // Create a default server info embed
      const defaultServerData = {
        serverName: "Unturned Server",
        serverIP: "your-server-ip.com",
        serverPort: "27015",
        maxPlayers: "24",
        currentPlayers: "0",
        gameMode: "PvP",
        map: "Washington",
        features: ["Custom loot tables", "Active admin support", "Regular events", "Fair play enforcement"],
        rules: [
          "No cheating or exploiting",
          "Respect other players",
          "No griefing or trolling",
          "Follow admin instructions",
        ],
      }

      const embed = createServerInfoEmbed(defaultServerData)

      try {
        await channel.send({ embeds: [embed] })
        await interaction.reply({
          content: `✅ Server info embed sent to ${channel}!`,
          ephemeral: true,
        })
      } catch (error) {
        console.error("Error sending server info embed:", error)
        await interaction.reply({
          content: "❌ Failed to send server info embed. Please check my permissions.",
          ephemeral: true,
        })
      }
    }
  },
}
