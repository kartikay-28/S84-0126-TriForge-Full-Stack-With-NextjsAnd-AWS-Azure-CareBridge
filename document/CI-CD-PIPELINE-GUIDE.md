# 🚀 CareBridge CI/CD Pipeline - Complete Guide

## Overview
This document provides a **detailed breakdown** of the GitHub Actions CI/CD pipeline for the CareBridge healthcare application. The pipeline automates testing, linting, building, and deployment processes to ensure code quality and consistency.

---

## 📁 Project Structure & Technology Stack

### Technology Stack
```
Frontend:     Next.js 16.1.2 (React 19, TypeScript)
Backend:      Next.js API Routes (Node.js)
Database:     PostgreSQL (with Prisma ORM)
Authentication: JWT + bcryptjs
File Storage: Vercel Blob
Styling:      Tailwind CSS 4
State:        React Hook Form + Zod validation
Caching:      Redis (ioredis)
Linting:      ESLint 9
```

### Project Structure
```
carebridge/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          ← Main CI/CD configuration
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── api/              ← API routes
│   │   ├── auth/             ← Authentication pages
│   │   ├── dashboard/        ← User dashboards
│   │   └── page.tsx          ← Home page
│   ├── components/           ← Reusable React components
│   ├── contexts/             ← Context API for state
│   ├── hooks/                ← Custom React hooks
│   ├── lib/                  ← Utility functions
│   └── config/
├── prisma/
│   ├── schema.prisma         ← Database schema
│   └── migrations/           ← Database version control
├── docker/
│   └── Dockerfile            ← Container configuration
├── scripts/
│   └── build.sh              ← Build scripts
├── public/                   ← Static assets
├── package.json              ← Dependencies & scripts
├── tsconfig.json             ← TypeScript config
├── next.config.ts            ← Next.js config
├── eslint.config.js          ← ESLint rules
├── .eslintrc.json            ← ESLint config
├── tailwind.config.js        ← Tailwind CSS config
├── postcss.config.mjs        ← PostCSS config
└── .env.example              ← Environment template
```

---

## 🔄 CI/CD Pipeline Workflow

### File Location
**Path:** `.github/workflows/ci-cd.yml`

This YAML file defines the automated workflow that runs on GitHub Actions.

### Pipeline Triggers

```yaml
on:
  push:
    branches:
      - cloud-deployment    # Runs on push to cloud-deployment branch
  pull_request:
    branches:
      - main                # Runs on PR to main branch
```

**Explanation:**
- **`push`**: Triggered when code is pushed to `cloud-deployment` branch
- **`pull_request`**: Triggered when a PR is created/updated targeting `main` branch
- This ensures code is validated before merging to production

---

## 📊 Pipeline Stages Breakdown

### Stage 1: CHECKOUT
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

**What it does:**
- Clones the entire repository into the GitHub Actions runner
- Downloads the latest code from the branch that triggered the workflow
- Makes all source files available for subsequent steps

**File affected:** `ci-cd.yml` (workflow definition)

---

### Stage 2: SETUP NODE.JS ENVIRONMENT
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18        # Installs Node.js v18
    cache: npm              # Enables npm dependency caching
```

**What it does:**
- Installs Node.js v18 on the Ubuntu runner
- Sets up npm package manager
- **Caching**: Stores `node_modules` between runs → **3-5x faster CI execution**

**Why Node.js 18?**
- Matches `package.json` engine requirement: `"node": ">=18.0.0"`
- Supports modern JavaScript features (async/await, nullish coalescing, etc.)
- Long-term support (LTS) version = stable & production-ready

**Files involved:**
- `package.json` (defines Node version requirement)
- `package-lock.json` (locks exact dependency versions)

---

### Stage 3: INSTALL DEPENDENCIES
```yaml
- name: Install dependencies
  run: npm ci
