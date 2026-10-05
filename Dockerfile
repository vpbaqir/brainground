# Production Dockerfile for Brain Playground Backend Server
FROM node:20-alpine

WORKDIR /app

# Copy package and server
COPY package.json ./
RUN npm install --omit=dev || true

COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/config || exit 1

CMD ["node", "server.js"]
