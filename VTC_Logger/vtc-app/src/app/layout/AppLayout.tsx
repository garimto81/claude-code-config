import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export function AppLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">VTC Story Ledger</h1>
            <p className="text-xs text-gray-400">
              {user?.display_name} • {user?.role}
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
