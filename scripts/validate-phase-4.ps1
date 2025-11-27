# Phase 4 검증: Git Ops (Commit & PR)
# Windows PowerShell 전용 버전

$ErrorActionPreference = "Stop"

Write-Host "Phase 4 검증: Git Ops (Commit & PR)" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# 1. Git 설치 확인
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git이 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}

# 2. Uncommitted Changes 확인
Write-Host "1. Uncommitted Changes 확인" -ForegroundColor Cyan
$gitStatus = & git status --porcelain 2>&1

if ($gitStatus) {
    Write-Host "❌ Uncommitted changes가 있습니다." -ForegroundColor Red
    Write-Host "   모든 변경사항을 커밋하거나 스태시하세요." -ForegroundColor Yellow
    $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    $allPassed = $false
} else {
    Write-Host "✅ Working directory clean" -ForegroundColor Green
}

# 3. Remote Sync 확인 (Push 여부)
Write-Host ""
Write-Host "2. Remote Sync 확인" -ForegroundColor Cyan

$currentBranch = & git rev-parse --abbrev-ref HEAD
$upstream = & git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Upstream branch가 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host "   git push -u origin $currentBranch" -ForegroundColor Gray
    # 엄격하게 실패로 처리하지 않음 (PR 전일 수 있음)
} else {
    $commitsAhead = & git rev-list --count "$upstream..HEAD"
    $commitsBehind = & git rev-list --count "HEAD..$upstream"

    if ([int]$commitsAhead -gt 0) {
        Write-Host "⚠️  Remote보다 $commitsAhead 커밋 앞서 있습니다. (Push 필요)" -ForegroundColor Yellow
        Write-Host "   git push" -ForegroundColor Gray
        $allPassed = $false
    } elseif ([int]$commitsBehind -gt 0) {
        Write-Host "⚠️  Remote보다 $commitsBehind 커밋 뒤쳐져 있습니다. (Pull 필요)" -ForegroundColor Yellow
        Write-Host "   git pull" -ForegroundColor Gray
        $allPassed = $false
    } else {
        Write-Host "✅ Remote와 동기화됨 (Synced)" -ForegroundColor Green
    }
}

# 4. PR 상태 확인 (GitHub CLI가 있는 경우)
Write-Host ""
Write-Host "3. PR 상태 확인 (Optional)" -ForegroundColor Cyan

if (Get-Command gh -ErrorAction SilentlyContinue) {
    $prStatus = & gh pr status --json number,state,url 2>$null | ConvertFrom-Json
    
    if ($prStatus -and $prStatus.currentBranch) {
        $pr = $prStatus.currentBranch
        Write-Host "✅ PR이 존재합니다: #$($pr.number) ($($pr.state))" -ForegroundColor Green
        Write-Host "   URL: $($pr.url)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  현재 브랜치에 대한 PR이 없습니다." -ForegroundColor Yellow
        Write-Host "   PR 생성: gh pr create" -ForegroundColor Gray
    }
} else {
    Write-Host "ℹ️  GitHub CLI (gh)가 설치되지 않아 PR 확인을 건너뜁니다." -ForegroundColor Gray
}

# 최종 결과
Write-Host ""
Write-Host "=" * 60

if ($allPassed) {
    Write-Host "✅ Phase 4 검증 통과" -ForegroundColor Green
    Write-Host ""
    Write-Host "다음 단계: Phase 5 (E2E & Security)" -ForegroundColor Cyan
    Write-Host "   scripts\validate-phase-5.ps1"
    exit 0
} else {
    Write-Host "❌ Phase 4 검증 실패" -ForegroundColor Red
    Write-Host "   위 항목들을 확인하세요" -ForegroundColor Yellow
    exit 1
}
