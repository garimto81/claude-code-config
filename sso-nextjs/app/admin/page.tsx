'use client'

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminPage() {
  const { data: session, status } = useSession()

  // 로딩 중일 때
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // 세션이 없을 때 (미들웨어가 처리하지만 안전장치)
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Redirecting...</p>
        </div>
      </div>
    )
  }

  const user = session.user
  const role = user.role

  return (
    <>
      <ThemeToggle />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>

          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">
                로그인 성공!
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">사용자 ID:</span> {user.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">이메일:</span> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">이름:</span> {user.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">역할:</span>{" "}
                <span className={role === "admin" ? "text-red-600 font-bold" : "text-blue-600"}>
                  {role}
                </span>
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
