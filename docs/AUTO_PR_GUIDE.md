# 자동 PR 생성 및 머지 시스템 사용 가이드

**버전**: 1.0.0 | **작성일**: 2025-01-13

---

## 🎯 개요

Phase 완료 커밋 시 자동으로 GitHub PR을 생성하고, CI 테스트 통과 후 자동 머지하는 워크플로우입니다.

---

## ✨ 주요 기능

- ✅ **자동 PR 생성**: 커밋 패턴 감지 시 PR 자동 생성
- ✅ **자동 머지**: CI 테스트 통과 시 즉시 머지
- ✅ **브랜치 자동 삭제**: 머지 후 Feature Branch 삭제
- ✅ **알림**: PR 생성 및 머지 상태 코멘트

---

## 🚀 빠른 시작

### 1단계: 초기 설정 (최초 1회)

#### Repository 설정

```bash
# 1. Branch Protection 활성화
Settings → Branches → Add rule
Branch name pattern: master
☑️ Require status checks to pass before merging
Required checks: Run CI Tests

# 2. Auto-merge 활성화
Settings → General
☑️ Allow auto-merge
```

📚 **자세한 설정**: [BRANCH_PROTECTION_GUIDE.md](BRANCH_PROTECTION_GUIDE.md)

---

### 2단계: 일반 사용 (매번)

#### Feature Branch 생성

```bash
git checkout -b feature/PRD-0001-user-auth
```

#### 코드 작성 및 커밋

```bash
# Phase 1-6 작업 수행
# ...

# 커밋 (패턴 중요!)
git add .
git commit -m "feat: Add user authentication (v1.0.0) [PRD-0001]

Phase 1 completed:
- Login endpoint
- JWT tokens
- Password hashing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**필수 패턴**: `(vX.Y.Z) [PRD-NNNN]`

#### Push 및 자동 PR 생성

```bash
git push -u origin feature/PRD-0001-user-auth
```

**자동 실행**:
```
Push → GitHub Actions 트리거
→ Phase 감지 ✅
→ PR 생성 ✅
→ CI 테스트 실행 🔄
→ 테스트 통과 시 자동 머지 ✅
→ 브랜치 삭제 ✅
```

---

## 📋 커밋 메시지 패턴

### 필수 요소

```
<type>: <subject> (v<version>) [PRD-<number>]

<body>
```

### 예시

#### Phase 1 (코드 작성)
```
feat: Add authentication system (v1.0.0) [PRD-0001]

Phase 1 completed:
- User login endpoint
- JWT token generation
- Password hashing with bcrypt
```

#### Phase 2 (테스트)
```
test: Add authentication tests (v1.1.0) [PRD-0001]

Phase 2 completed:
- Unit tests for login
- Integration tests for JWT
- 95% code coverage
```

#### Phase 3 (버전 업데이트)
```
docs: Update README and CHANGELOG (v1.2.0) [PRD-0001]

Phase 3 completed:
- Version bump to 1.2.0
- CHANGELOG updated
- API documentation added
```

---

## 🛠️ 수동 실행

### Phase 감지 확인

```bash
python scripts/check-phase-completion.py HEAD
```

**출력 예시**:
```json
{
  "phase_completed": true,
  "phase_number": "1",
  "prd_number": "0001",
  "version": "1.0.0",
  "commit_message": "feat: Add auth (v1.0.0) [PRD-0001]"
}
```

### PR 수동 생성

```bash
bash scripts/create-phase-pr.sh
```

또는 특정 커밋:
```bash
bash scripts/create-phase-pr.sh abc123
```

---

## 🔍 워크플로우 상태 확인

### GitHub Actions 확인

```
Repository → Actions 탭
→ "Auto PR Creation & Merge" 워크플로우 선택
→ 최근 실행 확인
```

### PR 상태 확인

```bash
gh pr list
gh pr view <number>
```

---

## ⚙️ 설정 커스터마이즈

### Branch Protection 수준 변경

**표준 (기본)**:
- 테스트 필수, 리뷰 선택

**엄격**:
- 테스트 + 리뷰 필수
- 서명된 커밋만 허용

📚 [BRANCH_PROTECTION_GUIDE.md](BRANCH_PROTECTION_GUIDE.md) 참조

### CI 테스트 추가

워크플로우 파일 수정:
```yaml
# .github/workflows/auto-pr-merge.yml

