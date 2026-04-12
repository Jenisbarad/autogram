# Use Node.js LTS
FROM node:20-alpine

# Set working directory to /app
WORKDIR /app

# Install FFmpeg and other system dependencies
RUN apk add --no-cache ffmpeg ffmpeg-dev postgresql-client

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

# Start the application
CMD ["npm", "start"]
