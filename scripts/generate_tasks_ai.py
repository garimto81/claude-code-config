#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI Task Generation Script
PRD → Task List 자동 생성 (Claude API 활용)

Based on PhaseFlow AI task generation (MIT License)
Optimized for claude01 Phase 0-6 workflow
"""

import os
import sys
import io
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional

# Windows 인코딩 처리
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    import anthropic
except ImportError:
    print("❌ anthropic 패키지가 설치되지 않았습니다.")
    print("   설치: pip install anthropic")
    sys.exit(1)


def extract_prd_number(prd_path: str) -> Optional[str]:
    """PRD 파일 경로에서 번호 추출 (예: 0005-prd-feature.md → 0005)"""
    filename = Path(prd_path).name
    match = re.match(r'(\d{4})-prd', filename)
    return match.group(1) if match else None


def read_prd(prd_path: str) -> str:
    """PRD 파일 읽기"""
    if not os.path.exists(prd_path):
        raise FileNotFoundError(f"PRD 파일 없음: {prd_path}")

    with open(prd_path, 'r', encoding='utf-8') as f:
        return f.read()


def load_prompt_template() -> str:
    """프롬프트 템플릿 로드"""
    template_path = Path(__file__).parent.parent / "templates" / "ai-task-generation-prompt.md"

    if not template_path.exists():
        raise FileNotFoundError(f"프롬프트 템플릿 없음: {template_path}")

    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()


def generate_task_list(prd_content: str, prd_number: Optional[str] = None) -> str:
    """Claude API를 사용하여 Task List 생성"""
    # API 키 확인
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.\n"
            "   설정: export ANTHROPIC_API_KEY=your_key (Unix/macOS)\n"
            "   설정: set ANTHROPIC_API_KEY=your_key (Windows)"
        )

    # 프롬프트 템플릿 로드
    prompt_template = load_prompt_template()

    # PRD 내용 삽입
    prompt = prompt_template.replace("{prd_content}", prd_content)

    # Claude API 호출
    print(f"🤖 Claude API로 Task List 생성 중...")
    print(f"   모델: claude-sonnet-4-20250514")
    print(f"   PRD 크기: {len(prd_content)} chars\n")

    client = anthropic.Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # 응답에서 텍스트 추출
        task_list = response.content[0].text

        return task_list

    except Exception as e:
        raise RuntimeError(f"Claude API 호출 실패: {e}")


def save_task_list(task_list: str, prd_number: str, prd_path: str) -> str:
    """Task List를 파일로 저장"""
    # tasks/ 폴더 확인
    tasks_dir = Path("tasks")
    if not tasks_dir.exists():
        tasks_dir.mkdir()

    # 파일명 생성
    prd_filename = Path(prd_path).stem  # 예: 0005-prd-repo-analyzer
    task_filename = prd_filename.replace("-prd-", "-tasks-") + ".md"
    task_path = tasks_dir / task_filename

    # 저장
    with open(task_path, 'w', encoding='utf-8') as f:
        f.write(task_list)

    return str(task_path)


def main():
    """메인 실행 함수"""
    import argparse

    parser = argparse.ArgumentParser(
        description="AI 기반 Task List 생성 (Claude API)",
        epilog="예시: python scripts/generate_tasks_ai.py tasks/prds/0005-prd-repo-analyzer.md"
    )
    parser.add_argument('prd_path', help='PRD 파일 경로 (예: tasks/prds/0005-prd-feature.md)')
    parser.add_argument('--output', '-o', help='출력 파일 경로 (기본값: tasks/NNNN-tasks-*.md)')
    parser.add_argument('--preview', '-p', action='store_true', help='생성된 Task List를 파일로 저장하지 않고 미리보기')

    args = parser.parse_args()

    try:
        # PRD 번호 추출
        prd_number = extract_prd_number(args.prd_path)
        if not prd_number:
            print(f"⚠️  경고: PRD 파일명에서 번호 추출 실패: {args.prd_path}")
            print(f"   예상 형식: NNNN-prd-feature-name.md")

        # PRD 읽기
        print(f"📄 PRD 읽기: {args.prd_path}")
        prd_content = read_prd(args.prd_path)
        print(f"   ✅ PRD 로드 완료 ({len(prd_content)} chars)\n")

        # Task List 생성
        task_list = generate_task_list(prd_content, prd_number)
        print(f"   ✅ Task List 생성 완료 ({len(task_list)} chars)\n")

        # 미리보기 모드
        if args.preview:
            print("="*80)
            print(task_list)
            print("="*80)
            print("\n💡 파일로 저장하려면 --preview 옵션 제거")
            return

        # 파일 저장
        output_path = args.output or save_task_list(task_list, prd_number, args.prd_path)

        if not args.output:
            output_path = save_task_list(task_list, prd_number, args.prd_path)

        print(f"✅ Task List 저장 완료")
        print(f"   파일: {output_path}\n")

        # 통계
        task_count = task_list.count('### Task ')
        checkbox_count = task_list.count('- [ ]')
        print(f"📊 통계:")
        print(f"   Parent Tasks: {task_count}개")
        print(f"   체크박스: {checkbox_count}개")

        # 다음 단계 안내
        print(f"\n🚀 다음 단계:")
        print(f"   1. Task List 검토: cat {output_path}")
        print(f"   2. \"Go\" 입력 → Sub-Tasks 생성")
        print(f"   3. Task 0.0 실행 → 브랜치 생성")

    except FileNotFoundError as e:
        print(f"❌ 파일 오류: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"❌ 설정 오류: {e}", file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(f"❌ 실행 오류: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