jobs:
  run-tests:
    steps:
      # 기존 테스트...

      # 새 테스트 추가
      - name: Run E2E tests
        run: npm run test:e2e
```

---

## 🐛 문제 해결

### PR이 생성되지 않음

**원인**: 커밋 메시지 패턴 불일치

**해결**:
```bash
# 패턴 확인
python scripts/check-phase-completion.py HEAD

# 패턴이 맞지 않으면 커밋 메시지 수정
git commit --amend
git push --force
```

---

### Auto-merge가 작동하지 않음

**원인 1**: Repository 설정 누락

**해결**:
```
Settings → General → Allow auto-merge ☑️
```

**원인 2**: Required checks 실패

**해결**:
```bash
# Actions 로그 확인
gh run list
gh run view <run-id>

# 에러 수정 후 재푸시
git push
```

---

### 테스트가 실패함

**해결**:
1. Actions 탭에서 실패 로그 확인
2. 로컬에서 테스트 실행:
   ```bash
   pytest tests/ -v
   npm test
   ```
3. 수정 후 재푸시:
   ```bash
   git add .
   git commit -m "fix: Fix test failures"
   git push
   ```

---

## 📊 모니터링

### 자동 머지 통계 확인

```bash
# 최근 머지된 PR 목록
gh pr list --state merged --limit 10

# 특정 PR 세부정보
gh pr view <number>
```

### 워크플로우 실행 통계

```bash
# 최근 워크플로우 실행
gh run list --workflow "Auto PR Creation & Merge" --limit 10

# 성공률 확인
gh run list --status success --workflow "Auto PR Creation & Merge"
```

---

## 🔒 보안 고려사항

### GitHub Token 권한

**기본 `GITHUB_TOKEN`**:
- `contents: write`
- `pull-requests: write`
- `checks: read`

**주의**: PAT (Personal Access Token) 사용 시 최소 권한만 부여

### Branch Protection

- ✅ main 브랜치 직접 푸시 차단
- ✅ 필수 테스트 통과 확인
- ✅ 충돌 자동 감지

---

## 📚 추가 자료

### 관련 문서

- [CLAUDE.md](../CLAUDE.md) - Phase 0-6 워크플로우
- [BRANCH_PROTECTION_GUIDE.md](BRANCH_PROTECTION_GUIDE.md) - Branch Protection 상세 설정
- [PRD-0002](../tasks/prds/0002-prd-auto-pr-merge.md) - 이 시스템의 PRD

### GitHub 공식 문서

- [GitHub Actions](https://docs.github.com/en/actions)
- [Auto-merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)
- [Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

## 💡 팁 & 트릭

### 빠른 커밋 템플릿

`.gitmessage` 파일 생성:
```
feat: <description> (v0.0.0) [PRD-0000]

Phase X completed:
-
-
-

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

설정:
```bash
git config commit.template .gitmessage
```

### Phase별 브랜치 전략

```bash
# Phase 1-3: feature/PRD-NNNN-phase-1-3
git checkout -b feature/PRD-0001-phase-1-3

# Phase 4-6: 동일 브랜치 유지, 커밋만 추가
git commit -m "test: Add tests (v1.1.0) [PRD-0001]"
```

---

## 🎓 학습 리소스

### 예제 커밋

**Repository**: [anthropics/claude-code-examples](https://github.com/anthropics)

### 비디오 튜토리얼

- [YouTube: GitHub Actions for Auto PR](https://youtube.com)
- [Loom: Branch Protection Setup](https://loom.com)

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-01-13
**관련 PRD**: PRD-0002
