#!/bin/bash

# Claude Code Configuration Setup Script
# This script sets up Claude Code environment configuration across devices

set -e  # Exit on any error

echo "🚀 Starting Claude Code configuration setup..."

# Define paths
CLAUDE_DIR="$HOME/.claude"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create Claude directory if it doesn't exist
if [ ! -d "$CLAUDE_DIR" ]; then
    echo "📁 Creating Claude configuration directory..."
    mkdir -p "$CLAUDE_DIR"
else
    echo "📁 Claude configuration directory already exists"
fi

# Backup existing configuration files
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    echo "💾 Backing up existing configuration..."
    backup_dir="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    cp "$CLAUDE_DIR"/*.md "$backup_dir/" 2>/dev/null || true
    echo "✅ Backup created at: $backup_dir"
fi

# Copy configuration files
echo "📋 Copying configuration files..."
config_files=(
    "CLAUDE.md"
    "COMMANDS.md"
    "FLAGS.md"
    "PRINCIPLES.md"
    "RULES.md"
    "MCP.md"
    "PERSONAS.md"
    "ORCHESTRATOR.md"
    "MODES.md"
)

for file in "${config_files[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        cp "$SCRIPT_DIR/$file" "$CLAUDE_DIR/"
        echo "  ✅ Copied $file"
    else
        echo "  ⚠️  Warning: $file not found in source directory"
    fi
done

# Set appropriate permissions
chmod 644 "$CLAUDE_DIR"/*.md 2>/dev/null || true

# Verify installation
echo "🔍 Verifying installation..."
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    echo "✅ Core configuration file found"
else
    echo "❌ Core configuration file missing"
    exit 1
fi

# Check Claude Code installation
if command -v claude &> /dev/null; then
    echo "✅ Claude Code CLI detected"
    echo "📊 Current configuration:"
    claude config list 2>/dev/null || echo "  (No previous configuration found)"
else
    echo "⚠️  Claude Code CLI not found. Please install Claude Code first."
    echo "   Visit: https://claude.ai/code for installation instructions"
fi

# Git setup for tracking changes
if [ -d "$SCRIPT_DIR/.git" ]; then
    echo "🔧 Git repository detected. Setting up auto-sync..."
    cd "$SCRIPT_DIR"
    
    # Set up git hooks for auto-commit (optional)
    if [ ! -f ".git/hooks/post-checkout" ]; then
        cat > .git/hooks/post-checkout << 'EOF'
#!/bin/bash
# Auto-sync configuration after git operations
if [ -f "setup-claude.sh" ]; then
    echo "📥 Syncing configuration after git checkout..."
    ./setup-claude.sh --sync-only
fi
EOF
        chmod +x .git/hooks/post-checkout
        echo "  ✅ Git hooks configured"
    fi
fi

# Create local override template
local_override="$CLAUDE_DIR/.claude-local.md"
if [ ! -f "$local_override" ]; then
    cat > "$local_override" << 'EOF'
# .claude-local.md
# Device-specific Claude Code configuration (not tracked in Git)

## Local Settings
# Add device-specific settings here
# These settings override global configuration

## Examples:
# - Custom shortcuts
# - Device-specific paths
# - Local development preferences
# - Environment-specific configurations
EOF
    echo "📝 Created local override template at: $local_override"
fi

echo ""
echo "🎉 Claude Code configuration setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your terminal or run: source ~/.bashrc"
echo "2. Verify with: claude config list"
echo "3. Customize local settings in: $local_override"
echo ""
echo "🔄 To sync latest changes: cd $(pwd) && git pull && ./setup-claude.sh"
echo ""
echo "✨ Happy coding with Claude Code!"