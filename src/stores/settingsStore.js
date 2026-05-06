import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      // Sentiment analysis threshold (0-100)
      sentimentThreshold: 70,
      
      // Auto-generation vs rotation mode
      discountMode: 'auto', // 'auto' or 'rotation'
      
      // Notification preferences
      notifications: {
        newMentions: true,
        dmSent: true,
        codeRedeemed: true,
      },
      
      // Actions
      setSentimentThreshold: (threshold) => set({ sentimentThreshold: threshold }),
      
      setDiscountMode: (mode) => set({ discountMode: mode }),
      
      updateNotifications: (notificationUpdates) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notificationUpdates },
        })),
      
      resetSettings: () =>
        set({
          sentimentThreshold: 70,
          discountMode: 'auto',
          notifications: {
            newMentions: true,
            dmSent: true,
            codeRedeemed: true,
          },
        }),
    }),
    {
      name: 'settings-storage',
    }
  )
)
