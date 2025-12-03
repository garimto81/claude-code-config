#!/usr/bin/env python3
"""
Universal Phase Validator (Cross-platform)

Works on Windows, macOS, Linux
Validates all phases (0, 0.5, 1, 2, 3, 4, 5, 6)

Usage:
    python scripts/validate_phase_universal.py 0 NNNN       # PRD validation
    python scripts/validate_phase_universal.py 0.5 NNNN    # Task list validation
    python scripts/validate_phase_universal.py 1           # 1:1 test pairing
    python scripts/validate_phase_universal.py 2 --coverage 80  # Tests & coverage
    python scripts/validate_phase_universal.py 3           # Versioning & changelog
    python scripts/validate_phase_universal.py 4           # Git ops
    python scripts/validate_phase_universal.py 5           # E2E & security
    python scripts/validate_phase_universal.py 6           # Deployment readiness

Version: 1.1.0
Compatible with: claude-code-config >= 5.0.0
"""

import sys
import argparse
import pathlib
import re
import subprocess
from typing import Optional, List, Tuple
from enum import Enum


class ValidationResult(Enum):
    """Validation result status"""
    PASS = "✅ PASS"
    FAIL = "❌ FAIL"
    WARN = "⚠️  WARN"


class PhaseValidator:
    """Base validator class"""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def log(self, message: str):
        """Log message if verbose"""
        if self.verbose:
            print(f"  {message}")

    def error(self, message: str):
        """Add error"""
        self.errors.append(message)
        print(f"❌ {message}")

    def warn(self, message: str):
        """Add warning"""
        self.warnings.append(message)
        print(f"⚠️  {message}")

    def success(self, message: str):
        """Print success message"""
        print(f"✅ {message}")

    def result(self) -> ValidationResult:
        """Get validation result"""
        if self.errors:
            return ValidationResult.FAIL
        elif self.warnings:
            return ValidationResult.WARN
        else:
            return ValidationResult.PASS


