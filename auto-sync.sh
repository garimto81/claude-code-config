#!/bin/bash

# Claude Code Auto-Sync Hook
# Claude Code 시작 시 자동으로 최신 설정을 동기화하는 스크립트

CONFIG_REPO_URL="https://raw.githubusercontent.com/[username]/claude-code-config/main"
CLAUDE_DIR="$HOME/.claude"
LAST_SYNC_FILE="$CLAUDE_DIR/.last-sync"

# 마지막 동기화 시간 확인 (24시간마다 동기화)
should_sync() {
    if [ ! -f "$LAST_SYNC_FILE" ]; then
        return 0  # 파일이 없으면 동기화 필요
    fi
    
    last_sync=$(cat "$LAST_SYNC_FILE" 2>/dev/null || echo "0")
    current_time=$(date +%s)
    time_diff=$((current_time - last_sync))
    
    # 24시간 = 86400초
    if [ $time_diff -gt 86400 ]; then
        return 0  # 24시간 지났으면 동기화 필요
    else
        return 1  # 아직 동기화 불필요
    fi
}

# 빠른 동기화 실행
quick_sync() {
    echo "🔄 Claude Code 설정 자동 동기화 중..."
    
    # 필수 파일만 빠르게 확인
    core_files=("CLAUDE.md" "COMMANDS.md" "FLAGS.md")
    
    for file in "${core_files[@]}"; do
        if curl -sSL --max-time 5 "$CONFIG_REPO_URL/$file" -o "/tmp/claude_$file" 2>/dev/null; then
            if ! cmp -s "/tmp/claude_$file" "$CLAUDE_DIR/$file" 2>/dev/null; then
                cp "/tmp/claude_$file" "$CLAUDE_DIR/$file"
                echo "  ✅ $file 업데이트됨"
            fi
            rm -f "/tmp/claude_$file"
        fi
    done
    
    # 동기화 시간 기록
    echo "$(date +%s)" > "$LAST_SYNC_FILE"
    echo "✅ 설정 동기화 완료"
}

# 메인 로직
if should_sync; then
    # 네트워크 연결 확인 (빠른 테스트)
    if curl -sSL --max-time 3 "$CONFIG_REPO_URL/CLAUDE.md" >/dev/null 2>&1; then
        quick_sync
    else
        echo "⚠️ 네트워크 연결 없음 - 로컬 설정 사용"
    fi
fi