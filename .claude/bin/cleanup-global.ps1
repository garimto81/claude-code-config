# Claude Code 글로벌 설정 정리 스크립트
# E:/claude 외의 모든 중복 설정 제거

$ErrorActionPreference = "Stop"

Write-Host "🧹 Claude Code 글로벌 설정 정리 시작..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# 백업 디렉토리 생성
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = "E:/claude/backups/global-cleanup-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "`n📦 백업 디렉토리 생성: $backupDir" -ForegroundColor Yellow

# 1. 글로벌 .claude 디렉토리 처리
$globalClaude = "C:/Users/브로드스튜디오/.claude"
if (Test-Path $globalClaude) {
    Write-Host "`n🔍 글로벌 .claude 디렉토리 발견" -ForegroundColor Yellow
    Move-Item $globalClaude "$backupDir/.claude-global" -Force
    Write-Host "  ✅ 이동 완료: $globalClaude → 백업" -ForegroundColor Green
} else {
    Write-Host "`n  ℹ️  글로벌 .claude 디렉토리 없음" -ForegroundColor Gray
}

# 2. .claude.json 백업 파일들 처리
Write-Host "`n🔍 .claude.json 백업 파일 검색 중..." -ForegroundColor Yellow
$userHome = "C:/Users/브로드스튜디오"
$backupFiles = @(
    (Join-Path -Path $userHome -ChildPath ".claude.json"),
    (Join-Path -Path $userHome -ChildPath ".claude.json.backup"),
    (Join-Path -Path $userHome -ChildPath ".claude.json.broken")

)

# 패턴 매칭으로 추가 백업 파일 검색
$additionalBackups = Get-ChildItem -Path $userHome -Filter ".claude.json.backup.*" -File -ErrorAction SilentlyContinue
$corruptedBackups = Get-ChildItem -Path $userHome -Filter ".claude.json.corrupted.*" -File -ErrorAction SilentlyContinue

$allBackups = $backupFiles + $additionalBackups.FullName + $corruptedBackups.FullName

$movedCount = 0
foreach ($file in $allBackups) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Move-Item $file "$backupDir/$fileName" -Force
        Write-Host "  ✅ 이동: $fileName" -ForegroundColor Green
        $movedCount++
    }
}

if ($movedCount -eq 0) {
    Write-Host "  ℹ️  백업 파일 없음" -ForegroundColor Gray
}

# 3. .claude-server-commander 처리
$serverCommander = "$userHome/.claude-server-commander"
if (Test-Path $serverCommander) {
    Write-Host "`n🔍 .claude-server-commander 발견" -ForegroundColor Yellow
    Move-Item $serverCommander "$backupDir/.claude-server-commander" -Force
    Write-Host "  ✅ 이동 완료" -ForegroundColor Green
} else {
    Write-Host "`n  ℹ️  .claude-server-commander 없음" -ForegroundColor Gray
}

# 4. classic-isekai CLAUDE.md 처리
$classicIsekaiMd = "$userHome/Documents/GitHub/classic-isekai/CLAUDE.md"
if (Test-Path $classicIsekaiMd) {
    Write-Host "`n🔍 classic-isekai/CLAUDE.md 발견" -ForegroundColor Yellow
    Move-Item $classicIsekaiMd "$backupDir/classic-isekai-CLAUDE.md" -Force
    Write-Host "  ✅ 이동 완료" -ForegroundColor Green
} else {
    Write-Host "`n  ℹ️  classic-isekai/CLAUDE.md 없음" -ForegroundColor Gray
}

# 최종 보고
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "✨ 정리 완료!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n📊 정리 결과:" -ForegroundColor Yellow
Write-Host "  - 백업 위치: $backupDir"
Write-Host "  - .claude.json 백업 파일: $movedCount 개 이동"

Write-Host "`n📋 유지된 설정:" -ForegroundColor Yellow
Write-Host "  ✅ C:/Users/브로드스튜디오/.claude.json (MCP 서버 설정)"
Write-Host "  ✅ E:/claude/.claude/ (워크스페이스 설정)"

Write-Host "`n🔄 다음 단계:" -ForegroundColor Cyan
Write-Host "  1. VS Code 재시작"
Write-Host "  2. E:/claude 폴더 열기"
Write-Host "  3. 'claude mcp list' 명령으로 MCP 서버 확인"

Write-Host "`n💡 복원이 필요하면 백업 폴더를 확인하세요." -ForegroundColor Gray
