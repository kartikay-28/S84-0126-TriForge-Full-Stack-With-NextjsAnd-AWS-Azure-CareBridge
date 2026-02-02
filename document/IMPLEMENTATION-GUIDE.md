# 🚀 CareBridge CI/CD - Step-by-Step Implementation Guide

## Table of Contents
1. [Setup Checklist](#setup-checklist)
2. [Step-by-Step Implementation](#step-by-step-implementation)
3. [Testing the Pipeline](#testing-the-pipeline)
4. [Troubleshooting](#troubleshooting)
5. [Next Steps](#next-steps)

---

## Setup Checklist

Before starting, verify you have:

- [ ] GitHub repository created and pushed
- [ ] `.github/workflows/ci-cd.yml` file (already exists)
- [ ] `package.json` with all scripts (already exists)
- [ ] Node.js 18+ installed locally
- [ ] npm 8+ installed locally
- [ ] Git configured with SSH or HTTPS
- [ ] GitHub account with repository access

---

## Step-by-Step Implementation

### Step 1: Verify Workflow File Location ✅

**Current Status:** Already exists at `.github/workflows/ci-cd.yml`

**What it contains:**
```
✅ Workflow name: CI/CD Pipeline
✅ Triggers: push to cloud-deployment, PR to main
✅ 7 pipeline stages (checkout, setup, lint, test, build, docker)
✅ All steps properly configured
```

**Action Required:** None - file is ready!

---

### Step 2: Configure GitHub Secrets 🔐

GitHub secrets store sensitive data like database URLs and API tokens.

#### Where to Configure

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### Secrets to Add

**Secret 1: DATABASE_URL**
```
Name: DATABASE_URL
Value: postgresql://username:password@host:5432/carebridge
```
Where to get:
- **Local development:** Create local PostgreSQL database
- **Azure:** Azure Database for PostgreSQL connection string
- **AWS:** Amazon RDS endpoint
- **Cloud:** Any PostgreSQL provider

**Secret 2: JWT_SECRET**
```
Name: JWT_SECRET
Value: your-strong-random-key-at-least-32-characters-long
```
Generate:
```bash
openssl rand -base64 32
```
Or use: `https://generate-secret.vercel.app/32`

**Secret 3: BLOB_READ_WRITE_TOKEN**
```
Name: BLOB_READ_WRITE_TOKEN
Value: vercel_blob_rw_xxx_xxx
```
Where to get:
- Vercel Dashboard → Settings → Blob Storage → Create token

**Secret 4: REDIS_URL (Optional)**
```
Name: REDIS_URL
Value: redis://username:password@host:6379
```
Where to get:
- Redis Cloud or Azure Cache for Redis
- Only needed if using Redis caching

#### Verification

After adding secrets, you should see:
```
✅ DATABASE_URL
✅ JWT_SECRET
✅ BLOB_READ_WRITE_TOKEN
✅ REDIS_URL (optional)
```

**Security Notes:**
- ✅ Values are encrypted
- ✅ Not visible in GitHub UI after saving
- ✅ Can't be printed in logs
- ✅ Only accessible to CI/CD workflow

---

### Step 3: Create docker/Dockerfile 📦

**Current Status:** File doesn't exist, needs to be created

**Action Required:** Create file

**File Path:** `carebridge/docker/Dockerfile`

**Content:**
```dockerfile
# Multi-stage build for CareBridge Next.js application

# ============================================
# STAGE 1: BUILD
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate


# ============================================
# STAGE 2: RUNTIME
# ============================================
FROM node:18-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
COPY --from=builder /app/package*.json ./

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

**Verification:**
After creating the file, run:
```bash
docker build -t carebridge-app:latest -f ./docker/Dockerfile .
```

Expected output:
```
...
Successfully built 1234567890ab
Successfully tagged carebridge-app:latest
```

---

### Step 4: Update .env.example (Already Done)

**Current Status:** File exists with all necessary variables

**What's included:**
```env
✅ DATABASE_URL (PostgreSQL)
✅ JWT_SECRET (Authentication)
✅ BLOB_READ_WRITE_TOKEN (File storage)
✅ REDIS_URL (Optional caching)
✅ NEXT_PUBLIC_API_URL (Frontend API)
```

**Action Required:** None - already configured!

---

### Step 5: Test Locally Before Pushing

**Step 5a: Install Dependencies**
```bash
cd carebridge
npm install
```

Expected output:
```
up to date, audited 89 packages in 3.5s
```

**Step 5b: Create .env.local**
```bash
cp .env.example .env.local
```

Edit `.env.local` with local values:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/carebridge
JWT_SECRET=dev-secret-key-32-chars-minimum
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_test_token
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Step 5c: Run Lint Check**
```bash
npm run lint
```

Expected output:
```
✅ ESLint checks passed
```

If errors appear:
```
❌ error: Expected ';' at line 5
```
Fix and re-run.

**Step 5d: Run Build**
```bash
npm run build
```

Expected output:
```
✅ Compiled successfully
✅ Created .next/ directory with optimized output
```

**Step 5e: Test Production Build**
```bash
npm run build
npm start
```

Visit `http://localhost:3000` in browser.

Expected: App runs without errors

---

### Step 6: Create Required API Routes

The workflow expects these files to exist:

**Required Files Check:**
```
✅ src/app/api/ (directory exists)
✅ src/app/page.tsx (home page)
✅ src/app/layout.tsx (root layout)
✅ prisma/schema.prisma (database schema)
```

**What These Do in CI/CD:**
- `page.tsx` → Compiled to static HTML
- `api/` routes → Bundled as serverless functions
- `prisma/schema.prisma` → Generates database client

---

### Step 7: Commit and Push to GitHub

**Step 7a: Check Git Status**
```bash
git status
```

You should see:
```
Changes not staged for commit:
  modified: .github/workflows/ci-cd.yml
  new file: docker/Dockerfile
  modified: .env.example
  ...
```

**Step 7b: Stage Changes**
```bash
git add -A
```

**Step 7c: Commit Changes**
```bash
git commit -m "chore: setup CI/CD pipeline with Docker support"
```

**Step 7d: Push to GitHub**
```bash
git push origin cloud-deployment
```

**Step 7e: Monitor Workflow**

1. Go to GitHub repository
2. Click **Actions** tab (top menu)
3. You should see workflow running:
   ```
   CI/CD Pipeline → Running
   ```

4. Click the workflow to see details:
   ```
   ✅ Checkout code (10s)
   ✅ Setup Node.js (15s)
   ✅ Install dependencies (30s)
   ⏳ Lint code (running...)
   ```

---

## Testing the Pipeline

### Test 1: Successful Build

**Scenario:** Push clean code

**Steps:**
1. Verify code locally: `npm run build`
2. Push to `cloud-deployment`
3. Go to Actions tab
4. Wait for completion

**Expected Result:**
```
✅ All checks passed
Duration: ~2-3 minutes
```

---

### Test 2: Linting Error (Intentional)

**Scenario:** Test that pipeline catches linting errors

**Steps:**

1. Open `src/app/page.tsx`
2. Add intentional error:
   ```typescript
   const x = 5      // Missing semicolon
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "test: trigger lint error"
   git push origin cloud-deployment
   ```
4. Go to Actions tab

**Expected Result:**
```
❌ Lint code failed
Error: Expected ';' (semi)
  src/app/page.tsx:5:15
```

**Fix:**
1. Add semicolon: `const x = 5;`
2. Commit and push again
3. Workflow re-runs and passes

---

### Test 3: Type Error

**Scenario:** Test TypeScript compilation

**Steps:**

1. Open `src/lib/jwt.ts` (or any file)
2. Add type error:
   ```typescript
   const x: number = "string";  // Type mismatch
   ```
3. Commit and push

**Expected Result:**
```
❌ Build Next.js app failed
error TS2322: Type 'string' is not assignable to type 'number'
```

**Fix:**
1. Correct the type
2. Commit and push
3. Workflow passes

---

### Test 4: Pull Request Check

**Scenario:** Create a PR to main

**Steps:**

1. Create a new branch:
   ```bash
   git checkout -b feature/test
   ```

2. Make a small change (e.g., add comment)

3. Commit and push:
   ```bash
   git add .
   git commit -m "feat: test PR workflow"
   git push origin feature/test
   ```

4. Go to GitHub repository
5. You should see "Compare & pull request" button
6. Click it and create PR to `main`

**Expected Result:**

PR page shows:
```
Checks
CI/CD Pipeline ✅ All checks passed

Merge pull request button becomes enabled
```

---

## Troubleshooting

### Issue 1: Workflow Not Triggering

**Problem:** Pushed code but Actions tab doesn't show workflow

**Causes:**
- ❌ Workflow file not in `.github/workflows/` directory
- ❌ Branch name doesn't match trigger
- ❌ File has syntax errors

**Solutions:**

1. **Check file exists:**
   ```bash
   ls -la .github/workflows/ci-cd.yml
   ```
   Should output: `ci-cd.yml`

2. **Check branch name:**
   ```bash
   git branch
   ```
   Should show you're on: `cloud-deployment` or `main`

3. **Check workflow syntax:**
   ```bash
   cat .github/workflows/ci-cd.yml | grep "on:"
   ```
   Should show:
   ```
   push:
     branches:
       - cloud-deployment
   ```

4. **Force trigger:**
   - Make a small change (add comment)
   - Commit and push to cloud-deployment
   - Workflow should start

---

### Issue 2: Lint Errors Block Build

**Problem:** `npm run lint` fails in pipeline

**Error Message:**
```
error: Expected ';' at line 15
error: Unexpected var, use let or const instead
```

**Solutions:**

1. **Run lint locally:**
   ```bash
   npm run lint
   ```

2. **Find and fix errors:**
   - Error shows file and line number
   - Open file and fix issue
   - Common fixes:
     ```
     ❌ const x = 5  →  ✅ const x = 5;
     ❌ const name = 'John'  →  ✅ const name = "John";
     ❌ let x;  →  ✅ const x = value;
     ```

3. **Re-run lint:**
   ```bash
   npm run lint
   ```
   Should pass now

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: linting errors"
   git push origin cloud-deployment
   ```

---

### Issue 3: Build Fails - Missing Packages

**Problem:** Pipeline fails at install dependencies

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Update locally:**
   ```bash
   npm install
   ```

2. **Commit package-lock.json:**
   ```bash
   git add package-lock.json
   git commit -m "chore: update dependencies"
   git push origin cloud-deployment
   ```

3. **If still failing:**
   ```bash
   # Clear cache
   npm cache clean --force
   
   # Reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Issue 4: TypeScript Compilation Error

**Problem:** Build fails with type errors

**Error Message:**
```
error TS2322: Type 'string' is not assignable to type 'number'
  at src/lib/utils.ts:10:5
```

**Solutions:**

1. **Find the error:**
   ```bash
   # Line 10 of src/lib/utils.ts
   cat src/lib/utils.ts | sed -n '10p'
   ```

2. **Fix the type:**
   - Add proper type annotation
   - Or change value to match type
   - Or use proper type casting

3. **Verify locally:**
   ```bash
   npm run build
   ```
   Should compile successfully

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: TypeScript errors"
   git push origin cloud-deployment
   ```

---

### Issue 5: Docker Build Fails

**Problem:** Docker build step fails in pipeline

**Error Message:**
```
Error: cannot find './docker/Dockerfile'
```

**Solutions:**

1. **Check file exists:**
   ```bash
   ls -la docker/Dockerfile
   ```

2. **If not, create it:**
   ```bash
   mkdir -p docker
   # Create Dockerfile with content from Step 3
   ```

3. **Test build locally:**
   ```bash
   docker build -t carebridge-app:latest -f ./docker/Dockerfile .
   ```

4. **If build fails:**
   - Check Docker installed: `docker --version`
   - Check base image available: `docker pull node:18-alpine`
   - Check Dockerfile syntax

5. **Commit and push:**
   ```bash
   git add docker/Dockerfile
   git commit -m "feat: add Docker configuration"
   git push origin cloud-deployment
   ```

---

### Issue 6: Workflow Times Out

**Problem:** Workflow takes >10 minutes

**Causes:**
- ❌ Large npm packages installing
- ❌ Network issues
- ❌ Docker build very slow
- ❌ No caching enabled

**Solutions:**

1. **Check cache configuration:**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: npm  # ← This must be present
   ```

2. **Skip optional steps:**
   - Remove Docker build if not needed
   - Or only run on main branch:
     ```yaml
     - if: github.ref == 'refs/heads/main'
       run: docker build ...
     ```

3. **Optimize dependencies:**
   ```bash
   npm list --depth=0  # Check for bloat
   npm install --omit=dev  # Skip dev deps
   ```

---

### Issue 7: Secrets Not Available

**Problem:** Environment variable shows as blank in logs

**Error:**
```
Error: DATABASE_URL not found
```

**Solutions:**

1. **Verify secrets added:**
   - Settings → Secrets and variables → Actions
   - Should see:
     ```
     ✅ DATABASE_URL
     ✅ JWT_SECRET
     ✅ BLOB_READ_WRITE_TOKEN
     ```

2. **Check secret usage in workflow:**
   ```yaml
   env:
     DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```
   Ensure exact match with secret name

3. **Secrets are not printed:**
   - GitHub automatically masks secrets in logs
   - If you see: `***` that's correct
   - If you see: blank, secret is not set

4. **Add missing secrets:**
   - Go to Settings → Secrets
   - Click "New repository secret"
   - Name and value must match exactly

---

## Next Steps

### After First Successful Build

1. **Celebrate! 🎉**
   - You have a working CI/CD pipeline
   - Code is automatically tested before merging

2. **Set up Branch Protection:**
   ```
   Settings → Branches → Add rule
   - Branch name pattern: main
   - Require status checks to pass
   - Check: CI/CD Pipeline
   ```
   This prevents merging without passing tests

3. **Implement Tests:**
   - Create `jest.config.js`
   - Create test files: `src/__tests__/`
   - Update `package.json`: `"test": "jest"`
   - Tests run in pipeline

4. **Add Automated Deployment:**
   - After pipeline passes
   - Deploy to Vercel or Azure
   - Configure environment variables

5. **Monitor Pipeline:**
   - Check Actions tab regularly
   - Fix failures quickly
   - Track performance trends

### CI/CD Best Practices

✅ **DO:**
- Keep pipeline fast (<5 minutes)
- Run tests frequently
- Use feature branches
- Create PRs for code review
- Add meaningful commit messages
- Keep secrets in GitHub Secrets

❌ **DON'T:**
- Commit .env files
- Hardcode API keys
- Skip linting
- Ignore test failures
- Push to main directly
- Store secrets in source code

---

## Quick Reference

### Common Commands

```bash
# Local testing
npm install
npm run lint
npm run test
npm run build
npm start

# Git workflow
git checkout -b feature/my-feature
git add .
git commit -m "feat: description"
git push origin feature/my-feature
# Create PR on GitHub

# Docker testing
docker build -t carebridge-app:latest .
docker run -p 3000:3000 carebridge-app:latest

# View logs
git log --oneline -10
```

### GitHub Actions URLs

- **Actions Tab:** `https://github.com/YOUR-USERNAME/carebridge/actions`
- **Secrets:** `https://github.com/YOUR-USERNAME/carebridge/settings/secrets/actions`
- **Workflow File:** `.github/workflows/ci-cd.yml`

### Files Modified

```
✅ .github/workflows/ci-cd.yml (enhanced with detailed comments)
✅ docker/Dockerfile (created)
✅ .env.example (already complete)
✅ package.json (no changes needed)
✅ tsconfig.json (no changes needed)
```

---

## Support Resources

- **GitHub Actions Docs:** https://docs.github.com/actions
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Docker Docs:** https://docs.docker.com
- **ESLint Rules:** https://eslint.org/docs/rules/
- **Prisma ORM:** https://www.prisma.io/docs/

---

**Status:** ✅ Ready for Production

Your CareBridge CI/CD pipeline is now fully configured and ready to use!

