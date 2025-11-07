import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/utils/supabase';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';

interface ClaimKPParams {
  kpId: string;
  expectedVersion: number;
}

interface UnclaimKPParams {
  kpId: string;
}

interface ClaimResponse {
  success: boolean;
  error?: string;
  message?: string;
  current_version?: number;
  kp?: any;
}

export function useKPClaim() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  const claimKP = useMutation({
    mutationFn: async ({ kpId, expectedVersion }: ClaimKPParams) => {
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase.rpc('claim_kp', {
        p_kp_id: kpId,
        p_logger_id: userId,
        p_expected_version: expectedVersion,
      });

      if (error) {
        console.error('Claim KP error:', error);
        throw error;
      }

      // Parse JSON response
      const result: ClaimResponse = typeof data === 'string' ? JSON.parse(data) : data;

      if (!result.success) {
        if (result.error === 'VERSION_CONFLICT') {
          throw new Error('KP 정보가 변경되었습니다. 새로고침 후 다시 시도하세요.');
        } else if (result.error === 'ALREADY_CLAIMED') {
          throw new Error('다른 로거가 이미 이 KP를 담당하고 있습니다.');
        } else if (result.error === 'LOCK_TIMEOUT') {
          throw new Error('다른 로거가 이 KP를 처리 중입니다. 잠시 후 다시 시도하세요.');
        } else {
          throw new Error(result.message || 'KP Claim 실패');
        }
      }

      return result.kp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kp-list'] });
      toast.success('KP를 담당하게 되었습니다.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'KP Claim 실패');
    },
  });

  const unclaimKP = useMutation({
    mutationFn: async ({ kpId }: UnclaimKPParams) => {
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase.rpc('unclaim_kp', {
        p_kp_id: kpId,
        p_logger_id: userId,
      });

      if (error) {
        console.error('Unclaim KP error:', error);
        throw error;
      }

      // Parse JSON response
      const result: ClaimResponse = typeof data === 'string' ? JSON.parse(data) : data;

      if (!result.success) {
        throw new Error(result.message || 'KP Unclaim 실패');
      }

      return result.kp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kp-list'] });
      toast.success('KP 담당을 해제했습니다.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'KP Unclaim 실패');
    },
  });

  return {
    claimKP: claimKP.mutate,
    unclaimKP: unclaimKP.mutate,
    isClaimPending: claimKP.isPending,
    isUnclaimPending: unclaimKP.isPending,
  };
}
