import { create } from 'zustand';
import type { KPPlayer } from '@/shared/types/models';

interface KPState {
  kpList: KPPlayer[];
  selectedKPId: string | null;
  filterStatus: 'all' | 'claimed' | 'unclaimed';
  sortBy: 'name' | 'table' | 'chip_count';

  // Actions
  setKPList: (list: KPPlayer[]) => void;
  updateKP: (kpId: string, updates: Partial<KPPlayer>) => void;
  setSelectedKP: (kpId: string | null) => void;
  setFilterStatus: (status: 'all' | 'claimed' | 'unclaimed') => void;
  setSortBy: (sortBy: 'name' | 'table' | 'chip_count') => void;

  // Computed
  getFilteredKPs: () => KPPlayer[];
  getKPById: (kpId: string) => KPPlayer | undefined;
}

export const useKPStore = create<KPState>((set, get) => ({
  kpList: [],
  selectedKPId: null,
  filterStatus: 'all',
  sortBy: 'name',

  setKPList: (list) => set({ kpList: list }),

  updateKP: (kpId, updates) =>
    set((state) => ({
      kpList: state.kpList.map((kp) =>
        kp.kp_id === kpId ? { ...kp, ...updates } : kp
      ),
    })),

  setSelectedKP: (kpId) => set({ selectedKPId: kpId }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  setSortBy: (sortBy) => set({ sortBy }),

  getFilteredKPs: () => {
    const { kpList, filterStatus, sortBy } = get();

    // Filter
    let filtered = kpList;
    if (filterStatus === 'claimed') {
      filtered = kpList.filter((kp) => kp.current_logger_id !== null);
    } else if (filterStatus === 'unclaimed') {
      filtered = kpList.filter((kp) => kp.current_logger_id === null);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.player_name.localeCompare(b.player_name);
      } else if (sortBy === 'table') {
        const tableA = a.table_no ?? 999;
        const tableB = b.table_no ?? 999;
        if (tableA !== tableB) return tableA - tableB;
        return (a.seat_no ?? 999) - (b.seat_no ?? 999);
      } else if (sortBy === 'chip_count') {
        const chipA = a.chip_count ?? 0;
        const chipB = b.chip_count ?? 0;
        return chipB - chipA; // Descending
      }
      return 0;
    });

    return sorted;
  },

  getKPById: (kpId) => {
    return get().kpList.find((kp) => kp.kp_id === kpId);
  },
}));
