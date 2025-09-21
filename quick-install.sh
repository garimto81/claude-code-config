#!/bin/bash
# Claude Code Quick Install Script for Unix/Linux/macOS
# Usage: curl -sSL https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.sh | bash

echo "Starting Claude Code Universal Configuration v2.1.0 setup..."
echo "Downloading latest configuration from GitHub..."

# Configuration variables
CLAUDE_DIR="$HOME/.claude"
CONFIG_REPO_DIR="$HOME/.claude-config"

# Create Claude configuration directory
if [ ! -d "$CLAUDE_DIR" ]; then
    mkdir -p "$CLAUDE_DIR"
    echo "Created Claude configuration directory"
else
    echo "Claude configuration directory already exists"
fi

# Backup existing configuration
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    BACKUP_DIR="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r "$CLAUDE_DIR"/* "$BACKUP_DIR" 2>/dev/null || true
    echo "Existing configuration backed up to: $BACKUP_DIR"
fi

echo "Cloning Claude Code configuration repository..."

# Check Git installation and clone/update repository
if command -v git &> /dev/null; then
    echo "Git detected: $(git --version)"
    
    # Update existing repository or clone new one
    if [ -d "$CONFIG_REPO_DIR/.git" ]; then
        echo "Updating existing configuration repository..."
        git -C "$CONFIG_REPO_DIR" pull --ff-only &> /dev/null
    else
        echo "Cloning configuration repository..."
        git clone "https://github.com/garimto81/claude-code-config.git" "$CONFIG_REPO_DIR" &> /dev/null
    fi
    
    # Copy main CLAUDE.md and .claude folder contents to user Claude directory
    if [ -f "$CONFIG_REPO_DIR/CLAUDE.md" ]; then
        echo "Copying main configuration file..."
        cp "$CONFIG_REPO_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
    fi
    
    if [ -d "$CONFIG_REPO_DIR/.claude" ]; then
        echo "Copying additional configuration files..."
        cp -r "$CONFIG_REPO_DIR/.claude/"* "$CLAUDE_DIR/" 2>/dev/null || true
        echo "All configuration files copied successfully"
    fi
    
else
    echo "Git not found. Please install Git first."
    echo "Download Git: https://git-scm.com/downloads"
    exit 1
fi

echo ""
echo "Claude Code setup completed successfully!"
echo ""

# Check installed components
echo "Installed components:"
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    echo "  - Main configuration file (CLAUDE.md)"
fi
if [ -f "$CLAUDE_DIR/version.json" ]; then
    VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$CLAUDE_DIR/version.json" | sed 's/.*"\([^"]*\)"$/\1/')
    echo "  - Version file (v$VERSION)"
fi
if [ -d "$CLAUDE_DIR/agents" ]; then
    AGENT_COUNT=$(ls "$CLAUDE_DIR/agents/"*.md 2>/dev/null | wc -l)
    echo "  - Sub-Agent system ($AGENT_COUNT agents)"
fi
if [ -d "$CLAUDE_DIR/commands" ]; then
    COMMAND_COUNT=$(ls "$CLAUDE_DIR/commands/"*.md 2>/dev/null | wc -l)
    echo "  - Custom commands ($COMMAND_COUNT commands)"
fi

echo ""
echo "You can now run Claude Code!"

# Check Claude CLI installation
if command -v claude &> /dev/null; then
    CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "Unknown")
    echo "Claude Code CLI detected: $CLAUDE_VERSION"
    echo "Everything is ready to go!"
else
    echo "Please install Claude Code CLI: https://claude.ai/code"
fi

echo ""
echo "To update in the future, run:"
echo "curl -sSL https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.sh | bash"