```

**What it does:**
- `npm ci` = "npm clean install" (different from `npm install`)
- Installs dependencies from `package-lock.json` (exact versions)
- Skips optional dependencies not needed in CI
- More reliable for CI/CD than `npm install`

**Key dependencies being installed:**
```json
{
  "production": [
    "@prisma/client": "^5.19.1",      // Database ORM
    "next": "16.1.2",                 // React framework
    "react": "19.2.3",                // UI library
    "bcryptjs": "^3.0.3",            // Password hashing
    "jsonwebtoken": "^9.0.3",        // JWT auth
    "ioredis": "^5.9.2",             // Redis client
    "zod": "^4.3.5",                 // Schema validation
    "@vercel/blob": "^2.0.0"         // File storage
  ],
  "development": [
    "eslint": "^9",                  // Linter
    "typescript": "^5",              // Type checking
    "@types/react": "^19",           // React types
    "tailwindcss": "^4"              // CSS framework
  ]
}
```

**Files involved:**
- `package.json` (defines dependencies)
- `package-lock.json` (locks versions)

---

### Stage 4: LINT CODE
```yaml
- name: Lint code
  run: npm run lint
```

**What it does:**
- Runs ESLint to check code quality and style
- Detects syntax errors, unused variables, and code smells
- **Fails the build if errors found** → prevents low-quality code

**ESLint Configuration:**
**File:** `.eslintrc.json`
```json
{
  "extends": ["next/core-web-vitals", "plugin:prettier/recommended"],
  "rules": {
    "no-console": "warn",           // Warns on console.log() usage
    "semi": ["error", "always"],    // Enforces semicolons
    "quotes": ["error", "double"]   // Enforces double quotes
  }
}
```

**What ESLint checks:**
- ✅ Unused imports/variables
- ✅ Missing error handling
- ✅ Code style consistency
- ✅ React best practices
- ✅ Security issues

**Also configured:** `eslint.config.js`
```javascript
export default [
  js.configs.recommended,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**']
  }
]
```

**Ignores:**
- `.next/` → Next.js build output (auto-generated, don't lint)
- `build/` → Build artifacts
- `node_modules/` → Third-party code
- `out/` → Static export directory

---

### Stage 5: RUN TESTS
```yaml
- name: Run tests
  run: npm test
```

**Current Status:** `echo "No tests yet"`

**What SHOULD happen:**
- Jest test runner executes unit tests
- Tests cover component logic, hooks, and utility functions
- Generates code coverage reports

**Tests would include:**
```javascript
// Example: __tests__/components/FileUpload.test.tsx
describe('FileUpload Component', () => {
  test('uploads file successfully', () => {
    // Test file upload logic
  });
  
  test('validates file size', () => {
    // Test file size validation
  });
});
```

**Files to be tested:**
- `src/components/` → UI components
- `src/lib/` → Utility functions
- `src/hooks/` → Custom React hooks
- `src/contexts/` → Context providers

---

### Stage 6: BUILD NEXT.JS APP
```yaml
- name: Build Next.js app
  run: npm run build
```

**What it does:**
- Compiles TypeScript → JavaScript
- Bundles React components
- Optimizes assets (images, CSS, JS)
- Validates all code can compile

**Build process details:**

1. **TypeScript Compilation**
   - **File:** `tsconfig.json`
   ```json
   {
     "compilerOptions": {
       "target": "ES2017",           // Target JavaScript version
       "strict": true,               // Strict type checking
       "noUnusedLocals": true,       // Error on unused variables
       "noUnusedParameters": true,   // Error on unused params
       "jsx": "react-jsx"            // React 17+ syntax
     },
     "paths": {
       "@/*": ["./src/*"]            // Path alias for imports
     }
   }
   ```

2. **Next.js Compilation**
   - **File:** `next.config.ts`
   ```typescript
   const nextConfig: NextConfig = {
     typescript: {
       ignoreBuildErrors: false    // Fail if TypeScript errors
     }
   };
   ```
   - This ensures NO TypeScript errors are ignored
   - Full type safety is maintained

3. **Build Output**
   - Creates `.next/` directory with:
     - Optimized JavaScript bundles
     - Static HTML pages
     - CSS modules
     - Server-side code for API routes

**Files involved:**
- `src/app/layout.tsx` → Root layout
- `src/app/page.tsx` → Home page
- `src/app/api/**/*.ts` → API endpoints
- `prisma/schema.prisma` → Generates Prisma client (via `postinstall` hook)

---

### Stage 7: DOCKER BUILD VALIDATION
```yaml
- name: Docker build validation
  run: docker build -t carebridge-app -f ./docker/Dockerfile .
