#!/bin/bash

# Migration script from v1.x to v2.0
# Automatically migrates old configuration structure to new v2.0 format

set -euo pipefail

echo "🔄 Migrating Claude Code configuration from v1.x to v2.0..."

CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$CLAUDE_DIR/migration-backup-$(date +%Y%m%d%H%M%S)"

# Create backup
echo "💾 Creating migration backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$CLAUDE_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true

# Migration steps
echo "🔧 Performing migration..."

# 1. Update directory structure
if [ ! -d "$CLAUDE_DIR/settings" ]; then
    mkdir -p "$CLAUDE_DIR/settings"
fi

if [ ! -d "$CLAUDE_DIR/migrations" ]; then
    mkdir -p "$CLAUDE_DIR/migrations"
fi

# 2. Move old files to new structure
if [ -f "$CLAUDE_DIR/tools.md" ]; then
    mv "$CLAUDE_DIR/tools.md" "$CLAUDE_DIR/settings/"
    echo "  ✅ Moved tools.md to settings/"
fi

if [ -f "$CLAUDE_DIR/behaviors.md" ]; then
    mv "$CLAUDE_DIR/behaviors.md" "$CLAUDE_DIR/settings/"
    echo "  ✅ Moved behaviors.md to settings/"
fi

# 3. Update CLAUDE.md format
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    # Check if it's old format and needs updating
    if ! grep -q "INITIALIZATION PROTOCOL" "$CLAUDE_DIR/CLAUDE.md"; then
        echo "  🔄 Updating CLAUDE.md to new format..."
        # Backup old CLAUDE.md
        cp "$CLAUDE_DIR/CLAUDE.md" "$BACKUP_DIR/CLAUDE.md.old"
        # Download new format from repository
        curl -sSL "https://raw.githubusercontent.com/[username]/claude-code-config/main/.claude/claude.md" -o "$CLAUDE_DIR/claude.md"
        echo "  ✅ CLAUDE.md updated to v2.0 format"
    fi
fi

# 4. Create version file if it doesn't exist
if [ ! -f "$CLAUDE_DIR/version.json" ]; then
    cat > "$CLAUDE_DIR/version.json" << 'EOF'
{
  "version": "2.0.0",
  "schema": "2024-12",
  "migrated_from": "1.x",
  "migration_date": "$(date -Iseconds)"
}
EOF
    echo "  ✅ Created version.json"
fi

# 5. Set up shell integration if not present
setup_shell_integration() {
    local shell_rc=""
    
    if [ -n "${BASH_VERSION:-}" ]; then
        shell_rc="$HOME/.bashrc"
    elif [ -n "${ZSH_VERSION:-}" ]; then
        shell_rc="$HOME/.zshrc"
    fi
    
    if [ -n "$shell_rc" ] && [ -f "$shell_rc" ]; then
        if ! grep -q "claude-code-wrapper" "$shell_rc"; then
            echo "  🔧 Setting up shell integration..."
            cat >> "$shell_rc" << 'EOF'

# Claude Code Wrapper v2.0 (auto-sync)
claude() {
    local CFG="$HOME/.claude"
    local LOCK="$CFG/.sync.lock"
    
    # Quick sync check (background)
    if [ -d "$HOME/.claude-config/.git" ]; then
        (
            flock -n 9 || return 0
            git -C "$HOME/.claude-config" pull --ff-only --quiet 2>/dev/null || true
            rsync -a --quiet "$HOME/.claude-config/.claude/" "$CFG/" 2>/dev/null || true
        ) 9>"$LOCK" &
    fi
    
    command claude "$@"
}
EOF
            echo "  ✅ Shell integration added"
        fi
    fi
}

setup_shell_integration

# 6. Clean up old files
echo "🧹 Cleaning up deprecated files..."
deprecated_files=(
    "$CLAUDE_DIR/old-config.md"
    "$CLAUDE_DIR/legacy-settings.json"
)

for file in "${deprecated_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  🗑️ Removed deprecated file: $(basename "$file")"
    fi
done

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📋 Summary:"
echo "  • Backup created: $BACKUP_DIR"
echo "  • Configuration structure updated to v2.0"
echo "  • Shell integration configured"
echo "  • Version tracking enabled"
echo ""
echo "🔄 Next steps:"
echo "  1. Restart your terminal: source ~/.bashrc (or ~/.zshrc)"
echo "  2. Test configuration: claude --version"
echo "  3. Remove backup if everything works: rm -rf $BACKUP_DIR"
echo ""
echo "🎉 Welcome to Claude Code v2.0!"