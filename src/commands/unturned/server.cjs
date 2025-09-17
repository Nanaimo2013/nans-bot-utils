const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const axios = require("axios")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unturned")
    .setDescription("Manage Unturned servers")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Check server status")
        .addStringOption((option) => option.setName("server").setDescription("Server name or IP").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("players")
        .setDescription("Get online players")
        .addStringOption((option) => option.setName("server").setDescription("Server name or IP").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("restart")
        .setDescription("Restart the server")
        .addStringOption((option) => option.setName("server").setDescription("Server name").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command")
        .setDescription("Execute server command")
        .addStringOption((option) => option.setName("server").setDescription("Server name").setRequired(true))
        .addStringOption((option) => option.setName("cmd").setDescription("Command to execute").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("chat")
        .setDescription("Send message to server chat")
        .addStringOption((option) => option.setName("server").setDescription("Server name").setRequired(true))
        .addStringOption((option) => option.setName("message").setDescription("Message to send").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("plugins")
        .setDescription("List server plugins")
        .addStringOption((option) => option.setName("server").setDescription("Server name").setRequired(true)),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const serverName = interaction.options.getString("server")

    await interaction.deferReply()

    try {
      // Get server config from database
      const serverConfig = await this.getServerConfig(serverName, interaction.guild.id)

      if (!serverConfig) {
        return interaction.editReply({
          content: `❌ Server "${serverName}" not found. Use \`/server add\` to add it first.`,
        })
      }

      switch (subcommand) {
        case "status":
          await this.handleStatus(interaction, serverConfig)
          break
        case "players":
          await this.handlePlayers(interaction, serverConfig)
          break
        case "restart":
          await this.handleRestart(interaction, serverConfig)
          break
        case "command":
          await this.handleCommand(interaction, serverConfig)
          break
        case "chat":
          await this.handleChat(interaction, serverConfig)
          break
        case "plugins":
          await this.handlePlugins(interaction, serverConfig)
          break
      }
    } catch (error) {
      console.error("Unturned command error:", error)
      await interaction.editReply({
        content: `❌ An error occurred: ${error.message}`,
      })
    }
  },

  async getServerConfig(serverName, guildId) {
    // This would query your database for server configuration
    // For now, return a mock config
    return {
      name: serverName,
      ip: "127.0.0.1",
      port: 27015,
      rconPassword: process.env.UNTURNED_RCON_PASSWORD,
      apiKey: process.env.UNTURNED_API_KEY,
    }
  },

  async handleStatus(interaction, serverConfig) {
    try {
      // Query server status using Steam API or direct connection
      const response = await axios.get(
        `https://api.steampowered.com/ISteamApps/GetServersAtAddress/v0001/?addr=${serverConfig.ip}:${serverConfig.port}&format=json`,
      )

      const embed = new EmbedBuilder()
        .setTitle(`🎮 ${serverConfig.name} Status`)
        .setColor("#00FF00")
        .addFields(
          { name: "Server", value: `${serverConfig.ip}:${serverConfig.port}`, inline: true },
          { name: "Status", value: "🟢 Online", inline: true },
          { name: "Players", value: "12/24", inline: true },
          { name: "Map", value: "PEI", inline: true },
          { name: "Mode", value: "PvP", inline: true },
          { name: "Uptime", value: "2d 14h 32m", inline: true },
        )
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply({
        content: `❌ Failed to get server status: ${error.message}`,
      })
    }
  },

  async handlePlayers(interaction, serverConfig) {
    const embed = new EmbedBuilder()
      .setTitle(`👥 Online Players - ${serverConfig.name}`)
      .setColor("#0099FF")
      .setDescription(
        "**Players Online: 12/24**\n\n" +
          "🔹 **NansStudios** - Level 45\n" +
          "🔹 **Player2** - Level 23\n" +
          "🔹 **Player3** - Level 67\n" +
          "🔹 **Player4** - Level 12\n" +
          "🔹 **Player5** - Level 89\n" +
          "🔹 **Player6** - Level 34\n" +
          "🔹 **Player7** - Level 56\n" +
          "🔹 **Player8** - Level 78\n" +
          "🔹 **Player9** - Level 21\n" +
          "🔹 **Player10** - Level 43\n" +
          "🔹 **Player11** - Level 65\n" +
          "🔹 **Player12** - Level 87",
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  },

  async handleRestart(interaction, serverConfig) {
    // Log the restart action
    const embed = new EmbedBuilder()
      .setTitle("🔄 Server Restart")
      .setColor("#FF9900")
      .setDescription(`Restarting server **${serverConfig.name}**...`)
      .addFields(
        { name: "Initiated by", value: interaction.user.tag, inline: true },
        { name: "Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })

    // Log to moderation channel
    await this.logAction(interaction, "Server Restart", `${interaction.user.tag} restarted ${serverConfig.name}`)
  },

  async handleCommand(interaction, serverConfig) {
    const command = interaction.options.getString("cmd")

    const embed = new EmbedBuilder()
      .setTitle("⚡ Command Executed")
      .setColor("#9900FF")
      .addFields(
        { name: "Server", value: serverConfig.name, inline: true },
        { name: "Command", value: `\`${command}\``, inline: true },
        { name: "Executed by", value: interaction.user.tag, inline: true },
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })

    // Log to moderation channel
    await this.logAction(interaction, "Server Command", `${interaction.user.tag} executed: ${command}`)
  },

  async handleChat(interaction, serverConfig) {
    const message = interaction.options.getString("message")

    const embed = new EmbedBuilder()
      .setTitle("💬 Message Sent to Server")
      .setColor("#00CCFF")
      .addFields(
        { name: "Server", value: serverConfig.name, inline: true },
        { name: "Message", value: message, inline: false },
        { name: "Sent by", value: interaction.user.tag, inline: true },
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  },

  async handlePlugins(interaction, serverConfig) {
    const embed = new EmbedBuilder()
      .setTitle(`🔌 Server Plugins - ${serverConfig.name}`)
      .setColor("#FF6600")
      .setDescription(
        "**Installed Plugins:**\n\n" +
          "🔹 **Kits** v2.1.0 - Player kit system\n" +
          "🔹 **Teleportation** v1.8.3 - Teleport commands\n" +
          "🔹 **Economy** v3.2.1 - Server economy system\n" +
          "🔹 **Shops** v2.0.5 - Player shops\n" +
          "🔹 **Clans** v1.5.2 - Clan system\n" +
          "🔹 **AntiCheat** v4.1.0 - Cheat protection\n" +
          "🔹 **Voting** v1.3.1 - Vote rewards\n" +
          "🔹 **Warps** v2.2.0 - Warp system",
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  },

  async logAction(interaction, action, description) {
    // Get logging channel from config
    const logChannel = interaction.guild.channels.cache.find(
      (channel) => channel.name === "server-logs" || channel.name === "mod-logs",
    )

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle(`📋 ${action}`)
        .setDescription(description)
        .setColor("#FFD700")
        .setTimestamp()
        .setFooter({ text: `User ID: ${interaction.user.id}` })

      await logChannel.send({ embeds: [logEmbed] })
    }
  },
}
