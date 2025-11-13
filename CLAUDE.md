# Claude AI 마스터 개발 가이드
*핵심 워크플로우 & 자동화 규칙*

**버전**: 4.8.0 | **업데이트**: 2025-01-13

---

## 🔄 Phase 0-6: 완전한 개발 사이클

```
Phase 0: 요구사항 (PRD) → Phase 0.5: Task List
→ Phase 1: 코드 → Phase 2: 테스트 → Phase 3: 버전
→ Phase 4: Git → Phase 5: 검증 → Phase 6: 캐시
```

---

## 📌 Phase 0: 요구사항 정의

**절차**: 요청 → **A/B/C/D 질문** (3-8개) → PRD 저장 → Phase 0.5

**저장**: `/tasks/prds/0001-prd-feature-name.md`

**PRD 가이드**: MINIMAL (10분) | STANDARD (20-30분) | JUNIOR (40-60분)

---

## 📋 Phase 0.5: Task List 생성

**Two-Phase**: Parent Tasks → 확인 → "Go" → Sub-Tasks

**필수 규칙**:
- ✅ **1:1 Test Pairing**: 모든 구현 → 테스트 필수
- ✅ **Feature Branch**: Task 0.0 필수
- ✅ **체크박스 업데이트**: 완료 시 즉시 `[x]`

**상태**: `[ ]` 미시작 | `[x]` 완료 | `[!]` 실패 | `[⏸]` 블락

---

## 🔨 Phase 1-6: 개발 → 배포

| Phase | 작업 | 명령/규칙 |
|-------|------|----------|
| 1 | 코드 | PRD 구현 + 문서화 |
| 2 | 테스트 | `pytest tests/ -v` (Python) / `npm test` (Node.js) |
| 3 | 버전 | Semantic Versioning, README 업데이트 |
| 4 | Git | `git commit -m "type: 설명 (vX.Y.Z) [PRD-####]"` → **자동 PR** |
| 5 | 검증 | **Playwright E2E 필수** |
| 6 | 캐시 | `Ctrl+Shift+R` 또는 `?v=X.Y.Z` |

### 🚀 자동 PR/머지 (Phase 4)

```
커밋 (vX.Y.Z) [PRD-####] → Push → GitHub Actions
→ PR 생성 → CI 테스트 → 자동 머지 → 브랜치 삭제
```

📚 **설정**: [docs/BRANCH_PROTECTION_GUIDE.md](docs/BRANCH_PROTECTION_GUIDE.md)

---

## 🤖 Agent & MCP

**Top 5 Agent**:
1. `context7-engineer` ★ - 외부 기술 최신 문서 검증
2. `playwright-engineer` ★ - E2E 테스트 및 최종 검증
3. `seq-engineer` - 복잡한 요구사항 분석
4. `test-automator` - 단위/통합 테스트 작성
5. `typescript-expert` - TypeScript 타입 안정성

**핵심 원칙**:
- **Context7 필수**: 외부 라이브러리 사용 전 (Phase 0, 1)
- **Playwright 필수**: E2E 테스트 (Phase 2, 5)
- **병렬 실행**: 독립 작업 동시 호출 (평균 64% 시간 절감)

**병렬 실행 예시**:
```python
# Phase 1: 6개 Agent 병렬
Task("context7", "React 18 docs"), Task("seq", "requirements"),
Task("typescript", "types"), Task("test-automator", "unit tests")

# Phase 2: 5개 Agent 병렬
Task("playwright", "E2E"), Task("test-automator", "integration")
```

📚 **33개 Agent 전체**: [docs/AGENTS_REFERENCE.md](docs/AGENTS_REFERENCE.md)

---

## 🔧 Agent 자동 최적화

**커밋 시 자동 분석**: Agent/Skill 사용 패턴 → 실패 분류 → 개선 제안

**실패 원인 (5가지)**:
`timeout` | `missing_context` | `parameter_error` | `ambiguous_prompt` | `api_error`

