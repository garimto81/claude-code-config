# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Critical Instructions

### Core Rules
1. **Language**: User-facing output in Korean (한글). Technical terms (code, variables, GitHub) in English.
2. **Path Handling**: ALWAYS use absolute paths. Verify file existence before read/write.
3. **Validation**: NEVER skip phase validation. If validation fails, STOP and fix before proceeding.

### Project Context
- **Root**: `D:\AI\claude01`
- **Identity**: Meta-workflow system for Claude Code (methodology + automation tools, not product code)
- **Plugin Registry**: `.claude-plugin/registry.json`

---

## 2. Build & Test Commands

```powershell
# Run tests
pytest tests/ -v

# Run tests with coverage
pytest tests/ -v --cov=.claude/scripts --cov-report=term

# Run single test file
pytest tests/test_specific.py -v

# Phase validation (PowerShell - preferred on Windows)
.\scripts\validate-phase-0.ps1 NNNN    # PRD validation
.\scripts\validate-phase-0.5.ps1 NNNN  # Task list validation
.\scripts\validate-phase-1.ps1         # 1:1 test pairing check
.\scripts\validate-phase-2.ps1         # Test execution
.\scripts\validate-phase-3.ps1 v1.2.0  # Version & changelog
.\scripts\validate-phase-4.ps1         # Git ops validation
.\scripts\validate-phase-5.ps1         # E2E & security
.\scripts\validate-phase-6.ps1         # Deployment readiness

# Universal validator (Python - cross-platform)
python scripts/validate_phase_universal.py <phase> [args]
python scripts/validate_phase_universal.py 0 0001
python scripts/validate_phase_universal.py 2 --coverage 80

# Phase status check
.\scripts\phase-status.ps1

# Plugin management
python scripts/plugin_manager.py
```

---

## 3. Workflow Pipeline

Strict phase-gate workflow. Each phase must pass validation before proceeding.

| Phase | Action | Output | Validator |
| :--- | :--- | :--- | :--- |
| **0** | PRD Creation (8 sections) | `tasks/prds/NNNN-*.md` | `validate-phase-0.ps1 NNNN` |
| **0.5** | Task Breakdown | `tasks/NNNN-tasks-*.md` | `validate-phase-0.5.ps1 NNNN` |
| **1** | Implementation + 1:1 tests | `src/*`, `tests/*` | `validate-phase-1.ps1` |
| **2** | Test & Coverage | All tests pass | `validate-phase-2.ps1` |
| **2.5** | Code Review | Approval | `/pragmatic-code-review` (slash cmd) |
| **3** | Version Bump | `CHANGELOG.md` | `validate-phase-3.ps1 vX.Y.Z` |
| **4** | Git Commit/PR | PR Created | `validate-phase-4.ps1` |
| **5** | E2E & Security | Security Report | `validate-phase-5.ps1` |
| **6** | Deployment | Released | `validate-phase-6.ps1` |

> If validation fails, fix in current phase. Do not regress to previous phases.

---

## 4. Slash Commands

Available in `.claude/commands/`:

| Command | Purpose |
| :--- | :--- |
| `/create-prd` | Interactive PRD creation (Phase 0) |
| `/tdd` | TDD workflow - test first (Phase 1) |
| `/fix-issue` | Structured bug fix workflow |
| `/check` | Code quality checks |
| `/commit` | Conventional commit with emoji |
| `/changelog` | Update CHANGELOG.md |
| `/create-pr` | Create GitHub PR |
| `/create-docs` | Generate documentation |
| `/analyze-code` | Generate Mermaid class diagram |
| `/optimize` | Performance analysis |
| `/todo` | Manage project todos |
| `/issue` | **[Multi-Agent]** 병렬 솔루션 검색 |
| `/issue-update` | 실패 분석 및 새 해결책 제안 |
| `/search` | 웹/GitHub 검색 및 추천 |
| `/parallel-research` | **[Multi-Agent]** 병렬 리서치 |
| `/parallel-review` | **[Multi-Agent]** 4-에이전트 코드 리뷰 |

---

## 5. Architecture

This is a **monorepo** containing multiple sub-projects with a shared workflow system:

```
D:\AI\claude01\
├── .claude/              # Claude Code extensions
│   ├── commands/         # Slash commands (*.md)
│   ├── skills/           # Skills (skill-creator, webapp-testing)
│   ├── hooks/            # Git hooks (pre-commit, post-commit)
│   └── settings.json     # Claude Code settings
├── .claude-plugin/       # Plugin registry
├── scripts/              # Phase validators (PowerShell + Python)
├── tasks/                # PRDs and task lists
│   └── prds/             # Product Requirement Documents
├── tests/                # Pytest test suite
├── docs/                 # Documentation (guides, workflows)
│   ├── WORKFLOWS/        # Workflow recipes
│   └── GITHUB_WORKFLOW/  # GitHub integration guides
└── [sub-projects]/       # Independent projects (archive-analyzer, backend, frontend, etc.)
```

### Key Sub-Projects
- `archive-analyzer/` - Media archive analysis tools
- `backend/`, `frontend/` - Web application components
- `man_subclip/` - Subtitle/clip management
- `sso-system/` - SSO authentication system

---

## 6. GitHub Integration

```powershell
# Setup labels for repository
.\scripts\setup-github-labels.ps1

# Start work on issue (creates branch + draft PR)
.\scripts\github-issue-dev.ps1 <issue-number>
```

---

## 7. Multi-Agent System

병렬 멀티에이전트 워크플로우 (LangGraph + Claude Agent SDK):

```python
# 병렬 태스크 실행
from src.agents.parallel_workflow import run_parallel_task
result = run_parallel_task("프로젝트 분석", num_agents=3)

# Phase 병렬 검증
python src/agents/phase_validator.py 0 0.5 1 2
```

| 모듈 | 설명 |
| :--- | :--- |
| `src/agents/parallel_workflow.py` | LangGraph Fan-Out/Fan-In 워크플로우 |
| `src/agents/phase_validator.py` | Phase 병렬 검증기 |
| `src/agents/config.py` | 모델 티어링, Phase 에이전트 매핑 |

상세 가이드: `docs/guides/MULTI_AGENT_GUIDE.md`

---

## 8. Quick Reference

- **Bypass Mode**: `.\start-claude-bypass.bat` (skips permission prompts)
- **Python**: 3.11+ required
- **Test markers**: `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.slow`
- **Multi-Agent**: `langgraph`, `langchain-anthropic` 필요
