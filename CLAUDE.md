# Claude Code 마스터 가이드
*개발 워크플로우 + 토큰 최적화 통합*

**버전**: 3.1.0 | **단일 진실의 원천(Single Source of Truth)**

---

## 🎯 핵심 시스템 2가지

**Part 1: Phase 0-6** - 체계적 개발 사이클  
**Part 2: 토큰 최적화** - 86% 비용 절감

---

# PART 1: Phase 0-6 워크플로우

## 🔄 사이클

```
Phase 0: PRD → 0.5: Task List → 1: 코드 → 2: 테스트
→ 3: 버전 → 4: Git → 5: 검증 → 6: 캐시
```

---

## 📌 Phase 0: PRD 작성

**목표**: 요구사항 명확화 및 문서화

### 필수 절차
1. **8개 영역 질문** (각 영역별 답변 필수)
   - 🎯 **문제/목표**: 해결할 문제는? 달성할 목표는?
   - 👤 **사용자**: 누가 사용? 기술 수준은?
   - ⚙️ **기능**: 필수 기능 vs 선택 기능?
   - 📖 **스토리**: As a [user], I want [feature], So that [benefit]
   - ✅ **수락기준**: 어떻게 완성을 판단?
   - 🚫 **범위**: 명확히 제외할 것은?
   - 💾 **데이터**: 필요한 데이터/API는?
   - 🎨 **디자인**: UI/UX 요구사항은?

2. **PRD 저장**: `/tasks/prds/0001-prd-feature.md`

3. **승인 대기**: 사용자 "Go" 입력 후에만 Phase 1 시작

### 자동화
```bash
# 일반 PRD
python scripts/phase/create_prd.py feature-name "Description"

# 미니멀 PRD (토큰 최적화)
python scripts/phase/create_prd.py --minimal feature-name "Description"
```

### 체크리스트
- [ ] 8개 영역 모두 답변 완료
- [ ] PRD 파일 생성 완료
- [ ] 사용자 승인 받음

📚 [PRD_GUIDE.md](docs/guides/PRD_GUIDE.md) - 상세 가이드

---

## 📋 Phase 0.5: Task List 생성

**목표**: 개발 작업을 구체적 Task로 분해

### 필수 절차
1. **PRD 기반 Task 생성**
2. **Parent Tasks** (Phase별)
3. **Sub-Tasks** (구체적 작업)

### 자동화
```bash
python scripts/phase/generate_tasks.py tasks/prds/0001-*.md
# → tasks/0001-tasks-feature.md
```

### Task 상태 마커
- `[ ]` 미시작
- `[x]` 완료
- `[!]` 실패 (테스트 실패 등)
- `[⏸]` 블락 (의존성 대기)

### 체크리스트
- [ ] Task List 파일 생성
- [ ] Parent Tasks 정의 완료
- [ ] Sub-Tasks 구체적으로 작성
- [ ] 의존성 명시 완료

---

## 🔨 Phase 1: 코드 작성

**목표**: PRD 요구사항 구현

### 필수 수행사항
1. **Task List 순서대로 진행**
2. **각 Task 완료 시 `[x]` 마킹**
3. **코드 + 문서 동시 작성**
4. **TODO 주석 최소화** (즉시 구현 또는 Issue 생성)

### 코딩 원칙
- ✅ 한글 우선 (주석, 문서)
- ✅ 명확한 함수/변수명
- ✅ 단일 책임 원칙
- ✅ 재사용 가능한 컴포넌트

### 체크리스트
- [ ] Task List 기반 개발
- [ ] 코드 리뷰 (self)
- [ ] 문서 작성 완료
- [ ] TODO 정리 완료

---

## 🧪 Phase 2: 테스트

**목표**: 품질 보장 및 PRD 수락기준 검증

### 필수 테스트
1. **단위 테스트**: 함수/메서드 레벨
2. **통합 테스트**: 컴포넌트 간 상호작용
3. **E2E 테스트**: 사용자 시나리오

### 실행
```bash
# Python
pytest tests/ -v --cov=src
pytest tests/ -v --cov=src --cov-report=html

# Node.js
npm test
npm run test:coverage

# 모든 테스트 통과 필수!
```

### PRD 수락기준 검증
- [ ] 각 수락기준별 테스트 작성
- [ ] 모든 테스트 통과
- [ ] 커버리지 80% 이상

### 체크리스트
- [ ] 단위 테스트 작성 & 통과
- [ ] 통합 테스트 작성 & 통과
- [ ] E2E 테스트 (필요시)
- [ ] PRD 수락기준 검증 완료

---

## 🏷️ Phase 3: 버전 업데이트

**목표**: Semantic Versioning 적용

### 버전 규칙
- **Major (1.0.0 → 2.0.0)**: 호환성 깨지는 변경
- **Minor (1.0.0 → 1.1.0)**: 기능 추가 (호환성 유지)
- **Patch (1.0.0 → 1.0.1)**: 버그 수정

### 업데이트 대상
1. `README.md` - 버전 번호
2. `package.json` / `pyproject.toml` / `setup.py`
3. `CHANGELOG.md` (선택)
4. PRD 파일 - 버전 이력

### 체크리스트
- [ ] 올바른 버전 타입 선택
- [ ] 모든 파일 버전 업데이트
- [ ] 변경사항 문서화

---

## 📝 Phase 4: Git 커밋 & 푸시

**목표**: 변경사항 기록 및 공유

### 커밋 컨벤션
```bash
type(scope): subject (v버전) [PRD-####]

[선택: 상세 설명]

[선택: Footer]
```

