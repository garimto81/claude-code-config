import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, SortAsc, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useKPList } from '../hooks/useKPList';
import { useKPClaim } from '../hooks/useKPClaim';
import { useRealtimeKPUpdates } from '../hooks/useRealtimeKPUpdates';
import { useKPStore } from '../store/kpStore';
import { KPCard } from './KPCard';

export function KPDashboard() {
  const { data: kpList, isLoading, error } = useKPList();
  const { claimKP, unclaimKP, isClaimPending, isUnclaimPending } = useKPClaim();
  const { logout, user } = useAuthStore();
  const { filterStatus, setFilterStatus, sortBy, setSortBy, getFilteredKPs } = useKPStore();

  // Enable realtime updates
  useRealtimeKPUpdates();

  const [showFilters, setShowFilters] = useState(false);

  // Get filtered and sorted KP list
  const filteredKPs = getFilteredKPs();

  // Calculate statistics
  const totalKPs = kpList?.length || 0;
  const claimedKPs = kpList?.filter((kp) => kp.current_logger_id !== null).length || 0;
  const myKPs = kpList?.filter((kp) => kp.current_logger_id === user?.id).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(17 24 39)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 mx-auto mb-4" style={{ borderColor: 'rgb(59 130 246)' }} />
          <p className="text-gray-400 text-lg">KP 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(17 24 39)' }}>
        <div className="max-w-md p-8 rounded-lg border text-center" style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(220 38 38)' }}>
          <h2 className="text-2xl font-bold text-red-400 mb-4">오류 발생</h2>
          <p className="text-gray-300 mb-4">KP 목록을 불러오는데 실패했습니다.</p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(17 24 39)' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(55 65 81)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-7 h-7" style={{ color: 'rgb(59 130 246)' }} />
                KP Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {user?.display_name} ({user?.role})
              </p>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all border"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgb(75 85 99)',
                color: 'rgb(209 213 219)',
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>

          {/* Statistics */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(55 65 81)' }}>
              <p className="text-xs text-gray-400">Total KPs</p>
              <p className="text-2xl font-bold text-white">{totalKPs}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(55 65 81)' }}>
              <p className="text-xs text-gray-400">Claimed</p>
              <p className="text-2xl font-bold text-blue-400">{claimedKPs}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(6 78 59)' }}>
              <p className="text-xs text-gray-400">My KPs</p>
              <p className="text-2xl font-bold text-green-400">{myKPs}</p>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="mt-4 flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all border"
              style={{
                backgroundColor: showFilters ? 'rgb(59 130 246)' : 'transparent',
                borderColor: showFilters ? 'rgb(59 130 246)' : 'rgb(75 85 99)',
                color: showFilters ? 'white' : 'rgb(209 213 219)',
              }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </motion.button>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                {(['all', 'claimed', 'unclaimed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className="px-3 py-1 rounded-md text-sm font-medium transition-all"
                    style={{
                      backgroundColor: filterStatus === status ? 'rgb(59 130 246)' : 'rgb(55 65 81)',
                      color: filterStatus === status ? 'white' : 'rgb(209 213 219)',
                    }}
                  >
                    {status === 'all' ? 'All' : status === 'claimed' ? 'Claimed' : 'Unclaimed'}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <SortAsc className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'table' | 'chip_count')}
                className="px-3 py-2 rounded-md font-medium text-sm border outline-none"
                style={{
                  backgroundColor: 'rgb(55 65 81)',
                  borderColor: 'rgb(75 85 99)',
                  color: 'rgb(209 213 219)',
                }}
              >
                <option value="name">Name</option>
                <option value="table">Table & Seat</option>
                <option value="chip_count">Chip Count</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* KP Grid */}
      <main className="container mx-auto px-4 py-6">
        {filteredKPs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">해당하는 KP가 없습니다.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredKPs.map((kp) => (
              <KPCard
                key={kp.kp_id}
                kp={kp}
                onClaim={() => claimKP({ kpId: kp.kp_id, expectedVersion: kp.version })}
                onUnclaim={() => unclaimKP({ kpId: kp.kp_id })}
                isClaimPending={isClaimPending}
                isUnclaimPending={isUnclaimPending}
              />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
