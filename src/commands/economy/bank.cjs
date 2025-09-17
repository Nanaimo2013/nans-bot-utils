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
    .setName("bank")
    .setDescription("Manage your bank account")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("deposit")
        .setDescription("Deposit money into your bank account")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription('Amount to deposit (or "all" for everything)')
            .setRequired(true)
            .setMinValue(1),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("withdraw")
        .setDescription("Withdraw money from your bank account")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription('Amount to withdraw (or "all" for everything)')
            .setRequired(true)
            .setMinValue(1),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("balance").setDescription("Check your bank account balance")),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const subcommand = interaction.options.getSubcommand()
      const userId = interaction.user.id

      // Get user's current economy data
      const economyData = await this.getEconomyData(userId, interaction.client)

      if (subcommand === "deposit") {
        const amount = interaction.options.getInteger("amount")

        if (amount > economyData.cash) {
          return interaction.editReply({
            content: `❌ You don't have $${amount.toLocaleString()} in cash. You have $${economyData.cash.toLocaleString()}.`,
          })
        }

        // Update balances
        const newCash = economyData.cash - amount
        const newBank = economyData.bank + amount

        await this.updateEconomyData(userId, { cash: newCash, bank: newBank }, interaction.client)

        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("🏦 Bank Deposit")
          .setDescription(`Successfully deposited $${amount.toLocaleString()} into your bank account.`)
          .addFields(
            { name: "💵 Cash", value: `$${newCash.toLocaleString()}`, inline: true },
            { name: "🏦 Bank", value: `$${newBank.toLocaleString()}`, inline: true },
            { name: "💎 Total", value: `$${(newCash + newBank).toLocaleString()}`, inline: true },
          )
          .setTimestamp()
          .setFooter({ text: config.footerText })

        await interaction.editReply({ embeds: [embed] })
      } else if (subcommand === "withdraw") {
        const amount = interaction.options.getInteger("amount")

        if (amount > economyData.bank) {
          return interaction.editReply({
            content: `❌ You don't have $${amount.toLocaleString()} in your bank account. You have $${economyData.bank.toLocaleString()}.`,
          })
        }

        // Update balances
        const newCash = economyData.cash + amount
        const newBank = economyData.bank - amount

        await this.updateEconomyData(userId, { cash: newCash, bank: newBank }, interaction.client)

        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("🏦 Bank Withdrawal")
          .setDescription(`Successfully withdrew $${amount.toLocaleString()} from your bank account.`)
          .addFields(
            { name: "💵 Cash", value: `$${newCash.toLocaleString()}`, inline: true },
            { name: "🏦 Bank", value: `$${newBank.toLocaleString()}`, inline: true },
            { name: "💎 Total", value: `$${(newCash + newBank).toLocaleString()}`, inline: true },
          )
          .setTimestamp()
          .setFooter({ text: config.footerText })

        await interaction.editReply({ embeds: [embed] })
      } else if (subcommand === "balance") {
        const embed = new EmbedBuilder()
          .setColor("#0099FF")
          .setTitle("🏦 Bank Account")
          .setDescription(`${interaction.user.username}'s banking information`)
          .addFields(
            { name: "💵 Cash on Hand", value: `$${economyData.cash.toLocaleString()}`, inline: true },
            { name: "🏦 Bank Balance", value: `$${economyData.bank.toLocaleString()}`, inline: true },
            { name: "💎 Net Worth", value: `$${(economyData.cash + economyData.bank).toLocaleString()}`, inline: true },
            { name: "📈 Interest Rate", value: "2.5% daily", inline: true },
            { name: "🔒 Account Type", value: "Standard", inline: true },
            { name: "📅 Last Transaction", value: "Today", inline: true },
          )
          .setTimestamp()
          .setFooter({ text: config.footerText })

        await interaction.editReply({ embeds: [embed] })
      }
    } catch (error) {
      logger.error(`Error in bank command: ${error.message}`)
      await interaction.editReply({ content: "❌ An error occurred while processing your bank transaction." })
    }
  },

  async getEconomyData(userId, client) {
    try {
      if (client.db && client.db.isConnected) {
        const result = await client.db.query("SELECT * FROM user_economy WHERE user_id = ?", [userId])

        if (result && result.length > 0) {
          return result[0]
        }
      }

      // Create default entry
      const defaultData = { cash: 1000, bank: 0, level: 1, xp: 0 }
      await this.updateEconomyData(userId, defaultData, client)
      return defaultData
    } catch (error) {
      logger.error(`Error getting economy data: ${error.message}`)
      return { cash: 0, bank: 0, level: 1, xp: 0 }
    }
  },

  async updateEconomyData(userId, data, client) {
    try {
      if (client.db && client.db.isConnected) {
        await client.db.query(
          "INSERT INTO user_economy (user_id, cash, bank, level, xp) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE cash = VALUES(cash), bank = VALUES(bank), level = VALUES(level), xp = VALUES(xp)",
          [userId, data.cash, data.bank, data.level || 1, data.xp || 0],
        )
      }
    } catch (error) {
      logger.error(`Error updating economy data: ${error.message}`)
    }
  },
}
