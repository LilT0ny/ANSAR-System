import { create } from 'zustand';

const useOdontogramStore = create((set) => ({
    teeth: {}, // Format: { "11": { status: 'healthy', surfaces: [] }, ... }
    selectedTooth: null,

    selectTooth: (id) => set({ selectedTooth: id }),

    updateTooth: (id, data) => set((state) => ({
        teeth: {
            ...state.teeth,
            [id]: { ...state.teeth[id], ...data }
        }
    })),

    loadOdontogram: (data) => set({ teeth: data }),

    reset: () => set({ teeth: {}, selectedTooth: null }),
}));

export default useOdontogramStore;
