# Tasks for PRD-0002: 자동 PR 생성 및 머지 시스템

**PRD**: tasks/prds/0002-prd-auto-pr-merge.md
**생성일**: 2025-01-13
**버전**: 1.0.0

---

## Parent Tasks (Phase 1-6)

### Task 0.0: Feature Branch 생성
- [ ] 0.0.1 브랜치 생성: `feature/PRD-0002-auto-pr-merge`
- [ ] 0.0.2 로컬 환경 설정 확인

### Task 1.0: GitHub Actions 워크플로우 구현
- [ ] 1.1 `.github/workflows/auto-pr-merge.yml` 작성
- [ ] 1.2 Phase 완료 감지 로직 구현
- [ ] 1.3 PR 자동 생성 로직 구현
- [ ] 1.4 자동 머지 로직 구현

### Task 2.0: Phase 감지 스크립트 구현
- [ ] 2.1 `scripts/check-phase-completion.py` 작성
- [ ] 2.2 커밋 메시지 패턴 파싱 로직
- [ ] 2.3 Todo List 완료 상태 확인 로직

### Task 3.0: PR 생성 헬퍼 스크립트 구현
- [ ] 3.1 `scripts/create-phase-pr.sh` 작성
- [ ] 3.2 PR 템플릿 동적 생성 로직
- [ ] 3.3 브랜치명/PR 제목 자동 생성

### Task 4.0: Branch Protection 설정
- [ ] 4.1 GitHub Repository Settings 문서화
- [ ] 4.2 Branch Protection 규칙 정의
- [ ] 4.3 CI 필수 체크 설정 가이드

### Task 5.0: PR 템플릿 작성
- [ ] 5.1 `.github/pull_request_template.md` 작성
- [ ] 5.2 Phase별 체크리스트 템플릿
- [ ] 5.3 관련 PRD 자동 링크 로직

### Task 6.0: 테스트 구현
- [ ] 6.1 `tests/test_phase_detection.py` 작성
- [ ] 6.2 `tests/test_pr_creation.py` 작성
- [ ] 6.3 통합 테스트 시나리오 작성

### Task 7.0: 문서 업데이트
- [ ] 7.1 CLAUDE.md Phase 4-5 섹션 업데이트
- [ ] 7.2 README.md에 자동 PR 워크플로우 설명 추가
- [ ] 7.3 사용 가이드 문서 작성 (`docs/AUTO_PR_GUIDE.md`)

### Task 8.0: E2E 테스트 (Playwright)
- [ ] 8.1 전체 워크플로우 E2E 테스트
- [ ] 8.2 실제 GitHub 저장소에서 검증
- [ ] 8.3 다양한 Phase 시나리오 테스트

### Task 9.0: 버전 관리 및 Git
- [ ] 9.1 버전 업데이트 (v1.1.0)
- [ ] 9.2 변경사항 커밋
- [ ] 9.3 PR 생성 (수동, 이번만)

---

## 진행 상태

**총 Parent Tasks**: 10개
**완료**: 0개
**진행률**: 0%

---

## Sub-Tasks

> 사용자 승인 후 각 Parent Task의 상세 Sub-Tasks를 생성합니다.
> 승인 방법: "Go" 입력

---

## 주의사항

1. **1:1 Test Pairing**: Task 6.0의 모든 테스트 파일 필수
2. **Feature Branch**: Task 0.0부터 시작 필수
3. **체크박스 업데이트**: Sub-task 완료 시 즉시 `[x]` 표시
4. **Context7 검증**: GitHub Actions 최신 문법 확인 (Task 1.0 전)
5. **Playwright 검증**: E2E 테스트로 실제 작동 확인 (Task 8.0)
