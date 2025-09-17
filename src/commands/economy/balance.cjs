/**
 * JMF Hosting Discord Bot
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const logger = require("../../utils/logger.cjs")
const config = require("../../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your in-game balance and bank account")
    .addUserOption((option) =>
      option.setName("user").setDescription("Check another user's balance (staff only)").setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const targetUser = interaction.options.getUser("user") || interaction.user
      const isStaff = interaction.member.permissions.has("ModerateMembers")

      // Only allow staff to check other users' balances
      if (targetUser.id !== interaction.user.id && !isStaff) {
        return interaction.editReply({ content: "❌ You can only check your own balance." })
      }

      // Get user's economy data
      const economyData = await this.getEconomyData(targetUser.id, interaction.client)

      // Create balance embed
      const balanceEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle(`💰 ${targetUser.username}'s Economy`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "💵 Cash", value: `$${economyData.cash.toLocaleString()}`, inline: true },
          { name: "🏦 Bank", value: `$${economyData.bank.toLocaleString()}`, inline: true },
          { name: "💎 Total Worth", value: `$${(economyData.cash + economyData.bank).toLocaleString()}`, inline: true },
          { name: "📊 Level", value: `${economyData.level}`, inline: true },
          { name: "⭐ XP", value: `${economyData.xp}/${this.getXPRequired(economyData.level)}`, inline: true },
          { name: "🎯 Rank", value: `#${economyData.rank || "Unranked"}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: config.footerText })

      // Add progress bar for XP
      const xpProgress = this.createProgressBar(economyData.xp, this.getXPRequired(economyData.level))
      balanceEmbed.addFields({ name: "📈 XP Progress", value: xpProgress, inline: false })

      await interaction.editReply({ embeds: [balanceEmbed] })
    } catch (error) {
      logger.error(`Error in balance command: ${error.message}`)
      await interaction.editReply({ content: "❌ An error occurred while fetching balance data." })
    }
  },

  async getEconomyData(userId, client) {
    try {
      if (client.db && client.db.isConnected) {
        const result = await client.db.query("SELECT * FROM user_economy WHERE user_id = ?", [userId])

        if (result && result.length > 0) {
          const data = result[0]
          // Calculate rank
          const rankResult = await client.db.query(
            "SELECT COUNT(*) + 1 as rank FROM user_economy WHERE (cash + bank) > (SELECT cash + bank FROM user_economy WHERE user_id = ?)",
            [userId],
          )

          return {
            cash: data.cash || 0,
            bank: data.bank || 0,
            level: data.level || 1,
            xp: data.xp || 0,
            rank: rankResult && rankResult.length > 0 ? rankResult[0].rank : null,
          }
        }
      }

      // Default values for new users
      return {
        cash: 1000,
        bank: 0,
        level: 1,
        xp: 0,
        rank: null,
      }
    } catch (error) {
      logger.error(`Error getting economy data: ${error.message}`)
      return { cash: 0, bank: 0, level: 1, xp: 0, rank: null }
    }
  },

  getXPRequired(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  },

  createProgressBar(current, max, length = 20) {
    const percentage = Math.min(current / max, 1)
    const filled = Math.floor(percentage * length)
    const empty = length - filled

    return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${current}/${max} (${Math.floor(percentage * 100)}%)`
  },
}
