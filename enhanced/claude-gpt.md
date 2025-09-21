좋아요. 지금까지의 두 설계를 **나란히 비교**해서 장점만 취하고 빈틈은 메워, “어느 장비/OS/에디터에서든 같은 규칙·같은 파일·같은 초기화 절차”가 **더 견고하게** 돌아가도록 최종안을 드릴게요.

# 한눈 비교

| 항목                                                  | 사용자 초안 강점                         | 내가 제안했던 강점                                 | 최종 권장(통합)                                                                            |
| --------------------------------------------------- | --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| **싱글 소스(SSOT, *Single Source of Truth: 단일 진실 원천*)** | `claude-code-config/CLAUDE.md` 중심 | 홈 전역 `~/.claude/` + 프로젝트 오버라이드             | **전역(`~/.claude/`) + 프로젝트(`CLAUDE.md`) 병행**. 전역은 “회사 공통 규칙/보안 가드”, 프로젝트는 “업무 특화 규칙”. |
| **초기화**                                             | `init/setup.sh` 제안                | 원라이너 + 백업/롤백/헬스체크                          | **원라이너 설치 + 백업/헬스체크 + 롤백** 기본 탑재(맥·리눅스·WSL·윈도우 모두)                                   |
| **자동 동기화**                                          | CI 스케줄러로 타임스탬프 커밋                 | 쉘 래퍼(잠금·풀·오프라인 폴백)                         | **둘 다**: (A) 시작 시 래퍼로 `git pull` 시도, (B) CI는 “버전 태그/릴리스” 방식으로 깔끔히 유지(타임스탬프 커밋 지양)    |
| **계층 규칙**                                           | 템플릿별 `CLAUDE.md` 제공               | 디렉터리 계층 인식                                 | **프로젝트 루트/하위 폴더 `CLAUDE.md` → 전역 `~/.claude/CLAUDE.md`** 순서로 적용(구체 > 일반)             |
| **개발환경 표준화**                                        | `.devcontainer`                   | Nix/Docker/Dev Container 제안                | **Dev Container 기본**(+ Nix/Docker는 선택). `postCreateCommand`로 자동 초기화                  |
| **보안(Secrets)**                                     | `.gitignore`, private repo        | OS 키체인·SSO(*Single Sign-On: 단일 로그인*)·분리 저장 | **비밀값은 전원 분리**: `~/.claude/secrets/` + OS 키체인. Git에는 절대 미포함                          |
| **마이그레이션**                                          | (미제시)                             | 버전 비교 + 마이그레이션 스크립트                        | `version.json` 비교 → `migrations/` 실행 → 실패 시 **자동 롤백**                                |
| **오프라인 내성**                                         | (미제시)                             | pull 실패 시 마지막 스냅샷                          | **오프라인 폴백 + “stale 배지” 표기 + 재시도 힌트**                                                 |
| **운영가시성**                                           | (대체로 수동)                          | healthcheck.sh                             | **healthcheck + 상태 파일(`.state/last_sync`, `HEAD`) + 이슈 템플릿**                         |

---

# 최종 설계(실전 배포형)

## 1) 저장소 구조(완성형)

```
claude-code-config/                # SSOT(단일 진실 원천)
├─ .claude/                        # 전역 규칙/리소스(홈으로 복사됨)
│  ├─ CLAUDE.md                    # 전역 지시사항(회사 공통)
│  ├─ settings/                    # 포맷/린트/가이드
│  ├─ version.json                 # {"version":"1.3.0"}
│  ├─ migrations/                  # 마이그레이션 스크립트(버전별)
│  └─ templates/
│     ├─ python/CLAUDE.md
│     └─ javascript/CLAUDE.md
├─ scripts/
│  ├─ install.sh                   # macOS/Linux/WSL 설치(백업, 헬스체크, 롤백)
│  ├─ install.ps1                  # Windows 설치
│  ├─ update.sh                    # 수동 업데이트(동일 로직 함수화)
│  ├─ healthcheck.sh               # 무결성/버전/의존성 진단
│  └─ uninstall.sh                 # 제거/복구(백업 복원)
├─ .github/workflows/
│  └─ config-release.yml           # CI/CD(*Continuous Integration/Continuous Delivery: 지속적 통합/지속적 제공*)
├─ .devcontainer/devcontainer.json # 표준 개발환경 (선택)
└─ README.md                       # 원라이너·운영 가이드
```

> **정책 우선순위(merge/override)**
>
> 1. **프로젝트 하위폴더 `CLAUDE.md`** → 2) **프로젝트 루트 `CLAUDE.md`** → 3) **전역 `~/.claude/CLAUDE.md`**
>    전역은 금지/보안/공통 표준, 프로젝트는 도메인 규칙·체크리스트에 집중.

---

## 2) 설치(원라이너 + 안전장치)

