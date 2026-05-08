import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      subscription: null,
      plans: [],
      loading: false,
      error: null,

      // Fetch current subscription
      fetchSubscription: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.subscriptions.current();
          set({ subscription: data, loading: false });
          return data;
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to fetch subscription', loading: false });
          throw error;
        }
      },

      // Fetch available plans
      fetchPlans: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.subscriptions.plans();
          set({ plans: data.plans, loading: false });
          return data.plans;
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to fetch plans', loading: false });
          throw error;
        }
      },

      // Subscribe to a plan
      subscribe: async (priceId, paymentMethodId) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.subscriptions.subscribe(priceId, paymentMethodId);
          set({ subscription: data.subscription, loading: false });
          return data;
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to create subscription', loading: false });
          throw error;
        }
      },

      // Cancel subscription
      cancelSubscription: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.subscriptions.cancel();
          set({ subscription: data.subscription, loading: false });
          return data;
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to cancel subscription', loading: false });
          throw error;
        }
      },

      // Reactivate subscription
      reactivateSubscription: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.subscriptions.reactivate();
          set({ subscription: data.subscription, loading: false });
          return data;
        } catch (error) {
          set({ error: error.response?.data?.error || 'Failed to reactivate subscription', loading: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => set({ subscription: null, plans: [], loading: false, error: null }),
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        subscription: state.subscription,
      }),
    }
  )
);

export default useSubscriptionStore;
