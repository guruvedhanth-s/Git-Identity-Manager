#!/bin/bash

# Git Identity Manager - Setup Script
# This script installs and configures the Git Identity Manager CLI tool

set -e

echo "=================================="
echo "Git Identity Manager - Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Navigate to CLI directory
echo "📦 Installing dependencies..."
cd git-id-cli
npm install

echo ""
echo "🔨 Building CLI tool..."
npm run build

echo ""
echo "🔗 Linking globally..."
npm link

echo ""
echo "=================================="
echo "✅ Installation Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Add shell function to ~/.bashrc or ~/.zshrc:"
echo ""
echo "   git() {"
echo "       if [[ \" \$* \" == *\" --profile \"* ]]; then"
echo "           gitp \"\$@\""
echo "       else"
echo "           command git \"\$@\""
echo "       fi"
echo "   }"
echo ""
echo "2. Reload your shell:"
echo "   source ~/.bashrc"
echo ""
echo "3. Create your first profile:"
echo "   git-id add --github"
echo ""
echo "4. Start using Git with profiles:"
echo "   git clone <repo-url> --profile <profile-name>"
echo ""
echo "For documentation, see: DOCUMENTATION.md"
echo ""
