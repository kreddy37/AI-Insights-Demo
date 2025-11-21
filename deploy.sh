#!/bin/bash

# AI Insights Chat Deployment Script for DietPi/Debian
# This script pulls the latest code from GitHub and restarts the application

set -e

# Configuration
REPO_URL="https://github.com/YOUR_USERNAME/ai-insights-chat.git"
DEPLOY_DIR="/home/ai-insights-chat"
APP_NAME="ai-insights-chat"

echo "=========================================="
echo "AI Insights Chat - Deployment Script"
echo "=========================================="

# Navigate to deployment directory
cd "$DEPLOY_DIR"

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Install/update dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Restart PM2 app
echo "Restarting application..."
pm2 restart "$APP_NAME" || pm2 start ecosystem.config.js

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
