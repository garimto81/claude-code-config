# AI Task Generation Prompt Template
# claude01 Phase 0-6 Workflow에 최적화된 Task List 자동 생성

당신은 소프트웨어 프로젝트 관리 전문가입니다. 제공된 PRD(Product Requirements Document)를 분석하여 claude01 Phase 0-6 워크플로우에 맞는 구조화된 Task List를 생성하세요.

---

## PRD 내용

{prd_content}

---

## 출력 형식

다음 형식의 마크다운 Task List를 생성하세요:

```markdown
# Task List: {PRD_TITLE}

**PRD 문서**: tasks/prds/{PRD_NUMBER}-prd-{feature-name}.md
**버전**: 1.0.0
**작성일**: {TODAY_DATE}
**예상 기간**: 총 {TOTAL_DAYS}일

---

## 📊 프로젝트 개요

**목적**: {PURPOSE}

**핵심 가치**:
- {KEY_VALUE_1}
- {KEY_VALUE_2}
- {KEY_VALUE_3}

**Quick Win**: {QUICK_WIN_DESCRIPTION} ({DAYS}일)

---

## Phase 1: Parent Tasks (검토 필요)

> **지시사항**: 아래 Parent Tasks를 검토 후 "Go"를 입력하면 상세 Sub-Tasks를 생성합니다.

### Task 0.0: 프로젝트 초기화 [필수]
- [ ] 0.0.1: feature/{BRANCH_NAME} 브랜치 생성
- [ ] 0.0.2: 프로젝트 폴더 구조 생성 ({FOLDER_NAME}/)
- [ ] 0.0.3: 기본 설정 파일 작성 (.env.example, .gitignore)

**예상 시간**: 0.5일
**담당**: 개발자
**의존성**: 없음

---

### Task {N}: {TASK_TITLE}
**목적**: {PURPOSE}

**핵심 기능**:
- {FEATURE_1}
- {FEATURE_2}
- {FEATURE_3}

**파일**:
- `{IMPLEMENTATION_FILE}` (구현)
- `{TEST_FILE}` (테스트)

**예상 시간**: {DAYS}일
**의존성**: Task {DEPENDENCY}

---

[... 추가 Parent Tasks ...]

---

## 📊 Phase별 타임라인

| Phase | Tasks | 예상 기간 | 누적 일수 |
|-------|-------|----------|------------|
| Phase 0 | 기획 (PRD) | {DAYS}일 | {CUMULATIVE}일 |
| Phase 0.5 | Task 생성 | {DAYS}일 | {CUMULATIVE}일 |
| Phase 1 | {DESCRIPTION} | {DAYS}일 | {CUMULATIVE}일 |
| Phase 2 | {DESCRIPTION} | {DAYS}일 | {CUMULATIVE}일 |
| Phase 3 | {DESCRIPTION} | {DAYS}일 | {CUMULATIVE}일 |
| Phase 4 | {DESCRIPTION} | {DAYS}일 | {CUMULATIVE}일 |
| Phase 5 | {DESCRIPTION} | {DAYS}일 | {CUMULATIVE}일 |
| Phase 6 | {DESCRIPTION} | {DAYS}일 | {CUMULATIVE}일 |

**총 예상 기간**: 약 {TOTAL}일 (Quick Win: {QUICK_WIN_DAYS}일)

---

## 🎯 Quick Win Milestone ({DAYS}일)

**목표**: {QUICK_WIN_GOAL}

**범위**: Task 0.0 + Task {TASKS}

**검증 명령어**:
```bash
{VERIFICATION_COMMAND}
```

**성공 기준**:
- ✅ {CRITERION_1}
- ✅ {CRITERION_2}
- ✅ {CRITERION_3}

---

## 🔐 보안 체크리스트

- [ ] .env 파일을 .gitignore에 추가
- [ ] API 키는 환경 변수로만 관리
- [ ] 민감 정보 필터링
- [ ] Rate limit 핸들링 구현

---

## 📝 1:1 테스트 페어링 체크리스트

| 구현 파일 | 테스트 파일 | 상태 |
|----------|------------|------|
| {IMPL_FILE_1} | {TEST_FILE_1} | [ ] |
| {IMPL_FILE_2} | {TEST_FILE_2} | [ ] |
[... 모든 구현 파일 ...]

**목표 커버리지**: 80%+

---

## 🚀 다음 단계

1. **Parent Tasks 검토**: 위 Task {N}-{M} 구조 확인
2. **"Go" 입력**: Sub-Tasks 상세 생성 시작
3. **Task 0.0 실행**: 브랜치 생성 및 초기화
4. **Quick Win 달성**: {DAYS}일 내 첫 마일스톤 완료

---

**상태**: Parent Tasks 생성 완료 (검토 대기)
**작성일**: {TODAY_DATE}
**다음 액션**: 사용자 "Go" 입력 대기
```

---

## 중요 규칙

### 1. Task 0.0 필수 포함
- 0.0.1: 브랜치 생성 (feature/PRD-NNNN-{feature-name})
- 0.0.2: 프로젝트 폴더 구조
- 0.0.3: 기본 설정 파일

### 2. 1:1 테스트 페어링 강제
- 모든 구현 파일에는 대응 테스트 파일 필수
- Python: `src/foo.py` → `tests/test_foo.py`
- JS/TS: `src/foo.js` → `tests/foo.test.js`

### 3. 의존성 명시
- 각 Task의 의존성을 명확히 표시
- 병렬 실행 가능한 Task 식별

### 4. Quick Win 정의
- 2-3일 내 달성 가능한 첫 마일스톤
- 실제 동작하는 최소 기능

### 5. 예상 시간 현실적으로
- 과대평가보다는 과소평가
- 버퍼 20% 포함

### 6. Parent Tasks는 5-12개
- 너무 적으면: 세분화 부족
- 너무 많으면: 관리 복잡

---

## 출력

위 형식에 맞춰 완전한 마크다운 Task List를 생성하세요. PRD 내용을 분석하여 적절한 Task로 분해하고, 각 Task의 목적, 파일, 시간, 의존성을 명확히 하세요.
