// hooks/useRole.ts
// 참고: AsharibAli 패턴
// 재작성: 표준 React Hook 패턴 (공공재)

'use client'

import { useCurrentUser } from "./useCurrentUser"

/**
 * 현재 사용자의 역할 반환
 * @returns 'admin' | 'user' | undefined
 */
export function useRole() {
  const user = useCurrentUser()
  return user?.role
}
