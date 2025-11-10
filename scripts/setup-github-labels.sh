#!/bin/bash
# GitHub 라벨 설정 스크립트 (Phase 0-6 워크플로우용)
# Setup GitHub labels for Phase 0-6 workflow
#
# 사용법 (Usage): ./scripts/setup-github-labels.sh
# 실행 시간 (Duration): ~2분
# 필수 조건 (Prerequisites): gh CLI 설치 및 인증 완료

echo "🏷️  Phase 0-6 워크플로우용 GitHub 라벨 설정 중..."
echo "🏷️  Setting up GitHub labels for Phase 0-6 workflow..."
echo ""

# GitHub CLI 설치 확인 (Check if gh CLI is installed)
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh)가 설치되지 않았습니다"
  echo "❌ GitHub CLI (gh) is not installed"
  echo "설치 (Install): https://cli.github.com/"
  exit 1
fi

# Phase labels
echo "Creating Phase labels..."
gh label create "phase-0" --color "0E8A16" --description "Phase 0: PRD / Requirements" --force
gh label create "phase-0.5" --color "1D76DB" --description "Phase 0.5: Task List Generation" --force
gh label create "phase-1" --color "5319E7" --description "Phase 1: Code Implementation" --force
gh label create "phase-2" --color "B60205" --description "Phase 2: Testing" --force
gh label create "phase-3" --color "D93F0B" --description "Phase 3: Versioning" --force
gh label create "phase-4" --color "FBCA04" --description "Phase 4: Git (PR created)" --force
gh label create "phase-5" --color "0075CA" --description "Phase 5: Validation (CI/CD)" --force
gh label create "phase-6" --color "006B75" --description "Phase 6: Deployment / Cache" --force

echo ""
echo "Creating Type labels..."
gh label create "type:feature" --color "A2EEEF" --description "New feature" --force
gh label create "type:bug" --color "D73A4A" --description "Bug fix" --force
gh label create "type:refactor" --color "EDEDED" --description "Code refactoring" --force
gh label create "type:docs" --color "0075CA" --description "Documentation" --force
gh label create "type:perf" --color "F9D0C4" --description "Performance improvement" --force
gh label create "type:test" --color "C2E0C6" --description "Testing" --force
gh label create "type:chore" --color "FEF2C0" --description "Maintenance" --force

echo ""
echo "Creating Status labels..."
gh label create "status:planning" --color "D4C5F9" --description "In planning phase" --force
gh label create "status:in-progress" --color "FEF2C0" --description "Work in progress" --force
gh label create "status:review" --color "BFDADC" --description "In review" --force
gh label create "status:blocked" --color "B60205" --description "Blocked by dependency" --force
gh label create "status:ready-to-merge" --color "0E8A16" --description "Ready to merge" --force
gh label create "status:triage" --color "EDEDED" --description "Needs triage" --force
gh label create "status:deployed" --color "006B75" --description "Deployed to production" --force

echo ""
echo "Creating Priority labels..."
gh label create "priority:p0" --color "B60205" --description "Critical - Drop everything" --force
gh label create "priority:p1" --color "D93F0B" --description "High - This sprint" --force
gh label create "priority:p2" --color "FBCA04" --description "Medium - Next sprint" --force
gh label create "priority:p3" --color "0E8A16" --description "Low - Backlog" --force

echo ""
echo "Creating Severity labels (for bugs)..."
gh label create "severity:s0" --color "B60205" --description "Blocker - Service down" --force
gh label create "severity:s1" --color "D73A4A" --description "Critical - Major feature broken" --force
gh label create "severity:s2" --color "FBCA04" --description "Major - Some features broken" --force
gh label create "severity:s3" --color "0E8A16" --description "Minor - Inconvenience" --force

echo ""
echo "Creating Special labels..."
gh label create "tests:passing" --color "0E8A16" --description "All tests passing" --force
gh label create "version:ready" --color "0E8A16" --description "Version bump complete" --force
gh label create "breaking-change" --color "B60205" --description "Breaking API change" --force
gh label create "dependencies" --color "0366D6" --description "Dependency update" --force
gh label create "migrated-from-local" --color "EDEDED" --description "Migrated from local PRD" --force

echo ""
echo "✅ All labels created successfully!"
echo ""
echo "Next steps:"
echo "  1. Create GitHub Project: gh project create --title 'SSO Development' --owner @me"
echo "  2. Add issue templates to .github/ISSUE_TEMPLATE/"
echo "  3. Add GitHub Actions workflows to .github/workflows/"
