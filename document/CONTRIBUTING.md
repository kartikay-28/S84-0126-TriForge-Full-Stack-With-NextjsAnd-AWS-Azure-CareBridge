# Contributing to CareBridge

Thank you for your interest in contributing to CareBridge! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## 📋 Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL database
- Git

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/your-username/carebridge.git

# Navigate to the project directory
cd carebridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## 🌿 Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-patient-search`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/api-structure`)
- `test/` - Adding tests (e.g., `test/auth-endpoints`)

## 💻 Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Keep functions small and focused
- Add comments for complex logic

### Running Linter

```bash
npm run lint
```

## 🧪 Testing

Before submitting a PR:

1. Test your changes locally
2. Ensure no console errors
3. Verify all existing features still work
4. Test on different screen sizes (if UI changes)

## 📝 Commit Message Guidelines

Write clear and descriptive commit messages:

```
type: brief description

Detailed explanation if needed
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Example:
```
feat: add patient search functionality

Added search bar to patient dashboard that filters by name and ID
```

## 🔄 Pull Request Process

1. Update documentation if needed
2. Ensure your code follows the project's style guidelines
3. Test your changes thoroughly
4. Create a pull request with a clear title and description
5. Link any related issues
6. Wait for code review
7. Address review comments if any

### PR Title Format

```
[Type] Brief description
```

Examples:
- `[Feature] Add patient search functionality`
- `[Fix] Resolve login validation issue`
- `[Docs] Update installation guide`

## 🐛 Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

## 💡 Suggesting Features

When suggesting features:

- Explain the problem it solves
- Describe the proposed solution
- Consider alternative approaches
- Discuss potential impact

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

## ❓ Questions?

If you have questions:

- Check existing documentation
- Search closed issues
- Open a new issue with the `question` label

## 🙏 Thank You!

Your contributions make CareBridge better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🎉**
