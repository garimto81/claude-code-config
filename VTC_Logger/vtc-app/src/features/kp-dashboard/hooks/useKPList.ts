import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/utils/supabase';
import { useKPStore } from '../store/kpStore';
import type { KPPlayer } from '@/shared/types/models';

export function useKPList() {
  const { setKPList } = useKPStore();

  return useQuery({
    queryKey: ['kp-list'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_kp_list_sparse');

      if (error) {
        console.error('Failed to fetch KP list:', error);
        throw error;
      }

      // Parse JSON string response
      const kpList = typeof data === 'string' ? JSON.parse(data) : data;

      // Update Zustand store
      setKPList(kpList);

      return kpList as KPPlayer[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
