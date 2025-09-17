import { Client, GatewayIntentBits, Partials, Collection } from "discord.js"
import { config } from "dotenv"
import { fileURLToPath, pathToFileURL } from "url"
import { dirname, join } from "path"
import { readdirSync, statSync } from "fs"
import Database from "./database/database.js"
import Logger from "./utils/logger.js"

config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class NansBotUtils {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildModeration,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
    })

    this.client.commands = new Collection()
    this.client.cooldowns = new Collection()
    this.client.database = new Database()
    this.client.logger = new Logger()

    this.loadHandlers()
  }

  async loadHandlers() {
    await this.loadCommands()
    await this.loadEvents()
  }

  async loadCommands() {
    const commandsPath = join(__dirname, "commands")
    const commandFolders = readdirSync(commandsPath)

    for (const folder of commandFolders) {
      const folderPath = join(commandsPath, folder)
      if (statSync(folderPath).isDirectory()) {
        const commandFiles = readdirSync(folderPath).filter((file) => file.endsWith(".js"))

        for (const file of commandFiles) {
          const filePath = join(folderPath, file)
          const fileURL = pathToFileURL(filePath).href
          const command = await import(fileURL)

          if ("data" in command.default && "execute" in command.default) {
            this.client.commands.set(command.default.data.name, command.default)
            this.client.logger.info(`Loaded command: ${command.default.data.name}`)
          }
        }
      }
    }
  }

  async loadEvents() {
    const eventsPath = join(__dirname, "events")
    const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".js"))

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file)
      const fileURL = pathToFileURL(filePath).href
      const event = await import(fileURL)

      if (event.default.once) {
        this.client.once(event.default.name, (...args) => event.default.execute(...args))
      } else {
        this.client.on(event.default.name, (...args) => event.default.execute(...args))
      }

      this.client.logger.info(`Loaded event: ${event.default.name}`)
    }
  }

  async start() {
    try {
      await this.client.database.initialize()
      await this.client.login(process.env.DISCORD_TOKEN)
    } catch (error) {
      this.client.logger.error("Failed to start bot:", error)
      process.exit(1)
    }
  }
}

const bot = new NansBotUtils()
bot.start()

export default NansBotUtils
