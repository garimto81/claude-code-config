# Claude AI 마스터 개발 가이드
*핵심 워크플로우 & 자동화 규칙*

**버전**: 4.1.0 | **업데이트**: 2025-01-12

---

## 🔄 Phase 0-6: 완전한 개발 사이클

```
Phase 0: 요구사항 (PRD) → Phase 0.5: Task List 생성
→ Phase 1: 코드 → Phase 2: 테스트 → Phase 3: 버전
→ Phase 4: Git → Phase 5: 검증 → Phase 6: 캐시
```

---

## 📌 Phase 0: 요구사항 정의 (PRD 작성)

**절차**: 요청 수신 → **A/B/C/D 명확화 질문** (3-8개) → PRD 저장 → 승인 대기 → Phase 0.5

**저장**: `/tasks/prds/0001-prd-feature-name.md` (0001부터 시작)

**PRD 가이드**:
- MINIMAL: 경험 많은 개발자 (10분)
- STANDARD: 중급 개발자 (20-30분)
- JUNIOR: 초보자 (40-60분)

---

## 📋 Phase 0.5: Task List 생성

**Two-Phase 프로세스**:
1. Parent Tasks 생성 → 사용자 확인
2. "Go" 입력 → Sub-Tasks 생성

**자동화**:
```bash
python scripts/generate_tasks.py tasks/prds/0001-prd-user-auth.md
# → tasks/0001-tasks-user-auth.md
```

**필수 규칙**:
- ✅ **1:1 Test Pairing**: 모든 구현 파일 → 테스트 파일 필수
- ✅ **Feature Branch**: Task 0.0 항상 포함
- ✅ **체크박스 업데이트**: Sub-task 완료 시 즉시 `[x]` 표시
- ✅ **진행률 확인**: `grep -oP '\[.\]' tasks/NNNN-*.md | sort | uniq -c`

**상태 마커**: `[ ]` 미시작 | `[x]` 완료 | `[!]` 실패 | `[⏸]` 블락


---

## 🔨 Phase 1-6: 개발 → 배포

| Phase | 작업 | 명령/규칙 |
|-------|------|----------|
| 1 | 코드 작성 | PRD 구현 + 문서화 |
| 2 | 테스트 | `pytest tests/ -v --cov=src` (Python) / `npm test` (Node.js) |
| 3 | 버전 | Semantic Versioning (Major.Minor.Patch), README 업데이트 |
| 4 | Git | `git commit -m "type: 설명 (v버전) [PRD-####]"` |
| 5 | 검증 | GitHub 파일 확인, CI/CD 통과 확인 |
| 6 | 캐시 | `Ctrl+Shift+R` 또는 `?v=1.2.3` |

---

## 🤖 Subagent & MCP

**Top 5 Agent**: `seq-engineer` (요구사항) | `python-pro` | `frontend-developer` | `test-automator` | `security-auditor`

**MCP**: `sequentialthinking`, `ide`, `github`, `supabase` (Primary) | `context7`, `exa`, `slack` (Secondary)

---

## 🌍 언어 & 표준

**언어**: 한글 우선, 원문 용어는 그대로 유지 (GitHub, Docker 등)

**폴더**: `tasks/prds/` (PRD) | `tasks/tickets/` (버그) | `scripts/` (자동화) | `docs/` | `src/` | `tests/`

---

## 📊 커밋 컨벤션

**형식**: `type: subject (v버전) [PRD-####]`
**타입**: `feat` | `fix` | `docs` | `refactor` | `perf` | `test`
**예시**: `feat: Add auth (v1.2.0) [PRD-0001]`

---

## 🔐 보안 체크리스트

**필수**: 환경변수 | SQL Injection 방지 | XSS 방지 | CSRF | Rate Limiting | HTTPS | 보안 헤더 | 의존성 스캔

**.gitignore**: `.env*` | `*.key` | `secrets/` | `tasks/prds/*-internal.md`

---

## 🚀 GitHub 워크플로우

**GitHub 네이티브 개발**:
- [깃허브_워크플로우_개요.md](깃허브_워크플로우_개요.md) - 5분 개요
- [깃허브_빠른시작.md](깃허브_빠른시작.md) - 30분 설정

**자동화**:
```bash
# GitHub 라벨 설정
bash scripts/setup-github-labels.sh

# 이슈 작업 시작
bash scripts/github-issue-dev.sh 123
```

---

## 🚦 토큰 최적화

### 5대 기법

#### 1. 미니멀 PRD
```bash
python scripts/create_prd.py --minimal "Feature Name"
```

#### 2. 스마트 컨텍스트
```bash
python scripts/index_codebase.py .
python scripts/context_manager.py --summary
```

#### 3. Diff 기반 업데이트
```bash
python scripts/diff_manager.py . --diff src/*.py
```

#### 4. Function Calling
JSON 응답 사용: `{"action": "edit", "file": "app.py"}`

#### 5. 배치 처리
병렬 도구 호출: `Read("file1.py"), Read("file2.py")`

📚 [TOKEN_OPTIMIZATION_DETAILS.md](docs/TOKEN_OPTIMIZATION_DETAILS.md) - 상세 분석 및 비용 효과

---

## 💡 핵심 원칙

1. **Phase 0부터 시작**: PRD → 개발 순서 필수
2. **PRD 중심**: 커밋마다 `[PRD-####]` 참조
3. **자동화 우선**: 스크립트 활용
4. **병렬 실행**: 독립 작업 동시 호출

---

## 📚 참조 문서

### 워크플로우
- [깃허브_워크플로우_개요.md](깃허브_워크플로우_개요.md) - GitHub 네이티브 개발
- [README_GITHUB_WORKFLOW.md](README_GITHUB_WORKFLOW.md) - 문서 네비게이션

### Spec Kit
- [docs/SPECKIT_EXECUTIVE_SUMMARY.md](docs/SPECKIT_EXECUTIVE_SUMMARY.md) - 5분 개요
- [.speckit/constitution.md](.speckit/constitution.md) - Constitution 템플릿

### 공식 문서
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [GitHub Spec Kit](https://github.com/github/spec-kit)

---

## 🎓 Quick Start

### 로컬 PRD 방식
```bash
# 1. PRD 작성
vim tasks/prds/0001-prd-feature.md

# 2. 개발 & 테스트 (Phase 1-2)

# 3. 커밋
git commit -m "feat: Add feature (v1.0.0) [PRD-0001]"
```

### GitHub 네이티브 방식
```bash
# 1. 이슈 생성
gh issue create --template 01-feature-prd.yml

# 2. 작업 시작
bash scripts/github-issue-dev.sh 123

# 3. 개발 & 푸시
git commit -m "feat: Add feature [#123]"
git push
```

---

## 📋 버전 히스토리

### v4.1.0 (2025-01-12)
- ✅ 언어 정책 명확화 (괄호 영문명 불필요)
- ✅ GitHub 워크플로우 통합
- ✅ Spec Kit 참조 추가
- ✅ Quick Start 두 가지 방식 제시

### v4.0.0 (2025-01-12)
- 🎯 171줄 달성 (373줄에서 54% 축소)
- 🗑️ 비용 계산 및 중복 설명 제거
- ⚡ Phase 0-6 핵심 워크플로우에 집중

---

*이 문서는 Claude Code 작업의 핵심 워크플로우만 담았습니다.*
*상세 내용은 [README.md](README.md) 및 docs/ 폴더 참조.*
