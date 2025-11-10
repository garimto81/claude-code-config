# Project Constitution: SSO System + Multi-App Architecture
*Non-negotiable principles for development*

**Version**: 1.0.0 | **Last Updated**: 2025-11-10

---

## 1. Security Principles (Non-Negotiable)

### 1.1 Environment Variables
- ✅ **ALWAYS** use `.env` files for secrets (API keys, DB credentials)
- ✅ **NEVER** commit `.env` files to Git (must be in `.gitignore`)
- ✅ **ALWAYS** provide `.env.example` with dummy values
- ✅ **ALWAYS** validate env vars are loaded before app starts

```javascript
// Example validation
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL must be set in .env');
}
```

### 1.2 Supabase RLS (Row Level Security)
- ✅ **ALWAYS** enable RLS on all user data tables
- ✅ **NEVER** use service role key in client-side code
- ✅ **ALWAYS** test RLS policies with real users (not service role)
- ✅ **ALWAYS** document RLS policies in `docs/supabase_rls_policies.sql`

### 1.3 Authentication
- ✅ **ALWAYS** use Supabase Auth (no custom JWT handling)
- ✅ **ALWAYS** validate session on protected routes
- ✅ **NEVER** store auth tokens in localStorage (use httpOnly cookies via Supabase)

---

## 2. Architecture Principles

### 2.1 SSO System
- ✅ **SINGLE SOURCE OF TRUTH**: Supabase Auth for all apps
- ✅ **SDK-FIRST**: Shared `@yourorg/sso-sdk` package for auth logic
- ✅ **NO DUPLICATION**: Auth code lives in SDK, not individual apps

### 2.2 Multi-Repo Structure
```
sso-system/         # Monorepo: SSO + SDK
├── auth-service/   # Supabase project config
├── sdk/            # @yourorg/sso-sdk (shared package)
└── docs/           # Shared docs

apps/
├── VTC_Logger/     # App 1 (consumes SDK)
├── contents-factory/ # App 2 (consumes SDK)
└── [future apps]
```

### 2.3 Dependency Direction
```
Apps → SDK → Supabase
     ↘     ↗
      (never backwards)
```

---

## 3. Development Principles

### 3.1 Testing (Non-Negotiable)
- ✅ **1:1 TEST PAIRING**: Every implementation file must have a test file
- ✅ **TEST-FIRST for Auth**: Write auth tests before implementation
- ✅ **RLS TESTING**: Must test both allowed and denied scenarios

```bash
# Directory structure requirement
src/auth/login.ts        → tests/auth/login.test.ts
src/auth/register.ts     → tests/auth/register.test.ts
```

### 3.2 Version Control
- ✅ **FEATURE BRANCHES**: Never commit directly to main/master
- ✅ **SEMANTIC VERSIONING**: Major.Minor.Patch for all packages
- ✅ **COMMIT CONVENTION**: `type: subject (vVersion) [PRD-####]`

### 3.3 Documentation
- ✅ **PRD REQUIRED**: Every feature must have a PRD (Phase 0)
- ✅ **README FIRST**: Update README.md before implementation
- ✅ **INLINE DOCS**: JSDoc for all public functions

---

## 4. Technology Constraints

### 4.1 Approved Stack
- **Frontend**: React 18+ (TypeScript), Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand (no Redux)
- **Testing**: Vitest (unit), Playwright (e2e)
- **AI Tools**: Claude Code (primary), GitHub Copilot (secondary)

### 4.2 Prohibited
- ❌ **NO** custom auth systems (use Supabase Auth)
- ❌ **NO** JWT handling in client code (use Supabase SDK)
- ❌ **NO** direct SQL in app code (use Supabase client or RPC)
- ❌ **NO** localStorage for sensitive data

---

## 5. SSO-Specific Rules

### 5.1 User Profile Structure
```typescript
// Must match across all apps
interface UserProfile {
  id: string;          // Supabase auth.users.id
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### 5.2 Session Management
- ✅ **SESSION REFRESH**: Handle token refresh automatically (Supabase SDK)
- ✅ **LOGOUT CLEANUP**: Clear all app state on logout
- ✅ **CONCURRENT SESSIONS**: Support multiple devices (don't force single session)

### 5.3 OAuth Providers
- **Google**: Primary (already configured)
- **GitHub**: Secondary (future)
- **Email/Password**: Fallback only

---

## 6. Failure Modes to Prevent

### 6.1 "Forgot to Check" Bugs
Before every PR, verify:
- [ ] Environment variables documented in `.env.example`
- [ ] RLS policies applied and tested
- [ ] All routes check authentication
- [ ] Error handling for network failures
- [ ] Loading states for async operations

### 6.2 Cross-App Consistency
Before publishing SDK update:
- [ ] Version bumped (semver)
- [ ] CHANGELOG updated
- [ ] Breaking changes documented
- [ ] All consuming apps tested

---

## 7. Enforcement

### 7.1 Pre-Commit Checks (Future)
```bash
# TODO: Setup git hooks
- Lint (ESLint)
- Format (Prettier)
- Type check (TypeScript)
- Test (Vitest --run)
```

### 7.2 Review Checklist
Even for solo dev, before merging:
1. Constitution compliance (review this file)
2. All tests passing (local + CI)
3. No console errors in browser
4. Mobile responsive (if UI change)
5. README updated (if API change)

---

## 8. When to Update Constitution

Add to this file when:
- ✅ Same mistake made 2+ times (make it a rule)
- ✅ Security incident or near-miss
- ✅ New technology added to stack
- ✅ Architecture decision with long-term impact

**Update frequency**: Review monthly, update as needed

---

**Last Review**: 2025-11-10
**Next Review**: 2025-12-10
