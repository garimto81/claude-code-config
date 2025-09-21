# JavaScript/Node.js 프로젝트 설정

## 프로젝트 특화 설정
- **언어**: JavaScript/TypeScript
- **런타임**: Node.js
- **패키지 매니저**: npm/yarn/pnpm 자동 감지

## 필수 도구
- Node.js (LTS 버전 권장)
- npm/yarn/pnpm
- ESLint
- Prettier

## 코딩 표준
```yaml
formatting:
  - Prettier 설정 준수
  - 세미콜론 사용
  - 2-space 들여쓰기
linting:
  - ESLint 규칙 엄격 적용
  - TypeScript strict mode
testing:
  - Jest/Vitest 단위 테스트
  - Cypress/Playwright E2E 테스트
  - 최소 80% 커버리지
```

## 표준 명령어
```bash
npm run dev        # 개발 서버 시작
npm run build      # 프로덕션 빌드
npm run test       # 테스트 실행
npm run lint       # 린팅 검사
npm run type-check # TypeScript 타입 검사
```

## 보안 고려사항
- package-lock.json 항상 커밋
- npm audit 정기 실행
- .env 파일 gitignore 추가
- 의존성 취약점 모니터링