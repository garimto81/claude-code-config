# Claude AI 마스터 개발 가이드
*핵심 워크플로우 & 자동화 규칙*

**버전**: 4.7.0 | **업데이트**: 2025-01-13

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
| 4 | Git | `git commit -m "type: 설명 (v버전) [PRD-####]"` → **자동 PR 생성** |
| 5 | 검증 | **Playwright E2E 필수** - 실제 작동 확인 후 완료 처리 |
| 6 | 캐시 | `Ctrl+Shift+R` 또는 `?v=1.2.3` |

### 🚀 자동 PR/머지 (Phase 4+)

**커밋 후 자동 실행**:
```
커밋 (vX.Y.Z) [PRD-####] → Push → GitHub Actions
→ PR 생성 → CI 테스트 → 자동 머지 → 브랜치 삭제
```

**수동 실행**:
```bash
# PR 생성
bash scripts/create-phase-pr.sh

# Phase 감지 확인
python scripts/check-phase-completion.py HEAD
```

📚 **설정 가이드**: [docs/BRANCH_PROTECTION_GUIDE.md](docs/BRANCH_PROTECTION_GUIDE.md)

---

## 🤖 Subagent & MCP

**Top 5 Agent** (범용):
1. `context7-engineer` (필수) - 외부 기술 최신 문서 검증
2. `playwright-engineer` (필수) - E2E 테스트 및 최종 검증
3. `seq-engineer` (권장) - 복잡한 요구사항 분석
4. `test-automator` (권장) - 단위/통합 테스트 작성
5. `typescript-expert` (권장) - TypeScript 타입 안정성

**MCP**: `sequentialthinking`, `ide`, `github`, `supabase`, `playwright` (Primary) | `context7`, `exa`, `slack` (Secondary)

**핵심 원칙**:
- **Context7 필수**: 외부 라이브러리 사용 전 최신 문서 확인 (Phase 0, 1)
- **Playwright 필수**: E2E 테스트 실행 (Phase 2, 5)
- **병렬 실행**: 독립 작업 동시 호출 (Phase 1 최대 6개, Phase 2 최대 5개)
- **개발 시간 단축**: 병렬 실행으로 평균 64% 절감

📚 **상세 가이드**: [docs/AGENTS_REFERENCE.md](docs/AGENTS_REFERENCE.md)
- 33개 Agent 전체 목록 및 용도
- Phase별 활용법 및 필수 여부
- 병렬 실행 패턴 및 시나리오별 조합
- 시간 단축 효과 분석

---

## 🔧 Agent/Skill 자동 최적화

**자동 분석 시스템**: 커밋 시 Agent/Skill 사용 패턴 분석 및 개선 제안 생성

**작동 방식**:
```
커밋 → Git Hook 실행 → Claude Code 로그 분석
→ 실패 패턴 감지 → Claude API로 프롬프트 개선
→ Git 메타데이터 저장 + 개선 제안 파일 생성
```

**실패 원인 자동 분류**:
- `timeout`: 시간 초과 (→ 타임아웃 값 조정 제안)
- `missing_context`: 컨텍스트 부족 (→ 추가 정보 제공 제안)
- `parameter_error`: 파라미터 오류 (→ 올바른 파라미터 제안)
- `ambiguous_prompt`: 모호한 프롬프트 (→ 명확한 프롬프트 제안)
- `api_error`: API 오류 (→ 재시도 또는 대안 제안)

**출력**:
- `.claude/improvement-suggestions.md`: 개선 제안 (커밋마다 추가)
- Git 커밋 메타데이터: `Agent-Usage: [{"agent":"...","status":"..."}]`

**설정**: `.claude/optimizer-config.json` (활성화/비활성화, Claude API 모델 선택 등)

📚 **상세 가이드**: [docs/AGENT_OPTIMIZER_GUIDE.md](docs/AGENT_OPTIMIZER_GUIDE.md) - 설치, 설정, 문제 해결

---

## 🎓 Skill 활용

**용도**: PDF 변환, Excel 분석, 이미지 압축 등 파일 처리 자동화
**원칙**: Agents 먼저, Skills는 보조 도구

**예시**: `Skill("pdf")` → "PRD-0003을 PDF로 변환"

📚 [Skill 카탈로그](https://docs.anthropic.com/en/docs/claude-code/skills) - 전체 Skills 목록 및 사용법

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

1. **미니멀 PRD**: MINIMAL 가이드 사용 (10분, ~1270 토큰)
2. **병렬 도구 호출**: 독립 작업 동시 실행 (`Read("a.py"), Read("b.py")`)
3. **컨텍스트 집중**: 필요한 파일만 읽기, 전체 탐색 지양
4. **Diff 기반**: 변경된 부분만 전달

---

## 💡 핵심 원칙

1. **Phase 0부터 시작**: PRD → 개발 순서 필수
2. **PRD 중심**: 커밋마다 `[PRD-####]` 참조
3. **자동화 우선**: 스크립트 활용
4. **병렬 실행**: 독립 작업 동시 호출
5. **Context7 검증**: 외부 기술 사용 전 최신 문서 확인 필수
6. **Playwright 검증**: Phase 5에서 실제 작동 확인 후 완료 처리

---

## 📚 참조 문서

### 워크플로우
- [깃허브_워크플로우_개요.md](깃허브_워크플로우_개요.md) - GitHub 네이티브 개발
- [README_GITHUB_WORKFLOW.md](README_GITHUB_WORKFLOW.md) - 문서 네비게이션

### Spec Kit
- [docs/SPECKIT_EXECUTIVE_SUMMARY.md](docs/SPECKIT_EXECUTIVE_SUMMARY.md) - 5분 개요
- [.speckit/constitution.md](.speckit/constitution.md) - Constitution 템플릿

### Agent
- [docs/AGENTS_REFERENCE.md](docs/AGENTS_REFERENCE.md) - 33개 Agent 완전 가이드 & 병렬 실행 패턴

### 공식 문서
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [GitHub Spec Kit](https://github.com/github/spec-kit)

---

## 🎓 Quick Start

### 로컬 PRD 방식
```bash
# 1. PRD 작성 → 2. Task List 생성 → 3. 개발 & 테스트
vim tasks/prds/0001-prd-feature.md
git commit -m "feat: Add feature (v1.0.0) [PRD-0001]"
```

### GitHub 네이티브 방식 (추천)
**차이점**: PRD를 GitHub Issue로 작성
```bash
gh issue create --template 01-feature-prd.yml
bash scripts/github-issue-dev.sh 123  # 자동 브랜치 생성 & 라벨링
git commit -m "feat: Add feature [#123]" && git push
```

📚 [깃허브_빠른시작.md](깃허브_빠른시작.md) - 30분 설정 가이드

---

## 📋 변경 이력

**현재 버전**: v4.7.0 (2025-01-13)

**주요 변경**: Agent/Skill 자동 최적화 섹션 추가 (+29줄), Git Hooks 기반 사후 분석 시스템 문서화

📚 **전체 이력**: `git log --oneline CLAUDE.md`

---

*이 문서는 Claude Code 작업의 핵심 워크플로우만 담았습니다.*
*상세 내용은 [README.md](README.md) 및 docs/ 폴더 참조.*
