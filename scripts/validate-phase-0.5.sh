#!/bin/bash
# Phase 0.5 검증: Task List 생성 확인
# Based on cc-sdd validation system (MIT License)
# Adapted for claude01 Phase 0-6 workflow

set -e

PRD_NUM=$1

# 사용법 체크
if [ -z "$PRD_NUM" ]; then
  echo "❌ 사용법: $0 <PRD_NUMBER>"
  echo "   예시: $0 0005"
  exit 1
fi

# Task List 파일 존재 확인
TASK_PATTERN="tasks/${PRD_NUM}-tasks-*.md"
TASK_FILE=$(ls $TASK_PATTERN 2>/dev/null | head -1)

if [ -z "$TASK_FILE" ]; then
  echo "❌ Phase 0.5 검증 실패: Task List 없음"
  echo "   경로: $TASK_PATTERN"
  echo ""
  echo "📝 Phase 0.5 요구사항:"
  echo "   1. PRD 기반 Task List 생성 필요"
  echo "   2. 명령: python scripts/generate_tasks.py tasks/prds/${PRD_NUM}-*.md"
  exit 1
fi

# Task 0.0 검증 (필수)
if ! grep -q "Task 0.0" "$TASK_FILE"; then
  echo "❌ Phase 0.5 검증 실패: Task 0.0 없음"
  echo "   Task 0.0은 브랜치 생성 Task로 필수입니다"
  exit 1
fi

# Task 0.0 완료 확인
if grep -A 5 "Task 0.0" "$TASK_FILE" | grep -q "\[x\].*브랜치"; then
  echo "✅ Task 0.0 완료 (브랜치 생성)"
else
  echo "⚠️  Task 0.0 미완료 (브랜치 생성 대기)"
fi

# 체크박스 형식 검증
TOTAL_TASKS=$(grep -c "\[ \]" "$TASK_FILE" 2>/dev/null || true)
DONE_TASKS=$(grep -c "\[x\]" "$TASK_FILE" 2>/dev/null || true)

# 기본값 설정
TOTAL_TASKS=${TOTAL_TASKS:-0}
DONE_TASKS=${DONE_TASKS:-0}

echo "✅ Phase 0.5 검증 통과"
echo "   Task List: $TASK_FILE"
echo "   총 Task: $TOTAL_TASKS"
echo "   완료: $DONE_TASKS"

# 진행률 계산 (0으로 나누기 방지)
TOTAL_ALL=$((TOTAL_TASKS + DONE_TASKS))
if [ "$TOTAL_ALL" -gt 0 ]; then
  PROGRESS=$((DONE_TASKS * 100 / TOTAL_ALL))
  echo "   진행률: ${PROGRESS}%"
fi

exit 0
