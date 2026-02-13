import { create } from 'zustand';

// Default tooth state
const createDefaultTooth = () => ({
    status: 'healthy',       // 'healthy' | 'caries' | 'treated' | 'missing' | 'custom'
    surfaces: {},            // { vestibular: 'caries', oclusal: 'treated', ... }
    notes: '',
});

const useOdontogramStore = create((set, get) => ({
    teeth: {},               // Format: { "11": { status, surfaces, notes }, ... }
    selectedTooth: null,

    selectTooth: (id) => set({ selectedTooth: id }),

    getTooth: (id) => {
        const state = get();
        return state.teeth[id] || createDefaultTooth();
    },

    // Update a full tooth status (whole tooth tool)
    updateToothStatus: (id, status) => set((state) => {
        const existing = state.teeth[id] || createDefaultTooth();
        return {
            teeth: {
                ...state.teeth,
                [id]: {
                    ...existing,
                    status,
                    // When marking whole tooth, clear individual surfaces
                    surfaces: status === 'healthy' ? {} : existing.surfaces,
                }
            }
        };
    }),

    // Update a specific surface with a condition (per-surface painting)
    updateToothSurface: (id, surface, condition) => set((state) => {
        const existing = state.teeth[id] || createDefaultTooth();
        const newSurfaces = { ...existing.surfaces };

        if (condition === 'healthy') {
            // Remove the surface condition (clear it)
            delete newSurfaces[surface];
        } else if (newSurfaces[surface] === condition) {
            // Toggle off if same condition
            delete newSurfaces[surface];
        } else {
            // Set the condition
            newSurfaces[surface] = condition;
        }

        // Determine overall status
        const surfaceValues = Object.values(newSurfaces);
        let newStatus = existing.status;
        if (surfaceValues.length === 0 && existing.status !== 'missing') {
            newStatus = 'healthy';
        } else if (surfaceValues.length > 0) {
            newStatus = 'custom'; // Mixed surfaces
        }

        return {
            teeth: {
                ...state.teeth,
                [id]: {
                    ...existing,
                    surfaces: newSurfaces,
                    status: newStatus,
                }
            }
        };
    }),

    // Update notes for a tooth
    updateToothNotes: (id, notes) => set((state) => {
        const existing = state.teeth[id] || createDefaultTooth();
        return {
            teeth: {
                ...state.teeth,
                [id]: { ...existing, notes }
            }
        };
    }),

    // Legacy update (backwards compat)
    updateTooth: (id, data) => set((state) => ({
        teeth: {
            ...state.teeth,
            [id]: { ...(state.teeth[id] || createDefaultTooth()), ...data }
        }
    })),

    loadOdontogram: (data) => set({ teeth: data }),

    reset: () => set({ teeth: {}, selectedTooth: null }),
}));

export default useOdontogramStore;
