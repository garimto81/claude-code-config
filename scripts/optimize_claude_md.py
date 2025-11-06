#!/usr/bin/env python3
"""
CLAUDE.md 최적화 분석 도구
전역 지침 파일의 품질을 평가하고 개선 제안을 제공합니다.
"""

import re
import sys
from pathlib import Path
from collections import Counter
from typing import List, Dict, Tuple


class CLAUDEMDOptimizer:
    def __init__(self, file_path: str = "CLAUDE.md"):
        self.file_path = Path(file_path)
        self.content = ""
        self.lines = []

        if self.file_path.exists():
            self.content = self.file_path.read_text(encoding='utf-8')
            self.lines = self.content.split('\n')

    def analyze(self) -> Dict:
        """전체 분석 실행"""
        if not self.content:
            return {"error": "CLAUDE.md 파일을 찾을 수 없습니다"}

        return {
            "file_info": self._get_file_info(),
            "structure": self._analyze_structure(),
            "duplicates": self._find_duplicates(),
            "readability": self._check_readability(),
            "token_estimate": self._estimate_tokens(),
            "recommendations": self._generate_recommendations()
        }

    def _get_file_info(self) -> Dict:
        """파일 기본 정보"""
        version_match = re.search(r'\*\*버전\*\*:\s*([0-9.]+)', self.content)

        return {
            "total_lines": len(self.lines),
            "non_empty_lines": len([l for l in self.lines if l.strip()]),
            "version": version_match.group(1) if version_match else "Unknown",
            "size_bytes": len(self.content.encode('utf-8')),
            "char_count": len(self.content)
        }

    def _analyze_structure(self) -> Dict:
        """문서 구조 분석"""
        sections = []
        current_section = None
        code_blocks = 0
        tables = 0

        for line in self.lines:
            # 섹션 헤더
            if line.startswith('##'):
                if current_section:
                    sections.append(current_section)
                current_section = {
                    "title": line.strip('#').strip(),
                    "level": len(line) - len(line.lstrip('#')),
                    "lines": 0
                }
            elif current_section:
                current_section["lines"] += 1

            # 코드 블록
            if line.strip().startswith('```'):
                code_blocks += 1

            # 테이블
            if '|' in line and line.count('|') >= 2:
                tables += 1

        if current_section:
            sections.append(current_section)

        return {
            "total_sections": len(sections),
            "sections": sections,
            "code_blocks": code_blocks // 2,  # 시작/끝 쌍
            "tables": tables
        }

    def _find_duplicates(self) -> Dict:
        """중복 항목 찾기"""
        # 강조 표시(**text**)
        bold_items = re.findall(r'\*\*([^*]+)\*\*', self.content)
        bold_counter = Counter(bold_items)
        duplicates = {k: v for k, v in bold_counter.items() if v > 1}

        # 유사 문장 (간단한 검사)
        line_counter = Counter([l.strip() for l in self.lines if l.strip() and not l.strip().startswith('#')])
        duplicate_lines = {k: v for k, v in line_counter.items() if v > 1 and len(k) > 20}

        return {
            "duplicate_bold_items": duplicates,
            "duplicate_lines_count": len(duplicate_lines),
            "duplicate_lines": list(duplicate_lines.keys())[:5]  # 상위 5개만
        }

    def _check_readability(self) -> Dict:
        """가독성 검사"""
        # 평균 줄 길이
        non_empty_lines = [l for l in self.lines if l.strip()]
        avg_line_length = sum(len(l) for l in non_empty_lines) / len(non_empty_lines) if non_empty_lines else 0

        # 긴 줄 (100자 초과)
        long_lines = [(i+1, len(l)) for i, l in enumerate(self.lines) if len(l) > 100]

        # 연속 빈 줄
        consecutive_empty = []
        empty_count = 0
        for i, line in enumerate(self.lines):
            if not line.strip():
                empty_count += 1
            else:
                if empty_count > 2:
                    consecutive_empty.append((i-empty_count+1, empty_count))
                empty_count = 0

        return {
            "avg_line_length": round(avg_line_length, 1),
            "long_lines_count": len(long_lines),
            "long_lines": long_lines[:5],
            "consecutive_empty_lines": consecutive_empty
        }

    def _estimate_tokens(self) -> Dict:
        """토큰 수 추정 (간단한 방법)"""
        # 대략적인 추정: 1 token ≈ 4 characters (영문 기준)
        # 한글은 더 많은 토큰 사용 가능
        total_chars = len(self.content)
        estimated_tokens = total_chars // 3  # 한글 고려

        # Claude API 비용 추정 (2025년 기준)
        cost_per_1m_tokens = 3.0  # Input tokens
        estimated_cost = (estimated_tokens / 1_000_000) * cost_per_1m_tokens

        return {
            "estimated_tokens": estimated_tokens,
            "estimated_cost_per_call": round(estimated_cost, 6),
            "estimated_cost_100_calls": round(estimated_cost * 100, 4)
        }

    def _generate_recommendations(self) -> List[Dict]:
        """개선 권장사항 생성"""
        recommendations = []
        info = self._get_file_info()
        duplicates = self._find_duplicates()
        readability = self._check_readability()

        # 문서 길이
        if info["total_lines"] > 200:
            recommendations.append({
                "level": "warning",
                "category": "Length",
                "message": f"문서가 {info['total_lines']}줄로 너무 깁니다 (권장: 200줄 이하)",
                "suggestion": "불필요한 섹션 제거 또는 외부 문서로 분리"
            })

        # 중복 항목
        if len(duplicates["duplicate_bold_items"]) > 5:
            recommendations.append({
                "level": "info",
                "category": "Duplicates",
                "message": f"{len(duplicates['duplicate_bold_items'])}개의 중복 강조 항목 발견",
                "suggestion": "중복 제거로 명확성 향상"
            })

        # 가독성
        if readability["long_lines_count"] > 10:
            recommendations.append({
                "level": "info",
                "category": "Readability",
                "message": f"{readability['long_lines_count']}개의 긴 줄 (100자 초과) 발견",
                "suggestion": "줄바꿈으로 가독성 개선"
            })

        # 연속 빈 줄
        if readability["consecutive_empty_lines"]:
            recommendations.append({
                "level": "info",
                "category": "Formatting",
                "message": f"{len(readability['consecutive_empty_lines'])}곳에서 연속 빈 줄 (3개 이상) 발견",
                "suggestion": "불필요한 빈 줄 제거"
            })

        # 긍정적인 피드백
        if not recommendations:
            recommendations.append({
                "level": "success",
                "category": "Quality",
                "message": "문서가 최적 상태입니다!",
                "suggestion": "현재 구조 유지"
            })

        return recommendations


