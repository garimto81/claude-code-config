# Aiden 명령어 종합 가이드

**Version**: 5.4.0 | **Updated**: 2025-12-03

Aiden은 프로젝트 관리 및 자동화를 위한 명령어 세트입니다.

---

## 개요

Aiden 명령어는 프로젝트 전체 라이프사이클을 지원합니다:

```
/aiden-plan → /aiden-first → [개발] → /aiden-update → /aiden-summary → /aiden-endtoend
```

---

## 명령어 상세

### /aiden-plan
**목적**: 프로젝트 기획서 생성

**기능**:
- 서브폴더 생성
- 완벽한 기획서 (readme.md) 작성
- 단계적, 체계적 계획 수립

**사용 시점**: 새 프로젝트/기능 시작 시

**예시**:
```
/aiden-plan
→ 새 프로젝트 폴더와 상세 기획서 생성
```

---

### /aiden-first
**목적**: 작업 진행 상황 상세 기록

**기능**:
- 모든 작업 내용을 md 파일에 자세히 기술
- 나중에 이해하기 쉽도록 설계
- 꼼꼼하고 자세한 기록

**사용 시점**: 작업 진행 중 지속적으로

**예시**:
```
/aiden-first
→ 현재 진행 중인 작업을 문서화
```

---

### /aiden-update
**목적**: GitHub 동기화

**기능**:
1. 모든 변경사항 커밋
2. README.md 및 관련 문서 업데이트
3. GitHub에 푸시

**사용 시점**: 작업 완료 후 저장소 동기화 시

**예시**:
```
/aiden-update
→ 변경사항 커밋 + 문서 업데이트 + 푸시
```

---

### /aiden-summary
**목적**: 프로젝트 종합 분석 및 요약

**기능**:
1. **Discovery & Inventory**
   - 전체 파일 시스템 스캔
   - 문서 분석 (README, API docs)
   - 설정/메타데이터 검토

2. **Deep Technical Analysis**
   - 아키텍처 식별
   - 기술 스택 평가
   - 코드 품질 & 패턴

3. **Contextual Understanding**
   - 비즈니스 로직 추출
   - 개발 라이프사이클 분석
   - 통합 & 에코시스템

4. **Summary Construction**
   - Executive Summary
   - Core Components
   - Key Features
   - Insights & Observations

**사용 시점**: 프로젝트 이해/온보딩 시

**출력**: 종합 Markdown 리포트

---

### /aiden-endtoend
**목적**: E2E 테스트 자동화

**기능**:
1. Playwright MCP를 사용하여 E2E 테스트 실행
2. 모든 기능과 동작 검증
3. 실패 시:
   - 적절한 하위 에이전트 고용
   - 문제 원인 분석
   - 해결책 제안 및 적용
   - 재테스트
4. 모든 테스트 통과 시 보고

**사용 시점**: Phase 5 (E2E & Security) 단계

**예시**:
```
/aiden-endtoend
→ E2E 테스트 실행 → 실패 시 자동 수정 → 재실행 반복
```

---

## 워크플로우 통합

### 새 기능 개발 플로우

```
1. /aiden-plan          # 기획서 생성
2. /create-prd          # PRD 작성 (Phase 0)
3. /aiden-first         # 작업 기록 시작
4. [구현 작업]           # Phase 1-2
5. /aiden-update        # 중간 저장
6. /pragmatic-code-review  # Phase 2.5
7. /aiden-endtoend      # Phase 5
8. /aiden-summary       # 최종 요약
```

### 기존 프로젝트 분석 플로우

```
1. /aiden-summary       # 프로젝트 이해
2. /aiden-first         # 분석 내용 기록
3. [개선 작업]
4. /aiden-update        # 변경사항 동기화
```

---

## Phase 매핑

| 명령어 | Phase | 용도 |
|--------|-------|------|
| /aiden-plan | Phase 0 | 기획 |
| /aiden-first | Phase 1-2 | 문서화 |
| /aiden-update | Phase 4 | Git 동기화 |
| /aiden-summary | All | 분석 |
| /aiden-endtoend | Phase 5 | E2E 테스트 |

---

## 관련 명령어

| 명령어 | 설명 |
|--------|------|
| /create-prd | PRD 생성 |
| /commit | 커밋 생성 |
| /create-pr | PR 생성 |
| /pragmatic-code-review | 코드 리뷰 |

---

## 팁

### 효과적인 사용

1. **프로젝트 시작**: `/aiden-plan` → `/create-prd`
2. **작업 중**: `/aiden-first`로 지속적 기록
3. **저장점**: `/aiden-update`로 주기적 동기화
4. **완료 시**: `/aiden-summary`로 문서화

### 주의사항

- `/aiden-update`는 모든 변경사항을 커밋하므로 주의
- `/aiden-endtoend`는 Playwright MCP 설정 필요
- `/aiden-summary`는 대규모 프로젝트에서 시간이 걸릴 수 있음

---

**Maintained By**: Claude Code + garimto81
