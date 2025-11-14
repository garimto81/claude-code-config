#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
1:1 테스트 페어링 검증기
Based on cc-sdd validation patterns (MIT License)
Enforces claude01 test pairing rules
"""

import os
import sys
from pathlib import Path
from typing import List, Tuple

# Windows 인코딩 처리
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

class Colors:
    """터미널 컬러"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def find_source_files(src_dir: str = "src") -> List[Path]:
    """소스 파일 찾기 (.py, .js, .ts)"""
    if not os.path.exists(src_dir):
        return []

    source_files = []
    src_path = Path(src_dir)

    # Python 파일
    source_files.extend(src_path.rglob("*.py"))

    # JavaScript/TypeScript 파일
    source_files.extend(src_path.rglob("*.js"))
    source_files.extend(src_path.rglob("*.ts"))

    # 제외: __init__.py, *.d.ts
    source_files = [
        f for f in source_files
        if f.name != "__init__.py" and not f.name.endswith(".d.ts")
    ]

    return source_files

def get_expected_test_path(source_file: Path) -> List[Path]:
    """예상되는 테스트 파일 경로 반환"""
    tests_dir = Path("tests")

    # Python: src/module/file.py → tests/test_file.py
    if source_file.suffix == ".py":
        test_name = f"test_{source_file.stem}.py"
        return [tests_dir / test_name]

    # JavaScript: src/file.js → tests/file.test.js
    elif source_file.suffix in [".js", ".ts"]:
        test_name_js = f"{source_file.stem}.test.js"
        test_name_ts = f"{source_file.stem}.test.ts"
        return [tests_dir / test_name_js, tests_dir / test_name_ts]

    return []

def validate_test_pairing() -> Tuple[bool, List[str], List[str]]:
    """
    테스트 페어링 검증

    Returns:
        (성공 여부, 누락된 파일 목록, 경고 목록)
    """
    source_files = find_source_files()

    if not source_files:
        return True, [], ["소스 파일이 없습니다 (src/ 폴더 비어있음)"]

    missing = []
    warnings = []

    for src_file in source_files:
        expected_tests = get_expected_test_path(src_file)

        # 테스트 파일 존재 확인
        test_exists = any(test_path.exists() for test_path in expected_tests)

        if not test_exists:
            missing.append(f"{src_file} → {expected_tests[0]}")

    # tests/ 폴더 체크
    if not Path("tests").exists():
        warnings.append("tests/ 폴더가 없습니다")

    return len(missing) == 0, missing, warnings

def main():
    """메인 실행"""
    print(f"{Colors.BLUE}🔍 1:1 테스트 페어링 검증 시작{Colors.RESET}\n")

    success, missing, warnings = validate_test_pairing()

    # 경고 출력
    for warning in warnings:
        print(f"{Colors.YELLOW}⚠️  {warning}{Colors.RESET}")

    if not success:
        print(f"\n{Colors.RED}❌ 테스트 페어링 검증 실패{Colors.RESET}\n")
        print("다음 파일에 대응하는 테스트 파일이 없습니다:\n")

        for item in missing:
            print(f"  {Colors.RED}✗{Colors.RESET} {item}")

        print(f"\n{Colors.BLUE}📝 1:1 테스트 페어링 규칙:{Colors.RESET}")
        print("  - 모든 구현 파일은 대응 테스트 파일 필요")
        print("  - Python: src/foo.py → tests/test_foo.py")
        print("  - JS/TS: src/foo.js → tests/foo.test.js")

        sys.exit(1)

    print(f"{Colors.GREEN}✅ 테스트 페어링 검증 통과{Colors.RESET}")

    # 통계
    source_files = find_source_files()
    print(f"\n검증된 파일: {len(source_files)}개")

    sys.exit(0)

if __name__ == "__main__":
    main()
