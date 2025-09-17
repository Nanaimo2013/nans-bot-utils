const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("serverinfo").setDescription("Shows detailed server information"),

  async execute(interaction, client, db) {
    const guild = interaction.guild

    // Get server statistics from database
    const ticketCount = await db.get("SELECT COUNT(*) as count FROM tickets WHERE guild_id = ?", [guild.id])
    const modLogCount = await db.get("SELECT COUNT(*) as count FROM mod_logs WHERE guild_id = ?", [guild.id])
    const embedCount = await db.get("SELECT COUNT(*) as count FROM custom_embeds WHERE guild_id = ?", [guild.id])

    // Calculate member statistics
    const members = guild.members.cache
    const humans = members.filter((member) => !member.user.bot).size
    const bots = members.filter((member) => member.user.bot).size
    const online = members.filter((member) => member.presence?.status === "online").size

    // Channel statistics
    const channels = guild.channels.cache
    const textChannels = channels.filter((channel) => channel.type === 0).size
    const voiceChannels = channels.filter((channel) => channel.type === 2).size
    const categories = channels.filter((channel) => channel.type === 4).size

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`📊 ${guild.name} Server Information`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: "👥 Members",
          value: `**Total:** ${guild.memberCount}\n**Humans:** ${humans}\n**Bots:** ${bots}\n**Online:** ${online}`,
          inline: true,
        },
        {
          name: "📺 Channels",
          value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categories}\n**Total:** ${channels.size}`,
          inline: true,
        },
        {
          name: "🎭 Roles",
          value: `**Total:** ${guild.roles.cache.size}\n**Highest:** ${guild.roles.highest.name}\n**Color Roles:** ${guild.roles.cache.filter((role) => role.color !== 0).size}`,
          inline: true,
        },
        {
          name: "🤖 Bot Statistics",
          value: `**Tickets:** ${ticketCount?.count || 0}\n**Mod Actions:** ${modLogCount?.count || 0}\n**Custom Embeds:** ${embedCount?.count || 0}`,
          inline: true,
        },
        {
          name: "⚙️ Server Settings",
          value: `**Verification:** ${guild.verificationLevel}\n**Boost Level:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount || 0}`,
          inline: true,
        },
        {
          name: "📅 Dates",
          value: `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n**Joined:** <t:${Math.floor(guild.joinedTimestamp / 1000)}:F>`,
          inline: true,
        },
      )
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" })

    if (guild.description) {
      embed.setDescription(guild.description)
    }

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }))
    }

    await interaction.reply({ embeds: [embed] })
  },
}
