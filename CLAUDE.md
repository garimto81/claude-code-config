# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Version**: 5.4.0-Windows | **Platform**: Windows 10/11

## Project Overview

**Claude Code Workflow Configuration** - 개발 워크플로우 및 자동화 도구 메타 레포지토리.
실제 제품 코드가 아닌, **개발 방법론(Workflow)**과 **자동화 스크립트**를 관리합니다.

## Critical Instructions

### Language Rules
- **User-facing**: Korean (한글) - 답변, 문서, 커밋 메시지 설명
- **Technical**: English - 코드, 변수명, 기술 용어

### Path Handling
- ALWAYS use **Absolute Paths** for file operations
- Verify file existence before reading/writing

### Validation (NEVER SKIP)
- Each phase has a strict validator script
- If validation fails, **STOP** and fix before proceeding

## Workflow Pipeline

| Phase | Action | Output | Validator |
| :--- | :--- | :--- | :--- |
| **0** | PRD 작성 | `tasks/prds/NNNN-*.md` | `scripts/validate-phase-0.ps1 NNNN` |
| **0.5** | Task 분해 | `tasks/NNNN-tasks-*.md` | `scripts/validate-phase-0.5.ps1 NNNN` |
| **1** | 구현 + 1:1 테스트 | `src/*`, `tests/*` | `scripts/validate-phase-1.ps1` |
| **2** | 테스트 & 커버리지 | Pass All Tests | `scripts/validate-phase-2.ps1` |
| **2.5** | 코드 리뷰 | Approval | `scripts/validate-phase-2.5.ps1` |
| **3** | 버전 & Changelog | `CHANGELOG.md` | `scripts/validate-phase-3.ps1` |
| **4** | Commit & PR | Git Commit / PR | `scripts/validate-phase-4.ps1` |
| **5** | E2E & Security | Security Report | `scripts/validate-phase-5.ps1` |
| **6** | Deployment | Release | `scripts/validate-phase-6.ps1` |

**Feedback Loop**: Validation 실패 시 현재 Phase의 Action으로 돌아감. 이전 Phase로 회귀 금지.

### Phase 간 데이터 핸드오프
```
Phase 0  → Phase 0.5: tasks/prds/NNNN-prd-*.md (PRD)
Phase 0.5 → Phase 1:  tasks/NNNN-tasks-*.md (Task List)
Phase 1  → Phase 2:   src/* + tests/* (Code + Tests)
Phase 2  → Phase 2.5: Test Results (Pass/Fail)
Phase 2.5 → Phase 3:  Review Approval
Phase 3  → Phase 4:   CHANGELOG.md + Version Tag
Phase 4  → Phase 5:   Git Commit / PR
Phase 5  → Phase 6:   Security Report (Pass)
```

**템플릿 위치**: `.claude-global/templates/`
- PRD: `prds/0000-prd-template.md`
- Tasks: `tasks/0000-tasks-template.md`

## Commands

### Planning (Phase 0-0.5)
```bash
/create-prd           # PRD 생성 (Interactive)
scripts/phase-status.ps1  # 현재 Phase 상태 확인
```

### Aiden 명령어 (프로젝트 관리)
```bash
/aiden-first          # 작업 진행 시 상세 기록 (md 파일)
/aiden-plan           # 서브폴더에 완벽한 기획서(readme.md) 생성
/aiden-update         # GitHub 커밋 + 문서 업데이트 + 푸시
/aiden-summary        # 프로젝트 종합 분석 및 요약 리포트
/aiden-endtoend       # Playwright E2E 테스트 (실패 시 자동 수정 반복)
```

### Development (Phase 1)
```bash
/tdd                  # TDD Red-Green-Refactor
/fix-issue            # GitHub 이슈 해결
/check                # 코드 품질 검사
```

### Testing (Phase 2)
```bash
pytest tests/ -v      # 테스트 실행
python scripts/validate_phase_universal.py 2 --coverage 80  # 커버리지 검증
```

### Code Review (Phase 2.5)
```bash
/pragmatic-code-review    # 코드 품질 리뷰 (Pragmatic Quality 프레임워크)
/design-review            # UI/UX 디자인 리뷰
/check                    # 정적 분석 + 보안 스캔
```

**Phase 2.5 종료 기준**:
- 코드 리뷰 통과 (Critical/High 이슈 없음)
- 보안 취약점 해결 완료
- 디자인 가이드라인 준수 (UI 변경 시)

**리뷰 에이전트**:
- `pragmatic-code-review`: 코드 품질, 아키텍처, 성능
- `design-review`: UI/UX, 접근성, 시각적 일관성
- `security-auditor`: 보안 취약점 분석

### Git Operations (Phase 3-4)
```bash
/commit               # Conventional Commit 생성
/changelog            # CHANGELOG 업데이트
/create-pr            # PR 생성
```

## Architecture

```
.
├── .claude/commands/     # Slash commands (16개)
├── .claude/plugins/      # 플러그인 디렉토리
├── .claude-plugin/       # Plugin registry (registry.json)
├── scripts/              # Validators & Automation (PowerShell/Python)
├── docs/                 # 워크플로우 문서
│   ├── WORKFLOWS/        # 실전 레시피
│   └── GITHUB_WORKFLOW/  # GitHub 연동
└── tasks/
    └── prds/             # PRD 파일들 (NNNN-prd-*.md)
```

## Key Files
- **Plugin Registry**: `.claude-plugin/registry.json` - 플러그인 관리
- **Universal Validator**: `python scripts/validate_phase_universal.py <PHASE> [ARGS]`
- **Phase Status**: `scripts/phase-status.ps1`
