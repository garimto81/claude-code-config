# Branch Protection 설정 가이드

자동 PR/머지 시스템을 위한 GitHub Branch Protection 설정 가이드

---

## 필수 설정

### 1. Repository Settings

**경로**: Repository → Settings → General

#### Allow auto-merge 활성화
```
☑️ Allow auto-merge
   Waits for merge requirements to be met and then merges automatically
```

**중요**: 이 옵션이 활성화되어야 `gh pr merge --auto` 명령이 작동합니다.

---

### 2. Branch Protection Rules

**경로**: Repository → Settings → Branches → Add rule

#### 기본 설정

**Branch name pattern**: `master` (또는 `main`)

#### 필수 규칙 (표준 수준)

```
☑️ Require a pull request before merging
   └─ ☐ Require approvals (선택사항, 리뷰 필요 시 체크)
      └─ Required number of approvals: 1

☑️ Require status checks to pass before merging
   └─ ☑️ Require branches to be up to date before merging
   └─ Status checks that are required:
       • run-tests (GitHub Actions Job 이름)
       • phase-detection (선택사항)

☑️ Require conversation resolution before merging (권장)

☐ Require signed commits (선택사항, 보안 강화 시)

☐ Require linear history (선택사항, rebase/squash만 허용)

☑️ Do not allow bypassing the above settings (관리자도 규칙 준수)
```

---

## 워크플로우별 설정

### 표준 (테스트 필수, 리뷰 선택)

**PRD-0002 기본 설정**

```yaml
Branch name pattern: master

✅ Require a pull request before merging
   ❌ Require approvals (0)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date
   Required checks:
     - run-tests

✅ Require conversation resolution

❌ Require signed commits

❌ Require linear history

✅ Do not allow bypassing
```

**효과**:
- 테스트 통과 필수
- 리뷰 없이 자동 머지 가능
- 충돌 없어야 머지 가능

---

### 엄격 (테스트 + 리뷰 필수)

**보안 중요 프로젝트용**

```yaml
Branch name pattern: master

✅ Require a pull request before merging
   ✅ Require approvals: 1

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date
   Required checks:
     - run-tests
     - phase-detection
     - all-checks-pass

✅ Require conversation resolution

✅ Require signed commits

✅ Require linear history (Squash/Rebase only)

✅ Do not allow bypassing
```

**효과**:
- 테스트 + 리뷰 모두 필수
- 서명된 커밋만 허용
- 머지 히스토리 깔끔 유지

---

### 유연 (기본 체크만)

**개인 프로젝트용**

```yaml
Branch name pattern: master

❌ Require a pull request before merging

❌ Require status checks to pass before merging

❌ Require conversation resolution

❌ Require signed commits

❌ Require linear history

❌ Do not allow bypassing
```

**효과**:
- 직접 푸시 가능
- 테스트 실패해도 머지 가능
- 빠른 개발 가능 (위험)

---

## Required Status Checks 설정

### GitHub Actions Job 이름 확인

**워크플로우 파일**: `.github/workflows/auto-pr-merge.yml`

```yaml
jobs:
  phase-detection:
    name: Detect Phase Completion  # ← 이 이름이 Status Check 이름
    # ...

  create-pr:
    name: Create Pull Request  # ← 이 이름이 Status Check 이름
    # ...

  run-tests:
    name: Run CI Tests  # ← 이 이름이 Status Check 이름
    # ...

  auto-merge:
    name: Auto Merge PR  # ← 이 이름이 Status Check 이름
    # ...
```

### Branch Protection에 추가할 Status Checks

**최소 필수**:
- `Run CI Tests` (run-tests Job)

**권장**:
- `Run CI Tests`
- `Detect Phase Completion`

**최대 (alls-green 패턴)**:
- `all-checks-pass` (단일 Job, 모든 Job 의존)

---

## alls-green 패턴 (권장)

### 개념

