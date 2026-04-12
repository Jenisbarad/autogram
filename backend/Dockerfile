# Use Node.js LTS
FROM node:20-alpine

# Install FFmpeg and system dependencies
RUN apk add --no-cache ffmpeg postgresql-client python3 make g++ pkgconfig pixman-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create media directories
RUN mkdir -p media/raw media/processed media/thumbnails

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/index.js"]
