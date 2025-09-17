# Installation Guide

## Prerequisites

Before installing Nans Bot Utils, ensure you have:

- Node.js 18.0.0 or higher
- npm or yarn package manager
- A Discord application and bot token
- Basic knowledge of Discord server management

## Quick Start

### 1. Download the Bot

Clone the repository or download the latest release:

\`\`\`bash
git clone https://github.com/your-username/nans-bot-utils.git
cd nans-bot-utils/Nans-Bot-Utils
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configuration

1. Copy the example environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Edit the `.env` file with your bot credentials:
\`\`\`env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_test_guild_id_here
\`\`\`

### 4. Deploy Commands

Deploy slash commands to Discord:

\`\`\`bash
npm run deploy
\`\`\`

### 5. Start the Bot

\`\`\`bash
npm start
\`\`\`

For development with auto-restart:
\`\`\`bash
npm run dev
\`\`\`

## Discord Application Setup

### Creating a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name
4. Navigate to the "Bot" section
5. Click "Add Bot"
6. Copy the bot token (keep this secret!)

### Bot Permissions

Your bot needs the following permissions:
- Send Messages
- Use Slash Commands
- Manage Messages
- Kick Members
- Ban Members
- Manage Roles
- View Audit Log
- Read Message History

### Invite URL

Generate an invite URL with the required permissions:
\`\`\`
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
\`\`\`

## Database Setup

The bot uses SQLite by default. The database will be created automatically on first run.

For production, consider using PostgreSQL or MySQL:

1. Install the appropriate database driver
2. Update the database configuration in your `.env` file
3. Run database migrations

## Web Dashboard Setup

The web dashboard requires additional configuration:

### Environment Variables

Add these to your `.env` file:

\`\`\`env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
DISCORD_CLIENT_SECRET=your_discord_client_secret
\`\`\`

### Starting the Dashboard

\`\`\`bash
cd ../  # Go back to root directory
npm install
npm run dev
\`\`\`

The dashboard will be available at `http://localhost:3000`

## Production Deployment

### Using PM2

1. Install PM2 globally:
\`\`\`bash
npm install -g pm2
\`\`\`

2. Start the bot with PM2:
\`\`\`bash
pm2 start src/index.js --name "nans-bot"
\`\`\`

3. Save PM2 configuration:
\`\`\`bash
pm2 save
pm2 startup
\`\`\`

### Using Docker

1. Build the Docker image:
\`\`\`bash
docker build -t nans-bot-utils .
\`\`\`

2. Run the container:
\`\`\`bash
docker run -d --name nans-bot --env-file .env nans-bot-utils
\`\`\`

### Vercel Deployment (Dashboard)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Troubleshooting

### Common Issues

**Bot not responding to commands:**
- Check if the bot is online in your server
- Verify the bot has necessary permissions
- Ensure slash commands are deployed

**Database errors:**
- Check file permissions for SQLite
- Verify database connection string
- Run database migrations

**Authentication issues:**
- Verify Discord client ID and secret
- Check NEXTAUTH_URL configuration
- Ensure redirect URLs match

### Getting Help

If you encounter issues:
1. Check the [troubleshooting guide](/docs/troubleshooting)
2. Search existing [GitHub issues](https://github.com/your-repo/issues)
3. Join our [Discord server](https://discord.gg/your-server)
4. Create a new issue with detailed information

## Next Steps

After installation:
1. [Configure basic settings](/docs/setup)
2. [Set up moderation](/docs/automod)
3. [Configure economy system](/docs/economy-setup)
4. [Enable AI features](/docs/ai-setup)

---

**Need help?** Join our Discord server or create a support ticket for personalized assistance.
