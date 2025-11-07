import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/utils/supabase';
import { useKPStore } from '../store/kpStore';
import type { KPPlayer } from '@/shared/types/models';

export function useRealtimeKPUpdates() {
  const queryClient = useQueryClient();
  const { updateKP } = useKPStore();

  useEffect(() => {
    // Subscribe to kp_players table changes
    const channel = supabase
      .channel('kp-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // All events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'kp_players',
        },
        (payload) => {
          console.log('KP Realtime Update:', payload);

          if (payload.eventType === 'UPDATE') {
            const updatedKP = payload.new as KPPlayer;

            // Update Zustand store
            updateKP(updatedKP.kp_id, updatedKP);

            // Update React Query cache
            queryClient.setQueryData<KPPlayer[]>(['kp-list'], (oldData) => {
              if (!oldData) return oldData;
              return oldData.map((kp) =>
                kp.kp_id === updatedKP.kp_id ? updatedKP : kp
              );
            });
          } else if (payload.eventType === 'INSERT') {
            // Refetch entire list for new KP
            queryClient.invalidateQueries({ queryKey: ['kp-list'] });
          } else if (payload.eventType === 'DELETE') {
            // Refetch entire list for deleted KP
            queryClient.invalidateQueries({ queryKey: ['kp-list'] });
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, updateKP]);
}
