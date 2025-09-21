#!/usr/bin/env bash
# healthcheck.sh - Claude Code 시스템 진단 도구

set -euo pipefail

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 체크 결과 저장
ERRORS=0
WARNINGS=0

check() {
    local name="$1"
    local command="$2"
    
    echo -n "Checking $name... "
    
    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        ((ERRORS++))
        return 1
    fi
}

warn_check() {
    local name="$1"
    local command="$2"
    
    echo -n "Checking $name... "
    
    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${YELLOW}WARNING${NC}"
        ((WARNINGS++))
        return 1
    fi
}

info_check() {
    local name="$1"
    local command="$2"
    
    echo -n "Checking $name... "
    
    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${BLUE}INFO${NC}"
        return 1
    fi
}

# 메인 체크
echo "🔍 Claude Code Health Check v2.0"
echo "==============================="

# 필수 체크 (오류시 문제)
echo -e "\n${GREEN}📋 Essential Components${NC}"
check "Configuration directory" "[ -d ~/.claude ]"
check "Main configuration file" "[ -f ~/.claude/claude.md ]"
check "Version file" "[ -f ~/.claude/version.json ]"
check "State directory" "[ -d ~/.claude/state ]"
check "Secrets directory" "[ -d ~/.claude/secrets ]"
check "Git installation" "command -v git"

# 중요 체크 (경고 수준)
echo -e "\n${YELLOW}⚠️  Important Components${NC}"
warn_check "GitHub CLI" "command -v gh"
warn_check "GitHub authentication" "gh auth status"
warn_check "Config repository" "[ -d ~/.claude-config/.git ]"
warn_check "Shell integration" "grep -q 'claude()' ~/.bashrc ~/.zshrc 2>/dev/null"

# 선택적 체크 (정보 수준)
echo -e "\n${BLUE}ℹ️  Optional Components${NC}"
info_check "Docker" "command -v docker"
info_check "Node.js" "command -v node"
info_check "Python" "command -v python3"
info_check "Rust" "command -v rustc"
info_check "Go" "command -v go"
info_check "jq (JSON processor)" "command -v jq"
info_check "rsync" "command -v rsync"

# 설정 정보 표시
echo -e "\n${BLUE}📊 Configuration Info${NC}"
if [ -f ~/.claude/version.json ]; then
    VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' ~/.claude/version.json | sed 's/.*"\([^"]*\)"$/\1/')
    SCHEMA=$(grep -o '"schema"[[:space:]]*:[[:space:]]*"[^"]*"' ~/.claude/version.json | sed 's/.*"\([^"]*\)"$/\1/')
    echo "Configuration version: ${GREEN}$VERSION${NC} (schema: $SCHEMA)"
else
    echo "Configuration version: ${RED}Unknown${NC}"
fi

if [ -d ~/.claude-config/.git ]; then
    cd ~/.claude-config
    LAST_UPDATE=$(git log -1 --format="%ci" 2>/dev/null || echo "Unknown")
    COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "Unknown")
    echo "Last update: ${GREEN}$LAST_UPDATE${NC}"
    echo "Total commits: ${GREEN}$COMMIT_COUNT${NC}"
fi

# Stale 감지 및 동기화 상태
if [ -f ~/.claude/state/last_sync ]; then
    LAST_SYNC=$(cat ~/.claude/state/last_sync)
    echo "Last sync: ${GREEN}$LAST_SYNC${NC}"
    
    HOURS_SINCE=$(( ($(date +%s) - $(date -d "$LAST_SYNC" +%s 2>/dev/null || echo 0)) / 3600 ))
    if [ $HOURS_SINCE -gt 24 ]; then
        echo "Sync status: ${YELLOW}STALE (${HOURS_SINCE}h old)${NC}"
        ((WARNINGS++))
    else
        echo "Sync status: ${GREEN}FRESH${NC}"
    fi
else
    echo "Sync status: ${RED}UNKNOWN${NC}"
    ((WARNINGS++))
fi

if [ -f ~/.claude/state/sync_failed ]; then
    echo "Last sync result: ${RED}FAILED${NC}"
    ((WARNINGS++))
else
    echo "Last sync result: ${GREEN}SUCCESS${NC}"
fi

# Claude CLI 버전 체크
if command -v claude &> /dev/null; then
    CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "Unknown")
    echo "Claude CLI version: ${GREEN}$CLAUDE_VERSION${NC}"
fi

# 프로젝트 타입 감지
echo -e "\n${BLUE}🏗️  Project Detection${NC}"
PROJECT_TYPE="Generic"
if [ -f package.json ]; then
    PROJECT_TYPE="JavaScript/Node.js"
    echo "Project type: ${GREEN}$PROJECT_TYPE${NC}"
    NODE_VERSION=$(node --version 2>/dev/null || echo "Not installed")
    echo "Node.js version: $NODE_VERSION"
elif [ -f requirements.txt ] || [ -f pyproject.toml ] || [ -f Pipfile ]; then
    PROJECT_TYPE="Python"
    echo "Project type: ${GREEN}$PROJECT_TYPE${NC}"
    PYTHON_VERSION=$(python3 --version 2>/dev/null || echo "Not installed")
    echo "Python version: $PYTHON_VERSION"
elif [ -f Cargo.toml ]; then
    PROJECT_TYPE="Rust"
    echo "Project type: ${GREEN}$PROJECT_TYPE${NC}"
    RUST_VERSION=$(rustc --version 2>/dev/null || echo "Not installed")
    echo "Rust version: $RUST_VERSION"
elif [ -f go.mod ]; then
    PROJECT_TYPE="Go"
    echo "Project type: ${GREEN}$PROJECT_TYPE${NC}"
    GO_VERSION=$(go version 2>/dev/null || echo "Not installed")
    echo "Go version: $GO_VERSION"
else
    echo "Project type: ${YELLOW}$PROJECT_TYPE${NC}"
fi

# 권한 및 파일 상태 체크
echo -e "\n${BLUE}🔒 Permissions & File Status${NC}"
if [ -d ~/.claude ]; then
    CLAUDE_PERMS=$(stat -c "%a" ~/.claude 2>/dev/null || stat -f "%A" ~/.claude 2>/dev/null)
    echo "~/.claude permissions: $CLAUDE_PERMS"
    
    if [ -f ~/.claude/claude.md ]; then
        CONFIG_SIZE=$(du -h ~/.claude/claude.md | cut -f1)
        CONFIG_LINES=$(wc -l < ~/.claude/claude.md)
        echo "Configuration size: $CONFIG_SIZE ($CONFIG_LINES lines)"
    fi
fi

# 네트워크 연결 테스트
echo -e "\n${BLUE}🌐 Network Connectivity${NC}"
echo -n "GitHub API access... "
if curl -sSf https://api.github.com/zen > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}LIMITED${NC}"
    ((WARNINGS++))
fi

# 결과 요약
echo ""
echo "=============================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! System is healthy.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found - system functional but could be improved${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s), $WARNINGS warning(s) found - intervention required${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Reinstall: curl -sSL https://raw.githubusercontent.com/[username]/claude-code-config/main/quick-install.sh | bash"
    echo "2. Re-authenticate GitHub: gh auth login"
    echo "3. Restart terminal and try again"
    exit 1
fi