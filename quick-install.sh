#!/bin/bash

# Claude Code Quick Install Script
# Usage: curl -sSL https://raw.githubusercontent.com/[username]/claude-code-config/main/quick-install.sh | bash

set -e

echo "🚀 Claude Code 자동 설정 시작..."
echo "📍 GitHub에서 최신 설정을 다운로드합니다..."

# 임시 디렉토리 생성
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# GitHub에서 설정 파일들 직접 다운로드
REPO_URL="https://raw.githubusercontent.com/[username]/claude-code-config/main"

echo "📥 설정 파일 다운로드 중..."

# 필수 파일들 다운로드
files=(
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

# Claude 설정 디렉토리 준비
CLAUDE_DIR="$HOME/.claude"
mkdir -p "$CLAUDE_DIR"

# 기존 설정 백업
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    echo "💾 기존 설정 백업 중..."
    backup_dir="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    cp "$CLAUDE_DIR"/*.md "$backup_dir/" 2>/dev/null || true
    echo "✅ 백업 완료: $backup_dir"
fi

# 설정 파일들 다운로드 및 설치
for file in "${files[@]}"; do
    echo "📥 다운로드: $file"
    if curl -sSL "$REPO_URL/$file" -o "$file"; then
        cp "$file" "$CLAUDE_DIR/"
        echo "  ✅ $file 설치 완료"
    else
        echo "  ⚠️  $file 다운로드 실패"
    fi
done

# 권한 설정
chmod 644 "$CLAUDE_DIR"/*.md 2>/dev/null || true

# 정리
cd ~
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 Claude Code 자동 설정 완료!"
echo ""
echo "📋 설치된 파일들:"
ls -la "$CLAUDE_DIR"/*.md 2>/dev/null || echo "설정 파일을 찾을 수 없습니다"
echo ""
echo "✨ 이제 Claude Code를 실행하세요!"

# Claude 설치 확인
if command -v claude &> /dev/null; then
    echo "✅ Claude Code CLI 감지됨"
else
    echo "⚠️  Claude Code CLI를 설치해주세요: https://claude.ai/code"
fi