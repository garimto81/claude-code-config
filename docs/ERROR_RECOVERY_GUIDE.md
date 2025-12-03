# Error Recovery Guide

**Version**: 5.4.0 | **Updated**: 2025-12-03

Validation 실패 시 복구 절차 가이드.

---

## Overview

CLAUDE.md의 Feedback Loop 규칙:
> Validation 실패 시 현재 Phase의 Action으로 돌아감. 이전 Phase로 회귀 금지.

이 가이드는 각 Phase별 일반적인 실패 시나리오와 복구 방법을 제공합니다.

---

## Phase 0: PRD Validation 실패

### 증상
```
❌ PRD file not found: tasks/prds/NNNN-prd-*.md
❌ PRD too short: XX lines (minimum 50)
⚠️ Section missing or misnamed: Purpose/Features/Success
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| File not found | 파일 위치 오류 | `tasks/prds/` 디렉토리에 `NNNN-prd-*.md` 형식으로 저장 |
| Too short | 내용 부족 | 최소 50줄 이상 작성, `/create-prd` 사용 권장 |
| Section missing | 필수 섹션 누락 | Purpose, Features, Success 섹션 추가 |

### 명령어
```bash
# PRD 템플릿으로 시작
/create-prd <기능명>

# 검증 재실행
python scripts/validate_phase_universal.py 0 NNNN
```

---

## Phase 0.5: Task List Validation 실패

### 증상
```
❌ Task list not found: tasks/NNNN-tasks-*.md
❌ Task 0.0 not started
⚠️ Task 0.0 partially done (X/Y)
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| File not found | Task 파일 미생성 | PRD 기반으로 Task 파일 생성 |
| Task 0.0 not started | 환경 설정 미완료 | Task 0.0 체크리스트 완료 |
| Partially done | 일부 항목 미체크 | 누락된 체크박스 `[x]`로 표시 |

### 명령어
```bash
# Task 생성 요청
"PRD 읽고 Task List 작성해줘"

# 검증 재실행
python scripts/validate_phase_universal.py 0.5 NNNN
```

---

## Phase 1: 1:1 Test Pairing 실패

### 증상
```
❌ Orphaned files without tests: N
   ❌ src/auth/oauth.py
   ❌ src/components/Button.tsx
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| Orphaned files | 테스트 파일 누락 | 각 소스 파일에 대응하는 테스트 생성 |

### 파일 매핑 규칙
```
Python:  src/auth/oauth.py      → tests/auth/test_oauth.py
TS/JS:   src/components/Btn.tsx → tests/components/Btn.test.tsx
```

### 명령어
```bash
# TDD 모드로 테스트 먼저 생성
/tdd

# 검증 재실행
python scripts/validate_phase_universal.py 1
```

---

## Phase 2: Test & Coverage 실패

### 증상
```
❌ Tests failed
❌ Coverage too low: XX% (minimum 80%)
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| Tests failed | 테스트 케이스 실패 | 실패한 테스트 수정 또는 코드 버그 수정 |
| Coverage low | 테스트 커버리지 부족 | 누락된 코드 경로에 테스트 추가 |

### 명령어
```bash
# 실패한 테스트 확인
pytest tests/ -v --tb=short

# 커버리지 상세 확인
pytest tests/ --cov=src --cov-report=term-missing

# 특정 파일만 테스트
pytest tests/auth/test_oauth.py -v

# 검증 재실행
python scripts/validate_phase_universal.py 2 --coverage 80
```

### 커버리지 개선 팁
- `--cov-report=term-missing`으로 누락된 라인 확인
- Edge case, error handling 경로 테스트 추가
- Mock 객체로 외부 의존성 격리

---

## Phase 2.5: Code Review 실패

### 증상
- Critical/High 이슈 발견
- 보안 취약점 탐지
- 디자인 가이드라인 위반

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| Critical issue | 심각한 코드 문제 | 즉시 수정 후 재리뷰 |
| Security vuln | 보안 취약점 | 취약점 패치 적용 |
| Design violation | UI/UX 불일치 | 디자인 가이드 준수하도록 수정 |

### 명령어
```bash
# 코드 리뷰 재실행
/pragmatic-code-review

# 디자인 리뷰 (UI 변경 시)
/design-review

# 정적 분석 + 보안 스캔
/check
```

---

## Phase 3: Versioning 실패

### 증상
```
❌ CHANGELOG.md not found
⚠️ No semantic version found in CHANGELOG
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| File not found | CHANGELOG 미생성 | CHANGELOG.md 파일 생성 |
| No version | 버전 형식 오류 | `## [X.Y.Z]` 형식으로 버전 추가 |

### 명령어
```bash
# Changelog 업데이트
/changelog

# 검증 재실행
python scripts/validate_phase_universal.py 3
```

---

## Phase 4: Git Ops 실패

### 증상
```
❌ Uncommitted changes detected
❌ scripts/validate-phase-4.ps1 not found
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| Uncommitted changes | 변경사항 미커밋 | `git add` + `git commit` 실행 |
| Merge conflict | 병합 충돌 | 충돌 해결 후 `git commit` |

### 명령어
```bash
# 변경사항 확인
git status

# 커밋 생성
/commit

# PR 생성
/create-pr

# 검증 재실행
python scripts/validate_phase_universal.py 4
```

---

## Phase 5: E2E & Security 실패

### 증상
```
❌ pip-audit found vulnerabilities
⚠️ npm audit found issues
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| Dependency vuln | 취약한 패키지 | 패키지 업데이트 또는 대체 |
| E2E test fail | UI 플로우 오류 | 테스트 또는 코드 수정 |

### 명령어
```bash
# Python 취약점 수정
pip-audit --fix

# Node.js 취약점 수정
npm audit fix

# 보안 스캔 재실행
python scripts/validate_phase_universal.py 5
```

---

## Phase 6: Deployment 실패

### 증상
```
❌ Working directory has uncommitted changes
⚠️ Not on main branch
⚠️ No version tags found
```

### 복구 방법

| 실패 유형 | 원인 | 해결 방법 |
|-----------|------|-----------|
| Uncommitted changes | 미커밋 변경사항 | 모든 변경사항 커밋 |
| Not on main | 잘못된 브랜치 | PR 머지 후 main 체크아웃 |
| No tags | 버전 태그 없음 | `git tag vX.Y.Z` 생성 |

### 명령어
```bash
# 모든 변경사항 커밋
git add . && git commit -m "chore: prepare for release"

# main 브랜치로 이동
git checkout main && git pull

# 버전 태그 생성
git tag v5.4.0
git push origin v5.4.0

# 검증 재실행
python scripts/validate_phase_universal.py 6
```

---

## Emergency: 롤백 절차

### 배포 후 문제 발생 시

```bash
# 1. 이전 버전으로 롤백
git revert HEAD

# 2. 또는 특정 태그로 복원
git checkout v5.3.0

# 3. devops-troubleshooter 에이전트 사용
"배포 실패 분석해줘"
```

---

## Related Documentation

- **[CLAUDE.md](../CLAUDE.md)** - Workflow Pipeline
- **[PHASE_VALIDATION_GUIDE.md](PHASE_VALIDATION_GUIDE.md)** - Validator 상세
- **[PHASE_AGENT_MAPPING.md](PHASE_AGENT_MAPPING.md)** - Phase별 에이전트

---

**Maintained By**: Claude Code + garimto81
