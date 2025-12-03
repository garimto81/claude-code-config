---
description: Perform security audit on the codebase
---

# /security-review - 보안 감사

Phase 2.5 및 Phase 5에서 사용하는 보안 검사 명령어.

## Usage

```
/security-review
```

## What it does

1. **의존성 취약점 스캔**: npm audit, pip-audit
2. **정적 보안 분석 (SAST)**: 코드 내 취약점 탐지
3. **시크릿 탐지**: 하드코딩된 비밀번호, API 키
4. **OWASP Top 10 체크**: 주요 보안 위험 검토

## Security Checks

### Dependency Vulnerabilities
```bash
# Python
pip-audit --strict

# Node.js
npm audit --audit-level=high
```

### Code Analysis
- SQL Injection
- XSS (Cross-Site Scripting)
- Command Injection
- Insecure Deserialization
- Hardcoded Secrets

### Configuration
- HTTPS 강제
- CORS 설정
- 인증/인가 검증
- 세션 관리

## Severity Levels

| Level | Action |
|-------|--------|
| CRITICAL | 즉시 수정 필수 (Phase 진행 차단) |
| HIGH | Phase 3 전 수정 필요 |
| MEDIUM | 리뷰 후 판단 |
| LOW | 백로그에 추가 |

## Phase Integration

- **Phase 2.5**: 코드 리뷰와 병렬 실행
- **Phase 5**: E2E 테스트와 병렬 실행

## Related

- `/pragmatic-code-review` - 코드 품질 리뷰
- `/check` - 정적 분석 통합
- `scripts/validate-phase-5.ps1` - Phase 5 보안 검증
