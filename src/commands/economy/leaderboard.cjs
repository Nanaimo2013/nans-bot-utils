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
    .setName("leaderboard")
    .setDescription("View server leaderboards")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of leaderboard to view")
        .setRequired(true)
        .addChoices(
          { name: "💰 Richest Players", value: "money" },
          { name: "📊 Highest Levels", value: "level" },
          { name: "⭐ Most XP", value: "xp" },
          { name: "💵 Most Cash", value: "cash" },
          { name: "🏦 Biggest Bank", value: "bank" },
        ),
    ),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const type = interaction.options.getString("type")
      const leaderboardData = await this.getLeaderboardData(type, interaction.client)

      const embed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle(this.getLeaderboardTitle(type))
        .setTimestamp()
        .setFooter({ text: config.footerText })

      if (leaderboardData.length === 0) {
        embed.setDescription("No data available yet. Start playing to appear on the leaderboard!")
      } else {
        let description = ""

        for (let i = 0; i < Math.min(leaderboardData.length, 10); i++) {
          const user = leaderboardData[i]
          const medal = this.getMedal(i + 1)
          const value = this.formatValue(type, user)

          try {
            const discordUser = await interaction.client.users.fetch(user.user_id)
            description += `${medal} **${discordUser.username}** - ${value}\n`
          } catch (error) {
            description += `${medal} **Unknown User** - ${value}\n`
          }
        }

        embed.setDescription(description)

        // Add user's position if they're not in top 10
        const userPosition = await this.getUserPosition(interaction.user.id, type, interaction.client)
        if (userPosition > 10) {
          embed.addFields({
            name: "Your Position",
            value: `#${userPosition}`,
            inline: true,
          })
        }
      }

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      logger.error(`Error in leaderboard command: ${error.message}`)
      await interaction.editReply({ content: "❌ An error occurred while fetching leaderboard data." })
    }
  },

  async getLeaderboardData(type, client) {
    try {
      if (!client.db || !client.db.isConnected) {
        return []
      }

      let query
      switch (type) {
        case "money":
          query = "SELECT user_id, cash, bank, (cash + bank) as total FROM user_economy ORDER BY total DESC LIMIT 10"
          break
        case "level":
          query = "SELECT user_id, level, xp FROM user_economy ORDER BY level DESC, xp DESC LIMIT 10"
          break
        case "xp":
          query = "SELECT user_id, xp, level FROM user_economy ORDER BY xp DESC LIMIT 10"
          break
        case "cash":
          query = "SELECT user_id, cash FROM user_economy ORDER BY cash DESC LIMIT 10"
          break
        case "bank":
          query = "SELECT user_id, bank FROM user_economy ORDER BY bank DESC LIMIT 10"
          break
        default:
          return []
      }

      const result = await client.db.query(query)
      return result || []
    } catch (error) {
      logger.error(`Error getting leaderboard data: ${error.message}`)
      return []
    }
  },

  async getUserPosition(userId, type, client) {
    try {
      if (!client.db || !client.db.isConnected) {
        return 0
      }

      let query
      switch (type) {
        case "money":
          query =
            "SELECT COUNT(*) + 1 as position FROM user_economy WHERE (cash + bank) > (SELECT cash + bank FROM user_economy WHERE user_id = ?)"
          break
        case "level":
          query =
            "SELECT COUNT(*) + 1 as position FROM user_economy WHERE (level > (SELECT level FROM user_economy WHERE user_id = ?)) OR (level = (SELECT level FROM user_economy WHERE user_id = ?) AND xp > (SELECT xp FROM user_economy WHERE user_id = ?))"
          break
        case "xp":
          query =
            "SELECT COUNT(*) + 1 as position FROM user_economy WHERE xp > (SELECT xp FROM user_economy WHERE user_id = ?)"
          break
        case "cash":
          query =
            "SELECT COUNT(*) + 1 as position FROM user_economy WHERE cash > (SELECT cash FROM user_economy WHERE user_id = ?)"
          break
        case "bank":
          query =
            "SELECT COUNT(*) + 1 as position FROM user_economy WHERE bank > (SELECT bank FROM user_economy WHERE user_id = ?)"
          break
        default:
          return 0
      }

      const result = await client.db.query(query, type === "level" ? [userId, userId, userId] : [userId])
      return result && result.length > 0 ? result[0].position : 0
    } catch (error) {
      logger.error(`Error getting user position: ${error.message}`)
      return 0
    }
  },

  getLeaderboardTitle(type) {
    const titles = {
      money: "💰 Richest Players",
      level: "📊 Highest Levels",
      xp: "⭐ Most Experience",
      cash: "💵 Most Cash",
      bank: "🏦 Biggest Bank Accounts",
    }
    return titles[type] || "Leaderboard"
  },

  getMedal(position) {
    const medals = {
      1: "🥇",
      2: "🥈",
      3: "🥉",
    }
    return medals[position] || `**${position}.**`
  },

  formatValue(type, user) {
    switch (type) {
      case "money":
        return `$${(user.cash + user.bank).toLocaleString()}`
      case "level":
        return `Level ${user.level} (${user.xp.toLocaleString()} XP)`
      case "xp":
        return `${user.xp.toLocaleString()} XP (Level ${user.level})`
      case "cash":
        return `$${user.cash.toLocaleString()}`
      case "bank":
        return `$${user.bank.toLocaleString()}`
      default:
        return "N/A"
    }
  },
}
