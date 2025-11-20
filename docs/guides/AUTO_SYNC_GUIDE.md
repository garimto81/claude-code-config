# CLAUDE.md 자동 동기화 가이드

**버전**: 1.0.0
**업데이트**: 2025-01-12

> **🗣️ 언어 규칙**: CLAUDE.md Core Rules에 명시된 **“항상 한글로 말할 것”** 지침을 모든 사용자 응답·문서·커밋 설명에 최우선으로 적용하세요.

---

## 📋 개요

`.claude-sync.sh` 스크립트는 전역 CLAUDE.md 파일의 변경사항을 자동으로 감지하고, Git 커밋 및 푸시를 수행합니다.

---

## 🚀 주요 기능

### 1. 자동 변경 감지
- **Before/After Hash 비교**: md5sum을 사용하여 파일 변경 감지
- **버전 정보 자동 추출**: `**버전**: X.X.X` 패턴 인식
- **변경사항 요약**: Git diff 상위 5줄 자동 수집

### 2. 스마트 커밋
```bash
chore: Sync to CLAUDE.md v4.0.0

주요 변경사항:
  - 🎯 171줄 달성 (373줄에서 54% 축소)
  - 🗑️ 비용 계산 및 중복 설명 제거
  - 📦 상세 내용 → TOKEN_OPTIMIZATION_DETAILS.md
```

**커밋 메시지 형식**:
- 타입: `chore` (설정 파일 동기화)
- 제목: `Sync to CLAUDE.md vX.X.X`
- 본문: 주요 변경사항 (최대 5줄)

### 3. 선택적 푸시
```bash
📤 GitHub에 푸시하시겠습니까? (y/n): y
✅ 푸시 완료!
```

- 사용자 확인 후 푸시 실행
- `y` 입력 시 즉시 `git push`
- `n` 입력 시 로컬 커밋만 유지

### 4. 최적화 검토
```bash
🔍 전역 지침 최적화 검토 권장사항:
  ⚠️  문서 길이: 250줄 (200줄 초과)
  💡 불필요한 섹션 제거 고려
  ✅ 상세 분석: python scripts/optimize_claude_md.py
```

**자동 검사 항목**:
- 문서 길이 (200줄 기준)
- 중복 강조 항목 (**text** 패턴, 5개 이상)

---

## 🛠️ 사용 방법

### 기본 실행
```bash
bash .claude-sync.sh
```

### Claude Code 시작 시 자동 실행
`.claude-sync.sh`는 Claude Code 시작 전 자동으로 실행됩니다.

---

## 📊 최적화 분석기

### 실행
```bash
python scripts/optimize_claude_md.py [파일경로]
```

### 출력 예시
```
============================================================
📊 CLAUDE.md 최적화 분석 보고서
============================================================

📄 파일 정보:
   버전: 4.0.0
   전체 줄 수: 168줄
   내용 줄 수: 109줄
   파일 크기: 4,461 bytes

📐 구조:
   섹션 수: 20개
   코드 블록: 7개
   테이블: 18개

🎫 토큰 추정:
   예상 토큰: ~1,162 tokens
   호출당 비용: ~$0.003486
   100회 호출 비용: ~$0.3486

🔄 중복 강조 항목 (3개):
   'Phase 0': 5회
   '권장': 3회
   'PRD': 4회

💡 권장사항:
   ✅ [Quality] 문서가 최적 상태입니다!
      → 현재 구조 유지
```

### 분석 항목

#### 1. 파일 정보
- 버전, 줄 수, 파일 크기

#### 2. 구조 분석
- 섹션 수
- 코드 블록 수
- 테이블 수

#### 3. 중복 검사
- 강조 표시 중복 (`**text**`)
- 중복 문장 (20자 이상)

#### 4. 가독성
- 평균 줄 길이
- 긴 줄 (100자 초과)
- 연속 빈 줄 (3개 이상)

#### 5. 토큰 추정
- 예상 토큰 수 (한글 고려)
- 호출당 비용
- 100회 호출 비용

#### 6. 권장사항
```python
{
    "level": "warning",  # warning | info | success
    "category": "Length",
    "message": "문서가 250줄로 너무 깁니다 (권장: 200줄 이하)",
    "suggestion": "불필요한 섹션 제거 또는 외부 문서로 분리"
}
```

---

## 🔧 커스터마이징

### 문서 길이 기준 변경
```bash
# .claude-sync.sh (81줄)
if [ "$LINES" -gt 200 ]; then  # 200 → 원하는 숫자
```

### 중복 항목 기준 변경
```bash
# .claude-sync.sh (88줄)
if [ "$DUPLICATES" -gt 5 ]; then  # 5 → 원하는 숫자
```

### 커밋 메시지 형식 변경
```bash
# .claude-sync.sh (45줄)
COMMIT_MSG="chore: Sync to CLAUDE.md v${VERSION}"
# → 원하는 형식으로 변경
```

---

## ⚠️ 주의사항

### Windows 환경
- Git Bash 또는 WSL 사용 권장
- `md5sum` 명령어 필요 (`md5` 사용 시 수정 필요)

### Git 설정
```bash
# 사용자 정보 확인
git config user.name
git config user.email

# 미설정 시
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 권한 문제
```bash
# Unix/Linux/Mac
chmod +x .claude-sync.sh

# Windows (Git Bash)
# 추가 설정 불필요
```

---

## 🎯 워크플로우

```
1. Submodule 업데이트
   ↓
2. CLAUDE.md 해시 비교
   ↓
3. 변경사항 감지? → No → 종료
   ↓ Yes
4. 버전 정보 추출
   ↓
5. Diff 요약 생성
   ↓
6. Git Add & Commit
   ↓
7. 푸시 여부 확인 (사용자 입력)
   ↓
8. 최적화 검토 제안
   ↓
9. 종료
```

---

## 📚 관련 파일

| 파일 | 설명 |
|------|------|
| [.claude-sync.sh](.claude-sync.sh) | 메인 동기화 스크립트 |
| [scripts/optimize_claude_md.py](scripts/optimize_claude_md.py) | 최적화 분석기 |
| [CLAUDE.md](CLAUDE.md) | 전역 지침 파일 |

---

## 🐛 문제 해결

### 1. md5sum 명령어 없음 (Mac)
```bash
# .claude-sync.sh 수정
md5sum → md5 -r
```

### 2. 푸시 실패 (인증 오류)
```bash
# SSH 키 설정 확인
ssh -T git@github.com

# HTTPS → SSH 변경
git remote set-url origin git@github.com:username/repo.git
```

### 3. 한글 인코딩 오류
```bash
# Python 스크립트 실행 시
export PYTHONIOENCODING=utf-8
python scripts/optimize_claude_md.py
```

---

## 💡 팁

### 자동 푸시 (확인 없이)
```bash
# .claude-sync.sh (60-71줄 주석 처리)
# 아래 코드로 대체
git push
if [ $? -eq 0 ]; then
    echo "✅ 푸시 완료!"
else
    echo "⚠️  푸시 실패"
fi
```

### CI/CD 통합
```yaml
# .github/workflows/sync-claude.yml
name: Sync CLAUDE.md
on:
  schedule:
    - cron: '0 0 * * *'  # 매일 자정
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: bash .claude-sync.sh
      - run: git push
```

---

**v1.0.0 변경사항**:
- 초기 버전 작성
- 자동 커밋 & 푸시 기능
- 최적화 검토 로직
- Windows 인코딩 지원

*이 문서는 `.claude-sync.sh` 스크립트의 사용 가이드입니다.*
