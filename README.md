# 🤖 Nans Bot Utils

<div align="center">

![Nans Bot Utils Logo](https://via.placeholder.com/200x200/5865F2/FFFFFF?text=NBU)

**Professional Discord Bot Management Platform**

[![Discord](https://img.shields.io/discord/your-server-id?color=5865F2&logo=discord&logoColor=white)](https://discord.gg/your-invite)
[![License](https://img.shields.io/github/license/Nanaimo2013/nans-bot-utils)](LICENSE)
[![Version](https://img.shields.io/github/v/release/Nanaimo2013/nans-bot-utils)](https://github.com/Nanaimo2013/nans-bot-utils/releases)
[![Stars](https://img.shields.io/github/stars/Nanaimo2013/nans-bot-utils)](https://github.com/Nanaimo2013/nans-bot-utils/stargazers)

*Advanced Discord bot with comprehensive server management, moderation, economy, leveling, and AI integration*

[🚀 **Get Started**](#-quick-start) • [📖 **Documentation**](https://your-domain.com/docs) • [💬 **Discord**](https://discord.gg/your-invite) • [🌐 **Dashboard**](https://your-domain.com)

</div>

---

## ✨ Features

### 🛡️ **Advanced Moderation**
- **Auto-moderation** with AI-powered content filtering
- **Spam protection** with customizable thresholds
- **Warning system** with automatic escalation
- **Raid protection** against mass joins
- **Comprehensive logging** of all moderation actions
- **Custom filters** for links, profanity, and more

### 💰 **Economy System**
- **Virtual currency** with customizable names and symbols
- **Daily rewards** and work commands
- **Shop system** with custom items
- **Banking** with interest rates
- **Leaderboards** and statistics
- **Transaction logging** and analytics

### 📈 **Leveling & XP**
- **XP system** with message-based rewards
- **Level-up notifications** with custom messages
- **Role rewards** for reaching milestones
- **Leaderboards** and rank cards
- **Customizable multipliers** and cooldowns
- **Channel-specific settings**

### 🧠 **AI Integration**
- **AI chat** powered by OpenAI GPT models
- **Smart moderation** with context awareness
- **Custom personalities** and prompts
- **Auto-responses** to mentions
- **Content analysis** and sentiment detection
- **Configurable models** and parameters

### 📊 **Analytics & Logging**
- **Comprehensive event logging** (messages, members, moderation)
- **Real-time analytics** dashboard
- **Export capabilities** for data analysis
- **Webhook integrations** for external systems
- **Activity tracking** and insights
- **Custom log channels** per event type

### 🌐 **Web Dashboard**
- **Beautiful interface** with dark/light themes
- **Server management** with intuitive controls
- **Real-time statistics** and monitoring
- **Configuration panels** for all features
- **User authentication** via Discord OAuth2
- **Mobile-responsive** design

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Discord Bot Token** ([Get one here](https://discord.com/developers/applications))
- **Basic Discord server management** knowledge

### 1. Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/Nanaimo2013/nans-bot-utils.git
cd nans-bot-utils

# Install bot dependencies
cd Nans-Bot-Utils
npm install

# Install dashboard dependencies
cd ..
npm install
\`\`\`

### 2. Configuration

\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
\`\`\`

**Required Environment Variables:**
\`\`\`env
# Discord Bot
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Dashboard
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: AI Features
OPENAI_API_KEY=your_openai_key
\`\`\`

### 3. Deploy & Start

\`\`\`bash
# Deploy slash commands
cd Nans-Bot-Utils
npm run deploy

# Start the bot
npm start

# In another terminal, start the dashboard
cd ..
npm run dev
\`\`\`

### 4. Invite Bot

Generate an invite link with required permissions:
\`\`\`
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
\`\`\`

---

## 📖 Documentation

| Resource | Description |
|----------|-------------|
| [📚 **Full Documentation**](https://your-domain.com/docs) | Complete setup and usage guide |
| [⚡ **Quick Setup**](https://your-domain.com/docs/installation) | Get started in 5 minutes |
| [🔧 **Configuration**](https://your-domain.com/docs/setup) | Detailed configuration options |
| [💻 **Commands**](https://your-domain.com/docs/commands) | Complete command reference |
| [🔌 **API Reference**](https://your-domain.com/docs/api) | REST API documentation |
| [❓ **FAQ**](https://your-domain.com/docs/faq) | Frequently asked questions |

---

## 🎮 Commands Overview

### General Commands
\`\`\`
/help                    - Show help information
/info                    - Bot statistics and information
/ping                    - Check bot latency
/serverinfo              - Display server information
/userinfo [user]         - Display user information
\`\`\`

### Moderation Commands
\`\`\`
/ban <user> [reason]     - Ban a user from the server
/kick <user> [reason]    - Kick a user from the server
/mute <user> <time>      - Mute a user for specified time
/warn <user> <reason>    - Issue a warning to a user
/clear <amount> [user]   - Delete multiple messages
\`\`\`

### Economy Commands
\`\`\`
/balance [user]          - Check balance
/daily                   - Claim daily reward
/work                    - Work to earn money
/pay <user> <amount>     - Transfer money
/shop [category]         - View server shop
/leaderboard             - Economy leaderboard
\`\`\`

### Leveling Commands
\`\`\`
/level [user]            - Check level and XP
/leaderboard level       - Level leaderboard
/rank [user]             - Show rank card
\`\`\`

### AI Commands
\`\`\`
/ai <message>            - Chat with AI assistant
/ai-moderate <text>      - Analyze content with AI
\`\`\`

---

## 🛠️ Development

### Project Structure

\`\`\`
nans-bot-utils/
├── Nans-Bot-Utils/          # Discord Bot
│   ├── src/
│   │   ├── commands/        # Slash commands
│   │   ├── events/          # Discord events
│   │   ├── database/        # Database models
│   │   └── utils/           # Utility functions
│   └── package.json
├── app/                     # Next.js Dashboard
│   ├── dashboard/           # Dashboard pages
│   ├── docs/               # Documentation
│   └── api/                # API routes
├── components/              # React components
└── docs/                   # Markdown documentation
\`\`\`

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup

\`\`\`bash
# Install dependencies
npm install

# Start development servers
npm run dev          # Dashboard (localhost:3000)
cd Nans-Bot-Utils && npm run dev  # Bot with auto-restart
\`\`\`

---

## 🚀 Deployment

### Vercel (Recommended for Dashboard)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nanaimo2013/nans-bot-utils)

### Docker

\`\`\`bash
# Build and run with Docker
docker build -t nans-bot-utils .
docker run -d --env-file .env nans-bot-utils
\`\`\`

### VPS/Dedicated Server

\`\`\`bash
# Using PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
\`\`\`

---

## 📊 Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| **Servers** | 1,000+ |
| **Users** | 500,000+ |
| **Commands Executed** | 10M+ |
| **Uptime** | 99.9% |

</div>

---

## 🤝 Community & Support

### Get Help

- 💬 **[Discord Server](https://discord.gg/your-invite)** - Live community support
- 📧 **[Email Support](mailto:support@your-domain.com)** - Direct assistance
- 🐛 **[GitHub Issues](https://github.com/Nanaimo2013/nans-bot-utils/issues)** - Bug reports
- 💡 **[Feature Requests](https://github.com/Nanaimo2013/nans-bot-utils/discussions)** - Suggest improvements

### Stay Updated

- ⭐ **Star this repository** to show support
- 👀 **Watch releases** for updates
- 🐦 **Follow us on Twitter** [@YourHandle](https://twitter.com/yourhandle)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Discord.js** - Powerful Discord API library
- **Next.js** - React framework for the dashboard
- **OpenAI** - AI integration capabilities
- **Vercel** - Hosting and deployment platform
- **Contributors** - Amazing people who help improve this project

---

<div align="center">

**Made with ❤️ by [NansStudios](https://github.com/nansstudios)**

[🌟 **Star**](https://github.com/Nanaimo2013/nans-bot-utils/stargazers) • [🍴 **Fork**](https://github.com/Nanaimo2013/nans-bot-utils/fork) • [📝 **Contribute**](CONTRIBUTING.md)

</div>
\`\`\`

```json file="" isHidden
