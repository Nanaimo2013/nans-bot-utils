/**
 * JMF Hosting Discord Bot - Advanced Ticket System
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js")
const logger = require("../utils/logger")
const config = require("../../config.json")

class AdvancedTicketSystem {
  constructor() {
    this.client = null
    this.db = null
    this.isInitialized = false
    this.ticketTypes = config.ticketSystem?.types || [
      { id: "general", name: "General Support", emoji: "🎫", description: "General questions and support" },
      { id: "technical", name: "Technical Issues", emoji: "🔧", description: "Server or technical problems" },
      { id: "billing", name: "Billing Support", emoji: "💳", description: "Payment and billing inquiries" },
      { id: "report", name: "Report Issue", emoji: "⚠️", description: "Report bugs or issues" },
    ]
  }

  /**
   * Initialize the ticket system
   * @param {Client} client - Discord client
   */
  async init(client) {
    this.client = client
    this.db = client.db
    this.isInitialized = true

    // Create database tables if they don't exist
    if (this.db) {
      await this.createTables()
    }

    logger.info("Advanced Ticket System initialized")
  }

  /**
   * Create necessary database tables
   */
  async createTables() {
    try {
      // Tickets table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_id VARCHAR(50) UNIQUE NOT NULL,
          user_id VARCHAR(20) NOT NULL,
          guild_id VARCHAR(20) NOT NULL,
          channel_id VARCHAR(20) NOT NULL,
          type VARCHAR(50) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          description TEXT,
          priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
          status ENUM('open', 'claimed', 'closed', 'archived') DEFAULT 'open',
          claimed_by VARCHAR(20) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          closed_at TIMESTAMP NULL,
          transcript_url VARCHAR(500) NULL,
          rating INT NULL,
          feedback TEXT NULL
        )
      `)

      // Ticket messages table for transcripts
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS ticket_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_id VARCHAR(50) NOT NULL,
          user_id VARCHAR(20) NOT NULL,
          username VARCHAR(100) NOT NULL,
          content TEXT NOT NULL,
          attachments JSON NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
        )
      `)

      // Ticket participants table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS ticket_participants (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_id VARCHAR(50) NOT NULL,
          user_id VARCHAR(20) NOT NULL,
          added_by VARCHAR(20) NOT NULL,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
        )
      `)

      logger.info("Ticket system database tables created/verified")
    } catch (error) {
      logger.error(`Failed to create ticket tables: ${error.message}`)
    }
  }

  /**
   * Create ticket creation panel
   * @param {TextChannel} channel - Channel to send the panel to
   */
  async createTicketPanel(channel) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🎫 Create Support Ticket")
        .setDescription(
          "Need help? Create a support ticket by selecting the appropriate category below. Our support team will assist you as soon as possible.",
        )
        .setColor(config.embedColor || "#00AAFF")
        .addFields(
          this.ticketTypes.map((type) => ({
            name: `${type.emoji} ${type.name}`,
            value: type.description,
            inline: true,
          })),
        )
        .setFooter({
          text: config.footerText || "JMF Hosting | Support System",
          iconURL: this.client.user.displayAvatarURL(),
        })
        .setTimestamp()

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("ticket_type_select")
        .setPlaceholder("Select a ticket type...")
        .addOptions(
          this.ticketTypes.map((type) => ({
            label: type.name,
            description: type.description,
            value: type.id,
            emoji: type.emoji,
          })),
        )

      const row = new ActionRowBuilder().addComponents(selectMenu)

      await channel.send({ embeds: [embed], components: [row] })
      logger.info(`Created ticket panel in channel: ${channel.name}`)
    } catch (error) {
      logger.error(`Failed to create ticket panel: ${error.message}`)
    }
  }

  /**
   * Handle ticket type selection
   * @param {StringSelectMenuInteraction} interaction
   */
  async handleTicketTypeSelect(interaction) {
    try {
      const ticketType = this.ticketTypes.find((type) => type.id === interaction.values[0])

      if (!ticketType) {
        return interaction.reply({
          content: "❌ Invalid ticket type selected.",
          ephemeral: true,
        })
      }

      // Create modal for ticket details
      const modal = new ModalBuilder()
        .setCustomId(`ticket_modal_${ticketType.id}`)
        .setTitle(`${ticketType.emoji} ${ticketType.name}`)

      const subjectInput = new TextInputBuilder()
        .setCustomId("ticket_subject")
        .setLabel("Subject")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Brief description of your issue...")
        .setRequired(true)
        .setMaxLength(100)

      const descriptionInput = new TextInputBuilder()
        .setCustomId("ticket_description")
        .setLabel("Description")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Please provide detailed information about your issue...")
        .setRequired(true)
        .setMaxLength(1000)

      const priorityInput = new TextInputBuilder()
        .setCustomId("ticket_priority")
        .setLabel("Priority (low, medium, high, urgent)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("medium")
        .setRequired(false)
        .setMaxLength(10)

      const firstRow = new ActionRowBuilder().addComponents(subjectInput)
      const secondRow = new ActionRowBuilder().addComponents(descriptionInput)
      const thirdRow = new ActionRowBuilder().addComponents(priorityInput)

      modal.addComponents(firstRow, secondRow, thirdRow)

      await interaction.showModal(modal)
    } catch (error) {
      logger.error(`Failed to handle ticket type selection: ${error.message}`)
      await interaction.reply({
        content: "❌ An error occurred while processing your request.",
        ephemeral: true,
      })
    }
  }

  /**
   * Handle ticket creation modal submission
   * @param {ModalSubmitInteraction} interaction
   */
  async handleTicketModal(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true })

      const ticketTypeId = interaction.customId.replace("ticket_modal_", "")
      const ticketType = this.ticketTypes.find((type) => type.id === ticketTypeId)

      const subject = interaction.fields.getTextInputValue("ticket_subject")
      const description = interaction.fields.getTextInputValue("ticket_description")
      const priorityInput = interaction.fields.getTextInputValue("ticket_priority") || "medium"

      // Validate priority
      const validPriorities = ["low", "medium", "high", "urgent"]
      const priority = validPriorities.includes(priorityInput.toLowerCase()) ? priorityInput.toLowerCase() : "medium"

      // Generate unique ticket ID
      const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

      // Create ticket channel
      const ticketChannel = await this.createTicketChannel(
        interaction.guild,
        interaction.user,
        ticketId,
        ticketType,
        subject,
        priority,
      )

      if (!ticketChannel) {
        return interaction.editReply({
          content: "❌ Failed to create ticket channel. Please contact an administrator.",
        })
      }

      // Save ticket to database
      if (this.db) {
        await this.db.query(
          `
          INSERT INTO tickets (ticket_id, user_id, guild_id, channel_id, type, subject, description, priority, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
        `,
          [
            ticketId,
            interaction.user.id,
            interaction.guild.id,
            ticketChannel.id,
            ticketType.id,
            subject,
            description,
            priority,
          ],
        )
      }

      // Send initial message in ticket channel
      await this.sendTicketWelcomeMessage(ticketChannel, interaction.user, ticketType, subject, description, priority)

      // Log ticket creation
      await this.logTicketAction(
        interaction.guild,
        "created",
        interaction.user,
        ticketId,
        `${ticketType.name} - ${subject}`,
      )

      await interaction.editReply({
        content: `✅ Your ticket has been created! Please check ${ticketChannel} for further assistance.`,
      })
    } catch (error) {
      logger.error(`Failed to create ticket: ${error.message}`)
      await interaction.editReply({
        content: "❌ An error occurred while creating your ticket. Please try again or contact an administrator.",
      })
    }
  }

  /**
   * Create ticket channel
   * @param {Guild} guild
   * @param {User} user
   * @param {string} ticketId
   * @param {Object} ticketType
   * @param {string} subject
   * @param {string} priority
   */
  async createTicketChannel(guild, user, ticketId, ticketType, subject, priority) {
    try {
      // Get or create ticket category
      let category = guild.channels.cache.find(
        (c) =>
          c.type === ChannelType.GuildCategory &&
          c.name.toLowerCase() === (config.ticketSystem?.categoryName || "tickets").toLowerCase(),
      )

      if (!category) {
        category = await guild.channels.create({
          name: config.ticketSystem?.categoryName || "Tickets",
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: [PermissionFlagsBits.ViewChannel],
            },
          ],
        })
      }

      // Create ticket channel
      const channelName = `${ticketType.id}-${user.username}-${ticketId.split("-")[1]}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
            ],
          },
        ],
      })

      // Add support roles if configured
      if (config.ticketSystem?.supportRoles) {
        for (const roleId of config.ticketSystem.supportRoles) {
          const role = guild.roles.cache.get(roleId)
          if (role) {
            await ticketChannel.permissionOverwrites.create(role, {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true,
              AttachFiles: true,
              EmbedLinks: true,
              ManageMessages: true,
            })
          }
        }
      }

      return ticketChannel
    } catch (error) {
      logger.error(`Failed to create ticket channel: ${error.message}`)
      return null
    }
  }

  /**
   * Send welcome message in ticket channel
   * @param {TextChannel} channel
   * @param {User} user
   * @param {Object} ticketType
   * @param {string} subject
   * @param {string} description
   * @param {string} priority
   */
  async sendTicketWelcomeMessage(channel, user, ticketType, subject, description, priority) {
    try {
      const priorityEmojis = {
        low: "🟢",
        medium: "🟡",
        high: "🟠",
        urgent: "🔴",
      }

      const embed = new EmbedBuilder()
        .setTitle(`${ticketType.emoji} Support Ticket`)
        .setDescription(`Hello ${user}, thank you for creating a support ticket. Our team will assist you shortly.`)
        .setColor(this.getPriorityColor(priority))
        .addFields(
          { name: "📋 Subject", value: subject, inline: false },
          { name: "📝 Description", value: description, inline: false },
          { name: "⚡ Priority", value: `${priorityEmojis[priority]} ${priority.toUpperCase()}`, inline: true },
          { name: "🏷️ Type", value: `${ticketType.emoji} ${ticketType.name}`, inline: true },
          { name: "👤 Created by", value: `${user}`, inline: true },
        )
        .setFooter({
          text: config.footerText || "JMF Hosting | Support System",
          iconURL: this.client.user.displayAvatarURL(),
        })
        .setTimestamp()

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("Claim Ticket")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("👋"),
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🔒"),
        new ButtonBuilder()
          .setCustomId("add_user_ticket")
          .setLabel("Add User")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("➕"),
        new ButtonBuilder()
          .setCustomId("transcript_ticket")
          .setLabel("Transcript")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("📄"),
      )

      await channel.send({ embeds: [embed], components: [buttons] })
    } catch (error) {
      logger.error(`Failed to send ticket welcome message: ${error.message}`)
    }
  }

  /**
   * Get priority color
   * @param {string} priority
   */
  getPriorityColor(priority) {
    const colors = {
      low: "#00FF00",
      medium: "#FFFF00",
      high: "#FF8000",
      urgent: "#FF0000",
    }
    return colors[priority] || colors.medium
  }

  /**
   * Log ticket action
   * @param {Guild} guild
   * @param {string} action
   * @param {User} user
   * @param {string} ticketId
   * @param {string} details
   */
  async logTicketAction(guild, action, user, ticketId, details) {
    try {
      if (!config.ticketSystem?.logChannel) return

      const logChannel = guild.channels.cache.get(config.ticketSystem.logChannel)
      if (!logChannel) return

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket ${action.charAt(0).toUpperCase() + action.slice(1)}`)
        .setColor(config.embedColor || "#00AAFF")
        .addFields(
          { name: "🎫 Ticket ID", value: ticketId, inline: true },
          { name: "👤 User", value: `${user} (${user.tag})`, inline: true },
          { name: "📋 Details", value: details, inline: false },
        )
        .setTimestamp()
        .setFooter({
          text: config.footerText || "JMF Hosting | Ticket System",
          iconURL: this.client.user.displayAvatarURL(),
        })

      await logChannel.send({ embeds: [embed] })
    } catch (error) {
      logger.error(`Failed to log ticket action: ${error.message}`)
    }
  }
}

module.exports = new AdvancedTicketSystem()
