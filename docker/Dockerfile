FROM node:20-bullseye

WORKDIR /app

# Copy dependency files first
COPY carebridge/package*.json ./

# Install dependencies without running postinstall
RUN npm install --ignore-scripts

# Copy full app
COPY carebridge/ .

# Generate Prisma client (now OpenSSL is available)
RUN npx prisma generate

# Build Next.js app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
