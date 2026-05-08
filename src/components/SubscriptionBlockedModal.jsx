import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertCircle, Sparkles } from 'lucide-react';
import PlanSelectionDialog from './PlanSelectionDialog';

const SubscriptionBlockedModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    const handleSubscriptionRequired = (event) => {
      setSubscriptionData(event.detail);
      setIsOpen(true);
    };

    window.addEventListener('subscription-required', handleSubscriptionRequired);

    return () => {
      window.removeEventListener('subscription-required', handleSubscriptionRequired);
    };
  }, []);

  const handleUpgrade = () => {
    setShowPlanDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[500px]" hideClose>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              <DialogTitle>Subscription Required</DialogTitle>
            </div>
            <DialogDescription>
              {subscriptionData?.trial_expired 
                ? 'Your free trial has ended. Upgrade to Premium to continue using TagProf.'
                : 'Your subscription has expired. Please renew to continue using TagProf.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Premium Features
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Unlimited Instagram mentions tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Automated discount code generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>AI-powered sentiment analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Instagram DM automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Analytics and insights dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <Button onClick={handleUpgrade} className="w-full" size="lg">
              Upgrade to Premium
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You'll be able to cancel anytime from your settings
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <PlanSelectionDialog 
        open={showPlanDialog} 
        onOpenChange={setShowPlanDialog} 
      />
    </>
  );
};

export default SubscriptionBlockedModal;