```

**What it does:**
- Validates the Docker configuration
- Builds a container image named `carebridge-app`
- Ensures app can be containerized for cloud deployment

**Dockerfile Path:** `./docker/Dockerfile` (currently doesn't exist)

**What should be in Dockerfile:**
```dockerfile
# Multi-stage build for production

# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔐 Environment Variables & Secrets

### Environment Variables File
**Location:** `.env.example`

```dotenv
# ==================================================
# SERVER SIDE VARIABLES (Never exposed to browser)
# ==================================================

# PostgreSQL Database connection (used by Prisma)
DATABASE_URL=postgresql://username:password@hostname:port/carebridge?sslmode=require

# JWT secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Vercel Blob token for file uploads
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# Redis connection (optional)
REDIS_URL=redis://username:password@hostname:port

# ==================================================
# CLIENT SIDE VARIABLES (Must start with NEXT_PUBLIC_)
# ==================================================

# Base API URL for frontend requests
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
```

### GitHub Secrets Configuration

To use secrets in CI/CD:

1. Go to **GitHub Repo Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Authentication secret key
   - `BLOB_READ_WRITE_TOKEN` - Vercel Blob token
   - `REDIS_URL` - Redis connection string

3. **Updated Workflow with Secrets:**
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  BLOB_READ_WRITE_TOKEN: ${{ secrets.BLOB_READ_WRITE_TOKEN }}
```

---

## 🎯 Complete CI/CD Workflow File Explanation

### Full `ci-cd.yml` with Enhanced Comments

**File:** `.github/workflows/ci-cd.yml`

```yaml
# ============================================
# CAREBRIDGE CI/CD PIPELINE
# ============================================
# Automates testing, linting, building, and
# validation on each push or pull request
# ============================================

name: CI/CD Pipeline

# WORKFLOW TRIGGERS
# Defines which events start the pipeline
on:
  push:
    branches:
      - cloud-deployment          # Run on pushes to cloud-deployment branch
  pull_request:
    branches:
      - main                      # Run on PRs targeting main branch

# JOBS
# Defines the work to be done
jobs:
  build-test-docker:              # Job name (can have multiple jobs)
    runs-on: ubuntu-latest        # Runs on latest Ubuntu container

    # STEPS
    # Sequential tasks executed in order
    steps:
      # Step 1: Clone repository
      - name: Checkout code
        uses: actions/checkout@v4
        # Uses: Official GitHub action to clone repo
        # v4: Latest stable version of checkout action

      # Step 2: Install Node.js runtime
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18         # Install Node.js v18
          cache: npm               # Cache npm dependencies

      # Step 3: Install project dependencies
      - name: Install dependencies
        run: npm ci
        # npm ci: Clean install from package-lock.json
        # Better than npm install for CI environments

      # Step 4: Check code quality
      - name: Lint code
        run: npm run lint
        # Runs ESLint configured in .eslintrc.json
        # Fails if style/quality issues found

      # Step 5: Run automated tests
      - name: Run tests
        run: npm test
        # Currently: echo "No tests yet"
        # Should run: Jest test suite

      # Step 6: Build Next.js application
      - name: Build Next.js app
        run: npm run build
        # Compiles TypeScript
        # Bundles React components
        # Generates .next/ directory

      # Step 7: Validate Docker configuration
      - name: Docker build validation
        run: docker build -t carebridge-app -f ./docker/Dockerfile .
        # -t: Tag image as carebridge-app
        # -f: Use Dockerfile from docker/ directory
        # .: Build context is current directory
```

---

## 📋 npm Scripts Explained

**File:** `package.json`

```json
"scripts": {
  "dev": "next dev",                    // Start dev server (localhost:3000)
  "build": "next build",                // Build for production
  "postinstall": "prisma generate",     // Auto-runs after npm install
  "start": "next start",                // Start production server
  "lint": "eslint",                     // Check code quality
  "test": "echo \"No tests yet\""       // Placeholder for tests
}
```

### Detailed Breakdown

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Start development server with hot reload |
| `build` | `next build` | Compile app for production deployment |
| `postinstall` | `prisma generate` | Generate Prisma client after dependency install |
| `start` | `next start` | Run compiled production build |
| `lint` | `eslint` | Run code quality checks |
| `test` | `echo "No tests yet"` | Placeholder (should be `jest --coverage`) |

---

## 🔄 Pipeline Execution Flow

```
GitHub Event (push/PR)
         ↓
    Checkout Code
         ↓
    Setup Node.js 18
         ↓
    Install Dependencies (npm ci)
         ↓
    Lint Code (ESLint)  ←── Can FAIL
         ↓
    Run Tests           ←── Can FAIL
         ↓
    Build Next.js       ←── Can FAIL
         ↓
    Docker Validation   ←── Can FAIL
         ↓
    ✅ Success OR ❌ Failure
         ↓
    GitHub Status Check Updated
         ↓
    PR Mergeable? (blocks merge if fails)
