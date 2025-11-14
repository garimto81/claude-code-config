// app/forbidden/page.tsx
// 새로 작성

import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <p className="mt-4 text-xl text-gray-600">
          이 페이지에 접근할 권한이 없습니다.
        </p>
        <p className="mt-2 text-gray-500">
          Admin 권한이 필요합니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
