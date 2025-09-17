const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const logger = require("../../utils/logger.cjs")
const config = require("../../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Configure automod settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable automod features")
        .addStringOption((option) =>
          option
            .setName("feature")
            .setDescription("The automod feature to enable")
            .setRequired(true)
            .addChoices(
              { name: "Anti-spam", value: "spam" },
              { name: "Invite filter", value: "invites" },
              { name: "Link filter", value: "links" },
              { name: "Word filter", value: "words" },
              { name: "Mention spam", value: "mentions" },
              { name: "All features", value: "all" },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable automod features")
        .addStringOption((option) =>
          option
            .setName("feature")
            .setDescription("The automod feature to disable")
            .setRequired(true)
            .addChoices(
              { name: "Anti-spam", value: "spam" },
              { name: "Invite filter", value: "invites" },
              { name: "Link filter", value: "links" },
              { name: "Word filter", value: "words" },
              { name: "Mention spam", value: "mentions" },
              { name: "All features", value: "all" },
            ),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("status").setDescription("Check automod status")),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand()

      if (subcommand === "enable") {
        const feature = interaction.options.getString("feature")
        await enableAutomod(interaction, feature)
      } else if (subcommand === "disable") {
        const feature = interaction.options.getString("feature")
        await disableAutomod(interaction, feature)
      } else if (subcommand === "status") {
        await checkAutomodStatus(interaction)
      }
    } catch (error) {
      logger.error(`Error executing automod command: ${error.message}`)
      await interaction.reply({
        content: "An error occurred while executing this command.",
        ephemeral: true,
      })
    }
  },
}

async function enableAutomod(interaction, feature) {
  // Implementation would go here
  await interaction.reply({
    content: `Enabled automod feature: ${feature}`,
    ephemeral: true,
  })
}

async function disableAutomod(interaction, feature) {
  // Implementation would go here
  await interaction.reply({
    content: `Disabled automod feature: ${feature}`,
    ephemeral: true,
  })
}

async function checkAutomodStatus(interaction) {
  // Implementation would go here
  await interaction.reply({
    content: "Automod status: Active",
    ephemeral: true,
  })
}
