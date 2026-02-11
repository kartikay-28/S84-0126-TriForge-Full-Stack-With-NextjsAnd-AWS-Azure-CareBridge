# 📜 NPM Scripts Guide

This document explains all available npm scripts in the CareBridge project.

## 🚀 Development Scripts

### `npm run dev`
Starts the Next.js development server with hot-reload enabled.
- **Port**: http://localhost:3000
- **Use when**: Developing and testing locally

### `npm run build`
Creates an optimized production build of the application.
- **Output**: `.next` directory
- **Use when**: Preparing for deployment or testing production build

### `npm start`
Starts the production server (requires `npm run build` first).
- **Use when**: Testing production build locally

## 🔍 Code Quality Scripts

### `npm run lint`
Runs ESLint to check for code quality issues.
- **Use when**: Before committing code

### `npm run lint:fix`
Automatically fixes ESLint issues where possible.
- **Use when**: You want to auto-fix linting errors

### `npm run type-check`
Runs TypeScript compiler to check for type errors without emitting files.
- **Use when**: Verifying TypeScript types before commit

### `npm run format`
Formats all code files using Prettier.
- **Use when**: Ensuring consistent code formatting

### `npm run format:check`
Checks if code is properly formatted without making changes.
- **Use when**: In CI/CD pipeline or pre-commit hooks

## 🗄️ Database Scripts

### `npm run db:migrate`
Creates and applies a new database migration.
- **Use when**: Making schema changes during development
- **Interactive**: Prompts for migration name

### `npm run db:push`
Pushes schema changes directly to database without creating migrations.
- **Use when**: Rapid prototyping (not recommended for production)

### `npm run db:studio`
Opens Prisma Studio - a visual database browser.
- **Port**: http://localhost:5555
- **Use when**: Viewing/editing database records visually

### `npm run db:seed`
Seeds the database with initial data.
- **Use when**: Setting up development environment
- **Note**: Requires seed script configuration in `prisma/schema.prisma`

### `npm run db:reset`
Resets database by dropping all data and re-running migrations.
- **⚠️ Warning**: Deletes all data!
- **Use when**: Starting fresh in development

## 🧹 Maintenance Scripts

### `npm run clean`
Removes build cache and temporary files.
- **Removes**: `.next` directory and `node_modules/.cache`
- **Use when**: Troubleshooting build issues

### `npm run postinstall`
Automatically runs after `npm install` to generate Prisma Client.
- **Automatic**: No need to run manually

## 📋 Common Workflows

### Starting Development
```bash
npm install
npm run db:migrate
npm run dev
```

### Before Committing
```bash
npm run lint:fix
npm run type-check
npm run format
```

### Preparing for Deployment
```bash
npm run lint
npm run type-check
npm run build
```

### Database Setup
```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

### Troubleshooting Build Issues
```bash
npm run clean
npm install
npm run build
```

## 💡 Tips

- Use `npm run` to see all available scripts
- Scripts can be chained with `&&` (e.g., `npm run lint && npm run build`)
- Add custom scripts to `package.json` as needed
- Use `--` to pass arguments to scripts (e.g., `npm run lint -- --fix`)

## 🔗 Related Documentation

- [Next.js CLI Documentation](https://nextjs.org/docs/app/api-reference/next-cli)
- [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [ESLint CLI](https://eslint.org/docs/latest/use/command-line-interface)

---

**Happy Coding! 🎉**
