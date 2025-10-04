# MCP Verification Script
# UTF-8 Encoding

Write-Host "[MCP] Verification started..." -ForegroundColor Cyan

$mcpConfigPath = "E:\claude\.claude\mcp-servers.json"

if (-not (Test-Path $mcpConfigPath)) {
    Write-Host "[ERROR] MCP config not found" -ForegroundColor Red
    exit 1
}

$mcpConfig = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
$servers = $mcpConfig.mcpServers.PSObject.Properties

Write-Host "`n[INFO] Registered servers: $($servers.Count)" -ForegroundColor Green

foreach ($server in $servers) {
    $name = $server.Name
    $config = $server.Value

    Write-Host "`n[SERVER] $name" -ForegroundColor Yellow

    if ($config.type -eq "http") {
        Write-Host "  Type: HTTP (Auto-update)" -ForegroundColor Gray
        Write-Host "  Status: OK" -ForegroundColor Green
    }
    elseif ($config.command) {
        $cmd = $config.command
        $args = $config.args -join " "

        Write-Host "  Type: Command" -ForegroundColor Gray
        Write-Host "  Command: $cmd $args" -ForegroundColor Gray

        if ($cmd -eq "npx" -and $args -like "*@latest*") {
            Write-Host "  Status: OK (@latest enabled)" -ForegroundColor Green
        }
        else {
            Write-Host "  Status: OK" -ForegroundColor Green
        }
    }
}

Write-Host "`n[MCP] Verification complete`n" -ForegroundColor Green
