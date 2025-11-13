#!/usr/bin/env python3
"""
Phase Completion Detection Script

이 스크립트는 커밋 메시지를 분석하여 Phase 완료 여부를 감지합니다.

Usage:
    python scripts/check-phase-completion.py [commit_hash]

    # 최신 커밋 확인
    python scripts/check-phase-completion.py

    # 특정 커밋 확인
    python scripts/check-phase-completion.py abc123

    # GitHub Actions에서 사용
    python scripts/check-phase-completion.py HEAD

출력:
    JSON 형식으로 Phase 정보 반환
    {
        "phase_completed": true/false,
        "phase_number": "1-6" or "unknown",
        "prd_number": "0001" or null,
        "version": "1.2.3" or null,
        "commit_message": "전체 커밋 메시지"
    }
"""

import re
import subprocess
import sys
import json
from typing import Dict, Optional


def get_commit_message(commit_hash: str = "HEAD") -> str:
    """Git 커밋 메시지를 가져옵니다."""
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--pretty=%B", commit_hash],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Git 명령 실행 실패: {e}", file=sys.stderr)
        sys.exit(1)


def parse_commit_message(message: str) -> Dict[str, Optional[str]]:
    """
    커밋 메시지를 파싱하여 Phase 정보를 추출합니다.

    패턴:
        - Version: (v1.2.3)
        - PRD: [PRD-0001]
        - Phase: "Phase 1" or "phase 2" (case-insensitive)

    Args:
        message: 커밋 메시지

    Returns:
        딕셔너리 형태의 Phase 정보
    """
    result = {
        "phase_completed": False,
        "phase_number": None,
        "prd_number": None,
        "version": None,
        "commit_message": message
    }

    # Version 패턴: (vX.Y.Z)
    version_match = re.search(r'\(v(\d+\.\d+\.\d+)\)', message)
    if version_match:
        result["version"] = version_match.group(1)

    # PRD 패턴: [PRD-0001]
    prd_match = re.search(r'\[PRD-(\d{4})\]', message)
    if prd_match:
        result["prd_number"] = prd_match.group(1)

    # Phase 패턴: "Phase 1" or "phase 2" (case-insensitive)
    phase_match = re.search(r'(?i)phase\s+([1-6])', message)
    if phase_match:
        result["phase_number"] = phase_match.group(1)

    # Phase 완료 판단: Version + PRD가 모두 있으면 완료로 간주
    if result["version"] and result["prd_number"]:
        result["phase_completed"] = True

    return result


def check_todo_completion(prd_number: str) -> Dict[str, any]:
    """
    Todo List 완료 상태를 확인합니다.

    Args:
        prd_number: PRD 번호 (예: "0001")

    Returns:
        Todo 완료 정보
    """
    todo_file = f"tasks/{prd_number}-tasks-*.md"

    try:
        # glob 패턴으로 파일 찾기
        import glob
        files = glob.glob(todo_file)

        if not files:
            return {
                "todo_exists": False,
                "total_tasks": 0,
                "completed_tasks": 0,
                "completion_rate": 0.0
            }

        todo_path = files[0]
        with open(todo_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 체크박스 카운트
        total_tasks = len(re.findall(r'\[.\]', content))
        completed_tasks = len(re.findall(r'\[x\]', content, re.IGNORECASE))

        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0

        return {
            "todo_exists": True,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completion_rate, 2)
        }

    except Exception as e:
        print(f"⚠️ Todo 파일 읽기 실패: {e}", file=sys.stderr)
        return {
            "todo_exists": False,
            "total_tasks": 0,
            "completed_tasks": 0,
            "completion_rate": 0.0
        }


def main():
    """메인 함수"""
    # 커밋 해시 (옵션)
    commit_hash = sys.argv[1] if len(sys.argv) > 1 else "HEAD"

    # 커밋 메시지 가져오기
    message = get_commit_message(commit_hash)

    # 커밋 메시지 파싱
    result = parse_commit_message(message)

    # Todo 완료 상태 확인 (PRD 번호가 있는 경우)
    if result["prd_number"]:
        todo_info = check_todo_completion(result["prd_number"])
        result["todo_info"] = todo_info

    # JSON 출력
    print(json.dumps(result, indent=2, ensure_ascii=False))

    # Exit code (Phase 완료 시 0, 아니면 1)
    sys.exit(0 if result["phase_completed"] else 1)


if __name__ == "__main__":
    main()
