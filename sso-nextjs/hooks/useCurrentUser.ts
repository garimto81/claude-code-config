// hooks/useCurrentUser.ts
// 참고: AsharibAli 패턴
// 재작성: 표준 React Hook 패턴 (공공재)

'use client'

import { useSession } from "next-auth/react"

/**
 * 현재 로그인한 사용자 정보 반환
 * @returns User 객체 또는 undefined
 */
export function useCurrentUser() {
  const { data: session } = useSession()
  return session?.user
}
