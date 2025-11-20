# 빠른 명령어 참조
*외부 참조 문서 (CLAUDE.md 컨텍스트에 포함되지 않음)*

> **🗣️ 언어 규칙**: CLAUDE.md Core Rules에 명시된 **“항상 한글로 말할 것”** 지침을 모든 사용자 응답·문서·커밋 설명에 최우선으로 적용하세요.

---

## 📊 진행률 확인

### 기본 확인
```bash
# 체크박스 상태별 카운트
grep -oP '\[.\]' tasks/0001-*.md | sort | uniq -c
# 결과: 15 [x], 8 [ ], 2 [!]
```

### 퍼센트 계산
```bash
# 완료율
echo "scale=2; $(grep -c '\[x\]' tasks/0001-*.md) * 100 / $(grep -c '\[.\]' tasks/0001-*.md)" | bc
# 결과: 62.50
```

### Phase별 상태
```bash
# Phase 1.0의 완료 task 수
grep -A 10 "^- \[ \] 1.0" tasks/0001-*.md | grep -c "\[x\]"
```

---

## 🚀 프로젝트 설정

### 폴더 구조 생성
```bash
mkdir -p tasks/{prds,tickets,archives}
mkdir -p scripts
mkdir -p docs/guides
mkdir -p tests
```

### 템플릿 복사
```bash
# 기존 프로젝트에서
cp ../reference-project/tasks/prds/_TEMPLATE.md tasks/prds/
cp ../reference-project/.gitignore .
```

### GitHub Template 사용
```bash
gh repo create new-project --template yourorg/project-template
```

---

## 🔍 Task 검색

### 현재 진행 중인 task 찾기
```bash
grep "^\- \[ \] [0-9]" tasks/0001-*.md | head -1
```

### 실패한 task 찾기
```bash
grep "^\- \[!\]" tasks/0001-*.md
```

### 특정 Phase의 task 목록
```bash
grep "^\- \[.\] 2\." tasks/0001-*.md
```

---

## 📝 PRD 관리

### 마지막 PRD 번호 확인
```bash
ls tasks/prds/ | grep -oP '\d{4}' | sort -n | tail -1
```

### 다음 PRD 번호
```bash
printf "%04d\n" $(($(ls tasks/prds/ | grep -oP '\d{4}' | sort -n | tail -1) + 1))
```

---

## 🧪 테스트 상태

### 테스트 파일 누락 확인
```bash
# 구현 파일 목록
find src -name "*.ts" -not -name "*.test.ts" > /tmp/impl.txt

# 테스트 파일 목록
find src -name "*.test.ts" | sed 's/\.test\.ts/.ts/' > /tmp/tests.txt

# 차이 확인
comm -23 /tmp/impl.txt /tmp/tests.txt
```

---

## 📈 통계

### 주간 완료 task 수
```bash
git log --since="1 week ago" --grep="\[x\]" --oneline | wc -l
```

### 평균 task 소요 시간
```bash
# Git log에서 [x] 커밋 간격 계산
git log --grep="\[x\]" --format="%at" | awk '{if(NR>1) print ($0-prev)/3600; prev=$0}' | awk '{sum+=$1; n++} END {print sum/n " hours"}'
```

---

## 🎯 팁

- **별칭 설정**: `.bashrc`에 추가
  ```bash
  alias progress='grep -oP "\[.\]" tasks/*-tasks-*.md | sort | uniq -c'
  alias tasks='grep "^\- \[ \]" tasks/*-tasks-*.md | head -5'
  ```

- **Git Hook**: `.git/hooks/post-commit`에 자동 통계 업데이트
  ```bash
  #!/bin/bash
  grep -c '\[x\]' tasks/*.md > .task-stats
  ```

- **VS Code 확장**:
  - Markdown Checkboxes (자동 카운트)
  - Task Explorer (tree view)
