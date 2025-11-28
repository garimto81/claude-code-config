# Phase 0.5: Task Generation Guide

PRD를 실행 가능한 Task List로 변환하는 상세 가이드.

---

## Task 생성 프로세스

### 2단계 승인 프로세스

```
Step 1: Parent Tasks 생성 → 사용자 검토 → "Go"
Step 2: Sub-Tasks 생성 (1:1 테스트 페어링 포함)
```

### 생성 방법

**방법 1: 대화로 생성** (권장)
```
사용자: "tasks/prds/0001-prd-feature.md 읽고 Task List 작성해줘"
Claude: PRD 분석 → Parent Tasks 제안 → 승인 후 Sub-Tasks 생성
```

**방법 2: 스크립트** (API 키 필요)
```bash
export ANTHROPIC_API_KEY=your_key
python scripts/generate_tasks_ai.py tasks/prds/NNNN-prd-feature.md
```

---

## Task 구조 규칙

### Task 0.0 (필수)

모든 Task List는 반드시 Task 0.0으로 시작:

```markdown
## Task 0.0: Setup
- [ ] Create feature branch: `feature/PRD-XXXX-feature-name`
- [ ] Update CLAUDE.md with project context (if needed)
```

### Parent Tasks (5-12개)

High-level phases로 구성:

| Task 번호 | 내용 | 예시 |
|----------|------|------|
| 0.0 | Setup | 브랜치 생성, 환경 설정 |
| 1.0 | Research/Documentation | 기술 조사, 설계 문서 |
| 2.0-4.0 | Implementation | 핵심 기능 구현 |
| 5.0 | Testing | 단위/통합/E2E 테스트 |
| 6.0+ | Integration/Deployment | 통합, 배포 |

### Sub-Tasks

각 Parent Task 아래 상세 구현 단계:

```markdown
## Task 2.0: Phase 1 - Authentication
- [ ] Task 2.1: Create `src/auth/login.py`
- [ ] Task 2.2: Create `tests/auth/test_login.py` (1:1 pair with 2.1)
- [ ] Task 2.3: Implement JWT token generation
- [ ] Task 2.4: Create `src/auth/middleware.py`
- [ ] Task 2.5: Create `tests/auth/test_middleware.py` (1:1 pair with 2.4)
```

---

## 1:1 테스트 페어링 규칙

**필수**: 모든 구현 파일은 대응하는 테스트 파일 필요

| 구현 파일 | 테스트 파일 |
|----------|------------|
| `src/auth.py` | `tests/test_auth.py` |
| `src/auth/login.py` | `tests/auth/test_login.py` |
| `src/components/Button.tsx` | `tests/components/Button.test.tsx` |

**Task List 작성 시**:
- 구현 Task 바로 다음에 테스트 Task 배치
- `(1:1 pair with X.X)` 주석으로 연결 표시

---

## Checkbox 포맷

| 기호 | 상태 | 의미 |
|------|------|------|
| `[ ]` | pending | 시작 전 |
| `[x]` | done | 완료 |
| `[!]` | failed | 실패 (재작업 필요) |
| `[⏸]` | blocked | 차단됨 (의존성 대기) |

### 진행률 확인

```bash
# 전체 진행률
grep -oP '\[.\]' tasks/NNNN-tasks-*.md | sort | uniq -c

# 예상 출력:
#   12 [x]  # 완료
#    5 [ ]  # 대기
#    1 [!]  # 실패
```

---

## 파일 명명 규칙

```
tasks/NNNN-tasks-feature-name.md
```

예시:
- `tasks/0001-tasks-user-authentication.md`
- `tasks/0002-tasks-payment-integration.md`

---

## 완전한 예시

```markdown
# Task List: User Authentication (PRD-0001)

**PRD**: tasks/prds/0001-prd-user-authentication.md
**Branch**: feature/PRD-0001-user-authentication
**Created**: 2025-01-20

---

## Task 0.0: Setup
- [x] Create feature branch: `feature/PRD-0001-user-authentication`
- [x] Update CLAUDE.md with project context

## Task 1.0: Phase 0 - Research
- [x] Task 1.1: Research OAuth2 providers (Google, GitHub)
- [x] Task 1.2: Document JWT token strategy

## Task 2.0: Phase 1 - Core Authentication
- [x] Task 2.1: Create `src/auth/models.py`
- [x] Task 2.2: Create `tests/auth/test_models.py` (1:1 pair with 2.1)
- [ ] Task 2.3: Create `src/auth/login.py`
- [ ] Task 2.4: Create `tests/auth/test_login.py` (1:1 pair with 2.3)
- [ ] Task 2.5: Implement password hashing

## Task 3.0: Phase 1 - JWT Middleware
- [ ] Task 3.1: Create `src/auth/jwt.py`
- [ ] Task 3.2: Create `tests/auth/test_jwt.py` (1:1 pair with 3.1)
- [ ] Task 3.3: Create `src/middleware/auth_middleware.py`
- [ ] Task 3.4: Create `tests/middleware/test_auth_middleware.py` (1:1 pair with 3.3)

## Task 4.0: Phase 2 - Testing
- [ ] Task 4.1: Unit tests (80% coverage)
- [ ] Task 4.2: Integration tests with mock database
- [ ] Task 4.3: E2E tests with Playwright

## Task 5.0: Phase 3 - Documentation
- [ ] Task 5.1: Update API documentation
- [ ] Task 5.2: Add usage examples to README
```

---

## Validation

Phase 1로 진행하기 전 검증:

```bash
bash scripts/validate-phase-0.5.sh 0001
```

**검증 항목**:
- ✅ Task List 파일 존재
- ✅ Task 0.0 완료 (feature branch 생성)
- ✅ Checkbox 포맷 올바름
- ✅ 1:1 테스트 페어링 계획됨
