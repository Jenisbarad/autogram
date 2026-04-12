#!/bin/bash

# Install yt-dlp if not already installed
if ! command -v yt-dlp &> /dev/null; then
    echo "📦 Installing yt-dlp..."
    pip3 install yt-dlp --break-system-packages 2>/dev/null || pip3 install yt-dlp
    echo "✅ yt-dlp installed"
else
    echo "✅ yt-dlp already installed"
fi

# Start the application
cd backend && npm start