**macOS/Linux/WSL**

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/<you>/claude-code-config/main/scripts/install.sh)"
```

**Windows (관리자 PowerShell 권장)**

```powershell
iwr -UseBasicParsing https://raw.githubusercontent.com/<you>/claude-code-config/main/scripts/install.ps1 | iex
```

**install.sh 핵심 포인트**

* 기존 `~/.claude` → `~/.claude.backup.YYYYMMDDHHMMSS`로 **원자적 백업**
* `.claude/` 전체를 홈으로 복사
* `healthcheck.sh` 실행(경고는 비차단), 실패 시 **자동 롤백**
* **OAuth(*Open Authorization: 개방형 권한 위임*)**/SSO는 계정·장비당 **최초 1회 수동 로그인** 원칙

---

## 3) 실행 시 자동 동기화(경량 래퍼)

**bash/zsh (`~/.bashrc` 또는 `~/.zshrc`)**

```bash
claude() {
  local CFG="$HOME/.claude"
  local LOCK="$CFG/.sync.lock"
  mkdir -p "$CFG"

  if [ ! -f "$CFG/CLAUDE.md" ]; then
    echo "⚙️ 최초 설정이 필요합니다. install.sh를 먼저 실행하세요."
    return 1
  fi

  # 동기화 (오프라인 실패 허용)
  ( flock -n 9 || { echo "⏳ 다른 동기화 진행 중"; return 0; }
    if git -C "$CFG" rev-parse >/dev/null 2>&1; then
      git -C "$CFG" pull --ff-only || echo "⚠️ pull 실패(오프라인 진행)"
      git -C "$CFG" rev-parse HEAD > "$CFG/.state/HEAD"
      date +%FT%T > "$CFG/.state/last_sync"
    fi
  ) 9>"$LOCK"

  command claude "$@"
}
```

**PowerShell (`$PROFILE`)**

```powershell
function claude {
  $cfg = "$HOME\.claude"
  if (-not (Test-Path "$cfg\CLAUDE.md")) {
    Write-Host "⚙️ 최초 설정 필요: install.ps1 실행"
    return
  }
  try {
    git -C $cfg pull --ff-only | Out-Null
    (Get-Date).ToString("s") | Set-Content "$cfg\.state\last_sync"
  } catch { Write-Host "⚠️ pull 실패(오프라인 진행)" }
  & claude.exe $args
}
```

---

## 4) 전역 `CLAUDE.md`(요지, 실제 투입용)

```markdown
# 🚀 Global Claude Code Policy (Company-Wide)
> 이 전역 규칙은 모든 프로젝트에 적용됩니다.  
> **우선순위**: 프로젝트/하위폴더 `CLAUDE.md` > 프로젝트 루트 `CLAUDE.md` > (본 문서)

## 1) First Task: Sync & Health
- 시작 전 `~/.claude` 최신 상태 확인(래퍼가 자동 시도)
- `~/.claude/version.json` vs 리포 버전 비교 → 필요 시 마이그레이션 안내
- 상태 파일: `.state/last_sync`, `.state/HEAD`를 참조하여 stale 여부 표시

## 2) Global Restrictions
- 금지 경로: `/infra/prod/*`, `/.github/workflows/prod-*`
- 자동생성 파일: `*.generated.*`, `*.lock`은 직접 수정 금지
- 비밀값: `~/.claude/secrets/` (Git 미추적), OS 키체인 권장

## 3) Universal Standards
- Git 커밋: `type(scope): description` (type: feat/fix/docs/style/refactor/test/chore)
- 브랜치: `feature/*`, `bugfix/*`, `hotfix/*`
- 포맷/린트: 저장 시 자동, 경고는 커밋 전 반드시 해결
- 의존성은 **버전 고정** 원칙

## 4) Project Context Hints
- Node 프로젝트(`package.json`) → `templates/javascript/CLAUDE.md` 참고
- Python(`pyproject.toml`/`requirements.txt`) → `templates/python/CLAUDE.md` 참고