**Type**: `feat` | `fix` | `docs` | `refactor` | `perf` | `test` | `chore`

### 예시
```bash
git add -A
git commit -m "feat: Add user authentication (v1.2.0) [PRD-0001]

- JWT token generation
- Password hashing with bcrypt
- Login/logout endpoints

Closes #123"

git push origin main
```

### 자동화
```bash
python scripts/phase/auto_deploy.py feat "Add authentication" \
  --prd 0001 --bump minor
# → 버전 업데이트 + Git 커밋 + 푸시 자동 실행
```

### 체크리스트
- [ ] 의미 있는 커밋 메시지
- [ ] PRD 번호 참조
- [ ] 버전 번호 포함
- [ ] 푸시 완료

---

## ✅ Phase 5: GitHub 검증

**목표**: 배포 결과 확인

### 검증 항목
1. **파일 확인**: GitHub에서 변경사항 확인
2. **CI/CD**: 자동 빌드/테스트 통과 확인
3. **버전 태그**: Release 태그 확인 (선택)

### 검증 방법
```javascript
// 브라우저 또는 WebFetch로 확인
https://github.com/user/repo/blob/main/README.md
https://raw.githubusercontent.com/user/repo/main/src/file.py
```

### 체크리스트
- [ ] 파일 정상 업로드 확인
- [ ] CI/CD 통과 (있다면)
- [ ] README 버전 확인

---

## 🔄 Phase 6: 캐시 갱신

**목표**: 사용자에게 최신 버전 전달

### 대상
1. **브라우저 캐시**: 정적 파일
2. **CDN 캐시**: 전역 배포
3. **서비스 워커**: PWA

### 방법
- **사용자 안내**: "Ctrl+Shift+R로 새로고침"
- **버전 쿼리**: `?v=1.2.0` 파라미터 추가
- **자동 무효화**: CDN API 사용

### 체크리스트
- [ ] 캐시 갱신 필요 여부 판단
- [ ] 사용자 안내 또는 자동 무효화
- [ ] 최신 버전 확인

---

# PART 2: 토큰 최적화

## 💰 효과

```
Before: 350K 토큰 ($1.05)
After:   50K 토큰 ($0.15)
절감: 86%
```

## 🎯 5가지 전략

### 1️⃣ 미니멀 PRD (87% ↓)
```markdown
**What:** Login
**Why:** Security  
**Must:** [ ] Register [ ] Login [ ] Reset
**Success:** <2s response
```

📚 [PRD_MINIMAL_TEMPLATE.md](docs/optimization/PRD_MINIMAL_TEMPLATE.md)

### 2️⃣ 스마트 컨텍스트 (83% ↓)
```bash
python scripts/optimization/index_codebase.py .
```

📚 [SMART_CONTEXT_GUIDE.md](docs/optimization/SMART_CONTEXT_GUIDE.md)

### 3️⃣ Diff 기반 (93% ↓)
```python
from scripts.optimization.diff_manager import DiffManager
dm = DiffManager(".")
diff = dm.generate_diff(["src/auth.py"])
```

📚 [DIFF_UPDATE_GUIDE.md](docs/optimization/DIFF_UPDATE_GUIDE.md)

### 4️⃣ Function Calling (80% ↓)
JSON 응답: `{"action": "edit", "file": "app.py"}`

### 5️⃣ 배치 처리
병렬 도구 호출

---

# PART 3: 통합 사용

## 🚀 완벽한 워크플로우

```bash
# Phase 0: 미니멀 PRD (2K)
python scripts/phase/create_prd.py --minimal auth "Add authentication"

# Phase 0.5: Task + 인덱싱
python scripts/phase/generate_tasks.py tasks/prds/0001-*.md
python scripts/optimization/index_codebase.py .

# Phase 1-2: 개발 & 테스트 (스마트 컨텍스트 + Diff 자동)

# Phase 3-6: 배포
python scripts/phase/auto_deploy.py feat "Add auth" --prd 0001
```

**결과**: 체계적 + 86% 절감 🎉

---

## 📁 구조

```
프로젝트/
├── tasks/prds/      # Phase 0
├── tasks/0001-*.md  # Phase 0.5
├── scripts/
├── docs/
├── src/             # Phase 1
├── tests/           # Phase 2
└── .claude/         # 최적화 캐시
```

---

## 📚 참조

### Phase 워크플로우
- [PRD_GUIDE.md](docs/guides/PRD_GUIDE.md)
- [TOOLS_REFERENCE.md](docs/guides/TOOLS_REFERENCE.md)
- [QUICK_START.md](docs/guides/QUICK_START.md)

### 토큰 최적화
- [TOKEN_OPTIMIZATION_MASTER.md](docs/optimization/TOKEN_OPTIMIZATION_MASTER.md)
- [SMART_CONTEXT_GUIDE.md](docs/optimization/SMART_CONTEXT_GUIDE.md)
- [DIFF_UPDATE_GUIDE.md](docs/optimization/DIFF_UPDATE_GUIDE.md)

---

## 🎓 Quick Start

```bash
cd your-project
python scripts/phase/create_prd.py --minimal feature "Description"
python scripts/optimization/index_codebase.py .
python scripts/phase/generate_tasks.py tasks/prds/0001-*.md
# → 개발
python scripts/phase/auto_deploy.py feat "Add feature" --prd 0001
```

---

**v3.1.0**: Phase별 상세 지침 추가 | 체크리스트 강화

*하나의 가이드로 모든 것을.*
