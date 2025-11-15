# PRD-0006: Claude Code Bypass Permission Mode

**상태**: Draft
**생성일**: 2025-01-15
**작성자**: User Request
**우선순위**: High

---

## 1. 개요 (Overview)

### 문제 정의
현재 Claude Code는 파일 수정, 명령 실행 등의 작업 시 매번 사용자 권한 확인을 요청합니다. 반복적인 작업이나 자동화 워크플로우에서 이러한 권한 요청이 생산성을 저하시킵니다.

### 목표
환경 변수 `CLAUDE_BYPASS_PERMISSION=1` 설정 시 모든 도구 실행에 대한 권한 요청을 자동으로 승인하는 bypass 모드를 구현하여, 사용자가 신뢰하는 환경에서 최대 생산성을 확보합니다.

### 핵심 가치
- **생산성 향상**: 반복적인 권한 승인 단계 제거
- **자동화 지원**: CI/CD 및 스크립트 환경에서 완전 자동 실행
- **사용자 선택권**: 기본 ON, 필요 시 비활성화 가능
- **완전한 신뢰 모드**: 모든 도구 작업에 대해 자동 승인

---

## 2. 범위 (Scope)

### In Scope
1. **환경 변수 감지 시스템**
   - `CLAUDE_BYPASS_PERMISSION` 환경 변수 읽기
   - 값: `1`, `true`, `yes`, `on` → bypass 활성화
   - 값: `0`, `false`, `no`, `off` 또는 미설정 → 기본 권한 모드

2. **모든 도구 bypass**
   - 파일 시스템: `Read`, `Write`, `Edit`, `NotebookEdit`
   - 실행: `Bash`, `BashOutput`, `KillShell`
   - 검색: `Grep`, `Glob`
   - 외부 연결: `WebFetch`, `WebSearch`
   - 기타: `Task`, `SlashCommand`, `Skill` 등 전체 도구

3. **위험 작업 포함**
   - 파일 삭제: `rm -rf` 등
   - Git 강제 푸시: `git push --force`
   - 시스템 명령: `sudo` 등
   - **모두 자동 승인** (사용자가 bypass 모드를 명시적으로 활성화했으므로)

4. **기본 동작**
   - `CLAUDE_BYPASS_PERMISSION` 미설정 시: **기본 ON** (opt-out)
   - 명시적으로 `0` 설정 시에만 권한 모드로 전환

### Out of Scope
- GUI 설정 인터페이스 (환경 변수만 사용)
- 도구별 세밀한 권한 제어 (전체 bypass 또는 전체 권한 모드)
- 작업 로그 기록 기능 (향후 확장 가능)

---

## 3. 요구사항 (Requirements)

### 3.1 기능 요구사항 (Functional Requirements)

#### FR-1: 환경 변수 읽기
- **설명**: 시스템 환경 변수 `CLAUDE_BYPASS_PERMISSION` 읽기
- **우선순위**: P0 (Critical)
- **구현**:
  ```python
  import os
  bypass_enabled = os.getenv('CLAUDE_BYPASS_PERMISSION', '1').lower() in ['1', 'true', 'yes', 'on']
  ```
- **기본값**: `'1'` (기본 ON)

#### FR-2: 도구 실행 전 bypass 체크
- **설명**: 모든 도구 호출 전 bypass 모드 확인
- **우선순위**: P0 (Critical)
- **동작**:
  - `bypass_enabled == True` → 권한 요청 건너뛰고 즉시 실행
  - `bypass_enabled == False` → 기존 권한 요청 프로세스 실행

#### FR-3: 위험 작업 처리
- **설명**: 위험한 작업도 bypass 모드에서 자동 승인
- **우선순위**: P0 (Critical)
- **위험 작업 목록** (예시):
  - `rm -rf`, `rm -r`
  - `git push --force`, `git reset --hard`
  - `sudo` 명령
  - 파일 전체 덮어쓰기 (`Write` 도구)
- **동작**: bypass 모드에서 경고 없이 실행

#### FR-4: 상태 표시
- **설명**: Claude Code 시작 시 bypass 모드 상태 표시
- **우선순위**: P1 (High)
- **출력 예시**:
  ```
  ⚡ Bypass Permission Mode: ENABLED
  All tool permissions will be auto-approved.
  To disable: export CLAUDE_BYPASS_PERMISSION=0
  ```