**출력**:
- `.claude/improvement-suggestions.md`: 개선 제안
- Git 메타데이터: `Agent-Usage: [{"agent":"...","status":"..."}]`

**예시**:
```bash
git commit -m "feat: Add auth (v1.0.0) [PRD-0001]"
# → post-commit hook 실행 → 로그 분석 → 개선 제안 생성
```

📚 **설치/설정**: [docs/AGENT_OPTIMIZER_GUIDE.md](docs/AGENT_OPTIMIZER_GUIDE.md)

---

## 🎓 Skill 활용

**용도**: PDF, Excel, 이미지 처리 자동화 | **원칙**: Agents 먼저

📚 [Skill 카탈로그](https://docs.anthropic.com/en/docs/claude-code/skills)

---

## 🌍 언어 & 폴더

**언어**: 한글 우선, 원문 용어 유지 (GitHub, Docker 등)

**폴더**: `tasks/prds/` | `tasks/tickets/` | `scripts/` | `docs/` | `src/` | `tests/`

---

## 📊 커밋 컨벤션

**형식**: `type: subject (vX.Y.Z) [PRD-####]`

**타입**: `feat` | `fix` | `docs` | `refactor` | `perf` | `test`

---

## 🔐 보안 체크리스트

**필수**: 환경변수 | SQL Injection 방지 | XSS 방지 | CSRF | Rate Limiting | HTTPS | 보안 헤더 | 의존성 스캔

**.gitignore**: `.env*` | `*.key` | `secrets/` | `tasks/prds/*-internal.md`

---

## 🚀 GitHub 워크플로우

- [깃허브_워크플로우_개요.md](깃허브_워크플로우_개요.md) - 5분 개요, ROI
- [깃허브_빠른시작.md](깃허브_빠른시작.md) - 30분 설정 가이드

**자동화**:
```bash
bash scripts/setup-github-labels.sh      # 라벨 설정
bash scripts/github-issue-dev.sh 123     # 이슈 작업 시작
```

---

## 🚦 토큰 최적화

1. **미니멀 PRD**: 10분, ~1270 토큰
2. **병렬 호출**: `Read("a.py"), Read("b.py")`
3. **컨텍스트 집중**: 필요한 파일만
4. **Diff 기반**: 변경 부분만

---

## 💡 핵심 원칙

1. **Phase 0부터**: PRD → 개발 순서
2. **PRD 중심**: 커밋마다 `[PRD-####]`
3. **자동화 우선**: 스크립트 활용
4. **병렬 실행**: 독립 작업 동시
5. **Context7 필수**: 외부 기술 전
6. **Playwright 필수**: Phase 5 검증

---

## 📚 참조 문서

**워크플로우**: [깃허브_워크플로우_개요.md](깃허브_워크플로우_개요.md) | [README_GITHUB_WORKFLOW.md](README_GITHUB_WORKFLOW.md)

**Spec Kit**: [docs/SPECKIT_EXECUTIVE_SUMMARY.md](docs/SPECKIT_EXECUTIVE_SUMMARY.md) | [.speckit/constitution.md](.speckit/constitution.md)

**Agent**: [docs/AGENTS_REFERENCE.md](docs/AGENTS_REFERENCE.md)

**공식**: [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | [GitHub Spec Kit](https://github.com/github/spec-kit)

---

## 🎓 Quick Start

**로컬**:
```bash
vim tasks/prds/0001-prd-feature.md
git commit -m "feat: Add feature (v1.0.0) [PRD-0001]"
```

**GitHub** (추천):
```bash
gh issue create --template 01-feature-prd.yml
bash scripts/github-issue-dev.sh 123
git commit -m "feat: Add feature [#123]" && git push
```

---

**v4.8.0** (2025-01-13) - 토큰 최적화: 262→200줄 (-24%), 병렬 Agent 예시 추가

---

*핵심 워크플로우 레퍼런스. 상세: [README.md](README.md), docs/ 폴더*
