#!/bin/bash
# 1인 개발자용 이슈 작업 시작 스크립트
# Quick script for solo developer to start work on issue
#
# 사용법 (Usage): ./scripts/github-issue-dev.sh <issue-number>
# 예시 (Example): ./scripts/github-issue-dev.sh 123
# 실행 시간 (Duration): ~30초

ISSUE_NUMBER=$1

if [ -z "$ISSUE_NUMBER" ]; then
  echo "사용법 (Usage): ./scripts/github-issue-dev.sh <issue-number>"
  exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed"
  echo "Install: https://cli.github.com/"
  exit 1
fi

echo "🔍 Fetching issue #$ISSUE_NUMBER..."

# Fetch issue details
ISSUE_JSON=$(gh issue view $ISSUE_NUMBER --json title,labels,body 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "❌ Issue #$ISSUE_NUMBER not found"
  exit 1
fi

TITLE=$(echo $ISSUE_JSON | jq -r '.title')
LABELS=$(echo $ISSUE_JSON | jq -r '.labels[].name' | tr '\n' ',')

# Create branch
BRANCH_NAME="feature/issue-${ISSUE_NUMBER}"

echo ""
echo "📝 Issue: #$ISSUE_NUMBER - $TITLE"
echo "🏷️  Labels: $LABELS"
echo ""

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
  echo "✅ Branch $BRANCH_NAME already exists"
  git checkout $BRANCH_NAME
else
  echo "🌿 Creating branch: $BRANCH_NAME"
  git checkout -b "$BRANCH_NAME"
fi

# Check if PR already exists
EXISTING_PR=$(gh pr list --head $BRANCH_NAME --json number --jq '.[0].number' 2>/dev/null)

if [ -n "$EXISTING_PR" ]; then
  echo "✅ Draft PR already exists: #$EXISTING_PR"
else
  echo "📄 Creating draft PR..."

  # Create draft PR immediately
  gh pr create \
    --title "[WIP] $TITLE" \
    --body "Closes #$ISSUE_NUMBER" \
    --draft \
    --label "status:in-progress"

  echo "✅ Draft PR created"
fi

echo ""
echo "🚀 코딩 준비 완료! (Ready to code!)"
echo ""
echo "다음 단계 (Next steps):"
echo "  1. 코드 작성 (Make your changes)"
echo "  2. git add . && git commit -m 'feat: 작업 내용 [#$ISSUE_NUMBER]'"
echo "  3. git push"
echo "  4. 완료 시 (When ready): gh pr ready"
