# Plugin Coordination Guide

**Version**: 5.4.0 | **Updated**: 2025-12-03

플러그인 간 상호작용 및 Phase별 조정 가이드.

---

## Overview

현재 등록된 플러그인: 8개
- Upstream (외부): 5개
- Local (Phase별): 3개

---

## Plugin-Phase 매핑

| Phase | Plugin | 주요 에이전트 |
|-------|--------|--------------|
| 0 | phase-0-planning | context7-engineer, seq-engineer |
| 0.5 | phase-0-planning | task-decomposition |
| 1 | phase-1-development | backend-architect, frontend-developer, fullstack-developer |
| 2 | phase-2-testing | test-automator, playwright-engineer |
| 2.5 | workflow-reviews | pragmatic-code-review, design-review |
| 3 | - | code-reviewer (phase-2-testing) |
| 4 | - | github-engineer (specialized-tools) |
| 5 | phase-2-testing | security-auditor, performance-engineer |
| 6 | - | deployment-engineer (external) |

---

## Plugin 의존성 그래프

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 0-0.5          Phase 1            Phase 2-2.5        │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐    │
│  │ phase-0-     │    │ phase-1-     │   │ phase-2-     │    │
│  │ planning     │───▶│ development  │──▶│ testing      │    │
│  └──────────────┘    └──────────────┘   └──────────────┘    │
│         │                   │                  │             │
│         ▼                   ▼                  ▼             │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐    │
│  │ meta-        │    │ debugging-   │   │ workflow-    │    │
│  │ development  │    │ toolkit      │   │ reviews      │    │
│  └──────────────┘    └──────────────┘   └──────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  SUPPORTING PLUGINS (Cross-Phase)                            │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │ python-      │    │ javascript-  │                       │
│  │ development  │    │ typescript   │                       │
│  └──────────────┘    └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 에이전트 오케스트레이션

### 순차 실행 (Sequential)
```
Phase 4: github-engineer → code-reviewer
Phase 6: cloud-architect → deployment-engineer
```

### 병렬 실행 (Parallel)
```
Phase 0:   context7-engineer ∥ seq-engineer ∥ architect-reviewer
Phase 2:   test-automator ∥ playwright-engineer
Phase 2.5: pragmatic-code-review ∥ security-auditor
Phase 5:   playwright-engineer ∥ security-auditor ∥ performance-engineer
```

---

## 멀티 플러그인 워크플로우 예시

### 예시 1: 새 기능 개발 (Full-Stack)

```bash
# Phase 0: 기획
/create-prd oauth-login
# 사용 플러그인: phase-0-planning
# 사용 에이전트: context7-engineer (문서 검색)

# Phase 0.5: Task 분해
"PRD 읽고 Task List 작성해줘"
# 사용 플러그인: phase-0-planning
# 사용 에이전트: task-decomposition

# Phase 1: 구현
"Task 1.1 백엔드 API 구현해줘"
# 사용 플러그인: phase-1-development, python-development
# 사용 에이전트: backend-architect

"Task 1.2 프론트엔드 구현해줘"
# 사용 플러그인: phase-1-development, javascript-typescript
# 사용 에이전트: frontend-developer

# Phase 2: 테스트
"유닛 테스트 작성해줘"
# 사용 플러그인: phase-2-testing
# 사용 에이전트: test-automator (병렬 실행)

# Phase 2.5: 리뷰
/pragmatic-code-review
# 사용 플러그인: workflow-reviews
# 사용 에이전트: pragmatic-code-review, security-auditor (병렬)

# Phase 3-4: 버전 & 커밋
/changelog
/commit
/create-pr

# Phase 5: E2E & 보안
/aiden-endtoend
# 사용 플러그인: phase-2-testing
# 사용 에이전트: playwright-engineer, security-auditor (병렬)
```

### 예시 2: 버그 수정 (Quick Fix)

```bash
# Phase 1: 디버깅
"TypeError 에러 고쳐줘"
# 사용 플러그인: debugging-toolkit
# 사용 에이전트: debugger

# Phase 2: 테스트 추가
"회귀 테스트 추가해줘"
# 사용 플러그인: phase-2-testing
# 사용 에이전트: test-automator

# Phase 3-4: 커밋
/commit
```

---

## 플러그인 우선순위

동일 기능 제공 시 우선순위:

1. **Phase별 플러그인** (phase-0, phase-1, phase-2)
2. **Workflow 플러그인** (workflow-reviews)
3. **언어별 플러그인** (python-development, javascript-typescript)
4. **도구 플러그인** (debugging-toolkit)

---

## 플러그인 설정

### registry.json 구조
```json
{
  "version": "5.4.0",
  "plugins": [
    {
      "id": "plugin-name",
      "version": "X.Y.Z",
      "status": "active",        // active | deprecated | disabled
      "localPath": ".claude/plugins/plugin-name"
    }
  ],
  "settings": {
    "autoCheckUpdates": false,
    "preferLocalChanges": true
  }
}
```

### 플러그인 관리 명령어
```bash
# 플러그인 목록 확인
python scripts/plugin_manager.py list

# 플러그인 상태 확인
python scripts/plugin_manager.py status <plugin-id>

# 플러그인 업데이트 (upstream)
python scripts/plugin_manager.py update <plugin-id>
```

---

## 주의사항

### 플러그인 충돌 방지
- 동일 에이전트가 여러 플러그인에 존재할 경우, Phase별 플러그인 우선
- `preferLocalChanges: true` 설정으로 로컬 수정사항 유지

### 성능 최적화
- Phase별로 필요한 플러그인만 로드
- 토큰 사용량: 전체 로드 시 40,000+ → Phase별 로드 시 2,000 (95% 절감)

### 확장 가이드
새 플러그인 추가 시:
1. `.claude/plugins/<plugin-name>/` 디렉토리 생성
2. `agents/`, `commands/`, `context/` 하위 디렉토리 구성
3. `.claude-plugin/registry.json`에 등록

---

## Related Documentation

- **[CLAUDE.md](../CLAUDE.md)** - Workflow Pipeline
- **[PHASE_AGENT_MAPPING.md](PHASE_AGENT_MAPPING.md)** - Phase별 에이전트
- **[PLUGIN_SYSTEM_GUIDE.md](PLUGIN_SYSTEM_GUIDE.md)** - 플러그인 시스템 상세

---

**Maintained By**: Claude Code + garimto81