### 3.2 비기능 요구사항 (Non-Functional Requirements)

#### NFR-1: 성능
- 환경 변수 읽기는 시작 시 1회만 수행
- 도구 실행 시 오버헤드 < 1ms

#### NFR-2: 보안
- 환경 변수 설정은 사용자 책임
- bypass 모드 활성화 시 명확한 경고 메시지 표시

#### NFR-3: 호환성
- 기존 권한 시스템과 100% 호환
- bypass 비활성화 시 기존 동작과 동일

---

## 4. 사용자 스토리 (User Stories)

### US-1: 자동화 스크립트 실행
**As a** DevOps 엔지니어
**I want to** CI/CD 파이프라인에서 Claude Code를 권한 요청 없이 실행
**So that** 완전 자동화된 워크플로우 구축 가능

**Acceptance Criteria**:
- [ ] `export CLAUDE_BYPASS_PERMISSION=1` 후 스크립트 실행 시 권한 요청 없음
- [ ] 모든 파일 수정/생성 작업이 자동 승인됨
- [ ] Git 커밋/푸시 작업이 자동 승인됨

### US-2: 로컬 개발 환경
**As a** 개발자
**I want to** 신뢰하는 로컬 환경에서 반복 작업 시 권한 요청 생략
**So that** 개발 속도 향상

**Acceptance Criteria**:
- [ ] `.bashrc` 또는 `.zshrc`에 환경 변수 설정
- [ ] Claude Code 시작 시 bypass 모드 활성화 확인
- [ ] 파일 수정 시 즉시 실행

### US-3: 긴급 디버깅
**As a** 개발자
**I want to** 프로덕션 이슈 디버깅 시 빠른 수정
**So that** 다운타임 최소화

**Acceptance Criteria**:
- [ ] 긴급 상황에서 `export CLAUDE_BYPASS_PERMISSION=1` 즉시 적용
- [ ] 위험한 명령(롤백, 강제 푸시 등)도 자동 승인
- [ ] 작업 완료 후 `export CLAUDE_BYPASS_PERMISSION=0`으로 복원

---

## 5. 기술 스펙 (Technical Specifications)

### 5.1 아키텍처

```
┌─────────────────────────────────────┐
│   Claude Code Main Process          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 1. Startup: Read env variable  │ │
│  │    CLAUDE_BYPASS_PERMISSION    │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 2. Set global bypass flag      │ │
│  │    bypass_enabled = True/False │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 3. Tool execution hook         │ │
│  │    if bypass_enabled:          │ │
│  │        auto_approve()          │ │
│  │    else:                        │ │
│  │        request_permission()    │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.2 핵심 로직

```python
# config.py
import os

class BypassPermissionConfig:
    def __init__(self):
        # 기본값: '1' (ON)
        env_value = os.getenv('CLAUDE_BYPASS_PERMISSION', '1')
        self.enabled = env_value.lower() in ['1', 'true', 'yes', 'on']

    def should_bypass(self, tool_name: str) -> bool:
        """모든 도구에 대해 bypass 여부 반환"""
        return self.enabled

# main.py
bypass_config = BypassPermissionConfig()

def execute_tool(tool_name: str, **kwargs):
    if bypass_config.should_bypass(tool_name):
        # 권한 요청 생략, 즉시 실행
        return tool.execute(**kwargs)
    else:
        # 기존 권한 요청 프로세스
        if request_user_permission(tool_name, **kwargs):
            return tool.execute(**kwargs)
        else:
            raise PermissionDenied(f"User denied {tool_name}")
```

### 5.3 시작 메시지

```python
def print_startup_message():
    if bypass_config.enabled:
        print("""
⚡ Bypass Permission Mode: ENABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All tool permissions will be auto-approved.
To disable: export CLAUDE_BYPASS_PERMISSION=0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """)
    else:
        print("🔒 Permission Mode: Standard (manual approval required)")
```

---

## 6. 테스트 계획 (Test Plan)

### 6.1 단위 테스트

#### Test Case 1: 환경 변수 읽기
```python
def test_bypass_enabled_on():
    os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
    config = BypassPermissionConfig()
    assert config.enabled == True

def test_bypass_enabled_off():
    os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
    config = BypassPermissionConfig()
    assert config.enabled == False

