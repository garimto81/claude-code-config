# Phase-Specific Agent Mapping Guide

**Version**: 5.4.0 | **Updated**: 2025-12-03

Complete guide for selecting optimal agents for each phase of the development cycle.

---

## Overview

This document provides detailed agent selection guidance for **all phases (0-6)** of the development workflow.

**Quick Reference**:
- **Phase 0**: PRD 작성 & 요구사항 분석
- **Phase 0.5**: Task 분해 & 계획
- **Phase 1**: 구현 (코드 + 테스트)
- **Phase 2**: 테스트 실행 & 커버리지
- **Phase 2.5**: 코드 리뷰 & 품질 검증
- **Phase 3**: Versioning & Release Tagging
- **Phase 4**: Git + Automated PR/Merge
- **Phase 5**: E2E Testing & Security Validation
- **Phase 6**: Production Deployment

---

## Phase 0: PRD 작성

### context7-engineer (Required)
**Success Rate**: 100% | **Grade**: S | **Model**: Sonnet

**Use for**:
- 최신 라이브러리/프레임워크 문서 검색
- API 문서 검증
- 기술 스택 최신 정보 확인

**Timing**: PRD 작성 시작 전 기술 조사

### seq-engineer (Recommended)
**Model**: Sonnet

**Use for**:
- 요구사항 분석 및 구조화
- 시퀀스 다이어그램 생성
- 시스템 흐름 설계

**Timing**: context7-engineer 이후

### architect-reviewer (Optional)
**Model**: Sonnet

**Use for**:
- 아키텍처 결정 검토
- 기술 부채 예방
- 확장성 검증

**Timing**: PRD 초안 완성 후 검토

---

## Phase 0.5: Task 분해

### task-decomposition (Required)
**Model**: Haiku

**Use for**:
- PRD → Task List 변환
- 작업 의존성 파악
- 우선순위 결정

**Timing**: Phase 0 완료 직후

### taskmanager-planner (Recommended)
**Model**: Haiku

**Use for**:
- Task 세분화 (1-2시간 단위)
- 체크리스트 생성
- 진행률 추적 구조 설계

**Timing**: task-decomposition과 병렬 실행 가능

---

## Phase 1: 구현

### backend-architect (Conditional)
**Grade**: A | **Model**: Sonnet

**Use for**:
- API 설계 및 구현
- 데이터베이스 스키마 설계
- 서버 로직 구현

**Trigger**: 백엔드 작업 시

### frontend-developer (Conditional)
**Grade**: A | **Model**: Sonnet

**Use for**:
- UI 컴포넌트 구현
- 상태 관리 설계
- 반응형 디자인

**Trigger**: 프론트엔드 작업 시

### fullstack-developer (Recommended)
**Grade**: A | **Model**: Sonnet

**Use for**:
- 풀스택 기능 구현
- API-UI 연동
- 통합 로직

**Timing**: 대부분의 기능 구현에 적합

### debugger (Required for bugs)
**Success Rate**: 81% | **Grade**: A | **Model**: Sonnet

**Use for**:
- TypeError, ValueError 등 에러 수정
- 런타임 오류 디버깅
- 로직 오류 추적

**Trigger**: 에러 발생 시 자동 선택

---

## Phase 2: 테스트

### test-automator (Required)
**Success Rate**: 100% | **Grade**: S | **Model**: Sonnet

**Use for**:
- 유닛 테스트 자동 생성
- 테스트 케이스 설계
- 모킹 및 픽스처 설정

**Timing**: 구현 완료 후 즉시 (1:1 pairing)

### playwright-engineer (Conditional)
**Success Rate**: 63% | **Model**: Sonnet

**Use for**:
- E2E 테스트 작성
- 브라우저 자동화 테스트
- 사용자 플로우 검증

**Trigger**: UI 기능 테스트 필요 시

**Known Issues**: 복잡한 플로우에서 45초 이상 소요될 수 있음

---

## Phase 2.5: 코드 리뷰

### pragmatic-code-review (Required)
**Success Rate**: 100% | **Grade**: S | **Model**: Sonnet

**Use for**:
- 코드 품질 리뷰
- 아키텍처 일관성 검토
- 성능 이슈 식별
- 베스트 프랙티스 준수 확인

**Timing**: Phase 2 테스트 통과 후

**Command**: `/pragmatic-code-review`

### design-review (Conditional)
**Model**: Sonnet

**Use for**:
- UI/UX 디자인 리뷰
- 접근성 검증
- 시각적 일관성 확인

**Trigger**: UI 변경이 포함된 경우

**Command**: `/design-review`

### security-auditor (Recommended)
**Success Rate**: 100% | **Grade**: S | **Model**: Sonnet

**Use for**:
- 보안 취약점 사전 검토
- OWASP Top 10 체크
- 의존성 취약점 스캔

**Timing**: 코드 리뷰와 병렬 실행

---

## Phase 3: Versioning

### code-reviewer (Required)
**Success Rate**: 100% | **Grade**: S | **Model**: Sonnet

**Use for**:
- Final code quality check before release
- Pre-release code review
- Architecture consistency validation
- Best practice adherence

