# Dockerfile for server
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server/ .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]