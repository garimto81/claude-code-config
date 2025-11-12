#!/bin/bash
# PRD-0001 승인 체크리스트 자동 검증 스크립트
# 용도: CLAUDE.md 최적화 PRD 승인 체크리스트 달성 여부 확인

set -e

CLAUDE_MD="CLAUDE.md"
TARGET_LINES=150
CURRENT_VERSION="v4.2.0"
TARGET_VERSION="v4.5.0"

echo "========================================="
echo "PRD-0001 승인 체크리스트 검증"
echo "========================================="
echo ""

# 체크리스트 초기화
check_1="❌"
check_2="❌"
check_3="❌"
check_4="❌"
check_5="❌"

# [1] 150줄 이하 목표 합리적?
echo "✅ [체크 1/5] 줄 수 목표 검증"
CURRENT_LINES=$(wc -l < "$CLAUDE_MD")
echo "   현재: ${CURRENT_LINES}줄 / 목표: ${TARGET_LINES}줄 이하"

if [ "$CURRENT_LINES" -le "$TARGET_LINES" ]; then
    check_1="✅"
    echo "   결과: ✅ 목표 달성 (${CURRENT_LINES}줄)"
else
    REDUCTION_NEEDED=$((CURRENT_LINES - TARGET_LINES))
    REDUCTION_PCT=$(awk "BEGIN {printf \"%.1f\", ($REDUCTION_NEEDED / $CURRENT_LINES) * 100}")
    echo "   결과: ❌ ${REDUCTION_NEEDED}줄 축소 필요 (-${REDUCTION_PCT}%)"
fi
echo ""

# [2] Phase 마스터 표 통합 방식 적절?
echo "📋 [체크 2/5] Phase 마스터 표 구조 검증"
PHASE_TABLES=$(grep -c "^| Phase |" "$CLAUDE_MD" || true)
PHASE_SECTIONS=$(grep "^## .*Phase" "$CLAUDE_MD" | wc -l)

echo "   Phase 관련 표: ${PHASE_TABLES}개"
echo "   Phase 관련 섹션: ${PHASE_SECTIONS}개"

if [ "$PHASE_TABLES" -eq 1 ] && [ "$PHASE_SECTIONS" -le 4 ]; then
    check_2="✅"
    echo "   결과: ✅ 통합 표 구조 적절"
else
    echo "   결과: ❌ 표가 분산되어 있음 (통합 필요)"
fi
echo ""

# [3] Agent 섹션 3→1 축소 동의?
echo "🤖 [체크 3/5] Agent 섹션 구조 검증"
AGENT_SUBSECTIONS=$(grep "^### .*Agent\|^### .*Context7\|^### .*Playwright\|^### .*병렬" "$CLAUDE_MD" | wc -l)

echo "   Agent 하위 섹션: ${AGENT_SUBSECTIONS}개"

if [ "$AGENT_SUBSECTIONS" -le 1 ]; then
    check_3="✅"
    echo "   결과: ✅ 섹션 통합 완료"
else
    echo "   결과: ❌ 현재 ${AGENT_SUBSECTIONS}개 섹션 (통합 필요)"
fi
echo ""

# [4] GitHub 워크플로우 외부 참조 괜찮?
echo "🚀 [체크 4/5] GitHub 워크플로우 간소화 검증"
GITHUB_SECTION_LINES=$(awk '/^## 🚀 GitHub 워크플로우/,/^---/' "$CLAUDE_MD" | wc -l)

echo "   GitHub 섹션 줄 수: ${GITHUB_SECTION_LINES}줄"

if [ "$GITHUB_SECTION_LINES" -le 15 ]; then
    check_4="✅"
    echo "   결과: ✅ 간소화 완료 (외부 참조 활용)"
else
    REDUCTION_NEEDED=$((GITHUB_SECTION_LINES - 15))
    echo "   결과: ❌ ${REDUCTION_NEEDED}줄 축소 가능 (외부 참조 권장)"
fi
echo ""

# [5] v4.5.0 버전 번호 적절?
echo "📌 [체크 5/5] 버전 번호 검증"
if grep -q "v4.5.0" "$CLAUDE_MD"; then
    check_5="✅"
    echo "   결과: ✅ v4.5.0 반영됨"
else
    echo "   현재 버전: ${CURRENT_VERSION}"
    echo "   결과: ⏸️  v4.5.0 미반영 (구현 후 업데이트 예정)"
    check_5="⏸️ "
fi
echo ""

# 최종 요약
echo "========================================="
echo "📊 최종 결과"
echo "========================================="
echo "${check_1} [1] 150줄 이하 목표 (현재 ${CURRENT_LINES}줄)"
echo "${check_2} [2] Phase 마스터 표 통합 (현재 표 ${PHASE_TABLES}개)"
echo "${check_3} [3] Agent 섹션 통합 (현재 ${AGENT_SUBSECTIONS}개)"
echo "${check_4} [4] GitHub 워크플로우 간소화 (현재 ${GITHUB_SECTION_LINES}줄)"
echo "${check_5} [5] v4.5.0 버전 번호"
echo ""

# 승인 가능 여부 판단
TOTAL_CHECKS=5
PASSED_CHECKS=$(echo "${check_1}${check_2}${check_3}${check_4}${check_5}" | grep -o "✅" | wc -l)

echo "통과: ${PASSED_CHECKS}/${TOTAL_CHECKS}"
echo ""

if [ "$PASSED_CHECKS" -ge 4 ]; then
    echo "✅ 승인 권장 (80% 이상 달성)"
    exit 0
elif [ "$PASSED_CHECKS" -ge 3 ]; then
    echo "⚠️  조건부 승인 (60% 이상 달성)"
    exit 0
else
    echo "❌ 승인 보류 (개선 필요)"
    exit 1
fi