**Timing**: After all tests pass, before creating git tag

**Output**: Review report for CHANGELOG.md

### github-engineer (Recommended)
**Model**: Haiku

**Use for**:
- Semantic version validation
- Git tag creation with proper annotations
- CHANGELOG.md formatting

**Timing**: After code-reviewer approval

---

## Phase 4: Git + PR Automation

### github-engineer (Required)
**Model**: Haiku

**Use for**:
- Automated PR creation from feature branch
- PR description generation
- Branch management

**Timing**: After Phase 3 tag creation

**Note**: Mostly automated via `.github/workflows/auto-pr-merge.yml`

### code-reviewer (Optional)
**Model**: Sonnet

**Use for**:
- Final PR review before merge
- Cross-file impact analysis
- Merge conflict resolution suggestions

---

## Phase 5: E2E & Security Testing

### playwright-engineer (Required)
**Success Rate**: 63% (improving) | **Model**: Sonnet

**Use for**:
- User flow testing (login, checkout, critical paths)
- Cross-browser validation (Chrome, Firefox, Safari)
- Visual regression testing

**Known Issues**:
- ⚠️ Timeout on complex flows (>45s)

**Best Practice**: Break long flows into smaller tests

**Timing**: Run in parallel with security-auditor

### security-auditor (Required)
**Success Rate**: 100% | **Grade**: S | **Model**: Sonnet

**Use for**:
- OWASP Top 10 compliance check
- Dependency vulnerability scan
- SQL injection/XSS prevention validation

**Timing**: Run in parallel with playwright-engineer

**Blocker**: Critical vulnerabilities must be fixed before Phase 6

### performance-engineer (Recommended)
**Grade**: A | **Model**: Sonnet

**Use for**:
- Load testing (1000+ concurrent users)
- Database query optimization
- Memory leak detection
- API response time benchmarking (<500ms target)

**Timing**: Run after E2E tests pass

### database-optimizer (Conditional)
**Model**: Sonnet

**Use for**:
- Slow query optimization (>100ms)
- Index recommendations
- Connection pool tuning

**Trigger**: Use ONLY if performance-engineer identifies DB bottlenecks

---

## Phase 6: Production Deployment

### deployment-engineer (Required)
**Grade**: A | **Model**: Haiku

**Use for**:
- Docker image build and optimization
- Kubernetes manifest creation
- CI/CD pipeline configuration
- Deployment script generation

**Timing**: After all Phase 5 checks pass

**Output**: Deployment commands, rollback plan

### cloud-architect (Recommended for first deployment)
**Model**: Sonnet

**Use for**:
- AWS/GCP/Azure resource provisioning
- Load balancer configuration
- Auto-scaling setup
- Cost optimization

**Timing**: Before deployment-engineer (infrastructure must exist first)

### devops-troubleshooter (Emergency use only)
**Model**: Sonnet

**Use for**:
- Deployment failure diagnosis
- Log analysis for errors
- Rollback execution
- Root cause analysis

**Trigger**: Use ONLY when deployment fails or production incidents occur

---

## Phase-Agent Summary Table

| Phase | Required Agents | Optional Agents | Parallel Execution |
|-------|----------------|-----------------|-------------------|
| 0 | context7-engineer, seq-engineer | architect-reviewer, exa-search | ✅ All |
| 0.5 | task-decomposition | taskmanager-planner | ✅ Both |
| 1 | debugger | backend-architect, frontend-developer, fullstack-developer | ✅ Most (exclude debugger) |
| 2 | test-automator, playwright-engineer | code-reviewer, security-auditor | ✅ All |
| 3 | code-reviewer, github-engineer | None | ✅ Both |
| 4 | github-engineer | code-reviewer | ❌ Sequential (github-engineer first) |
| 5 | playwright-engineer, security-auditor | performance-engineer, database-optimizer | ✅ All |
| 6 | deployment-engineer | cloud-architect, devops-troubleshooter | ⚠️ cloud-architect first, then deployment-engineer |

---

## Key Insights

### Parallel Execution Strategy
- **Always parallel**: Phase 0, 0.5, 2, 3, 5 (max time savings)
- **Sequential required**: Phase 4 (github-engineer creates PR, then code-reviewer reviews)
- **Conditional parallel**: Phase 6 (cloud-architect sets up infrastructure, then deployment-engineer deploys)
- **Emergency only**: devops-troubleshooter (production incidents)

### Performance Metrics
- **Token Savings**: 89.9% average vs loading all 33 agents
- **Measurement**: Run `python scripts/measure-token-usage.py --all`

---

## Related Documentation

- **[CLAUDE.md](../CLAUDE.md)** - Main workflow guide (Phase 0-2)
- **[AGENT_USAGE_BEST_PRACTICES.md](AGENT_USAGE_BEST_PRACTICES.md)** - Detailed agent-task mapping rules
- **[AGENTS_REFERENCE.md](AGENTS_REFERENCE.md)** - Complete agent catalog (122+ agents)

---

**Maintained By**: Claude Code + garimto81
**Repository**: https://github.com/garimto81/claude-code-config
