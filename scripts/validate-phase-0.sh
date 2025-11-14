#!/bin/bash
# Phase 0 검증: PRD 파일 존재 확인
# Based on cc-sdd validation system (MIT License)
# Adapted for claude01 Phase 0-6 workflow

set -e  # 에러 발생 시 중단

PRD_NUM=$1

# 사용법 체크
if [ -z "$PRD_NUM" ]; then
  echo "❌ 사용법: $0 <PRD_NUMBER>"
  echo "   예시: $0 0005"
  exit 1
fi

# PRD 파일 존재 확인
PRD_PATTERN="tasks/prds/${PRD_NUM}-prd-*.md"
PRD_FILE=$(ls $PRD_PATTERN 2>/dev/null | head -1)

if [ -z "$PRD_FILE" ]; then
  echo "❌ Phase 0 검증 실패: PRD 파일 없음"
  echo "   경로: $PRD_PATTERN"
  echo ""
  echo "📝 Phase 0 요구사항:"
  echo "   1. tasks/prds/${PRD_NUM}-prd-feature-name.md 파일 생성 필요"
  echo "   2. PRD 가이드: docs/guides/PRD_GUIDE_MINIMAL.md 참고"
  exit 1
fi

# PRD 내용 검증 (최소 요구사항)
if ! grep -q "## 목적" "$PRD_FILE" && ! grep -q "## Purpose" "$PRD_FILE"; then
  echo "⚠️  경고: PRD에 '목적' 섹션이 없습니다"
fi

if ! grep -q "## 핵심 기능" "$PRD_FILE" && ! grep -q "## Core Features" "$PRD_FILE"; then
  echo "⚠️  경고: PRD에 '핵심 기능' 섹션이 없습니다"
fi

# 성공
echo "✅ Phase 0 검증 통과"
echo "   PRD 파일: $PRD_FILE"

# 파일 통계
LINES=$(wc -l < "$PRD_FILE")
echo "   라인 수: $LINES"

if [ $LINES -lt 50 ]; then
  echo "   ⚠️  PRD가 너무 짧습니다 (최소 50줄 권장)"
fi

exit 0
