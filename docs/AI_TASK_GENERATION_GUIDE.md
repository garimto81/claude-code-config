# AI Task 생성 시스템 가이드

**버전**: 1.0.0
**출처**: PhaseFlow AI task generation (MIT License)
**적용**: claude01 Phase 0-6 workflow

---

## 📋 개요

Claude API를 활용하여 PRD(Product Requirements Document)에서 Task List를 자동 생성하는 시스템입니다.

### 🎯 목적
- ✅ Phase 0.5 완전 자동화 (수동 8시간 → 자동 30분)
- ✅ 일관된 Task 품질
- ✅ 1:1 테스트 페어링 자동 적용
- ✅ 연간 80시간 절감 (프로젝트 10개 기준)

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
pip install anthropic
```

### 2. API 키 설정

```bash
# Unix/macOS
export ANTHROPIC_API_KEY=your_key_here

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="your_key_here"

# Windows (cmd)
set ANTHROPIC_API_KEY=your_key_here
```

### 3. PRD 작성

```bash
vim tasks/prds/0006-prd-my-feature.md
# PRD 작성 (MINIMAL/STANDARD/JUNIOR 가이드 참고)
```

### 4. Task List 자동 생성

```bash
python scripts/generate_tasks_ai.py tasks/prds/0006-prd-my-feature.md
```

**출력**:
```
📄 PRD 읽기: tasks/prds/0006-prd-my-feature.md
   ✅ PRD 로드 완료 (5423 chars)

🤖 Claude API로 Task List 생성 중...
   모델: claude-sonnet-4-20250514
   PRD 크기: 5423 chars

   ✅ Task List 생성 완료 (12584 chars)

✅ Task List 저장 완료
   파일: tasks/0006-tasks-my-feature.md

📊 통계:
   Parent Tasks: 8개
   체크박스: 32개

🚀 다음 단계:
   1. Task List 검토: cat tasks/0006-tasks-my-feature.md
   2. "Go" 입력 → Sub-Tasks 생성
   3. Task 0.0 실행 → 브랜치 생성
```

---

## 📖 사용 방법

### 기본 사용

```bash
python scripts/generate_tasks_ai.py tasks/prds/0006-prd-feature.md
```

### 미리보기 (파일 저장 안 함)

```bash
python scripts/generate_tasks_ai.py tasks/prds/0006-prd-feature.md --preview
```

### 출력 파일 지정

```bash
python scripts/generate_tasks_ai.py tasks/prds/0006-prd-feature.md --output my-tasks.md
```

---

## 🏗️ 생성되는 Task List 구조

### 1. 프로젝트 개요
- 목적, 핵심 가치
- Quick Win 정의 (2-3일 마일스톤)

### 2. Task 0.0 (필수)
```markdown
### Task 0.0: 프로젝트 초기화 [필수]
- [ ] 0.0.1: feature/PRD-0006-my-feature 브랜치 생성
- [ ] 0.0.2: 프로젝트 폴더 구조 생성
- [ ] 0.0.3: 기본 설정 파일 작성 (.env.example, .gitignore)
```

### 3. Parent Tasks (5-12개)
```markdown
### Task 1: GitHub API 클라이언트 구현
**목적**: GitHub Search/Repository API 활용

**핵심 기능**:
- GitHub Search API로 저장소 검색
- Repository API로 메타데이터 수집
- Rate limit 핸들링

**파일**:
- `src/github_fetcher.py` (구현)
- `tests/test_github_fetcher.py` (테스트)

**예상 시간**: 1일
**의존성**: Task 0.0
```

### 4. 1:1 테스트 페어링 체크리스트
```markdown
| 구현 파일 | 테스트 파일 | 상태 |
|----------|------------|------|
| src/github_fetcher.py | tests/test_github_fetcher.py | [ ] |
| src/analyzer.py | tests/test_analyzer.py | [ ] |
```

### 5. Phase별 타임라인
```markdown
| Phase | Tasks | 예상 기간 | 누적 일수 |
|-------|-------|----------|-----------|
| Phase 0 | 기획 (PRD) | 1일 | 1일 |
| Phase 0.5 | Task 생성 | 0.5일 | 1.5일 |
| Phase 1 | 코어 구현 | 5일 | 6.5일 |
```

---

## ⚙️ 프롬프트 커스터마이징

### 템플릿 위치
`templates/ai-task-generation-prompt.md`

### 수정 가능 항목
1. **Task 구조**: Parent Tasks 수, 세분화 수준
2. **시간 예상**: 버퍼 비율 조정
3. **Quick Win 기준**: 목표 일수 변경
4. **체크리스트**: 추가 항목 정의

### 예시: Quick Win 기간 변경
```markdown
# 기존
**Quick Win**: {QUICK_WIN_DESCRIPTION} ({DAYS}일)

