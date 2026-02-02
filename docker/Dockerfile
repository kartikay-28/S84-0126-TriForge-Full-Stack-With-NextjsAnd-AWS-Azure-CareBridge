# ---------- Builder Stage ----------
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy full project first (so prisma/schema.prisma exists)
COPY carebridge/ .

# Then install deps
RUN npm install

# Generate prisma client
RUN npx prisma generate

# Build Next app
RUN npm run build


# ---------- Production Stage ----------
FROM node:20-bullseye-slim AS production

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./.prisma

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