def print_report(analysis: Dict):
    """분석 결과 출력"""
    # Windows 콘솔 인코딩 처리
    import sys
    if sys.platform == 'win32':
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

    print("=" * 60)
    print("📊 CLAUDE.md 최적화 분석 보고서")
    print("=" * 60)
    print()

    # 파일 정보
    info = analysis["file_info"]
    print(f"📄 파일 정보:")
    print(f"   버전: {info['version']}")
    print(f"   전체 줄 수: {info['total_lines']}줄")
    print(f"   내용 줄 수: {info['non_empty_lines']}줄")
    print(f"   파일 크기: {info['size_bytes']:,} bytes")
    print()

    # 구조
    structure = analysis["structure"]
    print(f"📐 구조:")
    print(f"   섹션 수: {structure['total_sections']}개")
    print(f"   코드 블록: {structure['code_blocks']}개")
    print(f"   테이블: {structure['tables']}개")
    print()

    # 토큰 추정
    tokens = analysis["token_estimate"]
    print(f"🎫 토큰 추정:")
    print(f"   예상 토큰: ~{tokens['estimated_tokens']:,} tokens")
    print(f"   호출당 비용: ~${tokens['estimated_cost_per_call']:.6f}")
    print(f"   100회 호출 비용: ~${tokens['estimated_cost_100_calls']:.4f}")
    print()

    # 중복 항목
    duplicates = analysis["duplicates"]
    if duplicates["duplicate_bold_items"]:
        print(f"🔄 중복 강조 항목 ({len(duplicates['duplicate_bold_items'])}개):")
        for item, count in list(duplicates["duplicate_bold_items"].items())[:5]:
            print(f"   '{item}': {count}회")
        print()

    # 권장사항
    print("💡 권장사항:")
    for i, rec in enumerate(analysis["recommendations"], 1):
        icon = {"warning": "⚠️", "info": "ℹ️", "success": "✅"}.get(rec["level"], "•")
        print(f"   {icon} [{rec['category']}] {rec['message']}")
        print(f"      → {rec['suggestion']}")
    print()

    print("=" * 60)


def main():
    """메인 실행"""
    file_path = sys.argv[1] if len(sys.argv) > 1 else "CLAUDE.md"

    optimizer = CLAUDEMDOptimizer(file_path)
    analysis = optimizer.analyze()

    if "error" in analysis:
        print(f"❌ 오류: {analysis['error']}")
        sys.exit(1)

    print_report(analysis)

    # 종료 코드: 경고가 있으면 1, 없으면 0
    has_warnings = any(r["level"] == "warning" for r in analysis["recommendations"])
    sys.exit(1 if has_warnings else 0)


if __name__ == "__main__":
    main()