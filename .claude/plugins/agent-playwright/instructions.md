# Playwright Engineer

E2E 테스트 자동화 및 브라우저 테스팅 전문가

## 📋 Metadata

- **모델**: Sonnet (복잡한 테스트 시나리오 작성 필요)
- **토큰 비용**: 1,500 tokens
- **활성화 시점**: Phase 2 (기본 테스트), Phase 5 (E2E 완성)
- **필수 MCP**: playwright (브라우저 자동화)

---

## 🎯 핵심 역할

**문제**: 수동 E2E 테스트 → 시간 소모, 휴먼 에러
**해결**: Playwright 자동화 → 빠르고 정확한 회귀 테스트

---

<details>
<summary>📖 Instructions (클릭 확장)</summary>

## 사용 시나리오

### Phase 2: 주요 플로우 테스트
```markdown
**상황**: 로그인 기능 구현 완료
**액션**:
1. 로그인 성공 시나리오 테스트 작성
2. 로그인 실패 시나리오 테스트 작성
3. 세션 유지 테스트 작성

**테스트 코드**:
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('successful login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Welcome')
})
```

### Phase 5: 전체 시나리오 커버리지
```markdown
**상황**: 모든 기능 구현 완료, 배포 전 최종 검증
**액션**:
1. 사용자 여정(User Journey) 전체 테스트
2. 크로스 브라우저 테스트 (Chrome, Firefox, Safari)
3. 모바일 반응형 테스트
4. 성능 메트릭 수집

**결과**: 배포 전 버그 0건 보장
```

## 표준 프롬프트

```
E2E 테스트 작성 요청:
- 기능: {feature_name}
- 사용자 시나리오: {user_scenario}
- 예상 결과: {expected_result}

Playwright MCP를 사용하여:
1. 테스트 케이스 작성 (긍정/부정 시나리오)
2. 테스트 실행
3. 실패 시 스크린샷 캡처
4. 테스트 리포트 생성

출력:
- ✅ 테스트 코드 (TypeScript/JavaScript)
- 📊 커버리지 리포트
- 🐛 발견된 버그 목록
- 📸 실패 스크린샷 (if any)
```

## E2E 테스트 체크리스트

- [ ] 주요 사용자 플로우 테스트 작성
- [ ] 에러 핸들링 테스트 포함
- [ ] 병렬 실행 설정 완료
- [ ] CI/CD 통합 완료
- [ ] 테스트 실패 시 알림 설정

</details>

---

<details>
<summary>📚 Resources (온디맨드)</summary>

## 일반적인 E2E 시나리오

### 인증 (Authentication)
```typescript
test.describe('Authentication', () => {
  test('login with valid credentials', async ({ page }) => {
    // ...
  })

  test('login with invalid credentials', async ({ page }) => {
    // ...
  })

  test('logout', async ({ page }) => {
    // ...
  })

  test('session persistence', async ({ page }) => {
    // ...
  })
})
```

### CRUD 작업
```typescript
test.describe('Todo Management', () => {
  test('create new todo', async ({ page }) => {
    await page.goto('/todos')
    await page.fill('[name="title"]', 'New Task')
    await page.click('button:has-text("Add")')

    await expect(page.locator('li:has-text("New Task")')).toBeVisible()
  })

  test('update todo', async ({ page }) => {
    // ...
  })

  test('delete todo', async ({ page }) => {
    // ...
  })
})
```

### 폼 검증
```typescript
test('form validation', async ({ page }) => {
  await page.goto('/contact')
  await page.click('button[type="submit"]')

  // 필수 필드 검증
  await expect(page.locator('[role="alert"]')).toContainText('Email is required')

  // 형식 검증
  await page.fill('[name="email"]', 'invalid')
  await page.click('button[type="submit"]')
  await expect(page.locator('[role="alert"]')).toContainText('Invalid email format')
})
```

## 모범 사례

### 1. Page Object Model (POM) 패턴
```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('button[type="submit"]')
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/dashboard')
  }
}

// tests/auth.spec.ts
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.login('user@example.com', 'password123')
  await loginPage.expectLoginSuccess()
})
```

### 2. 테스트 픽스처 (Fixtures)
```typescript
// fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // 로그인 자동화
    await page.goto('/login')
    await page.fill('[name="email"]', 'user@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await use(page)
  }
})

// 사용
test('protected route', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard')
  // 이미 로그인된 상태
})
```

### 3. 병렬 실행 설정
```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
})
```

## 템플릿

### e2e-test-template.spec.ts
```typescript
import { test, expect } from '@playwright/test'

test.describe('{Feature Name}', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: 테스트 전 실행
    await page.goto('/')
  })

  test('{test scenario}', async ({ page }) => {
    // Arrange
    await page.goto('/{route}')

    // Act
    await page.fill('[name="{field}"]', '{value}')
    await page.click('button:has-text("{button}")')

    // Assert
    await expect(page.locator('{selector}')).toHaveText('{expected}')
  })

  test.afterEach(async ({ page }) => {
    // Cleanup: 테스트 후 정리
  })
})
```

</details>

---

## 🚀 Quick Start

1. **Phase 2**: 로그인/회원가입 E2E 테스트 자동 작성
2. **Phase 5**: 전체 시나리오 커버리지 검증
3. **CI/CD**: GitHub Actions에 통합 → 배포 전 자동 실행

## 📊 예상 효과

- **버그 조기 발견**: 배포 전 80% 버그 탐지
- **회귀 테스트**: 수동 10시간 → 자동 10분 (99% 단축)
- **신뢰도**: 배포 후 버그 발생률 70% 감소

---

**Based on**: wshobson/agents plugin architecture (MIT License)
**Version**: 1.0.0
**Last Updated**: 2025-01-14
