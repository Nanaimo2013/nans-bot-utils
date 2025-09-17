/**
 * JMF Hosting Discord Bot
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const config = require("../config.json")

function createServerStatsEmbed(data) {
  const { members, servers, nodes, customers, system, financial, guild, isAuthorized } = data

  const embed = new EmbedBuilder()
    .setColor("#00AAFF")
    .setTitle("📊 JMF Hosting Server Statistics")
    .setDescription("Live statistics and system status")
    .addFields(
      {
        name: "👥 Discord Members",
        value: `**Total:** ${members.total}\n**Humans:** ${members.humans}\n**Bots:** ${members.bots}\n**Online:** ${members.online}\n**New Today:** ${members.newToday}`,
        inline: true,
      },
      {
        name: "🎮 Game Servers",
        value: `**Total:** ${servers.total}\n**Active:** ${servers.active}\n**Suspended:** ${servers.suspended}\n**CPU Usage:** ${servers.cpuUsage}%\n**RAM Usage:** ${servers.ramUsage}%`,
        inline: true,
      },
      {
        name: "🖥️ Nodes",
        value: `**Total:** ${nodes.total}\n**Online:** ${nodes.online}\n**Offline:** ${nodes.offline}\n**Avg Load:** ${nodes.averageLoad}%\n**Storage:** ${nodes.totalStorage}`,
        inline: true,
      },
      {
        name: "👤 Customers",
        value: `**Total:** ${customers.total}\n**Active:** ${customers.active}\n**New This Month:** ${customers.newThisMonth}\n**Support Tickets:** ${customers.supportTickets}\n**Satisfaction:** ${customers.satisfactionRate}%`,
        inline: true,
      },
      {
        name: "⚡ System Status",
        value: `**API:** ${system.apiStatus ? "🟢 Online" : "🔴 Offline"}\n**Database:** ${system.databaseStatus ? "🟢 Connected" : "🔴 Disconnected"}\n**Website:** ${system.websiteStatus ? "🟢 Online" : "🔴 Offline"}\n**Game Panel:** ${system.gamePanelStatus ? "🟢 Online" : "🔴 Offline"}\n**Billing:** ${system.billingStatus ? "🟢 Online" : "🔴 Offline"}`,
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({ text: config.footerText })

  // Add financial data if authorized
  if (isAuthorized && financial) {
    embed.addFields({
      name: "💰 Financial (Authorized)",
      value: `**Monthly Revenue:** $${financial.monthlyRevenue.toLocaleString()}\n**Annual Revenue:** $${financial.annualRevenue.toLocaleString()}\n**Avg Order:** $${financial.averageOrder}\n**Active Subs:** ${financial.activeSubscriptions}\n**Renewal Rate:** ${financial.renewalRate}%`,
      inline: true,
    })
  }

  // Create refresh button
  const components = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("refresh_stats")
        .setLabel("Refresh Stats")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔄"),
    ),
  ]

  return { embed, components }
}

module.exports = { createServerStatsEmbed }
