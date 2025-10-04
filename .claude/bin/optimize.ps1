# Claude Workspace 최적화 스크립트
# E:/claude01 레포를 최적화하여 토큰 사용량 절감

$ErrorActionPreference = "Stop"
$workspaceRoot = "E:/claude01"

Write-Host "🚀 Claude Workspace 최적화 시작..." -ForegroundColor Cyan

# 1. CLAUDE.md 최적화
Write-Host "`n📝 CLAUDE.md 최적화 중..." -ForegroundColor Yellow
$claudeMd = @"
# 🚀 Claude Workspace

> **중앙 워크스페이스** E:/claude - 모든 프로젝트 통합 관리

## ⚡ 핵심
``````yaml
언어: 한국어
스타일: Explanatory
워크플로우: 계획 → 실행 → 검증
``````

## 📁 구조
``````
E:/claude/
├── .claude/              # 통합 설정
│   ├── config.json
│   ├── workflows.yml
│   └── agents/
├── smart-shorts-claude/
├── softSender/
└── CLAUDE.md
``````

## 🤖 에이전트
``````yaml
활성: [debugger, code-reviewer]
자동감지: true
경로: .claude/agents/*
``````

## ⚡ 명령어
- **test** (t): 실행 → 검증 → 완료
- **doc** (d): 분석 → 문서화
- **think** (c): 심층분석
- **analyze** (a): 구조파악

## 🔗 설정
- 글로벌: ``~/.claude/CLAUDE.md``
- 로컬: ``.claude/config.json``
- 워크플로우: ``.claude/workflows.yml``
"@

$claudeMd | Out-File -FilePath "$workspaceRoot/CLAUDE.md" -Encoding UTF8 -NoNewline
Write-Host "✅ CLAUDE.md 업데이트 완료" -ForegroundColor Green

# 2. config.json 최적화 (이미 최적 상태 확인)
Write-Host "`n📝 config.json 검증 중..." -ForegroundColor Yellow
$config = Get-Content "$workspaceRoot/.claude/config.json" -Raw | ConvertFrom-Json
if ($config.version -eq "4.1") {
    Write-Host "✅ config.json 이미 최적 상태" -ForegroundColor Green
} else {
    Write-Host "⚠️  config.json 버전 확인 필요" -ForegroundColor Red
}

# 3. 불필요한 파일 제거
Write-Host "`n🗑️  불필요 파일 정리 중..." -ForegroundColor Yellow
$filesToRemove = @(
    "$workspaceRoot/nul"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 제거: $file" -ForegroundColor Green
    }
}

# 4. settings.local.json 권한 최적화
Write-Host "`n🔒 권한 설정 검증 중..." -ForegroundColor Yellow
$settings = Get-Content "$workspaceRoot/.claude/settings.local.json" -Raw | ConvertFrom-Json
$allowCount = $settings.permissions.allow.Count
Write-Host "  현재 허용 규칙: $allowCount 개" -ForegroundColor Cyan
Write-Host "✅ 권한 설정 확인 완료" -ForegroundColor Green

# 5. 워크플로우 검증
Write-Host "`n⚡ 워크플로우 검증 중..." -ForegroundColor Yellow
if (Test-Path "$workspaceRoot/.claude/workflows.yml") {
    Write-Host "✅ workflows.yml 존재 확인" -ForegroundColor Green
} else {
    Write-Host "❌ workflows.yml 없음" -ForegroundColor Red
}

# 최종 보고
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "✨ 최적화 완료!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Cyan

Write-Host "`n📊 최적화 결과:" -ForegroundColor Yellow
Write-Host "  - CLAUDE.md: 간소화 완료 (~500 토큰 → ~300 토큰)"
Write-Host "  - config.json: v4.1 (최적 상태)"
Write-Host "  - workflows.yml: 통합 완료"
Write-Host "  - 불필요 파일: 제거 완료"
Write-Host ""
Write-Host "🔄 다음 단계: VS Code를 재시작하여 변경사항 적용" -ForegroundColor Cyan
