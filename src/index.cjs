require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const Database = require("./database/database.cjs");

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
  ],
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Initialize database
const db = new Database();

// Recursive command loader
function loadCommands(dir) {
  let commands = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      commands = commands.concat(loadCommands(fullPath));
    } else if (file.endsWith(".js") || file.endsWith(".cjs")) {
      const command = require(fullPath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.log(`⚠️ Command at ${fullPath} missing "data" or "execute"`);
      }
    }
  }

  return commands;
}

// Load all commands
const commandsPath = path.join(__dirname, "commands");
const commands = loadCommands(commandsPath);

// Load events
function loadEvents(dir) {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js") || file.endsWith(".cjs"));
  for (const file of files) {
    const event = require(path.join(dir, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client, db));
    else client.on(event.name, (...args) => event.execute(...args, client, db));
    console.log(`✅ Loaded event: ${event.name}`);
  }
}

loadEvents(path.join(__dirname, "events"));

// Ready event
client.once(Events.ClientReady, async () => {
  console.log(`🚀 ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);

  // Set activity
  client.user.setActivity("Unturned Servers | /help", { type: ActivityType.Watching });

  // Initialize database
  await db.init();
  console.log("✅ Database initialized");
});

// Interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Cooldowns
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.data.name) ?? new Collection();
  client.cooldowns.set(command.data.name, timestamps);
  const cooldownAmount = (command.cooldown ?? 3) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    if (now < expirationTime) {
      const expired = Math.round(expirationTime / 1000);
      return interaction.reply({ content: `⏳ You are on cooldown. Try again <t:${expired}:R>.`, ephemeral: true });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    // Commands themselves handle deferring if needed
    await command.execute(interaction, client, db);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const errorEmbed = {
      color: 0xff0000,
      title: "❌ Command Error",
      description: "An error occurred while executing this command.",
      timestamp: new Date().toISOString(),
      footer: { text: "Nans Bot Utils by NansStudios" },
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// Global error handling
process.on("unhandledRejection", console.error);
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

// Login
client.login(process.env.DISCORD_TOKEN);
