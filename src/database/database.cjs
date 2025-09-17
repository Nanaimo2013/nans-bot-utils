const sqlite3 = require("sqlite3").verbose()
const path = require("path")

class Database {
  constructor() {
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(path.join(__dirname, "bot.db"), (err) => {
        if (err) {
          console.error("Error opening database:", err)
          reject(err)
        } else {
          console.log("Connected to SQLite database")
          this.createTables().then(resolve).catch(reject)
        }
      })
    })
  }

  async createTables() {
    const tables = [
      // Guild configuration
      `CREATE TABLE IF NOT EXISTS guild_config (
                guild_id TEXT PRIMARY KEY,
                prefix TEXT DEFAULT '!',
                automod_enabled INTEGER DEFAULT 1,
                logs_channel TEXT,
                welcome_channel TEXT,
                welcome_message TEXT,
                leave_channel TEXT,
                leave_message TEXT,
                ticket_category TEXT,
                ticket_logs_channel TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

      // Automod settings
      `CREATE TABLE IF NOT EXISTS automod_config (
                guild_id TEXT PRIMARY KEY,
                spam_protection INTEGER DEFAULT 1,
                link_protection INTEGER DEFAULT 1,
                caps_protection INTEGER DEFAULT 1,
                profanity_filter INTEGER DEFAULT 1,
                max_mentions INTEGER DEFAULT 5,
                max_duplicates INTEGER DEFAULT 3,
                timeout_duration INTEGER DEFAULT 300,
                FOREIGN KEY (guild_id) REFERENCES guild_config (guild_id)
            )`,

      // Tickets
      `CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                channel_id TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                status TEXT DEFAULT 'open',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                closed_at DATETIME,
                closed_by TEXT
            )`,

      // Ticket transcripts
      `CREATE TABLE IF NOT EXISTS ticket_transcripts (
                ticket_id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets (id)
            )`,

      // Moderation logs
      `CREATE TABLE IF NOT EXISTS mod_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                action TEXT NOT NULL,
                reason TEXT,
                duration INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

      // Custom embeds
      `CREATE TABLE IF NOT EXISTS custom_embeds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                name TEXT NOT NULL,
                title TEXT,
                description TEXT,
                color TEXT DEFAULT '#0099ff',
                thumbnail TEXT,
                image TEXT,
                footer TEXT,
                created_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
    ]

    for (const table of tables) {
      await this.run(table)
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err)
        else resolve({ id: this.lastID, changes: this.changes })
      })
    })
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = Database