모든 필수 체크를 하나의 Job으로 통합하여 Branch Protection 관리 간소화

### 워크플로우 수정

```yaml
jobs:
  phase-detection:
    # ...

  create-pr:
    needs: phase-detection
    # ...

  run-tests:
    needs: create-pr
    # ...

  auto-merge:
    needs: [create-pr, run-tests]
    # ...

  # 추가: alls-green Job
  all-checks-pass:
    name: All Checks Passed
    needs: [phase-detection, create-pr, run-tests, auto-merge]
    runs-on: ubuntu-22.04
    steps:
      - name: All checks passed
        run: echo "✅ All required checks passed successfully"
```

### Branch Protection 설정

```
Required status checks:
  • All Checks Passed
```

**장점**:
- 단일 Status Check만 관리
- Job 추가/제거 시 Branch Protection 수정 불필요
- 명확한 통과/실패 표시

---

## 자동 머지 동작 원리

### 워크플로우

```
1. Feature 브랜치에 Push
   ↓
2. GitHub Actions 트리거
   ↓
3. PR 생성 (없으면)
   ↓
4. Auto-merge 활성화 (gh pr merge --auto)
   ↓
5. CI 테스트 실행
   ↓
6. Required Checks 통과 대기
   ↓
7. 모든 체크 통과 시 자동 머지 ✅
   ↓
8. 브랜치 자동 삭제
```

### 자동 머지 조건

다음 조건이 **모두** 충족되어야 자동 머지 실행:

1. ✅ Auto-merge enabled (`gh pr merge --auto`)
2. ✅ All required status checks passed
3. ✅ Branch is up-to-date with base
4. ✅ No merge conflicts
5. ✅ Required reviews approved (설정 시)
6. ✅ Conversation resolved (설정 시)

**하나라도 실패 시**: Auto-merge는 **대기 상태**로 유지되며, 조건 충족 시 자동 실행

---

## 문제 해결

### Auto-merge가 작동하지 않음

**원인 1**: Repository에서 "Allow auto-merge" 비활성화

**해결**:
```
Settings → General → Allow auto-merge ☑️
```

---

**원인 2**: Required status checks 실패

**해결**:
1. Actions 탭에서 실패한 Job 확인
2. 로그 분석 및 수정
3. 재푸시 또는 수동 재실행

---

**원인 3**: Branch가 out-of-date

**해결**:
```bash
git checkout feature/PRD-NNNN
git pull origin master
git push
```

또는 GitHub UI에서 "Update branch" 버튼 클릭

---

**원인 4**: Status check 이름 불일치

**해결**:
1. GitHub Actions 로그에서 실제 Job 이름 확인
2. Branch Protection 설정에서 동일한 이름 입력
3. 대소문자 구분 주의

---

### PR이 자동 생성되지 않음

**원인**: 커밋 메시지 패턴 불일치

**해결**:
- 커밋 메시지에 `(vX.Y.Z) [PRD-NNNN]` 패턴 포함 확인
- 예: `feat: Add feature (v1.2.0) [PRD-0002]`

**디버깅**:
```bash
python scripts/check-phase-completion.py HEAD
```

---

## 보안 고려사항

### Token 권한

**GITHUB_TOKEN** (워크플로우 기본 제공):
- `contents: write` - 커밋/브랜치 생성 권한
- `pull-requests: write` - PR 생성/머지 권한
- `checks: read` - Status checks 읽기 권한

**Personal Access Token** (선택):
- 추가 워크플로우 트리거 필요 시 사용
- Fine-grained token 권장 (최소 권한 원칙)

### Actions SHA 고정

**권장**:
```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

**비권장**:
```yaml
uses: actions/checkout@v4  # 보안 위험
```

---

## 추가 리소스

- [GitHub Branch Protection 공식 문서](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Auto-merge 가이드](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)
- [Status Checks 설정 가이드](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-01-13
**관련 PRD**: PRD-0002