class Phase0Validator(PhaseValidator):
    """Phase 0: PRD validation"""

    def validate(self, prd_number: str) -> ValidationResult:
        """
        Validate Phase 0 completion

        Args:
            prd_number: PRD number (e.g., "0001")

        Returns:
            ValidationResult
        """
        print(f"\n🔍 Validating Phase 0 (PRD-{prd_number})...")

        # 1. Check PRD file exists
        prd_pattern = f"tasks/prds/{prd_number}-prd-*.md"
        prd_files = list(pathlib.Path(".").glob(prd_pattern))

        if not prd_files:
            self.error(f"PRD file not found: {prd_pattern}")
            return self.result()

        prd_file = prd_files[0]
        self.success(f"PRD file found: {prd_file}")

        # 2. Check minimum lines
        with open(prd_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        if len(lines) < 50:
            self.error(f"PRD too short: {len(lines)} lines (minimum 50)")
        else:
            self.success(f"PRD length OK: {len(lines)} lines")

        # 3. Check required sections
        content = "".join(lines)
        required_sections = [
            ("Purpose", r"##\s*(?:1\.)?\s*Purpose"),
            ("Features", r"##\s*(?:\d+\.)?\s*.*Features"),
            ("Success", r"##\s*(?:\d+\.)?\s*Success"),
        ]

        for section_name, pattern in required_sections:
            if re.search(pattern, content, re.IGNORECASE):
                self.success(f"Section found: {section_name}")
            else:
                self.warn(f"Section missing or misnamed: {section_name}")

        return self.result()


class Phase05Validator(PhaseValidator):
    """Phase 0.5: Task List validation"""

    def validate(self, prd_number: str) -> ValidationResult:
        """Validate Phase 0.5 completion"""
        print(f"\n🔍 Validating Phase 0.5 (PRD-{prd_number})...")

        # 1. Check task list exists
        task_pattern = f"tasks/{prd_number}-tasks-*.md"
        task_files = list(pathlib.Path(".").glob(task_pattern))

        if not task_files:
            self.error(f"Task list not found: {task_pattern}")
            return self.result()

        task_file = task_files[0]
        self.success(f"Task list found: {task_file}")

        # 2. Check Task 0.0 completed
        with open(task_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Look for Task 0.0 and check if checkboxes are marked
        task_00_pattern = r"##\s*Task\s*0\.0.*?(?=##|\Z)"
        task_00_match = re.search(task_00_pattern, content, re.DOTALL)

        if not task_00_match:
            self.warn("Task 0.0 section not found")
        else:
            task_00_content = task_00_match.group(0)
            completed = task_00_content.count("[x]")
            total = task_00_content.count("[") // 2  # Count all checkboxes

            if completed == 0:
                self.error("Task 0.0 not started")
            elif completed == total:
                self.success(f"Task 0.0 completed ({completed}/{total})")
            else:
                self.warn(f"Task 0.0 partially done ({completed}/{total})")

        # 3. Check overall progress
        total_tasks = content.count("- [ ]") + content.count("- [x]")
        completed_tasks = content.count("- [x]")

        if total_tasks > 0:
            progress = (completed_tasks / total_tasks) * 100
            self.success(f"Overall progress: {completed_tasks}/{total_tasks} ({progress:.1f}%)")
        else:
            self.warn("No tasks with checkboxes found")

        return self.result()


class Phase1Validator(PhaseValidator):
    """Phase 1: 1:1 Test Pairing validation"""

    def validate(self) -> ValidationResult:
        """Validate Phase 1: All implementation files have tests"""
        print("\n🔍 Validating Phase 1 (1:1 Test Pairing)...")

        # Find all implementation files
        src_patterns = ["src/**/*.py", "src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"]
        src_files = []
        for pattern in src_patterns:
            src_files.extend(pathlib.Path(".").glob(pattern))

        if not src_files:
            self.warn("No implementation files found in src/")
            return self.result()

        self.log(f"Found {len(src_files)} implementation files")

        # Check each has a test file
        orphaned = []
        for src_file in src_files:
            test_file = self._get_test_file_path(src_file)

            if test_file.exists():
                self.log(f"✅ {src_file} → {test_file}")
            else:
                orphaned.append(src_file)
                self.log(f"❌ {src_file} → MISSING: {test_file}")

        if orphaned:
            self.error(f"Orphaned files without tests: {len(orphaned)}")
            for file in orphaned:
                print(f"   ❌ {file}")
        else:
            self.success(f"All {len(src_files)} files have 1:1 test pairs")

        return self.result()

    def _get_test_file_path(self, src_file: pathlib.Path) -> pathlib.Path:
        """Get expected test file path for implementation file"""
        # src/auth/oauth.py → tests/auth/test_oauth.py
        # src/components/Button.tsx → tests/components/Button.test.tsx

        relative = src_file.relative_to("src")
        parent = relative.parent
        name = relative.stem
        suffix = relative.suffix

        # Determine test naming convention
        if suffix in [".ts", ".tsx", ".js", ".jsx"]:
            test_name = f"{name}.test{suffix}"
        else:  # Python
            test_name = f"test_{name}{suffix}"

        return pathlib.Path("tests") / parent / test_name


class Phase2Validator(PhaseValidator):
    """Phase 2: Testing validation"""

    def validate(self, min_coverage: int = 80) -> ValidationResult:
        """Validate Phase 2: Tests pass with minimum coverage"""
        print(f"\n🔍 Validating Phase 2 (Tests & Coverage)...")

        # Detect project type
        if (pathlib.Path("package.json").exists()):
            return self._validate_node(min_coverage)
        elif (pathlib.Path("requirements.txt").exists() or
              pathlib.Path("pyproject.toml").exists()):
            return self._validate_python(min_coverage)
        else:
            self.error("Cannot detect project type (no package.json or requirements.txt)")
            return self.result()

    def _validate_python(self, min_coverage: int) -> ValidationResult:
        """Validate Python tests"""
        try:
            # Run pytest with coverage
            result = subprocess.run(
                ["pytest", "tests/", "-v", "--cov=src", "--cov-report=term"],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                self.success("All tests passed")
            else:
                self.error("Tests failed")
                print(result.stdout)
                print(result.stderr)
                return self.result()

            # Check coverage (rough parsing)
            if f"TOTAL" in result.stdout:
                # Extract coverage percentage
                match = re.search(r"TOTAL\s+\d+\s+\d+\s+(\d+)%", result.stdout)
                if match:
                    coverage = int(match.group(1))
                    if coverage >= min_coverage:
                        self.success(f"Coverage: {coverage}% (>= {min_coverage}%)")
                    else:
                        self.error(f"Coverage too low: {coverage}% (minimum {min_coverage}%)")
                else:
                    self.warn("Could not parse coverage percentage")

        except FileNotFoundError:
            self.error("pytest not found. Install: pip install pytest pytest-cov")
        except subprocess.TimeoutExpired:
            self.error("Tests timed out after 5 minutes")

        return self.result()

    def _validate_node(self, min_coverage: int) -> ValidationResult:
        """Validate Node.js tests"""
        try:
            # Run npm test
            result = subprocess.run(
                ["npm", "test"],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                self.success("All tests passed")
            else:
                self.error("Tests failed")
                print(result.stdout)
                print(result.stderr)

        except FileNotFoundError:
            self.error("npm not found")
        except subprocess.TimeoutExpired:
            self.error("Tests timed out after 5 minutes")

        return self.result()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Universal Phase Validator (Cross-platform)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/validate_phase_universal.py 0 0001       # Validate Phase 0
  python scripts/validate_phase_universal.py 0.5 0001     # Validate Phase 0.5
  python scripts/validate_phase_universal.py 1            # Validate Phase 1
  python scripts/validate_phase_universal.py 2            # Validate Phase 2
  python scripts/validate_phase_universal.py 2 --coverage 90  # Custom coverage
        """
    )

    parser.add_argument("phase", type=str, help="Phase to validate (0, 0.5, 1, 2, 3, 5, 6)")
    parser.add_argument("prd_number", nargs="?", help="PRD number (for Phase 0, 0.5)")
    parser.add_argument("--coverage", type=int, default=80, help="Minimum coverage % (Phase 2)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()

    # Validate based on phase
    if args.phase == "0":
        if not args.prd_number:
            print("❌ PRD number required for Phase 0")
            sys.exit(1)
        validator = Phase0Validator(verbose=args.verbose)
        result = validator.validate(args.prd_number)

    elif args.phase == "0.5":
        if not args.prd_number:
            print("❌ PRD number required for Phase 0.5")
            sys.exit(1)
        validator = Phase05Validator(verbose=args.verbose)
        result = validator.validate(args.prd_number)

    elif args.phase == "1":
        validator = Phase1Validator(verbose=args.verbose)
        result = validator.validate()

    elif args.phase == "2":
        validator = Phase2Validator(verbose=args.verbose)
        result = validator.validate(min_coverage=args.coverage)

    elif args.phase == "2.5":
        # Phase 2.5: Code Review Validation
        print("\n🔍 Validating Phase 2.5 (Code Review)...")
        validator = PhaseValidator(verbose=args.verbose)

        # Check for pending changes
        res = subprocess.run(["git", "diff", "--name-only", "origin/HEAD..."],
                           capture_output=True, text=True)
        if res.stdout.strip():
            changed_files = len(res.stdout.strip().split('\n'))
            validator.success(f"Found {changed_files} changed files for review")
        else:
            validator.warn("No changes detected for review")

        # Check for critical markers (TODO, FIXME, HACK)
        res = subprocess.run(["git", "diff", "origin/HEAD..."], capture_output=True, text=True)
        diff_content = res.stdout

        critical_markers = ["TODO:", "FIXME:", "HACK:", "XXX:"]
        for marker in critical_markers:
            if marker in diff_content:
                validator.warn(f"Found '{marker}' in changes")

        # Security check
        security_patterns = [
            (r"password\s*=\s*['\"]", "Hardcoded password"),
            (r"api_key\s*=\s*['\"]", "Hardcoded API key"),
            (r"secret\s*=\s*['\"]", "Hardcoded secret"),
            (r"eval\(", "Dangerous eval()"),
        ]

        for pattern, name in security_patterns:
            if re.search(pattern, diff_content, re.IGNORECASE):
                validator.error(f"Security issue: {name}")

        # Check tests directory exists
        if pathlib.Path("tests").exists():
            test_files = list(pathlib.Path("tests").rglob("*test*.py")) + \
                        list(pathlib.Path("tests").rglob("*.test.*"))
            if test_files:
                validator.success(f"Test files exist ({len(test_files)} files)")
            else:
                validator.warn("No test files found in tests/")
        else:
            validator.warn("tests/ directory not found")

        result = validator.result()

    elif args.phase == "3":
        # Phase 3: Versioning & Changelog
        print("\n🔍 Validating Phase 3 (Versioning & Changelog)...")
        validator = PhaseValidator(verbose=args.verbose)

        # Check CHANGELOG.md exists and has recent entry
        changelog = pathlib.Path("CHANGELOG.md")
        if not changelog.exists():
            validator.error("CHANGELOG.md not found")
        else:
            validator.success("CHANGELOG.md found")
            with open(changelog, 'r', encoding='utf-8') as f:
                content = f.read()
            # Check for version pattern
            if re.search(r"##\s*\[?\d+\.\d+\.\d+\]?", content):
                validator.success("Version entry found in CHANGELOG")
            else:
                validator.warn("No semantic version found in CHANGELOG")

        result = validator.result()

    elif args.phase == "4":
        # Phase 4: Git Ops (Delegated to PowerShell on Windows, or simple check here)
        print("\n🔍 Validating Phase 4 (Git Ops)...")
        if sys.platform == "win32":
            # Delegate to PowerShell script if available
            ps_script = pathlib.Path("scripts/validate-phase-4.ps1")
            if ps_script.exists():
                print("   Delegating to validate-phase-4.ps1...")
                res = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", str(ps_script)])
                sys.exit(res.returncode)
            else:
                print("❌ scripts/validate-phase-4.ps1 not found")
                sys.exit(1)
        else:
            # Simple cross-platform check
            # 1. Check for uncommitted changes
            res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
            if res.stdout.strip():
                print("❌ Uncommitted changes detected")
                print(res.stdout)
                sys.exit(1)
            else:
                print("✅ Working directory clean")
                result = ValidationResult.PASS

    elif args.phase == "5":
        # Phase 5: E2E & Security
        print("\n🔍 Validating Phase 5 (E2E & Security)...")
        validator = PhaseValidator(verbose=args.verbose)

        # Check for security scan results or run basic checks
        try:
            # Python: pip-audit
            if pathlib.Path("requirements.txt").exists():
                res = subprocess.run(["pip-audit", "--strict"], capture_output=True, text=True, timeout=120)
                if res.returncode == 0:
                    validator.success("pip-audit: No vulnerabilities found")
                else:
                    validator.error(f"pip-audit found vulnerabilities:\n{res.stdout}")

            # Node.js: npm audit
            if pathlib.Path("package.json").exists():
                res = subprocess.run(["npm", "audit", "--audit-level=high"], capture_output=True, text=True, timeout=120)
                if res.returncode == 0:
                    validator.success("npm audit: No high/critical vulnerabilities")
                else:
                    validator.warn(f"npm audit found issues:\n{res.stdout}")

        except FileNotFoundError as e:
            validator.warn(f"Security tool not found: {e}")
        except subprocess.TimeoutExpired:
            validator.warn("Security scan timed out")

        result = validator.result()

    elif args.phase == "6":
        # Phase 6: Deployment Readiness
        print("\n🔍 Validating Phase 6 (Deployment Readiness)...")
        validator = PhaseValidator(verbose=args.verbose)

        # Check git tag exists
        res = subprocess.run(["git", "tag", "-l", "v*"], capture_output=True, text=True)
        if res.stdout.strip():
            latest_tag = res.stdout.strip().split('\n')[-1]
            validator.success(f"Git tag found: {latest_tag}")
        else:
            validator.warn("No version tags found (v* pattern)")

        # Check branch is clean
        res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if res.stdout.strip():
            validator.error("Working directory has uncommitted changes")
        else:
            validator.success("Working directory clean")

        # Check on main/master branch or has PR merged
        res = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True)
        branch = res.stdout.strip()
        if branch in ["main", "master"]:
            validator.success(f"On main branch: {branch}")
        else:
            validator.warn(f"Not on main branch: {branch}")

        result = validator.result()

    else:
        print(f"❌ Phase {args.phase} validation not yet implemented")
        print("   Available: 0, 0.5, 1, 2, 3, 4, 5, 6")
        sys.exit(1)

    # Print final result
    print(f"\n{result.value}")
    sys.exit(0 if result == ValidationResult.PASS else 1)


if __name__ == "__main__":
    main()
