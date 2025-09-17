const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("botinfo").setDescription("Shows bot statistics and information"),

  async execute(interaction, client, db) {
    const uptime = process.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor(uptime / 3600) % 24
    const minutes = Math.floor(uptime / 60) % 60
    const seconds = Math.floor(uptime % 60)

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🤖 Bot Information")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "📊 Statistics",
          value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Channels:** ${client.channels.cache.size}`,
          inline: true,
        },
        { name: "⏱️ Uptime", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        {
          name: "💾 Memory Usage",
          value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          inline: true,
        },
        { name: "🏓 Ping", value: `${client.ws.ping}ms`, inline: true },
        { name: "📅 Created", value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: "🔧 Version", value: "v1.0.0", inline: true },
      )
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    await interaction.reply({ embeds: [embed] })
  },
}
