import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useSubscriptionStore from '../stores/subscriptionStore';
import StripePaymentForm from './StripePaymentForm';

const PlanSelectionDialog = ({ open, onOpenChange }) => {
  const { plans, fetchPlans, loading } = useSubscriptionStore();
  const [billingInterval, setBillingInterval] = useState('annual');
  const [selectedPriceId, setSelectedPriceId] = useState(null);

  useEffect(() => {
    if (open && plans.length === 0) {
      fetchPlans().catch((error) => {
        toast.error('Failed to load plans');
      });
    }
  }, [open]);

  const premiumPlan = plans.find(plan => plan.name === 'Premium');

  // Set default price ID when premium plan is available
  useEffect(() => {
    if (premiumPlan && !selectedPriceId) {
      const priceId = billingInterval === 'monthly' 
        ? premiumPlan.stripe_price_id_monthly 
        : premiumPlan.stripe_price_id_annual;
      setSelectedPriceId(priceId);
    }
  }, [premiumPlan, billingInterval, selectedPriceId]);

  const handlePaymentSuccess = () => {
    onOpenChange(false);
    toast.success('Subscription activated successfully!');
  };

  const handleBillingIntervalChange = (interval) => {
    setBillingInterval(interval);
    // Update the price ID when interval changes
    const newPriceId = interval === 'monthly' 
      ? premiumPlan.stripe_price_id_monthly 
      : premiumPlan.stripe_price_id_annual;
    setSelectedPriceId(newPriceId);
  };

  if (loading && !premiumPlan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!premiumPlan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No plans available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const monthlyPrice = parseFloat(premiumPlan.price_monthly) || 14.99;
  const annualPrice = parseFloat(premiumPlan.price_annual) || 118.80;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <StripePaymentForm
          priceId={selectedPriceId}
          billingInterval={billingInterval}
          amount={billingInterval === 'monthly' ? monthlyPrice : annualPrice}
          monthlyPrice={monthlyPrice}
          annualPrice={annualPrice}
          onSuccess={handlePaymentSuccess}
          onBillingIntervalChange={handleBillingIntervalChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionDialog;
