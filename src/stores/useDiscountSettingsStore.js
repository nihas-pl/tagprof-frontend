import { create } from 'zustand'

export const useDiscountSettingsStore = create((set) => ({
  settings: null,
  availableCampaigns: [],
  loading: false,
  error: null,

  // Set settings
  setSettings: (settings, availableCampaigns = []) => {
    set({ 
      settings, 
      availableCampaigns,
      loading: false,
      error: null 
    })
  },

  // Update settings
  updateSettings: (updatedData) => {
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...updatedData } : updatedData,
    }))
  },

  // Set loading
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error, loading: false }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    settings: null,
    availableCampaigns: [],
    loading: false,
    error: null,
  }),
}))
