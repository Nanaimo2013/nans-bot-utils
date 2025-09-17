/**
 * JMF Hosting Discord Bot
 *
 * © 2025 JMFHosting. All Rights Reserved.
 * Developed by Nanaimo2013 (https://github.com/Nanaimo2013)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Manage support tickets")
    .addSubcommand((sc) =>
      sc
        .setName("create")
        .setDescription("Create a new ticket")
        .addStringOption((opt) =>
          opt
            .setName("category")
            .setDescription("Ticket category")
            .setRequired(false)
            .addChoices(
              { name: "General Support", value: "general" },
              { name: "Bug Report", value: "bug" },
              { name: "Feature Request", value: "feature" },
              { name: "Player Report", value: "report" },
              { name: "Unban Request", value: "unban" },
              { name: "Other", value: "other" }
            )
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("close")
        .setDescription("Close the current ticket")
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason").setRequired(false))
    )
    // FIX: setDefaultMemberPermissions is not a function on subcommand, must be on the main command or use .setDefaultMemberPermissions on the SlashCommandBuilder itself.
    .addSubcommand((sc) => 
      sc
        .setName("setup")
        .setDescription("Setup ticket system")
    )
    .addSubcommand((sc) =>
      sc
        .setName("panel")
        .setDescription("Create a ticket panel")
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel for panel").setRequired(false))
    )
    .addSubcommand((sc) =>
      sc.setName("add").setDescription("Add user to ticket").addUserOption((opt) => opt.setName("user").setDescription("User to add").setRequired(true))
    )
    .addSubcommand((sc) =>
      sc.setName("remove").setDescription("Remove user from ticket").addUserOption((opt) => opt.setName("user").setDescription("User to remove").setRequired(true))
    )
    .addSubcommand((sc) => sc.setName("transcript").setDescription("Generate ticket transcript"))
    .addSubcommand((sc) =>
      sc.setName("rename").setDescription("Rename the ticket").addStringOption((opt) => opt.setName("name").setDescription("New ticket name").setRequired(true))
    )
    .addSubcommand((sc) =>
      sc
        .setName("priority")
        .setDescription("Set ticket priority")
        .addStringOption((opt) =>
          opt
            .setName("level")
            .setDescription("Priority level")
            .setRequired(true)
            .addChoices(
              { name: "Low", value: "low" },
              { name: "Medium", value: "medium" },
              { name: "High", value: "high" },
              { name: "Urgent", value: "urgent" }
            )
        )
    )
    // Set default permissions for the main command, not subcommands
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client, db) {
    const subcommand = interaction.options.getSubcommand();
    try {
      if (["close", "add", "remove", "transcript", "rename", "priority"].includes(subcommand)) {
        return await this.handleSubcommand(interaction, subcommand, client, db);
      }

      switch (subcommand) {
        case "create":
          return await this.createTicket(interaction, client, db);
        case "setup":
          return await this.setupTickets(interaction, client, db);
        case "panel":
          return await this.createTicketPanel(interaction, client, db);
      }
    } catch (err) {
      console.error("Ticket command error:", err);
      return interaction.reply({ content: `❌ Error: ${err.message}`, ephemeral: true });
    }
  },

  async handleSubcommand(interaction, subcommand, client, db) {
    const logger = global.managers?.logger;

    if (subcommand === "add" || subcommand === "remove") {
      const user = interaction.options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.reply({ content: "❌ User not found.", ephemeral: true });

      try {
        if (subcommand === "add") {
          await interaction.channel.permissionOverwrites.create(member.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
          });
        } else {
          await interaction.channel.permissionOverwrites.delete(member.id);
        }

        logger?.info("commands", `User ${user.tag} ${subcommand}ed in ticket ${interaction.channel.name} by ${interaction.user.tag}`);
        return interaction.reply({ content: `✅ User ${subcommand}ed successfully.` });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: `❌ Failed to ${subcommand} user: ${err.message}`, ephemeral: true });
      }
    }

    if (subcommand === "close") return await this.closeTicket(interaction, client, db);
    if (subcommand === "rename") {
      const newName = interaction.options.getString("name");
      await interaction.channel.setName(newName).catch((err) => interaction.reply({ content: `❌ Error renaming: ${err.message}`, ephemeral: true }));
      return interaction.reply({ content: `✅ Ticket renamed to ${newName}` });
    }
    if (subcommand === "priority") {
      const level = interaction.options.getString("level");
      await db.run("UPDATE tickets SET priority = ? WHERE channel_id = ?", [level, interaction.channel.id]);
      return interaction.reply({ content: `✅ Priority set to ${level}` });
    }
    if (subcommand === "transcript") {
      const transcript = await this.generateTranscript(interaction.channel);
      return interaction.reply({
        content: "✅ Transcript generated.",
        files: [{ attachment: Buffer.from(transcript), name: `ticket-${interaction.channel.name}-transcript.txt` }],
        ephemeral: true,
      });
    }
  },

  async createTicket(interaction, client, db) {
    const category = interaction.options.getString("category") || "general";
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const existing = await db.get("SELECT channel_id FROM tickets WHERE guild_id = ? AND user_id = ? AND status='open'", [guildId, userId]);
    if (existing) return interaction.reply({ content: `You already have a ticket: <#${existing.channel_id}>`, ephemeral: true });

    const config = await db.get("SELECT ticket_category FROM guild_config WHERE guild_id = ?", [guildId]);
    if (!config?.ticket_category) return interaction.reply({ content: "Ticket system not set up. Run `/ticket setup`.", ephemeral: true });

    const categoryChannel = interaction.guild.channels.cache.get(config.ticket_category);
    if (!categoryChannel) return interaction.reply({ content: "Ticket category not found. Reconfigure ticket system.", ephemeral: true });

    const ticketName = `ticket-${interaction.user.username}-${Date.now().toString().slice(-4)}`;
    const ticketChannel = await interaction.guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: categoryChannel.id,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: userId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
      ],
    });

    const staffRoles = interaction.guild.roles.cache.filter((r) => r.permissions.has(PermissionFlagsBits.ManageMessages) || r.permissions.has(PermissionFlagsBits.Administrator));
    for (const role of staffRoles.values()) {
      await ticketChannel.permissionOverwrites.create(role.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
    }

    const result = await db.run("INSERT INTO tickets (guild_id, channel_id, user_id, category, status) VALUES (?, ?, ?, ?, 'open')", [guildId, ticketChannel.id, userId, category]);

    const ticketEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`🎫 Ticket #${result.lastID || result.id}`)
      .setDescription(`Welcome <@${userId}>! Describe your issue and staff will assist.`)
      .addFields(
        { name: "Category", value: this.getCategoryName(category), inline: true },
        { name: "Created", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        { name: "Status", value: "🟢 Open", inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: "Nans Bot Utils by NansStudios" });

    const controlRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close_ticket").setLabel("Close Ticket").setStyle(ButtonStyle.Danger).setEmoji("🔒"),
      new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim Ticket").setStyle(ButtonStyle.Primary).setEmoji("👤"),
      new ButtonBuilder().setCustomId("transcript_ticket").setLabel("Generate Transcript").setStyle(ButtonStyle.Secondary).setEmoji("📄")
    );

    await ticketChannel.send({ embeds: [ticketEmbed], components: [controlRow] });
    return interaction.reply({ content: `✅ Ticket created: <#${ticketChannel.id}>`, ephemeral: true });
  },

  async closeTicket(interaction, client, db) {
    const reason = interaction.options.getString("reason") || "No reason provided";
    const ticket = await db.get("SELECT * FROM tickets WHERE channel_id = ? AND status='open'", [interaction.channel.id]);
    if (!ticket) return interaction.reply({ content: "This is not an open ticket.", ephemeral: true });

    const transcript = await this.generateTranscript(interaction.channel);
    await db.run("UPDATE tickets SET status='closed', closed_at=datetime('now'), closed_by=? WHERE id=?", [interaction.user.id, ticket.id]);
    await db.run("INSERT INTO ticket_transcripts (ticket_id, content) VALUES (?, ?)", [ticket.id, transcript]);

    const closeEmbed = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("🔒 Ticket Closed")
      .setDescription(`Closed by <@${interaction.user.id}>.`)
      .addFields({ name: "Reason", value: reason, inline: true }, { name: "Closed At", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true })
      .setFooter({ text: "Channel will be deleted in 10s" })
      .setTimestamp();

    await interaction.reply({ embeds: [closeEmbed] });
    setTimeout(() => interaction.channel.delete().catch(console.error), 10000);
  },

  async setupTickets(interaction, client, db) {
    const guild = interaction.guild;
    try {
      const ticketCategory = await guild.channels.create({ name: "🎫 Tickets", type: ChannelType.GuildCategory, permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }] });
      const logsChannel = await guild.channels.create({ name: "ticket-logs", type: ChannelType.GuildText, parent: ticketCategory.id, permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }] });
      await db.run("UPDATE guild_config SET ticket_category=?, ticket_logs_channel=? WHERE guild_id=?", [ticketCategory.id, logsChannel.id, guild.id]);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor("#00ff00").setTitle("✅ Ticket System Setup").setDescription("Setup complete!").addFields({ name: "Ticket Category", value: `<#${ticketCategory.id}>` }, { name: "Logs Channel", value: `<#${logsChannel.id}>` }).setTimestamp()] });
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: `❌ Setup error: ${err.message}`, ephemeral: true });
    }
  },

  async createTicketPanel(interaction, client, db) {
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const embed = new EmbedBuilder().setColor("#0099ff").setTitle("🎫 Support Tickets").setDescription("Create a ticket for support.").setThumbnail(interaction.guild.iconURL()).setTimestamp();
    const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("create_ticket_panel").setLabel("Create Ticket").setStyle(ButtonStyle.Primary).setEmoji("🎫"));
    await channel.send({ embeds: [embed], components: [button] });
    await interaction.reply({ content: `✅ Ticket panel created in ${channel}`, ephemeral: true });
  },

  async generateTranscript(channel) {
    try {
      let messages = [];
      let lastId;
      while (true) {
        const batch = await channel.messages.fetch({ limit: 100, before: lastId });
        if (!batch.size) break;
        messages.push(...batch.values());
        lastId = batch.last().id;
      }
      messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      let transcript = `Ticket Transcript - ${channel.name}\nGenerated: ${new Date().toISOString()}\n${"=".repeat(50)}\n\n`;
      for (const msg of messages) {
        transcript += `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content || "[No content]"}\n`;
        if (msg.attachments.size) transcript += `  Attachments: ${msg.attachments.map(a => a.url).join(", ")}\n`;
      }
      return transcript;
    } catch (err) {
      console.error("Transcript error:", err);
      return "Error generating transcript.";
    }
  },

  getCategoryName(cat) {
    return { general: "🔧 General Support", bug: "🐛 Bug Report", feature: "💡 Feature Request", report: "⚠️ Player Report", unban: "🔓 Unban Request", other: "❓ Other" }[cat] || "❓ Other";
  },
};
