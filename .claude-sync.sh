#!/bin/bash
# Claude Code 시작 전 자동으로 전역 설정 동기화

echo "🔄 전역 설정 업데이트 중..."

cd "$(dirname "$0")"

# Submodule 최신 버전 다운로드
git submodule update --remote --merge .claude-global

if [ $? -eq 0 ]; then
    echo "✅ 전역 설정 업데이트 완료!"
    echo "📚 CLAUDE.md: $(cat .claude-global/global/CLAUDE.md | head -1)"
else
    echo "⚠️  업데이트 실패 - 기존 버전 사용"
fi