## 5) Error/Perf/Sec Behaviors
- 오류: 로그 요약 → 재현 절차 → 수정안 제시
- 성능: 필요 시 경량 프로파일링 요약 및 최적화 후보
- 보안: 키·자격증명 탐지 시 즉시 경고 및 차단 가이드
```

**템플릿 예시(파이썬 전용 규칙)**

```markdown
# Python Template Rules
- Python 3.11+
- 테스트: pytest, 커버리지 ≥ 80% (`pytest --cov=src`)
- 타입: mypy(strict), 공개 API는 타입힌트 필수
- 패키징: `pip` 또는 `poetry`, 잠금 파일 커밋
```

---

## 5) CI/CD(“설정 변경 = 릴리스” 모델)

`.github/workflows/config-release.yml`

```yaml
name: Config Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate Shell/JSON/YAML
        run: |
          bash -n scripts/*.sh
          jq -e . .claude/version.json
          yq -e '.' .devcontainer/devcontainer.json

      - name: Extract Version
        id: v
        run: echo "version=$(jq -r .version .claude/version.json)" >> $GITHUB_OUTPUT

      - name: Create Tag
        run: |
          git config user.name "Config Bot"
          git config user.email "bot@example.com"
          git tag -f "v${{ steps.v.outputs.version }}"
          git push -f origin "v${{ steps.v.outputs.version }}"
```

> **왜 타임스탬프 커밋 대신 태그/릴리스?**
> 히스토리를 깔끔히 유지하고, 각 장비가 “어느 버전의 정책”을 쓰는지 **정확히 추적**하기 쉽습니다.

---

## 6) 마이그레이션 & 롤백

* `~/.claude/version.json` ↔ 저장소 버전 비교
* 불일치 시 `migrations/<from>→<to>.sh` 실행
* 실패하면 **자동 롤백**: 백업 디렉터리 복구 + 오류 리포트(이슈 템플릿 링크)

`healthcheck.sh`는 다음을 점검:

* 필수 파일 존재/권한
* `HEAD`와 `last_sync` 스테일 여부
* 포맷/린트 도구 존재(있으면 간단 검증)
* 로컬 비밀값 경로 누락/권장 경고

---

## 7) Dev Container(선택·권장)

`.devcontainer/devcontainer.json` (개요)

```json
{
  "name": "Claude Code Standard Environment",
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "postCreateCommand": "bash ~/.claude/init/setup.sh || true",
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "files.autoSave": "afterDelay"
      }
    }
  },
  "mounts": [
    "source=${localEnv:HOME}/.claude,target=/home/vscode/.claude,type=bind"
  ]
}
```

> **장점**: 새 장비라도 컨테이너만 열면 **항상 같은 런타임**. 현장(사이프러스/프라하)·HQ(한국) 간 불일치 최소화.

---

## 8) 보안 정책

* **OAuth/SSO(단일 로그인)**: 각 장비 **최초 1회 수동** 승인(자동화 금지)
* **PAT(*Personal Access Token: 개인 액세스 토큰*)** 하드코딩 금지
* 비밀값은 `~/.claude/secrets/` + OS 키체인(Keychain/Credential Manager/gnome-keyring 등)
* 레포에는 `.gitignore`로 **비밀 경로** 제외

---

## 9) 운영 체크리스트(전역 `CLAUDE.md` 첫 화면에 노출)

* [ ] GitHub 연동 완료(미연동 → 안내)
* [ ] 전역 동기화 성공/스테일 여부
* [ ] 프로젝트 `CLAUDE.md` 탐지/적용
* [ ] 금지 경로·자동생성 파일 접근 차단
* [ ] 포맷/린트/테스트 통과
* [ ] 버전 호환(마이그레이션 필요 시 안내)

---

## 10) 단계별 롤아웃(WSOP·“버추얼 테이블” 현장 기준)

1. **사전 배포**: HQ·현장 노트북·윈도우 편집 PC에 원라이너 설치 → `healthcheck` 통과 확인
2. **프로젝트 오버레이**: WSOP 각 레포 루트/하위 폴더에 `CLAUDE.md` 배치(핸드 로거, GFX, RFID, MAM 등 세분화)
3. **훈련(15분)**: “동기화 실패 시 대응”, “오프라인 폴백”, “롤백” 실습
4. **태그 기반 릴리스**: `v1.3.0` 고정 운영 → 문제 발생 시 `v1.2.x`로 즉시 롤백
5. **지표**: 장비별 `last_sync` 수집(선택)로 현장 준수율 모니터링

---

# 결론(업데이트 포인트 요약)

* **전역+프로젝트 이중 구조**로 **규칙 충돌/중복 최소화**
* **시작 시 자동 동기화** + **오프라인 폴백** + **버전/마이그레이션**으로 **실전 내구성 강화**
* **CI는 타임스탬프 커밋 대신 버전 태그/릴리스**로 이력 간결화
* **개발환경은 Dev Container**로 통일, 장비 차이 ‘0’에 수렴
* **보안은 분리·비저장 원칙**(레포에 절대 비밀 미포함)

원하시면, 위 **최종 구조 그대로**:

* `scripts/install.sh / install.ps1 / update.sh / healthcheck.sh / uninstall.sh`
* 전역 `CLAUDE.md` + Python/JS 템플릿 `CLAUDE.md`
* `config-release.yml`
  를 **바로 붙여넣기 가능한 파일 세트**로 드릴게요.
  적용 대상 OS(맥/윈/리눅스)와 레포 이름만 알려주면, 즉시 납품형으로 구성해 드리겠습니다.
