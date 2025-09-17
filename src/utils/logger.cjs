// src/utils/logger.js
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function formatTimestamp() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

function writeLogToFile(level, message) {
  const logFile = path.join(logsDir, `${new Date().toISOString().slice(0, 10)}.log`);
  const logMessage = `[${formatTimestamp()}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage, { encoding: "utf8" });
}

module.exports = {
  info: (msg) => {
    console.log(chalk.blue(`[INFO | ${formatTimestamp()}] ${msg}`));
    writeLogToFile("info", msg);
  },

  warn: (msg) => {
    console.log(chalk.yellow(`[WARN | ${formatTimestamp()}] ${msg}`));
    writeLogToFile("warn", msg);
  },

  error: (msg) => {
    console.log(chalk.red(`[ERROR | ${formatTimestamp()}] ${msg}`));
    writeLogToFile("error", msg);
  },

  debug: (msg) => {
    console.log(chalk.magenta(`[DEBUG | ${formatTimestamp()}] ${msg}`));
    writeLogToFile("debug", msg);
  },
};
