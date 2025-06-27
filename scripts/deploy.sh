#!/bin/bash

# Modern Tetris Deployment Script
echo "🚀 Starting Modern Tetris deployment..."

# Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output is in the 'out' directory"
    echo ""
    echo "🌐 To deploy to GitHub Pages:"
    echo "1. Commit and push your changes to the main branch"
    echo "2. GitHub Actions will automatically deploy to GitHub Pages"
    echo "3. Your site will be available at: https://mytakoyaki.github.io/modern-tetris/"
else
    echo "❌ Build failed!"
    exit 1
fi 