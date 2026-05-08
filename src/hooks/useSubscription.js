import { useEffect } from 'react';
import useSubscriptionStore from '../stores/subscriptionStore';

export const useSubscription = () => {
  const { subscription, loading, error, fetchSubscription } = useSubscriptionStore();

  useEffect(() => {
    // Fetch subscription on mount if not already loaded
    if (!subscription && !loading) {
      fetchSubscription().catch(() => {
        // Silently fail - user might not have subscription yet
      });
    }
  }, []);

  const isActive = subscription?.can_access_premium || false;
  const isTrialing = subscription?.user?.trial_active || false;
  const isExpired = subscription?.user && !subscription?.user?.can_access_app;
  const trialDaysLeft = subscription?.user?.trial_days_remaining || 0;
  const canAccessApp = subscription?.user?.can_access_app !== false;

  return {
    subscription,
    isActive,
    isTrialing,
    isExpired,
    trialDaysLeft,
    canAccessApp,
    loading,
    error,
  };
};

export default useSubscription;
