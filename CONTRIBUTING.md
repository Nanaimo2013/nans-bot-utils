# Contributing to Nans Bot Utils

Thank you for your interest in contributing to Nans Bot Utils! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** - Summarize the issue in the title
- **Description** - Detailed description of the bug
- **Steps to reproduce** - Step-by-step instructions
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - OS, Node.js version, bot version
- **Screenshots** - If applicable

### Suggesting Features

Feature requests are welcome! Please include:

- **Clear title** - Summarize the feature
- **Description** - Detailed description of the feature
- **Use case** - Why this feature would be useful
- **Implementation ideas** - If you have any ideas

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** from \`main\`
3. **Make your changes**
4. **Test your changes**
5. **Update documentation** if needed
6. **Commit with conventional commits**
7. **Push to your fork**
8. **Create a pull request**

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git
- Discord Bot Token (for testing)

### Local Development

1. **Clone your fork**
   \`\`\`bash
   git clone https://github.com/your-username/nans-bot-utils.git
   cd nans-bot-utils
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   # Bot dependencies
   cd Nans-Bot-Utils
   npm install
   
   # Dashboard dependencies
   cd ..
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Start development servers**
   \`\`\`bash
   # Terminal 1: Bot
   cd Nans-Bot-Utils
   npm run dev
   
   # Terminal 2: Dashboard
   npm run dev
   \`\`\`

## 📝 Code Style

### JavaScript/TypeScript

- Use ESLint and Prettier for formatting
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Prefer async/await over promises

### Commit Messages

Use conventional commit format:

\`\`\`
type(scope): description

[optional body]

[optional footer]
\`\`\`

**Types:**
- \`feat\` - New feature
- \`fix\` - Bug fix
- \`docs\` - Documentation changes
- \`style\` - Code style changes
- \`refactor\` - Code refactoring
- \`test\` - Adding tests
- \`chore\` - Maintenance tasks

**Examples:**
\`\`\`
feat(moderation): add auto-ban feature
fix(economy): resolve daily reward bug
docs(readme): update installation instructions
\`\`\`

## 🧪 Testing

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
\`\`\`

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Use descriptive test names
- Test both success and error cases

Example test structure:
\`\`\`javascript
describe('Economy System', () => {
  describe('Daily Rewards', () => {
    it('should give daily reward to user', async () => {
      // Test implementation
    });
    
    it('should prevent claiming twice in 24 hours', async () => {
      // Test implementation
    });
  });
});
\`\`\`

## 📁 Project Structure

### Bot Structure (\`Nans-Bot-Utils/\`)

\`\`\`
src/
├── commands/           # Slash commands
│   ├── moderation/    # Moderation commands
│   ├── economy/       # Economy commands
│   ├── leveling/      # Leveling commands
│   └── utility/       # Utility commands
├── events/            # Discord events
├── database/          # Database models and migrations
├── utils/             # Utility functions
├── middleware/        # Command middleware
└── index.js          # Bot entry point
\`\`\`

### Dashboard Structure

\`\`\`
app/
├── dashboard/         # Dashboard pages
├── docs/             # Documentation pages
├── api/              # API routes
└── globals.css       # Global styles

components/
├── dashboard/        # Dashboard components
├── server/          # Server management components
├── ui/              # UI components
└── auth/            # Authentication components
\`\`\`

## 🎯 Areas for Contribution

### High Priority
- Bug fixes
- Performance improvements
- Security enhancements
- Documentation improvements

### Medium Priority
- New moderation features
- Economy system enhancements
- UI/UX improvements
- Test coverage

### Low Priority
- Code refactoring
- Minor feature additions
- Style improvements

## 📋 Pull Request Checklist

Before submitting a pull request:

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] PR description explains changes

## 🔍 Code Review Process

1. **Automated checks** - CI/CD pipeline runs tests
2. **Maintainer review** - Code review by maintainers
3. **Feedback** - Address any requested changes
4. **Approval** - PR approved by maintainer
5. **Merge** - Changes merged to main branch

## 🚀 Release Process

1. **Version bump** - Update version numbers
2. **Changelog** - Update CHANGELOG.md
3. **Tag release** - Create git tag
4. **Deploy** - Automatic deployment
5. **Announce** - Announce in Discord server

## 📞 Getting Help

If you need help with contributing:

- **Discord Server** - [Join our community](https://discord.gg/your-invite)
- **GitHub Discussions** - Ask questions in discussions
- **Email** - Contact maintainers directly

## 🏆 Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- Discord server special role
- Annual contributor highlights

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Nans Bot Utils! 🎉
\`\`\`
\`\`\`

```json file="" isHidden
