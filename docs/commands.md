# Command Reference

Complete list of all available commands for Nans Bot Utils.

## General Commands

### `/help`
Display help information and command list.

**Usage:** `/help [command]`
**Parameters:**
- `command` (optional) - Get detailed help for a specific command

**Examples:**
\`\`\`
/help
/help moderation
/help economy
\`\`\`

### `/info`
Display bot information and statistics.

**Usage:** `/info`

### `/ping`
Check bot latency and response time.

**Usage:** `/ping`

## Moderation Commands

### `/ban`
Ban a user from the server.

**Usage:** `/ban <user> [reason] [delete_days]`
**Parameters:**
- `user` (required) - User to ban
- `reason` (optional) - Reason for the ban
- `delete_days` (optional) - Days of messages to delete (0-7)

**Permissions:** Ban Members

### `/kick`
Kick a user from the server.

**Usage:** `/kick <user> [reason]`
**Parameters:**
- `user` (required) - User to kick
- `reason` (optional) - Reason for the kick

**Permissions:** Kick Members

### `/mute`
Mute a user for a specified duration.

**Usage:** `/mute <user> <duration> [reason]`
**Parameters:**
- `user` (required) - User to mute
- `duration` (required) - Duration (e.g., 1h, 30m, 1d)
- `reason` (optional) - Reason for the mute

**Permissions:** Manage Messages

### `/unmute`
Unmute a previously muted user.

**Usage:** `/unmute <user> [reason]`
**Parameters:**
- `user` (required) - User to unmute
- `reason` (optional) - Reason for unmuting

**Permissions:** Manage Messages

### `/warn`
Issue a warning to a user.

**Usage:** `/warn <user> <reason>`
**Parameters:**
- `user` (required) - User to warn
- `reason` (required) - Reason for the warning

**Permissions:** Manage Messages

### `/warnings`
View warnings for a user.

**Usage:** `/warnings <user>`
**Parameters:**
- `user` (required) - User to check warnings for

### `/clear`
Delete multiple messages at once.

**Usage:** `/clear <amount> [user]`
**Parameters:**
- `amount` (required) - Number of messages to delete (1-100)
- `user` (optional) - Only delete messages from this user

**Permissions:** Manage Messages

## Economy Commands

### `/balance`
Check your or another user's balance.

**Usage:** `/balance [user]`
**Parameters:**
- `user` (optional) - User to check balance for

**Aliases:** `/bal`

### `/daily`
Claim your daily reward.

**Usage:** `/daily`

**Cooldown:** 24 hours

### `/work`
Work to earn money.

**Usage:** `/work`

**Cooldown:** 1 hour

### `/pay`
Transfer money to another user.

**Usage:** `/pay <user> <amount>`
**Parameters:**
- `user` (required) - User to pay
- `amount` (required) - Amount to transfer

### `/shop`
View the server shop.

**Usage:** `/shop [category]`
**Parameters:**
- `category` (optional) - Shop category to view

### `/buy`
Purchase an item from the shop.

**Usage:** `/buy <item> [quantity]`
**Parameters:**
- `item` (required) - Item to purchase
- `quantity` (optional) - Quantity to buy (default: 1)

### `/inventory`
View your inventory.

**Usage:** `/inventory [user]`
**Parameters:**
- `user` (optional) - User to check inventory for

**Aliases:** `/inv`

### `/leaderboard`
View the server economy leaderboard.

**Usage:** `/leaderboard [type]`
**Parameters:**
- `type` (optional) - Leaderboard type (balance, level, etc.)

**Aliases:** `/lb`, `/top`

## Leveling Commands

### `/level`
Check your or another user's level.

**Usage:** `/level [user]`
**Parameters:**
- `user` (optional) - User to check level for

**Aliases:** `/rank`

### `/leaderboard`
View the server level leaderboard.

**Usage:** `/leaderboard level`

## AI Commands

### `/ai`
Chat with the AI assistant.

**Usage:** `/ai <message>`
**Parameters:**
- `message` (required) - Message to send to AI

**Aliases:** `/chat`, `/ask`

### `/ai-moderate`
Use AI to analyze message content.

**Usage:** `/ai-moderate <text>`
**Parameters:**
- `text` (required) - Text to analyze

**Permissions:** Manage Messages

## Utility Commands

### `/avatar`
Display a user's avatar.

**Usage:** `/avatar [user]`
**Parameters:**
- `user` (optional) - User to get avatar for

### `/userinfo`
Display detailed information about a user.

**Usage:** `/userinfo [user]`
**Parameters:**
- `user` (optional) - User to get information for

### `/serverinfo`
Display information about the current server.

**Usage:** `/serverinfo`

### `/poll`
Create a poll with multiple options.

**Usage:** `/poll <question> <option1> <option2> [option3] [option4] [option5]`
**Parameters:**
- `question` (required) - Poll question
- `option1-5` - Poll options (minimum 2, maximum 5)

### `/remind`
Set a reminder for yourself.

**Usage:** `/remind <time> <message>`
**Parameters:**
- `time` (required) - When to remind (e.g., 1h, 30m, 2d)
- `message` (required) - Reminder message

## Admin Commands

### `/config`
Configure bot settings for the server.

**Usage:** `/config <setting> <value>`
**Parameters:**
- `setting` (required) - Setting to configure
- `value` (required) - New value for the setting

**Permissions:** Administrator

### `/prefix`
Change the bot's command prefix.

**Usage:** `/prefix <new_prefix>`
**Parameters:**
- `new_prefix` (required) - New command prefix

**Permissions:** Administrator

### `/autorole`
Configure automatic role assignment.

**Usage:** `/autorole <role>`
**Parameters:**
- `role` (required) - Role to assign to new members

**Permissions:** Manage Roles

### `/welcome`
Configure welcome messages.

**Usage:** `/welcome <channel> <message>`
**Parameters:**
- `channel` (required) - Channel for welcome messages
- `message` (required) - Welcome message template

**Permissions:** Manage Server

## Permission Levels

Commands require different permission levels:

- **Everyone:** Basic commands like `/help`, `/balance`, `/level`
- **Manage Messages:** Moderation commands like `/warn`, `/clear`
- **Kick Members:** `/kick` command
- **Ban Members:** `/ban` command
- **Manage Roles:** Role-related commands
- **Administrator:** Server configuration commands

## Command Cooldowns

Some commands have cooldowns to prevent spam:

- `/daily` - 24 hours
- `/work` - 1 hour
- `/ai` - 5 seconds
- `/remind` - 10 seconds

## Getting Help

For detailed help on any command, use:
\`\`\`
/help <command_name>
\`\`\`

Or visit our [Discord server](https://discord.gg/your-server) for live support.

---

**Note:** Some commands may be disabled or have different configurations depending on your server settings.
