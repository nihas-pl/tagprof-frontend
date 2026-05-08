import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Sparkles } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

const TrialBanner = ({ onUpgradeClick }) => {
  const { isTrialing, trialDaysLeft, subscription } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed in localStorage
    const dismissed = localStorage.getItem('trial-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('trial-banner-dismissed', 'true');
  };

  // Reset dismissal when trial status changes
  useEffect(() => {
    if (!isTrialing) {
      localStorage.removeItem('trial-banner-dismissed');
    }
  }, [isTrialing]);

  if (!isTrialing || isDismissed) {
    return null;
  }

  const daysText = trialDaysLeft === 1 ? 'day' : 'days';
  const urgencyColor = trialDaysLeft <= 2 ? 'bg-red-500' : trialDaysLeft <= 5 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className={`${urgencyColor} text-white`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Sparkles className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {trialDaysLeft > 0 ? (
                  <>
                    <strong>{trialDaysLeft} {daysText}</strong> left in your free trial
                  </>
                ) : (
                  <>Your free trial ends today</>
                )}
              </p>
              <p className="text-xs opacity-90 hidden sm:block">
                Upgrade now to continue enjoying all premium features
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onUpgradeClick}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Upgrade Now
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;
