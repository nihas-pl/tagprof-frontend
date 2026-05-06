import { create } from 'zustand'

export const useCampaignStore = create((set, get) => ({
  campaigns: [],
  currentCampaign: null,
  loading: false,
  error: null,
  stats: {
    total_campaigns: 0,
    active_campaigns: 0,
    total_codes: 0,
    available_codes: 0,
  },
  pagination: {
    current_page: 1,
    per_page: 50,
    total_count: 0,
    total_pages: 0,
  },

  // Set campaigns
  setCampaigns: (campaigns, meta, stats) => {
    set({ 
      campaigns, 
      pagination: meta || get().pagination,
      stats: stats || get().stats,
      loading: false,
      error: null 
    })
  },

  // Set current campaign
  setCurrentCampaign: (campaign) => {
    set({ currentCampaign: campaign, loading: false, error: null })
  },

  // Add campaign
  addCampaign: (campaign) => {
    set((state) => ({
      campaigns: [campaign, ...state.campaigns],
      stats: {
        ...state.stats,
        total_campaigns: state.stats.total_campaigns + 1,
        active_campaigns: campaign.is_active ? state.stats.active_campaigns + 1 : state.stats.active_campaigns,
      },
    }))
  },

  // Update campaign
  updateCampaign: (id, updatedData) => {
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updatedData } : c
      ),
      currentCampaign: state.currentCampaign?.id === id 
        ? { ...state.currentCampaign, ...updatedData } 
        : state.currentCampaign,
    }))
  },

  // Remove campaign
  removeCampaign: (id) => {
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id),
      stats: {
        ...state.stats,
        total_campaigns: Math.max(0, state.stats.total_campaigns - 1),
      },
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
    campaigns: [],
    currentCampaign: null,
    loading: false,
    error: null,
  }),
}))