def test_bypass_default():
    if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
        del os.environ['CLAUDE_BYPASS_PERMISSION']
    config = BypassPermissionConfig()
    assert config.enabled == True  # 기본 ON
```

#### Test Case 2: 도구 실행
```python
def test_tool_bypass_mode():
    os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
    config = BypassPermissionConfig()

    # 모든 도구에 대해 bypass 반환
    assert config.should_bypass('Bash') == True
    assert config.should_bypass('Write') == True
    assert config.should_bypass('Edit') == True
```

### 6.2 통합 테스트

#### Test Case 3: E2E 파일 수정
```python
def test_e2e_file_edit_bypass():
    """bypass 모드에서 권한 요청 없이 파일 수정"""
    os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'

    # Claude Code 시작
    # "test.txt 파일에 'Hello' 추가" 요청
    # 권한 요청 없이 즉시 실행 확인

    with open('test.txt', 'r') as f:
        assert 'Hello' in f.read()
```

#### Test Case 4: 위험 명령 실행
```python
def test_dangerous_command_bypass():
    """bypass 모드에서 위험 명령 자동 승인"""
    os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'

    # "rm -rf temp/" 명령 실행 요청
    # 권한 요청 없이 즉시 실행 확인
    assert not os.path.exists('temp/')
```

---

## 7. 성공 지표 (Success Metrics)

### 7.1 정량적 지표
- **권한 요청 감소율**: 100% (bypass 모드에서 0건)
- **작업 완료 시간**: 30% 단축 (권한 승인 대기 시간 제거)
- **CI/CD 자동화율**: 100% (사람 개입 불필요)

### 7.2 정성적 지표
- 사용자가 반복 작업에서 권한 요청에 방해받지 않음
- 자동화 스크립트가 중단 없이 실행됨
- 긴급 상황에서 빠른 대응 가능

---

## 8. 마일스톤 (Milestones)

### Phase 1: 코어 구현 (v1.0.0)
- [ ] 환경 변수 읽기 로직
- [ ] 도구 실행 hook에 bypass 체크 추가
- [ ] 시작 메시지 출력

### Phase 2: 테스트 (v1.1.0)
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 (Playwright)

### Phase 3: 문서화 (v1.2.0)
- [ ] README 업데이트
- [ ] CLAUDE.md에 bypass 모드 가이드 추가
- [ ] 예제 추가 (CI/CD 설정 예시)

---

## 9. 리스크 & 완화 방안 (Risks & Mitigation)

### R-1: 의도하지 않은 위험 작업 실행
**리스크**: 사용자가 bypass 모드를 켠 상태에서 위험한 명령이 자동 실행될 수 있음
**확률**: Medium
**영향**: High
**완화 방안**:
- 시작 시 명확한 경고 메시지 표시
- 문서에 bypass 모드 사용 시 주의사항 명시
- 기본값을 ON으로 하되, 사용자가 명시적으로 설정했음을 문서화

### R-2: 환경 변수 미설정 시 혼란
**리스크**: 사용자가 bypass 모드를 기대했으나 환경 변수 미설정으로 권한 모드로 동작
**확률**: Low
**영향**: Low
**완화 방안**:
- 기본값을 ON으로 설정 (환경 변수 미설정 시 bypass 활성화)
- 시작 메시지에서 현재 모드 명확히 표시

---

## 10. 부록 (Appendix)

### 10.1 환경 변수 설정 예시

**Bash/Zsh (.bashrc, .zshrc)**:
```bash
# Bypass 모드 활성화 (기본값이므로 생략 가능)
export CLAUDE_BYPASS_PERMISSION=1

# Bypass 모드 비활성화
export CLAUDE_BYPASS_PERMISSION=0
```

**Windows (PowerShell)**:
```powershell
# Bypass 모드 활성화
$env:CLAUDE_BYPASS_PERMISSION=1

# Bypass 모드 비활성화
$env:CLAUDE_BYPASS_PERMISSION=0
```

**GitHub Actions CI/CD**:
```yaml
- name: Run Claude Code
  env:
    CLAUDE_BYPASS_PERMISSION: 1
  run: |
    claude-code execute-task
```

### 10.2 관련 문서
- Claude Code 공식 문서
- CLAUDE.md (Phase 0-6 워크플로우)
- Phase 1 구현 가이드

---

**승인**:
- [ ] 제품 매니저
- [ ] 엔지니어링 리드
- [ ] 보안 팀
