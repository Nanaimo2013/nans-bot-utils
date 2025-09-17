require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Recursively load commands
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
        commands.push(command.data.toJSON());
      } else {
        console.log(`⚠️ Command at ${fullPath} is missing "data" or "execute". Skipping.`);
      }
    }
  }

  return commands;
}

// Remove duplicates by command name
function uniqueCommands(commands) {
  const seen = new Set();
  return commands.filter(cmd => {
    if (seen.has(cmd.name)) {
      console.log(`⚠️ Duplicate command name detected: ${cmd.name}. Skipping.`);
      return false;
    }
    seen.add(cmd.name);
    return true;
  });
}

const commandsPath = path.join(__dirname, "commands");
let commands = loadCommands(commandsPath);
commands = uniqueCommands(commands);

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Refreshing ${commands.length} command(s)...`);

    if (process.env.GUILD_ID) {
      // Validate GUILD_ID is a valid Discord Snowflake
      if (!/^\d{17,19}$/.test(process.env.GUILD_ID)) {
        throw new Error(`Invalid GUILD_ID: ${process.env.GUILD_ID}`);
      }

      // Optionally reset all guild commands first to prevent duplicates
      console.log(`Clearing existing commands in guild ${process.env.GUILD_ID}...`);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: [] }
      );

      const data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Successfully reloaded ${data.length} guild command(s).`);
    } else {
      // Global deploy
      const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(`✅ Successfully reloaded ${data.length} global command(s).`);
    }
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
})();
