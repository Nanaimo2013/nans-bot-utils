const fs = require("fs")
const path = require("path")
const { EmbedBuilder } = require("discord.js")
const configManager = require("./configManager.cjs")

const dataDir = path.join(__dirname, "../data")
const dataPath = path.join(dataDir, "users.json")

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Ensure the users.json file exists
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({}), "utf-8")
}

// Load user data
function loadData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"))
}

// Save user data
function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8")
}

// Get user data
async function getUserData(userId) {
  const data = loadData()
  if (!data[userId]) {
    data[userId] = { warnings: [], notes: [] }
    saveData(data)
  }
  return data[userId]
}

// Add warning
async function addWarning(userId, reason, moderatorTag) {
  const data = loadData()
  if (!data[userId]) data[userId] = { warnings: [], notes: [] }
  const warning = { id: data[userId].warnings.length + 1, reason, moderatorTag, timestamp: Date.now() }
  data[userId].warnings.push(warning)
  saveData(data)
  return warning
}

// Add note
async function addNote(userId, content, moderatorTag) {
  const data = loadData()
  if (!data[userId]) data[userId] = { warnings: [], notes: [] }
  const note = { id: data[userId].notes.length + 1, content, moderatorTag, timestamp: Date.now() }
  data[userId].notes.push(note)
  saveData(data)
  return note
}

// Create user case file embed
async function getUserCaseFile(user) {
  const userData = await getUserData(user.id)
  const embed = new EmbedBuilder()
    .setTitle(`Case File: ${user.tag}`)
    .setDescription("Detailed moderation history and notes")
    .setColor("#FFAA00")
    .setTimestamp()
    .setFooter({ text: configManager.get("footerText") || "Nans Bot" })

  embed.addFields(
    { name: "Warnings", value: `${userData.warnings.length}`, inline: true },
    { name: "Notes", value: `${userData.notes.length}`, inline: true }
  )

  return embed
}

module.exports = { getUserData, addWarning, addNote, getUserCaseFile }
