# 📋 CareBridge Configuration Files - Deep Dive

## Table of Contents
1. [package.json](#packagejson)
2. [tsconfig.json](#tsconfigjson)
3. [next.config.ts](#nextconfigts)
4. [eslint Configuration](#eslint-configuration)
5. [tailwind.config.js](#tailwindconfigjs)
6. [postcss.config.mjs](#postcssconfigmjs)
7. [Dockerfile](#dockerfile)
8. [.env Configuration](#env-configuration)

---

## package.json

**Path:** `carebridge/package.json`

### Full File Content

```json
{
  "name": "carebridge",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "postinstall": "prisma generate",
    "start": "next start",
    "lint": "eslint",
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "@prisma/client": "^5.19.1",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-toast": "^1.2.15",
    "@tailwindcss/forms": "^0.5.11",
    "@tailwindcss/typography": "^0.5.19",
    "@types/multer": "^2.0.0",
    "@vercel/blob": "^2.0.0",
    "bcryptjs": "^3.0.3",
    "framer-motion": "^12.27.0",
    "ioredis": "^5.9.2",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.0.2",
    "next": "16.1.2",
    "prisma": "^5.19.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.1",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Detailed Breakdown

#### Scripts Section
```json
"scripts": {
  "dev": "next dev",              // Development server
                                  // Command: npm run dev
                                  // Starts: localhost:3000 with hot reload
                                  // When to use: Local development

  "build": "next build",          // Production build
                                  // Command: npm run build
                                  // Creates: .next/ directory
                                  // When to use: Before deployment, in CI/CD

  "postinstall": "prisma generate", // Auto-runs after npm install
                                  // Generates: Prisma client
                                  // Needed: For database queries
                                  // Why: Ensures DB client always up-to-date

  "start": "next start",          // Production server
                                  // Command: npm start
                                  // Requires: npm run build first
                                  // When to use: Production environments

  "lint": "eslint",               // Code quality check
                                  // Command: npm run lint
                                  // Checks: All .js, .ts, .tsx, .jsx files
                                  // Runs in: CI/CD pipeline
                                  // Fails on: Any linting errors

  "test": "echo \"No tests yet\"" // Placeholder
                                  // Current: Outputs message
                                  // Future: Should run Jest tests
                                  // Would run: npm test
}
```

#### Dependencies (Production)

```json
"dependencies": {
  // ============== DATABASE ==============
  "@prisma/client": "^5.19.1",    // Prisma ORM Client
                                  // Purpose: Database query builder
                                  // Files: Used in src/lib/prisma.ts
                                  // Examples:
                                  //   prisma.user.findUnique()
                                  //   prisma.doctor.create()
                                  //   prisma.medicalRecord.update()

  // ============== WEB FRAMEWORK ==============
  "next": "16.1.2",               // Next.js Framework
                                  // Purpose: React framework for production
                                  // Features: SSR, SSG, API routes, middleware
                                  // Files: src/app/** for routing
                                  // Version: 16.1.2 (latest)

  "react": "19.2.3",              // React Library
                                  // Purpose: UI component library
                                  // Version: 19 (latest with new hooks)
                                  // Used in: All .tsx files

  "react-dom": "19.2.3",          // React DOM Rendering
                                  // Purpose: Renders React to browser DOM
                                  // Used with: React components

  // ============== STYLING ==============
  "tailwindcss": "^4",            // Tailwind CSS Framework (in devDeps)
  "@tailwindcss/forms": "^0.5.11", // Form component styles
                                  // Purpose: Pre-styled form inputs
                                  // Used in: src/components/ProfileForms/

  "@tailwindcss/typography": "^0.5.19", // Typography styles
                                  // Purpose: Prose styling for rich text
                                  // Used in: Content-heavy pages

  // ============== UI COMPONENTS ==============
  "@radix-ui/react-dialog": "^1.1.15", // Dialog/Modal component
                                  // Purpose: Accessible dialog box
                                  // Used in: Patient record modals

  "@radix-ui/react-toast": "^1.2.15",  // Toast notification
                                  // Purpose: Dismissible notifications
                                  // Used in: Success/error messages

  "framer-motion": "^12.27.0",    // Animation library
                                  // Purpose: Smooth animations and transitions
                                  // Used in: LampToggle, ThemeToggle components

  // ============== AUTHENTICATION ==============
  "bcryptjs": "^3.0.3",           // Password hashing
                                  // Purpose: Securely hash passwords
                                  // Used in: src/api/auth/signup/route.ts
                                  // Example: const hash = await bcrypt.hash(password, 10)

  "jsonwebtoken": "^9.0.3",       // JWT tokens
                                  // Purpose: Create/verify authentication tokens
                                  // Used in: src/lib/jwt.ts
                                  // Example: jwt.sign({ userId: 123 }, secret)

  // ============== FORM HANDLING ==============
  "react-hook-form": "^7.71.1",   // Form state management
                                  // Purpose: Handle form inputs efficiently
                                  // Used in: BasicProfileForm.tsx
                                  // Features: Validation, error handling

  "zod": "^4.3.5",                // Schema validation
                                  // Purpose: Validate input schemas
                                  // Used in: Form submission validation
                                  // Example: z.string().email()

  // ============== DATA STORAGE ==============
  "@vercel/blob": "^2.0.0",       // File storage service
                                  // Purpose: Upload/retrieve files
                                  // Used in: FileUpload.tsx
                                  // Supports: Medical reports, images

  "multer": "^2.0.2",             // File upload middleware
                                  // Purpose: Parse file uploads
                                  // Used in: src/api/files/route.ts
                                  // Supports: multipart/form-data

  // ============== CACHING ==============
  "ioredis": "^5.9.2",            // Redis client
                                  // Purpose: In-memory caching
                                  // Used in: src/lib/redis.ts
                                  // Features: Session storage, caching

  // ============== TYPE DEFINITIONS ==============
  "@types/multer": "^2.0.0"       // TypeScript types for Multer
                                  // Purpose: Type safety for file uploads
                                  // Used with: multer package
}
```

#### DevDependencies (Development Only)

```json
"devDependencies": {
  // ============== TYPESCRIPT ==============
  "typescript": "^5",             // TypeScript compiler
                                  // Purpose: Type checking
                                  // Config file: tsconfig.json
                                  // Check with: tsc --noEmit

  "@types/node": "^20",           // Node.js type definitions
                                  // Purpose: Type Node.js APIs
                                  // Needed for: API routes, server code

  "@types/react": "^19",          // React type definitions
                                  // Purpose: Type React components
                                  // Needed for: .tsx files

  "@types/react-dom": "^19",      // React DOM type definitions
                                  // Purpose: Type React DOM APIs
                                  // Needed for: React rendering

  "@types/bcryptjs": "^2.4.6",    // bcryptjs type definitions
                                  // Purpose: Type bcrypt functions
                                  // Needed for: Password hashing

  "@types/jsonwebtoken": "^9.0.10", // JWT type definitions
                                  // Purpose: Type JWT functions
                                  // Needed for: Token creation/verification

  // ============== LINTING ==============
  "eslint": "^9",                 // Code quality linter
                                  // Purpose: Check code style
                                  // Config: .eslintrc.json, eslint.config.js
                                  // Run: npm run lint

  "eslint-config-next": "16.1.2", // Next.js ESLint configuration
                                  // Purpose: Next.js specific rules
                                  // Includes: React hooks rules, Next.js best practices

  // ============== STYLING ==============
  "tailwindcss": "^4",            // Tailwind CSS framework
                                  // Purpose: Utility-first CSS
                                  // Config: tailwind.config.js
                                  // Input: src/app/globals.css

  "@tailwindcss/postcss": "^4",   // PostCSS plugin for Tailwind
                                  // Purpose: Process Tailwind CSS
                                  // Config: postcss.config.mjs
}
```

#### Engines Section
```json
"engines": {
  "node": ">=18.0.0",             // Minimum Node.js version
                                  // Reason: Modern JavaScript support
                                  // GitHub Actions uses: v18
                                  // Why 18+: 
                                  //   - Supports top-level await
                                  //   - Nullish coalescing (??)
                                  //   - Optional chaining (?.)
                                  //   - LTS = stable & supported

  "npm": ">=8.0.0"                // Minimum npm version
                                  // Reason: Lockfile format compatibility
                                  // Current npm: 9.x, 10.x (fine)
                                  // Why 8+: Better dependency resolution
}
```

---

## tsconfig.json

**Path:** `carebridge/tsconfig.json`

### Full Configuration

```json
{
  "compilerOptions": {
    // ============== OUTPUT ==============
    "target": "ES2017",           // Target JavaScript version
                                  // ES2017 = supports:
                                  //   - async/await
                                  //   - Promise.all/Promise.race
                                  //   - String methods: padStart, padEnd
                                  // Compatibility: All modern browsers + Node.js 8+

    "lib": [
      "dom",                      // Browser DOM APIs
      "dom.iterable",             // Iterable DOM APIs (for...of)
      "esnext"                    // Latest JavaScript features
    ],

    "jsx": "react-jsx",           // JSX compilation
                                  // react-jsx = new transform (no import React needed)
                                  // Converts: <Button /> → jsx('Button', {})

    // ============== MODULE RESOLUTION ==============
    "module": "esnext",           // Module output format
                                  // esnext = let build tool handle transpilation
                                  // Next.js uses webpack, so it handles it

    "moduleResolution": "bundler", // How to resolve imports
                                  // bundler = modern bundler resolution
                                  // Supports: package.json "exports" field

    "resolveJsonModule": true,    // Allow importing .json files
                                  // Example: import config from './config.json'

    "allowJs": true,              // Allow .js files in TypeScript project
                                  // Useful: For migrating JS to TS gradually

    // ============== STRICT TYPE CHECKING ==============
    "strict": true,               // Enable all strict type checking
                                  // Includes:
                                  //   - noImplicitAny
                                  //   - strictNullChecks
                                  //   - strictFunctionTypes
                                  //   - etc.

    "noImplicitAny": true,        // Error on implicit 'any' type
                                  // ❌ let x; (any)
                                  // ✅ let x: any; (explicit)

    "strictNullChecks": true,     // Error on null/undefined without checking
                                  // ❌ const x: string = null;
                                  // ✅ const x: string | null = null;

    "strictFunctionTypes": true,  // Strict function signature checking
                                  // Function types must be exactly compatible

    "strictBindCallApply": true,  // Strict bind/call/apply checking
                                  // Ensures this binding is correct

    "strictPropertyInitialization": true, // Properties must be initialized
                                  // ❌ class User { name: string; } (error)
                                  // ✅ class User { name: string = ""; }

    "noImplicitThis": true,       // Error on implicit 'this: any'
                                  // Requires explicit type of 'this'

    "alwaysStrict": true,         // Emit "use strict" in output
                                  // Ensures strict mode in all generated code

    // ============== UNUSED CODE DETECTION ==============
    "noUnusedLocals": true,       // Error on unused local variables
                                  // ❌ const x = 5; (unused)
                                  // Helps identify dead code

    "noUnusedParameters": true,   // Error on unused function parameters
                                  // ❌ function getUser(id, unused) { }
                                  // Clean up function signatures

    "noImplicitReturns": true,    // Error if function may not return
                                  // ❌ function getValue() { if(x) return 5; }
                                  // All code paths must return

    "noFallthroughCasesInSwitch": true, // Error on switch fallthrough
                                  // ❌ case 1: doSomething(); case 2: {} (fallthrough)
                                  // Requires break or return

    // ============== EMIT ==============
    "noEmit": true,               // Don't output compiled files
                                  // Why: Next.js builds TypeScript, not tsc
                                  // Use tsc only for type checking

    "sourceMap": true,            // Generate .map files for debugging
                                  // Enables: Debugging TypeScript in browser

    "declaration": false,         // Don't generate .d.ts files
                                  // Not needed: This is app, not library

    // ============== INTEROPERABILITY ==============
    "esModuleInterop": true,      // Better CommonJS interop
                                  // Allows: import * as express from 'express'

    "forceConsistentCasingInFileNames": true, // Case-sensitive imports
                                  // Error if: import X from './x' (wrong case)
                                  // Prevents: Issues on case-sensitive systems (Linux)

    // ============== MODULE ISOLATION ==============
    "isolatedModules": true,      // Treat each file as separate module
                                  // Why: Better with Babel/esbuild/SWC transpilers

    // ============== INCREMENTAL COMPILATION ==============
    "incremental": true,          // Save compilation info
                                  // Benefit: Faster rebuilds (only changed files)

    // ============== PATH ALIASES ==============
    "paths": {
      "@/*": ["./src/*"]          // Import alias: @/components → src/components
                                  // Benefits:
                                  //   - Cleaner imports
                                  //   - Easier refactoring
                                  // Example: import Button from '@/components/Button'
    }
  },

  // ============== PLUGIN CONFIGURATION ==============
  "plugins": [
    {
      "name": "next"              // Next.js TypeScript plugin
                                  // Purpose: Type checking for Next.js specifics
                                  // Handles: App Router types, API routes, etc.
    }
  ],

  // ============== FILE INCLUSION ==============
  "include": [
    "next-env.d.ts",              // Next.js generated types
    "**/*.ts",                    // All .ts files
    "**/*.tsx"                    // All .tsx files
  ],

  // ============== FILE EXCLUSION ==============
  "exclude": [
    "node_modules",               // Third-party code
    ".next",                      // Build output
    "build",                      // Manual build output
    "out",                        // Static export output
    "dist"                        // Distribution output
  ]
}
```

---

## next.config.ts

**Path:** `carebridge/next.config.ts`

### Configuration & Explanation

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============== TYPESCRIPT ==============
  typescript: {
    ignoreBuildErrors: false,     // FAIL build on TypeScript errors
                                  // Why false: Ensures type safety in production
                                  // If true: Would allow errors to ship to prod
                                  // Recommended: Always use false
  },

  // ============== OPTIONAL ADDITIONS ==============
  // Below are common configurations for CareBridge:

  // ============== IMAGE OPTIMIZATION ==============
  // images: {
  //   formats: ["image/avif", "image/webp"],
  //   // Optimize images to modern formats
  //   // Avif: Better compression than WebP
  //   // WebP: Better than JPEG
  //   // Fallback: JPEG for older browsers
  //
  //   domains: [
  //     "vercel.blob.com",       // For @vercel/blob storage
  //     "*.blob.core.windows.net" // For Azure Blob Storage
  //   ],
  //   // Allow images from external domains
  // },

  // ============== ENVIRONMENT VARIABLES ==============
  // env: {
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  // },
  // But better: Use .env files directly

  // ============== EXPERIMENTAL FEATURES ==============
  // experimental: {
  //   isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB ISR cache
  // },

  // ============== WEBPACK CONFIG ==============
  // webpack: (config, { isServer }) => {
  //   // Custom webpack configuration
  //   return config;
  // },

  // ============== REWRITES & REDIRECTS ==============
  // async rewrites() {
  //   return {
  //     beforeFiles: [
  //       {
  //         source: "/api/:path*",
  //         destination: "http://localhost:4000/:path*"
  //       }
  //     ]
  //   };
  // },

  // ============== HEADERS ==============
  // async headers() {
  //   return [
  //     {
  //       source: "/api/health",
  //       headers: [
  //         { key: "Cache-Control", value: "no-cache" }
  //       ]
  //     }
  //   ];
  // },

  // ============== COMPRESSION ==============
  compress: true,                 // Gzip compression enabled
                                  // Default: true
                                  // Reduces payload size by 60-80%

  // ============== PRODUCTION SOURCE MAPS ==============
  productionBrowserSourceMaps: false, // Don't expose source maps in prod
                                  // Why false: Security (hide source code)
                                  // Error tracking: Use Sentry for errors

  // ============== BUILD ANALYSIS ==============
  // swcMinify: true,              // Use SWC instead of Terser (faster)
  //                               // Default: true for Next.js 13+

  // ============== MIDDLEWARE ==============
  // middleware: []                // Can be configured if needed
};

export default nextConfig;
```

---

## ESLint Configuration

### File 1: .eslintrc.json

**Path:** `carebridge/.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",           // Next.js recommended rules
                                      // Includes:
                                      //   - React hooks rules
                                      //   - Accessibility rules
                                      //   - Core Web Vitals rules (performance)

    "plugin:prettier/recommended"     // Prettier integration
                                      // Ensures: Code formatting consistency
                                      // Integrates with: .prettierrc file
  ],

  "rules": {
    // ============== LOGGING ==============
    "no-console": "warn",             // Warn on console.log() in code
                                      // Reason: Avoid logging in production
                                      // Warning: Doesn't fail build, just warns
                                      // Best practice: Use proper logger

    // ============== SEMICOLONS ==============
    "semi": ["error", "always"],      // REQUIRE semicolons at end of statements
                                      // Severity: error (breaks build)
                                      // ❌ const x = 5
                                      // ✅ const x = 5;
                                      // Reason: Avoid ASI (Automatic Semicolon Insertion) bugs

    // ============== QUOTES ==============
    "quotes": ["error", "double"],    // REQUIRE double quotes
                                      // Severity: error (breaks build)
                                      // ❌ const name = 'John';
                                      // ✅ const name = "John";
                                      // Reason: Code consistency across team

    // ============== OPTIONAL RULES ==============
    // Add these for stricter checking:

    // "no-unused-vars": "error",      // Error on unused variables
    //                                 // Caught by TypeScript already

    // "no-var": "error",              // Force const/let over var
    //                                 // var has function scope issues

    // "prefer-const": "error",        // Use const when not reassigned
    //                                 // Better: Clearer intent

    // "@next/next/no-html-link-for-pages": "off", // Allow <a> tags
    //                                 // Only needed if custom behavior

    // "react/prop-types": "off",      // TypeScript handles prop types
    //                                 // Don't need PropTypes
  }
}
```

### File 2: eslint.config.js

**Path:** `carebridge/eslint.config.js`

```javascript
import js from "@eslint/js";

export default [
  js.configs.recommended,           // Base ESLint recommended rules
                                    // Includes:
                                    //   - Best practice rules
                                    //   - Error prevention

  {
    ignores: [
      ".next/**",                   // Next.js build output
      "out/**",                     // Static export output
      "build/**",                   // Manual build directory
      "node_modules/**",            // Third-party packages
      ".git/**",                    // Git directory
      "*.config.js",                // Config files (usually fine)
    ],
    // Patterns to skip during linting
    // Why: Avoid linting generated/external code
    // Saves time: Don't check thousands of node_modules files
  },
];
```

---

## tailwind.config.js

**Path:** `carebridge/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  // ============== CONTENT PATHS ==============
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",    // Pages directory
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",  // Components
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",      // App router
  ],
  // Purpose: Tell Tailwind where to find CSS classes
  // Only includes classes found in these files
  // Benefit: Smaller CSS bundle (unused classes removed)

  theme: {
    extend: {
      // ============== CUSTOM COLORS ==============
      colors: {
        // Add custom brand colors here
        // primary: '#3B82F6',        // Brand blue
        // secondary: '#8B5CF6',     // Brand purple
      },

      // ============== CUSTOM SPACING ==============
      spacing: {
        // Add custom spacing values here
        // '128': '32rem',           // 512px
      },

      // ============== CUSTOM FONTS ==============
      fontFamily: {
        // Add custom fonts here
        // sans: ['Inter', 'sans-serif'],
      },

      // ============== CUSTOM ANIMATIONS ==============
      keyframes: {
        // Define custom animations
        // fadeIn: {
        //   '0%': { opacity: '0' },
        //   '100%': { opacity: '1' },
        // },
      },

      animation: {
        // Use keyframes here
        // fadeIn: 'fadeIn 0.5s ease-in',
      },
    },
  },

  // ============== PLUGINS ==============
  plugins: [
    require("@tailwindcss/forms"),        // Better form styling
    require("@tailwindcss/typography"),   // Prose classes for rich text
  ],
  // Purpose: Extend Tailwind with additional utilities
  // @tailwindcss/forms: Resets form inputs for consistency
  // @tailwindcss/typography: Classes for styled content (blog, etc)

  // ============== OPTIONAL SETTINGS ==============
  // darkMode: 'class',                // Enable dark mode with class strategy
  //                                    // Usage: <html class="dark">
  // corePlugins: {
  //   preflight: true,                // Enable Tailwind reset (Preflight)
  //   // Preflight resets browser defaults for consistency
  // },
};
```

---

## postcss.config.mjs

**Path:** `carebridge/postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // ============== TAILWIND CSS ==============
    tailwindcss: {},                // Process Tailwind CSS
                                    // Scans files for @tailwind directives
                                    // Generates CSS from utility classes

    // ============== AUTOPREFIXER ==============
    autoprefixer: {},               // Add vendor prefixes
                                    // Example: -webkit-, -moz-, -ms-
                                    // Why: Older browser compatibility

    // ============== OPTIONAL PLUGINS ==============
    // "postcss-preset-env": {     // Modern CSS features
    //   stage: 3                   // CSS Stage 3 features
    // },
    // cssnano: {},                // CSS minification
    //                             // Already done in production
  },
};

export default config;
```

---

## Dockerfile

**Path:** `carebridge/docker/Dockerfile` (needs to be created)

### Recommended Multi-Stage Build

```dockerfile
# ============================================================
# STAGE 1: BUILDER
# Purpose: Build the Next.js application
# Installs all dependencies and compiles code
# ============================================================

FROM node:18-alpine AS builder
# Base image: Node.js 18 on Alpine Linux
# Alpine: Only 170MB (vs 1GB+ for full Ubuntu)
# Trade-off: Missing some system tools, but fine for Node.js apps

WORKDIR /app
# Set working directory for all subsequent commands
# All RUN, ADD, COPY, etc. operate relative to this

COPY package*.json ./
# Copy package.json and package-lock.json
# Do this first for better caching
# If dependencies don't change, Docker reuses this layer

RUN npm ci
# Clean install dependencies
# Uses exact versions from package-lock.json
# Better than npm install for consistency

COPY . .
# Copy entire source code into container
# Happens after npm ci to leverage Docker layer caching
# If package*.json unchanged, npm ci layer is reused

RUN npm run build
# Compile TypeScript and React
# Generates: .next/ directory with optimized code
# Takes: ~45 seconds

# Optional: Prisma generate (usually done in postinstall)
RUN npx prisma generate
# Generate Prisma client from schema
# Only needed if postinstall not running properly


# ============================================================
# STAGE 2: RUNTIME
# Purpose: Run the application
# Only copies built output + dependencies
# Much smaller than builder stage
# ============================================================

FROM node:18-alpine
# Start fresh with another Node.js image
# Smaller: Only includes runtime, not build tools

WORKDIR /app

# Copy .next directory from builder
# This is the compiled app
COPY --from=builder /app/.next ./.next

# Copy node_modules from builder
# Production dependencies only
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
# Needed by npm start to know how to run app
COPY --from=builder /app/package*.json ./

# Copy .env if needed (be careful with secrets!)
# Better: Use environment variables instead
# COPY .env.production .env.production

# Copy prisma directory for migrations (optional)
# COPY --from=builder /app/prisma ./prisma

# ============================================================
# CONFIGURATION
# ============================================================

# Expose port that app listens on
EXPOSE 3000
# Port: 3000 (default Next.js port)
# This documents the port, doesn't actually expose it
# Mapping: docker run -p 8080:3000 will forward 8080 to 3000

# Set environment
ENV NODE_ENV=production
# Production mode: Better performance, no source maps

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
# Periodically checks if app is healthy
# Kubernetes: Uses for pod monitoring

# ============================================================
# STARTUP
# ============================================================

CMD ["npm", "start"]
# Default command to run when container starts
# Equivalent to: npm start
# Runs Next.js production server on port 3000

# Alternative CMD variations:
# CMD ["node_modules/.bin/next", "start"]  # Explicit Next.js binary
# CMD ["npm", "start", "--", "--hostname", "0.0.0.0"]  # Listen on all interfaces
```

### Building & Running

```bash
# Build the Docker image
docker build -t carebridge-app:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  carebridge-app:latest

# Push to container registry
docker tag carebridge-app:latest myregistry.azurecr.io/carebridge:latest
docker push myregistry.azurecr.io/carebridge:latest
```

---

## .env Configuration

### File: .env.example

**Path:** `carebridge/.env.example`

```dotenv
# ==================================================
# SERVER SIDE VARIABLES
# (Never exposed to browser)
# ==================================================

# PostgreSQL Database
# Format: postgresql://[user][:password]@[host][:port]/[database]
DATABASE_URL=postgresql://username:password@localhost:5432/carebridge?sslmode=require
# Used by: Prisma ORM
# Files: src/lib/prisma.ts
# Where to get:
#   - Local: Create with psql
#   - Azure: Azure Database for PostgreSQL
#   - AWS: Amazon RDS
# Required for: All database operations

# JWT Authentication Secret
JWT_SECRET=your-super-secret-jwt-key-here-min-32-characters
# Used for: Signing/verifying JWT tokens
# Files: src/lib/jwt.ts
# Length: At least 32 characters (strong random string)
# Generate: openssl rand -base64 32
# Required for: User authentication

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
# Used for: File uploads (medical reports)
# Files: src/lib/file-upload.ts, src/api/test-upload/route.ts
# Service: Vercel Blob (or Azure Blob Storage)
# Where to get: Vercel dashboard → Settings → Blob
# Optional: Can use Azure Blob if preferred

# Redis Cache (Optional)
REDIS_URL=redis://username:password@localhost:6379
# Used for: Session storage, caching
# Files: src/lib/redis.ts
# Service: Redis Cloud or Azure Cache for Redis
# Optional: App works without Redis (uses fallback)
# Benefit: Faster performance, session persistence


# ==================================================
# CLIENT SIDE VARIABLES
# (Must start with NEXT_PUBLIC_)
# (Exposed to browser - don't put secrets here!)
# ==================================================

# Base API URL for frontend requests
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
# Used for: API calls from browser
# Example: fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
# Local dev: http://localhost:3000
# Production: https://carebridge.vercel.app or https://carebridge.azurewebsites.net


# ==================================================
# BUILD CONFIGURATION
# ==================================================

# Prisma
PRISMA_SKIP_VALIDATION_WARNING=true  # Suppress validation warnings

# Next.js
NEXT_TELEMETRY_DISABLED=1            # Disable Next.js telemetry (optional)
```

### How to Use

#### 1. Local Development
```bash
# Create .env.local (git-ignored)
cp .env.example .env.local

# Edit .env.local with local values
DATABASE_URL=postgresql://user:pass@localhost:5432/carebridge
JWT_SECRET=dev-secret-key-minimum-32-chars-long
BLOB_READ_WRITE_TOKEN=dev-token
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 2. GitHub Actions (CI/CD)
```yaml
# In workflow file:
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  BLOB_READ_WRITE_TOKEN: ${{ secrets.BLOB_READ_WRITE_TOKEN }}

# In GitHub Settings → Secrets and variables → Actions:
# Add each secret value
```

#### 3. Production (Vercel)
```
Vercel Dashboard → Settings → Environment Variables
- Name: DATABASE_URL
  Value: postgresql://...
- Name: JWT_SECRET
  Value: prod-secret-key-...
- Name: BLOB_READ_WRITE_TOKEN
  Value: token-...
```

#### 4. Production (Azure)
```
Azure Portal → App Service → Configuration → Application settings
- DATABASE_URL = postgresql://...
- JWT_SECRET = prod-secret-...
- BLOB_READ_WRITE_TOKEN = token-...
```

---

## Summary Table

| File | Purpose | Used By | When Modified |
|------|---------|---------|---------------|
| `package.json` | Dependencies & scripts | npm, CI/CD | When adding packages or scripts |
| `tsconfig.json` | TypeScript settings | tsc, build | Changing type checking strictness |
| `next.config.ts` | Next.js configuration | Build, dev server | Custom build options, plugins |
| `.eslintrc.json` | ESLint rules | CI/CD lint step | Changing code quality standards |
| `eslint.config.js` | ESLint flat config | ESLint | Ignoring patterns, base rules |
| `tailwind.config.js` | Tailwind CSS | CSS processing | Adding custom colors, themes |
| `postcss.config.mjs` | PostCSS plugins | CSS processing | CSS transformations |
| `Dockerfile` | Container build | Docker, deployment | Container setup changes |
| `.env.example` | Environment template | Documentation | Adding new env variables |
| `.env.local` | Local env (git-ignored) | Dev server | Daily development |

---

## Next Steps

1. **Create Dockerfile** in `docker/` directory using the multi-stage example above
2. **Configure GitHub Secrets** with production database URL and tokens
3. **Test CI/CD Locally** with: `npm install && npm run lint && npm run build`
4. **Push to GitHub** and monitor Actions tab for successful run
5. **Set up deployment** to Vercel or Azure once CI passes

