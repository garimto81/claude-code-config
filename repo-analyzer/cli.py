#!/usr/bin/env python3
"""
Repository Analyzer CLI

Usage:
    python cli.py analyze <owner/repo>
    python cli.py compare <owner/repo1> <owner/repo2>
    python cli.py report weekly
"""

import os
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

console = Console()


@click.group()
@click.version_option(version='0.1.0', prog_name='repo-analyzer')
def cli():
    """GitHub Repository Analyzer - 워크플로우 분석 및 개선 제안 도구"""
    pass


@cli.command()
@click.argument('repo')
@click.option('--depth', default='basic', type=click.Choice(['basic', 'full']),
              help='분석 깊이 선택')
@click.option('--output', '-o', help='출력 파일 경로')
def analyze(repo, depth, output):
    """GitHub 저장소 분석

    REPO: owner/repository 형식 (예: Zer0Daemon/PhaseFlow)
    """
    console.print(Panel.fit(f"[bold green]Analyzing Repository: {repo}[/bold green]"))

    # 환경 변수 확인
    if not os.getenv('GITHUB_TOKEN'):
        console.print("[bold red]❌ Error:[/bold red] GITHUB_TOKEN이 설정되지 않음")
        console.print("  .env 파일에 GITHUB_TOKEN을 설정하세요")
        sys.exit(1)

    if not os.getenv('ANTHROPIC_API_KEY'):
        console.print("[bold yellow]⚠️  Warning:[/bold yellow] ANTHROPIC_API_KEY 미설정 - 수동 분석 모드")

    # Progress 표시
    with console.status("[bold green]분석 중...[/bold green]") as status:
        console.print(f"[dim]• 분석 깊이: {depth}[/dim]")
        console.print(f"[dim]• 저장소: {repo}[/dim]")

        # TODO: 실제 분석 로직 구현
        # from src.github_fetcher import GitHubFetcher
        # from src.analyzer import Analyzer

        console.print("\n[yellow]⚠️  Phase 1 개발 중 - 수동 분석 모드[/yellow]")
        console.print("[dim]TODO: github_fetcher.py 구현 필요[/dim]")
        console.print("[dim]TODO: analyzer.py 구현 필요[/dim]")

    # 결과 테이블 (예시)
    table = Table(title="분석 결과 (예시)")
    table.add_column("항목", style="cyan", no_wrap=True)
    table.add_column("상태", style="magenta")
    table.add_column("설명", style="green")

    table.add_row("README", "✅", "발견됨")
    table.add_row("워크플로우", "⏳", "분석 대기")
    table.add_row("자동화 수준", "⏳", "평가 대기")

    console.print(table)

    if output:
        console.print(f"\n[green]결과 저장 위치: {output}[/green]")


@cli.command()
@click.argument('repo1')
@click.argument('repo2')
def compare(repo1, repo2):
    """두 저장소 비교

    REPO1, REPO2: owner/repository 형식
    """
    console.print(Panel.fit(f"[bold blue]Comparing Repositories[/bold blue]"))
    console.print(f"• Repository 1: [cyan]{repo1}[/cyan]")
    console.print(f"• Repository 2: [cyan]{repo2}[/cyan]")

    # TODO: 비교 로직 구현
    console.print("\n[yellow]⚠️  Phase 2 기능 - 개발 예정[/yellow]")
    console.print("[dim]TODO: comparator.py 구현 필요[/dim]")


@cli.command()
@click.argument('type', type=click.Choice(['weekly', 'monthly']))
@click.option('--send', is_flag=True, help='이메일 발송')
def report(type, send):
    """리포트 생성

    TYPE: weekly 또는 monthly
    """
    console.print(Panel.fit(f"[bold magenta]Generating {type.capitalize()} Report[/bold magenta]"))

    # TODO: 리포트 생성 로직
    console.print("\n[yellow]⚠️  Phase 3 기능 - 개발 예정[/yellow]")
    console.print("[dim]TODO: report_generator.py 구현 필요[/dim]")

    if send:
        console.print("\n[dim]이메일 발송 기능은 추후 구현 예정[/dim]")


@cli.command()
def status():
    """시스템 상태 확인"""
    console.print(Panel.fit("[bold]System Status[/bold]"))

    # 환경 변수 체크
    checks = {
        "GITHUB_TOKEN": "✅" if os.getenv('GITHUB_TOKEN') else "❌",
        "ANTHROPIC_API_KEY": "✅" if os.getenv('ANTHROPIC_API_KEY') else "⚠️",
        "Python Version": f"✅ {sys.version.split()[0]}" if sys.version_info >= (3, 8) else "❌"
    }

    table = Table(title="Configuration Check")
    table.add_column("Component", style="cyan")
    table.add_column("Status", justify="center")

    for key, value in checks.items():
        table.add_row(key, value)

    console.print(table)

    # 출력 디렉토리 확인
    output_dir = Path("outputs")
    if output_dir.exists():
        console.print(f"\n[green]✅ Output directory exists: {output_dir.absolute()}[/green]")
    else:
        console.print(f"\n[yellow]⚠️  Output directory not found: {output_dir.absolute()}[/yellow]")


if __name__ == '__main__':
    cli()