/**
 * Config Manager
 * Handles reading and writing the bot's config.json safely
 * © 2025 NansStudios
 */

const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../config.json");

let config = {};

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error("Config file not found. Please create config.json in the project root.");
  }
  const raw = fs.readFileSync(configPath, "utf-8");
  try {
    config = JSON.parse(raw);
    return config;
  } catch (err) {
    throw new Error("Invalid JSON in config.json: " + err.message);
  }
}

function get(pathString, defaultValue) {
  const keys = pathString.split(".");
  let result = config;
  for (const key of keys) {
    if (result[key] === undefined) return defaultValue;
    result = result[key];
  }
  return result;
}

function set(pathString, value) {
  const keys = pathString.split(".");
  let obj = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!obj[key]) obj[key] = {};
    obj = obj[key];
  }
  obj[keys[keys.length - 1]] = value;
  saveConfig();
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

module.exports = {
  loadConfig,
  get,
  set,
  saveConfig,
  config,
};

// Immediately load config when required
loadConfig();
