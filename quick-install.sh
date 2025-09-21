#!/usr/bin/env bash

# Claude Code Perfect Setup v2.0
# Usage: curl -sSL https://raw.githubusercontent.com/[username]/claude-code-config/main/quick-install.sh | bash

set -euo pipefail

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
REPO="https://github.com/[username]/claude-code-config.git"
CONFIG_DIR="$HOME/.claude"
CONFIG_REPO_DIR="$HOME/.claude-config"
BACKUP_DIR="$HOME/.claude.backup.$(date +%Y%m%d%H%M%S)"
TEMP_DIR="$(mktemp -d)"
LOCK_FILE="$CONFIG_DIR/.install.lock"

# 트랩 설정 (정리)
trap 'rm -rf "$TEMP_DIR" "$LOCK_FILE"' EXIT

# 함수들
log() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }

check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 is required but not installed"
    fi
}

acquire_lock() {
    local count=0
    while [ -f "$LOCK_FILE" ] && [ $count -lt 30 ]; do
        warn "Another installation in progress, waiting..."
        sleep 2
        ((count++))
    done
    
    if [ $count -eq 30 ]; then
        error "Installation lock timeout"
    fi
    
    touch "$LOCK_FILE"
}

# 메인 로직
main() {
    echo "🚀 Claude Code Perfect Setup v2.0"
    echo "=================================="
    
    # 잠금 획득
    acquire_lock
    
    # 의존성 확인
    log "Checking dependencies..."
    check_command git
    
    # rsync 확인 (선택적)
    if command -v rsync &> /dev/null; then
        SYNC_CMD="rsync -a"
    else
        SYNC_CMD="cp -r"
        warn "rsync not found, using cp instead"
    fi
    
    # GitHub CLI 확인 (선택적)
    if command -v gh &> /dev/null; then
        log "GitHub CLI found"
        if ! gh auth status &> /dev/null; then
            warn "GitHub CLI not authenticated. Run: gh auth login"
        fi
    else
        warn "GitHub CLI not found. Manual GitHub integration required"
    fi
    
    # 저장소 클론
    log "Cloning configuration repository..."
    git clone --depth=1 "$REPO" "$TEMP_DIR" || error "Failed to clone repository"
    
    # 백업
    if [ -d "$CONFIG_DIR" ]; then
        log "Backing up existing configuration to $BACKUP_DIR"
        mv "$CONFIG_DIR" "$BACKUP_DIR"
    fi
    
    # 설치
    log "Installing configuration..."
    mkdir -p "$CONFIG_DIR"
    $SYNC_CMD "$TEMP_DIR/.claude/" "$CONFIG_DIR/"
    
    # 설정 저장소 복사 (향후 자동 업데이트용)
    if [ -d "$CONFIG_REPO_DIR" ]; then
        log "Updating existing config repository"
        cd "$CONFIG_REPO_DIR" && git pull --ff-only
    else
        log "Setting up config repository for auto-updates"
        git clone "$REPO" "$CONFIG_REPO_DIR"
    fi
    
    # 권한 설정
    chmod 700 "$CONFIG_DIR"
    chmod 600 "$CONFIG_DIR/claude.md"
    
    # Shell 통합 설정
    setup_shell_integration() {
        local shell_rc=""
        
        if [ -n "${BASH_VERSION:-}" ]; then
            shell_rc="$HOME/.bashrc"
        elif [ -n "${ZSH_VERSION:-}" ]; then
            shell_rc="$HOME/.zshrc"
        fi
        
        if [ -n "$shell_rc" ] && [ -f "$shell_rc" ]; then
            if ! grep -q "claude-code-wrapper" "$shell_rc"; then
                log "Adding shell integration to $shell_rc"
                cat >> "$shell_rc" << 'EOF'

# Claude Code Wrapper v2.0 (auto-sync with enhanced offline handling)
claude() {
    local CFG="$HOME/.claude"
    local LOCK="$CFG/.sync.lock"
    local STATE_DIR="$CFG/state"
    
    mkdir -p "$CFG" "$STATE_DIR"
    
    # Check if initial setup is needed
    if [ ! -f "$CFG/claude.md" ]; then
        echo "⚙️ 최초 설정이 필요합니다. install.sh를 먼저 실행하세요."
        return 1
    fi
    
    # Background sync with enhanced error handling
    if [ -d "$HOME/.claude-config/.git" ]; then
        (
            flock -n 9 || { echo "⏳ 다른 동기화 진행 중"; return 0; }
            
            # Try to pull updates
            if git -C "$HOME/.claude-config" pull --ff-only --quiet 2>/dev/null; then
                rsync -a --quiet "$HOME/.claude-config/.claude/" "$CFG/" 2>/dev/null || true
                git -C "$HOME/.claude-config" rev-parse HEAD > "$STATE_DIR/HEAD" 2>/dev/null
                date +%FT%T > "$STATE_DIR/last_sync"
            else
                echo "⚠️ 동기화 실패 (오프라인 모드로 진행)"
                # Mark as stale if sync fails
                touch "$STATE_DIR/sync_failed"
            fi
        ) 9>"$LOCK" &
    fi
    
    command claude "$@"
}
EOF
                log "Shell integration added. Run: source $shell_rc"
            fi
        fi
    }
    
    setup_shell_integration
    
    # 헬스체크
    log "Running health check..."
    if [ -f "$TEMP_DIR/scripts/healthcheck.sh" ]; then
        bash "$TEMP_DIR/scripts/healthcheck.sh" || warn "Health check reported issues"
    fi
    
    # 완료 메시지
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║     Installation Complete! 🎉          ║"
    echo "╠════════════════════════════════════════╣"
    echo "║ Config: $CONFIG_DIR"
    echo "║ Backup: ${BACKUP_DIR:-None}"
    echo "║ Version: 2.0.0"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "1. Run: source ~/.bashrc (or ~/.zshrc)"
    echo "2. Authenticate GitHub: gh auth login"
    echo "3. Start using: claude [your command]"
    echo ""
    log "Setup complete! Welcome to Claude Code v2.0!"
}

# 실행
main "$@"