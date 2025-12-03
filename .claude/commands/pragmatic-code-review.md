---
description: Conduct comprehensive code review based on Pragmatic Quality framework
---

# /pragmatic-code-review - 코드 품질 리뷰

Phase 2.5에서 사용하는 포괄적인 코드 리뷰 명령어.

## Usage

```
/pragmatic-code-review
```

## What it does

1. **Git 상태 분석**: 현재 브랜치의 변경사항 확인
2. **코드 품질 검토**: 아키텍처, 성능, 유지보수성
3. **보안 검사**: 취약점 및 베스트 프랙티스
4. **리뷰 리포트 생성**: Markdown 형식의 상세 리뷰

## Review Categories

- **Architecture**: 설계 패턴, 모듈 구조
- **Performance**: 성능 병목, 최적화 기회
- **Security**: OWASP Top 10, 인증/인가
- **Maintainability**: 코드 가독성, 테스트 용이성
- **Best Practices**: 언어별 컨벤션 준수

## Phase Integration

```
Phase 2 (Testing) → Phase 2.5 (/pragmatic-code-review) → Phase 3 (Versioning)
```

## Exit Criteria

- Critical/High 이슈 없음
- 보안 취약점 해결됨
- 리뷰어 승인

## Related

- `/design-review` - UI/UX 디자인 리뷰
- `/check` - 정적 분석 + 보안 스캔
- `scripts/validate-phase-2.5.ps1` - Phase 2.5 자동 검증
