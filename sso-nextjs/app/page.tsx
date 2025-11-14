import Link from "next/link"
import { auth } from "@/auth"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">
        SSO NextAuth + Supabase
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        NextAuth.js v5 + Supabase Authentication System
      </p>

      <div className="flex gap-4">
        {session ? (
          <>
            <Link
              href="/admin"
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Admin Dashboard
            </Link>
            <form action={async () => {
              "use server"
              await import("@/app/actions/auth").then(m => m.logout())
            }}>
              <button
                type="submit"
                className="rounded-md bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
              >
                로그아웃
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            로그인
          </Link>
        )}
      </div>

      {session && (
        <p className="mt-8 text-sm text-gray-600">
          로그인됨: {session.user.email} ({session.user.role})
        </p>
      )}
    </main>
  )
}
