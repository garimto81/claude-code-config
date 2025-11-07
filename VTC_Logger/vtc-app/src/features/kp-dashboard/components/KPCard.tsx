import { motion } from 'framer-motion';
import { User, MapPin, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useHaptic } from '../hooks/useHaptic';
import type { KPPlayer } from '@/shared/types/models';

interface KPCardProps {
  kp: KPPlayer;
  onClaim: () => void;
  onUnclaim: () => void;
  isClaimPending?: boolean;
  isUnclaimPending?: boolean;
}

export function KPCard({
  kp,
  onClaim,
  onUnclaim,
  isClaimPending,
  isUnclaimPending,
}: KPCardProps) {
  const navigate = useNavigate();
  const { vibrate } = useHaptic();
  const userId = useAuthStore((state) => state.user?.id);

  const isClaimed = !!kp.current_logger_id;
  const isClaimedByMe = kp.current_logger_id === userId;
  const isLoading = isClaimPending || isUnclaimPending;

  const handleClaim = () => {
    vibrate('medium');
    onClaim();
  };

  const handleUnclaim = () => {
    vibrate('light');
    onUnclaim();
  };

  const handleLogHand = () => {
    vibrate('success');
    navigate(`/hand-input/${kp.kp_id}`);
  };

  // Card background color based on status
  const cardBgColor = isClaimedByMe
    ? 'rgb(6 78 59)' // Green-900
    : isClaimed
    ? 'rgb(55 65 81)' // Gray-700
    : 'rgb(31 41 55)'; // Gray-800

  // Border color based on status
  const borderColor = isClaimedByMe
    ? 'rgb(34 197 94)' // Green-500
    : isClaimed
    ? 'rgb(75 85 99)' // Gray-600
    : 'rgb(55 65 81)'; // Gray-700

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="rounded-lg border p-4 space-y-4"
      style={{
        backgroundColor: cardBgColor,
        borderColor: borderColor,
        borderWidth: '2px',
      }}
    >
      {/* Header: Photo + Name + Table/Seat */}
      <div className="flex items-center gap-3">
        {/* Photo */}
        <div
          className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
          style={{ backgroundColor: 'rgb(55 65 81)' }}
        >
          {kp.photo_url ? (
            <img
              src={kp.photo_url}
              alt={kp.player_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-7 h-7 text-gray-400" />
            </div>
          )}
        </div>

        {/* Name + Table/Seat */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">
            {kp.player_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>
              {kp.table_no ? `Table ${kp.table_no}` : 'No Table'} •{' '}
              {kp.seat_no ? `Seat ${kp.seat_no}` : 'No Seat'}
            </span>
          </div>
        </div>

        {/* Chip Count */}
        {kp.chip_count !== null && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-400">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-medium">
                {kp.chip_count.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {isClaimed && (
        <div
          className="px-3 py-1 rounded-full text-xs font-medium text-center"
          style={{
            backgroundColor: isClaimedByMe ? 'rgb(34 197 94)' : 'rgb(156 163 175)',
            color: isClaimedByMe ? 'rgb(6 78 59)' : 'rgb(31 41 55)',
          }}
        >
          {isClaimedByMe ? '내가 담당 중' : '다른 로거가 담당 중'}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isClaimed && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClaim}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgb(59 130 246)',
              color: 'white',
            }}
          >
            {isClaimPending ? 'Claiming...' : 'Claim'}
          </motion.button>
        )}

        {isClaimedByMe && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogHand}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md font-medium transition-all"
              style={{
                backgroundColor: 'rgb(34 197 94)',
                color: 'white',
              }}
            >
              Log Hand
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnclaim}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md font-medium transition-all border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgb(75 85 99)',
                color: 'rgb(209 213 219)',
              }}
            >
              {isUnclaimPending ? 'Unclaiming...' : 'Unclaim'}
            </motion.button>
          </>
        )}

        {isClaimed && !isClaimedByMe && (
          <div
            className="w-full py-2.5 px-4 rounded-md text-center text-sm font-medium"
            style={{
              backgroundColor: 'rgb(55 65 81)',
              color: 'rgb(156 163 175)',
            }}
          >
            Claimed by Others
          </div>
        )}
      </div>
    </motion.div>
  );
}
