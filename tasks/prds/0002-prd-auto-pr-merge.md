# PRD-0002: 자동 PR 생성 및 머지 시스템

**작성일**: 2025-01-13
**버전**: 1.0.0
**타입**: Feature
**우선순위**: High

---

## 1. 개요

Phase 1-6 각 단계 완료 시 자동으로 GitHub PR을 생성하고, CI 테스트 통과 시 자동 머지하는 워크플로우 구축.

---

## 2. 배경 및 목표

### 문제
- 수동 PR 생성/머지 반복 작업으로 개발 속도 저하
- Phase 완료 후 PR 생성 누락 가능성
- 일관성 없는 PR 템플릿 및 커밋 메시지

### 목표
- Phase 완료 시 자동 PR 생성으로 워크플로우 자동화
- CI 테스트 통과 시 즉시 머지하여 배포 속도 향상
- 표준화된 PR 템플릿 및 안전장치 적용

---

## 3. 요구사항

### 3.1 기능 요구사항

#### FR-1: Phase 완료 감지
- Phase 1-6 각 단계 완료를 자동 감지
- 감지 방법: 커밋 메시지 패턴 분석 (`(vX.Y.Z) [PRD-####]`)
- 또는 Todo List 완료 상태 확인

#### FR-2: 자동 PR 생성
- 브랜치명 규칙: `feature/PRD-NNNN-phase-N`
- PR 제목: `[PRD-NNNN] Phase N: {작업 요약}`
- PR 본문 자동 생성:
  - Phase 완료 요약
  - 변경 파일 목록
  - 테스트 결과 링크
  - 관련 PRD 참조

#### FR-3: 자동 머지
- 트리거: CI 테스트 통과 (pytest, npm test 등)
- 머지 전 체크:
  - 모든 CI 통과 확인
  - 머지 충돌 없음
  - 브랜치 보호 규칙 준수
- 머지 방식: Squash merge (기본)
- 머지 후: 브랜치 자동 삭제

#### FR-4: 알림
- PR 생성 시: Slack/Discord 알림 (옵션)
- 머지 완료 시: 요약 알림
- 실패 시: 에러 로그 및 수동 처리 가이드

### 3.2 비기능 요구사항

#### NFR-1: 안전성
- main 브랜치 직접 푸시 차단 (Branch Protection)
- 테스트 실패 시 머지 중단
- 충돌 발생 시 수동 처리 요청

#### NFR-2: 성능
- PR 생성: 커밋 후 30초 이내
- 테스트 → 머지: 5분 이내 (테스트 시간 제외)

#### NFR-3: 확장성
- 다양한 Phase 타입 지원 (Feature, Bugfix, Docs)
- 커스텀 머지 규칙 설정 가능

---

## 4. 기술 스택

- **CI/CD**: GitHub Actions
- **PR 관리**: GitHub CLI (`gh`)
- **테스트**: pytest (Python), npm test (Node.js)
- **알림**: GitHub API (기본), Slack Webhook (옵션)

---

## 5. 구현 계획

### 5.1 핵심 컴포넌트

#### 1) GitHub Actions Workflow
- `.github/workflows/auto-pr-merge.yml`
- 트리거: `push` to feature branches
- 작업:
  1. Phase 완료 감지
  2. PR 생성 (없으면)
  3. CI 테스트 실행
  4. 테스트 통과 시 자동 머지

#### 2) PR 템플릿
- `.github/pull_request_template.md`
- Phase별 체크리스트 자동 생성

#### 3) 헬퍼 스크립트
- `scripts/create-phase-pr.sh`: PR 생성 로직
- `scripts/check-phase-completion.py`: Phase 완료 검증

### 5.2 워크플로우

```
[Phase N 완료]
→ git push
→ GitHub Actions 트리거
→ Phase 감지 & PR 생성
→ CI 테스트 실행 (pytest, eslint 등)
→ 테스트 통과 시 자동 머지
→ 브랜치 삭제 & 알림
```

---

## 6. 테스트 계획

### 6.1 단위 테스트
- `tests/test_phase_detection.py`: Phase 감지 로직
- `tests/test_pr_creation.py`: PR 생성 함수

### 6.2 통합 테스트
- 실제 GitHub 저장소에서 end-to-end 테스트
- 다양한 Phase 시나리오 검증

### 6.3 E2E 테스트 (Playwright)
- PR 생성 → 머지 전체 플로우 자동화 테스트

---

## 7. 보안 고려사항

- **GitHub Token**: Repository secrets에 저장 (`GH_TOKEN`)
- **권한 범위**: 최소 권한 원칙 (PR 생성/머지만)
- **Branch Protection**: main 브랜치 직접 푸시 차단
- **Audit Log**: 모든 자동 머지 로그 기록

---

## 8. 제약사항 및 리스크

### 제약사항
- GitHub Actions 무료 tier: 월 2000분 (약 33시간)
- Private 저장소: 제한된 동시 실행

### 리스크
- 테스트 오류 미감지 시 자동 머지 위험 → CI 강화로 완화
- 네트워크 장애 시 워크플로우 중단 → Retry 로직 추가

---

## 9. 성공 지표

- Phase 완료 후 PR 생성 시간: 평균 30초 이내
- 자동 머지 성공률: 95% 이상
- 수동 개입 감소율: 80% 이상

---

## 10. 향후 확장

- [ ] Slack/Discord 알림 통합
- [ ] 다중 저장소 지원
- [ ] AI 기반 PR 리뷰 자동화 (Context7)
- [ ] 롤백 자동화

---

## 참조

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Branch Protection 가이드](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- CLAUDE.md Phase 4-5 규칙