```

---

## 🎬 What Happens on Each Event

### Scenario 1: Developer Pushes to `cloud-deployment`
```
1. GitHub detects push event
2. CI/CD workflow starts
3. Runs all 7 stages
4. Results show in commit details
5. If passes → Ready for deployment
```

### Scenario 2: Developer Creates PR to `main`
```
1. GitHub detects pull_request event
2. CI/CD workflow starts
3. Runs all 7 stages
4. Results shown in PR checks
5. If fails → PR marked as "needs review"
6. If passes → PR can be merged (after code review)
```

---

## 🚀 Deployment Integration (Optional)

To add automated deployment after passing tests:

```yaml
- name: Deploy to Vercel
  if: github.ref == 'refs/heads/cloud-deployment' && success()
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  run: npm install -g vercel && vercel --prod --token $VERCEL_TOKEN
```

Or for Azure:
```yaml
- name: Deploy to Azure
  if: github.ref == 'refs/heads/main' && success()
  uses: azure/webapps-deploy@v2
  with:
    app-name: carebridge-app
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

---

## 📊 Performance Optimization

### Caching Strategy
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: npm          # ← Caches node_modules
```

**Benefits:**
- First run: ~2-3 minutes (downloads all packages)
- Subsequent runs: ~20-30 seconds (cached)
- **Saves ~90% of installation time**

### Concurrency Control
Add to workflow to prevent duplicate runs:
```yaml
concurrency:
  group: ${{ github.ref }}
  cancel-in-progress: true
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Node.js Version Mismatch
```
Error: The engine "node" is incompatible with this module.
```
**Solution:** Ensure workflow uses Node.js 18+
```yaml
node-version: 18
```

### Issue 2: ESLint Failures
```
Error: Expected ';' (semi)
```
**Solution:** Follow `.eslintrc.json` rules
- Add semicolons
- Use double quotes
- Avoid console.log() in production

### Issue 3: Docker Build Fails
```
Error: cannot find Dockerfile
```
**Solution:** Create `docker/Dockerfile` before running CI

### Issue 4: Long Build Times
```
❌ Build takes >5 minutes
```
**Solution:** Check cache settings in workflow
```yaml
with:
  cache: npm    # This must be set
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Workflow file exists: `.github/workflows/ci-cd.yml`
- [ ] Dependencies install without errors
- [ ] ESLint passes without warnings
- [ ] TypeScript compiles without errors
- [ ] Next.js build succeeds
- [ ] Docker image builds (if configured)
- [ ] GitHub Actions tab shows passing checks
- [ ] Secrets configured in GitHub Settings

---

## 📚 Files Involved in CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/ci-cd.yml` | Main workflow definition |
| `package.json` | Scripts & dependencies |
| `tsconfig.json` | TypeScript configuration |
| `.eslintrc.json` | ESLint rules |
| `eslint.config.js` | Modern ESLint config |
| `next.config.ts` | Next.js configuration |
| `.env.example` | Environment variable template |
| `docker/Dockerfile` | Container configuration |
| `prisma/schema.prisma` | Database schema |
| `src/**` | Source code to be validated |

---

## 🎓 Learning Outcomes

After understanding this pipeline, you'll know:

✅ How GitHub Actions automate testing and building
✅ The role of each CI/CD stage (Lint → Test → Build → Deploy)
✅ How to configure ESLint, TypeScript, and Next.js
✅ Best practices for secure credential management
✅ How to optimize CI/CD performance with caching
✅ How to integrate deployment with CI/CD
✅ How to debug pipeline failures

---

## 🔗 Related Documentation

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated:** January 29, 2026  
**Status:** ✅ Active CI/CD Pipeline  
**Maintainer:** CareBridge Team
