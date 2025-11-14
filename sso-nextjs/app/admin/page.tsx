import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
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
                <span className="font-semibold">사용자 ID:</span> {session.user.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">이메일:</span> {session.user.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">이름:</span> {session.user.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">역할:</span>{" "}
                <span className={session.user.role === "admin" ? "text-red-600 font-bold" : "text-blue-600"}>
                  {session.user.role}
                </span>
              </p>
            </div>

            <form action={async () => {
              "use server"
              await import("@/app/actions/auth").then(m => m.logout())
            }} className="pt-4">
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
