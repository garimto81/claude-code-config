import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'logger' | 'camera_supervisor' | 'producer';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, session, isLoading, isInitialized, error, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Loading state (only show if not initialized yet)
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(17 24 39)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 mx-auto mb-4" style={{ borderColor: 'rgb(59 130 246)' }} />
          <p className="text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  // Error state with helpful message
  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(17 24 39)' }}>
        <div className="max-w-md p-8 rounded-lg border" style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(220 38 38)' }}>
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Setup Required</h2>
          <p className="text-gray-300 mb-4">
            The database needs to be set up before you can use the application.
          </p>
          <div className="p-4 rounded text-sm text-gray-300 mb-4" style={{ backgroundColor: 'rgb(55 65 81)' }}>
            <p className="font-semibold mb-2">Quick Fix:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open Supabase Dashboard</li>
              <li>Go to SQL Editor</li>
              <li>Run the migration SQL</li>
              <li>Create a test user</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            See <code className="px-2 py-1 rounded" style={{ backgroundColor: 'rgb(55 65 81)' }}>AUTH_ERROR_FIX.md</code> for detailed instructions.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 rounded-md font-medium"
            style={{ backgroundColor: 'rgb(59 130 246)', color: 'white' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(17 24 39)' }}>
        <div className="max-w-md p-8 rounded-lg border text-center" style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(55 65 81)' }}>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-4">
            This page requires <span className="font-semibold" style={{ color: 'rgb(168 85 247)' }}>{requiredRole}</span> role.
          </p>
          <p className="text-gray-400 mb-6">
            Your role: <span className="font-semibold">{user.role}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 rounded-md font-medium"
            style={{ backgroundColor: 'rgb(55 65 81)', color: 'white' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
