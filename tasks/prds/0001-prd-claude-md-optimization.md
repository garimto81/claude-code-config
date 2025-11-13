# PRD-0001: CLAUDE.md 전역 지침 최적화

**생성일**: 2025-01-12
**상태**: 승인 대기
**담당**: Claude AI
**목표**: 실행 효율성 향상 + 150줄 이하 축소

---

## 1. 목표 (Goal)

**핵심**: CLAUDE.md를 171줄 → 150줄 이하로 축소하면서 실행 효율성 극대화

**성공 지표**:
- ✅ 150줄 이하 달성 (-12% 이상)
- ✅ Phase별 자동화 스크립트 통합
- ✅ v4.4.0 병렬 실행 전략 반영
- ✅ 중복 제거 + 참조 문서 동기화

---

## 2. 문제점 (Problem)

### A. 오래된 정보
- v4.4.0 병렬 Agent 실행 전략 미반영
- Agent 우선순위 업데이트 필요 (seq-engineer, playwright-engineer 등)

### B. 구조 복잡도
- Phase 0-6 설명이 산만 (표 vs 목록 혼재)
- Agent 가이드가 3개 섹션에 분산

### C. 중복 내용
- GitHub 워크플로우 중복 설명 (깃허브_*.md와 중복)
- Quick Start 두 가지 방식이 너무 상세

### D. 참조 문서 불일치
- AGENTS_REFERENCE.md와 Agent Top 5 불일치
- TOKEN_OPTIMIZATION_DETAILS.md 내용 일부 중복

---

## 3. 해결 방안 (Solution)

### 3.1 구조 재설계
```
[Before: 171줄]
Phase 0-6 상세 설명 (60줄)
+ Agent 가이드 3섹션 (45줄)
+ GitHub 워크플로우 (25줄)
+ 기타 (41줄)

[After: 145줄 목표]
Phase 0-6 간소화 (40줄) → -20줄
Agent 통합 1섹션 (25줄) → -20줄
GitHub 외부 참조 (10줄) → -15줄
기타 유지 (40줄)
= 115줄 핵심 + 30줄 참조 = 145줄
```

### 3.2 주요 변경사항

#### (1) Phase 0-6: 표 통합
- 현재: 단계별 설명 + 별도 표
- 개선: **하나의 마스터 표**로 통합 (Phase | 핵심 작업 | 명령 | Agent | 필수여부)

#### (2) Agent 가이드: 3→1 섹션
- 제거: "Phase별 Agent 활용 가이드" 표 (Phase 마스터 표에 통합)
- 제거: "병렬 Agent 실행" (AGENTS_REFERENCE.md 참조)
- 유지: Context7, Playwright 필수 원칙만 간략히

#### (3) GitHub 워크플로우: 외부 참조
```markdown
## GitHub 워크플로우
📚 [깃허브_빠른시작.md](깃허브_빠른시작.md) - 30분 설정
**자동화**: `bash scripts/github-issue-dev.sh 123`
```

#### (4) Quick Start: 통합
- Before: 로컬 PRD 방식 + GitHub 네이티브 방식 (각 5줄)
- After: 하나로 통합, GitHub 방식만 예시 (3줄)

#### (5) 최신 정보 반영
- v4.4.0 병렬 실행 전략 추가
- Agent Top 5: `seq-engineer | playwright-engineer | context7-engineer | test-automator | github-engineer`

---

## 4. 기술 스택 (Technical Stack)

- Markdown (CLAUDE.md)
- Python (scripts/validate_claude_md.py - 신규)
- Bash (scripts/optimize_claude_md.py - 기존 활용)

---

## 5. 구현 계획 (Implementation)

### Phase 1: 코드 작성
1. CLAUDE.md 백업 생성
2. Phase 0-6 마스터 표 작성
3. Agent 섹션 통합 (3→1)
4. GitHub 워크플로우 간소화
5. Quick Start 통합
6. v4.4.0 내용 반영

### Phase 2: 테스트
1. 줄 수 검증 (`wc -l CLAUDE.md` ≤ 150)
2. 마크다운 문법 검증 (`npx markdownlint CLAUDE.md`)
3. 외부 링크 확인 (모든 .md 파일 존재 확인)

### Phase 3: 버전 관리
- 버전: v4.5.0 (Major 유지, Minor 증가)
- 변경 사유: 구조 개선 + 최신 정보 반영

### Phase 4-6: 커밋 및 배포
- 커밋: `docs: Optimize CLAUDE.md to 145 lines (v4.5.0) [PRD-0001]`
- 검증: 실제 Claude Code에서 로드 확인

---

## 6. 비기능 요구사항 (Non-Functional)

### 성능
- 토큰 사용량: ~5% 절감 예상 (171줄 → 150줄)

### 가독성
- 표 통합으로 정보 밀도 증가
- 외부 참조로 맥락 유지

### 유지보수성
- 중복 제거로 업데이트 포인트 감소
- 참조 문서와 동기화 자동화 (scripts/validate_claude_md.py)

---

## 7. 제외 사항 (Out of Scope)

- ❌ 외부 문서(docs/AGENTS_REFERENCE.md 등) 수정 (이번 PRD 범위 밖)
- ❌ 새로운 기능 추가 (Phase 7-8 등)
- ❌ 언어 정책 변경 (v4.1.0 유지)

---

## 8. 리스크 & 완화 (Risks & Mitigation)

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| 과도한 축소로 필수 정보 손실 | 높음 | 백업 유지, 외부 참조 확인 |
| 외부 문서 누락 | 중간 | Phase 2에서 링크 검증 |
| 버전 불일치 | 낮음 | v4.5.0 명시, 히스토리 업데이트 |

---

## 9. 승인 체크리스트

- [ ] 150줄 이하 목표 합리적인가?
- [ ] Phase 마스터 표 통합 방식 적절한가?
- [ ] Agent 섹션 3→1 축소 동의하는가?
- [ ] GitHub 워크플로우 외부 참조 괜찮은가?
- [ ] v4.5.0 버전 번호 적절한가?

---

**다음 단계**: 승인 후 Phase 0.5 (Task List 생성)