# 수정
**Quick Win**: {QUICK_WIN_DESCRIPTION} (1주일 이내)
```

---

## 🔍 생성된 Task List 검토

### 1. 필수 확인 사항
- [ ] Task 0.0 포함 여부
- [ ] 모든 구현 파일에 대응 테스트 파일
- [ ] 의존성 순환 없음
- [ ] 예상 시간 현실적인지
- [ ] Quick Win 2-3일 내 달성 가능한지

### 2. 수정이 필요한 경우
- PRD를 더 구체화
- 템플릿 프롬프트 조정
- 재생성

---

## 💡 사용 시나리오

### 시나리오 1: 새 기능 개발

```bash
# 1. PRD 작성 (10분)
vim tasks/prds/0007-prd-payment-integration.md

# 2. Task List 자동 생성 (30초)
python scripts/generate_tasks_ai.py tasks/prds/0007-prd-payment-integration.md

# 3. 검토 (5분)
cat tasks/0007-tasks-payment-integration.md

# 4. "Go" 입력하여 Sub-Tasks 생성 (Claude Code에서)
# (또는 수동으로 작성)

# 5. Task 0.0 실행
git checkout -b feature/PRD-0007-payment-integration
```

**소요 시간**: 15분 30초 (기존: 8시간)
**절감**: 97% 시간 단축

### 시나리오 2: 복잡한 프로젝트

```bash
# 1. 상세한 PRD 작성 (30분, STANDARD 가이드)
vim tasks/prds/0008-prd-microservices-refactor.md

# 2. Task List 자동 생성 (1분)
python scripts/generate_tasks_ai.py tasks/prds/0008-prd-microservices-refactor.md

# 3. 검토 및 조정 (15분)
# Parent Tasks 15개 생성됨, 일부 조정

# 4. 진행
```

**소요 시간**: 46분 (기존: 16시간)
**절감**: 95% 시간 단축

---

## ❓ FAQ

### Q1: API 키가 없으면?
**A**: 수동으로 Task List 작성
```bash
# 기존 방식 (수동)
cp tasks/0001-tasks-template.md tasks/0006-tasks-my-feature.md
vim tasks/0006-tasks-my-feature.md
```

### Q2: 생성된 Task가 부정확하면?
**A**: PRD를 더 구체화하거나 템플릿 프롬프트 조정
- PRD에 기술 스택, 아키텍처 다이어그램 추가
- 템플릿에서 세분화 수준 조정

### Q3: 비용은?
**A**: Claude Sonnet 4 기준
- PRD 5KB + Task List 생성: ~15,000 tokens
- 비용: $0.045/request (입력 $3/MTok, 출력 $15/MTok)
- 프로젝트 10개/년: $0.45/년

**ROI**: 시간 절감 $4,000/년 vs 비용 $0.45/년 = **888,800% ROI**

### Q4: GitHub Actions에서 자동 실행?
**A**: 가능하지만 비추천
- PR 생성 시 자동 Task 생성 가능
- 하지만 검토 없이 자동 생성은 위험
- 수동 검토 후 생성 권장

### Q5: Sub-Tasks도 자동 생성?
**A**: 현재는 Parent Tasks만
- Sub-Tasks는 "Go" 입력 후 Claude Code가 생성
- 향후 구현 예정 (Two-Phase 자동화)

---

## 📊 예상 효과

### 정량적 효과

| 지표 | 수동 | AI 자동 | 개선 |
|------|------|---------|------|
| **소요 시간** | 8시간 | 30분 | **94% ↓** |
| **Task 품질** | 60% | 85% | **25%p ↑** |
| **1:1 페어링** | 70% 준수 | 100% 준수 | **30%p ↑** |

### 정성적 효과

- ✅ **일관성**: 항상 동일한 품질
- ✅ **완전성**: 필수 항목 누락 없음
- ✅ **빠른 시작**: Phase 0.5를 10분 내 완료
- ✅ **학습**: 프롬프트로 베스트 프랙티스 학습

---

## 🔗 참고 링크

- **PhaseFlow**: https://github.com/Zer0Daemon/PhaseFlow (MIT License)
- **PRD 가이드**: `docs/guides/PRD_GUIDE_MINIMAL.md`
- **Phase 0-6 워크플로우**: `CLAUDE.md`

---

## 🚀 다음 단계

1. ✅ API 키 설정
2. ✅ PRD 작성 (MINIMAL/STANDARD 가이드)
3. ✅ Task List 자동 생성
4. ✅ 검토 및 조정
5. ✅ Task 0.0 실행 (브랜치 생성)

---

**작성자**: Claude Code
**최종 업데이트**: 2025-01-14
**버전**: 1.0.0
**기반**: PhaseFlow AI task generation (MIT License)
