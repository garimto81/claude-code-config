# Phase 2.5: Code Review Validation
# Windows PowerShell 전용 버전
# Version: 5.4.0

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "🔍 Validating Phase 2.5 (Code Review)..." -ForegroundColor Cyan
Write-Host "=" * 60

$errors = @()
$warnings = @()

# 1. Git 변경사항 확인
Write-Host ""
Write-Host "📋 Checking pending changes..." -ForegroundColor Yellow

$gitStatus = git status --porcelain 2>&1
$gitDiff = git diff --name-only origin/HEAD... 2>&1

if ($gitDiff) {
    $changedFiles = ($gitDiff -split "`n").Count
    Write-Host "✅ Found $changedFiles changed files for review" -ForegroundColor Green
} else {
    $warnings += "No changes detected for review"
    Write-Host "⚠️  No changes detected for review" -ForegroundColor Yellow
}

# 2. 코드 리뷰 체크리스트 확인
Write-Host ""
Write-Host "📋 Code Review Checklist..." -ForegroundColor Yellow

# 2.1 Critical 이슈 검사 (TODO, FIXME, HACK)
$criticalPatterns = @("TODO:", "FIXME:", "HACK:", "XXX:")
$criticalFound = $false

foreach ($pattern in $criticalPatterns) {
    $matches = git diff origin/HEAD... 2>&1 | Select-String -Pattern $pattern
    if ($matches) {
        $criticalFound = $true
        $warnings += "Found '$pattern' in changes"
        Write-Host "⚠️  Found '$pattern' in changes" -ForegroundColor Yellow
    }
}

if (-not $criticalFound) {
    Write-Host "✅ No critical markers (TODO/FIXME/HACK) in new code" -ForegroundColor Green
}

# 2.2 console.log / print 디버그 문 검사
$debugPatterns = @("console\.log\(", "print\(.*debug", "debugger;")
$debugFound = $false

foreach ($pattern in $debugPatterns) {
    $matches = git diff origin/HEAD... 2>&1 | Select-String -Pattern $pattern
    if ($matches) {
        $debugFound = $true
        $warnings += "Found debug statement: $pattern"
        Write-Host "⚠️  Found debug statement matching: $pattern" -ForegroundColor Yellow
    }
}

if (-not $debugFound) {
    Write-Host "✅ No debug statements in new code" -ForegroundColor Green
}

# 3. 보안 검사 (기본)
Write-Host ""
Write-Host "🔒 Security Check..." -ForegroundColor Yellow

$securityPatterns = @(
    @{Pattern = "password\s*=\s*['""]"; Name = "Hardcoded password"},
    @{Pattern = "api_key\s*=\s*['""]"; Name = "Hardcoded API key"},
    @{Pattern = "secret\s*=\s*['""]"; Name = "Hardcoded secret"},
    @{Pattern = "eval\("; Name = "Dangerous eval()"},
    @{Pattern = "innerHTML\s*="; Name = "Potential XSS (innerHTML)"}
)

$securityIssues = $false
foreach ($sec in $securityPatterns) {
    $matches = git diff origin/HEAD... 2>&1 | Select-String -Pattern $sec.Pattern
    if ($matches) {
        $securityIssues = $true
        $errors += "Security issue: $($sec.Name)"
        Write-Host "❌ Security issue: $($sec.Name)" -ForegroundColor Red
    }
}

if (-not $securityIssues) {
    Write-Host "✅ No obvious security issues detected" -ForegroundColor Green
}

# 4. 테스트 통과 확인 (Phase 2 결과)
Write-Host ""
Write-Host "🧪 Verifying Phase 2 completion..." -ForegroundColor Yellow

if (Test-Path "tests") {
    $testFiles = Get-ChildItem -Path "tests" -Recurse -Include *.py,*.test.ts,*.test.tsx,*.test.js,*.spec.ts -ErrorAction SilentlyContinue
    if ($testFiles) {
        Write-Host "✅ Test files exist ($($testFiles.Count) files)" -ForegroundColor Green
    } else {
        $warnings += "No test files found in tests/"
        Write-Host "⚠️  No test files found in tests/" -ForegroundColor Yellow
    }
} else {
    $warnings += "tests/ directory not found"
    Write-Host "⚠️  tests/ directory not found" -ForegroundColor Yellow
}

# 5. 리뷰 결과 요약
Write-Host ""
Write-Host "=" * 60
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "❌ FAIL - $($errors.Count) error(s) found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "   • $err" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Action Required:" -ForegroundColor Yellow
    Write-Host "   1. Fix security issues before proceeding"
    Write-Host "   2. Run /pragmatic-code-review for detailed analysis"
    Write-Host "   3. Re-run this validator after fixes"
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARN - $($warnings.Count) warning(s) found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor Yellow
    foreach ($warn in $warnings) {
        Write-Host "   • $warn" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Recommendation:" -ForegroundColor Cyan
    Write-Host "   Review warnings before proceeding to Phase 3"
    exit 0
}

Write-Host "✅ PASS - Code review validation complete" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run /pragmatic-code-review for comprehensive review"
Write-Host "   2. If UI changes: Run /design-review"
Write-Host "   3. Proceed to Phase 3 (Versioning)"
exit 0
