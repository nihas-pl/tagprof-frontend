import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CreditCard, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import useSubscriptionStore from '../stores/subscriptionStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const BillingInfoCard = ({ subscription }) => {
  const { cancelSubscription, reactivateSubscription, fetchSubscription } = useSubscriptionStore();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenPortal = async () => {
    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/settings?tab=billing`;
      const { data } = await api.subscriptions.getPortalUrl(returnUrl);
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to open billing portal');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await cancelSubscription();
      await fetchSubscription();
      toast.success('Subscription will be canceled at the end of the billing period');
      setShowCancelDialog(false);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await reactivateSubscription();
      await fetchSubscription();
      toast.success('Subscription reactivated successfully');
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' },
      trialing: { label: 'Trial', variant: 'secondary' },
      past_due: { label: 'Past Due', variant: 'destructive' },
      canceled: { label: 'Canceled', variant: 'outline' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!subscription) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">Current Plan</h3>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and billing
            </p>
          </div>
          {getStatusBadge(subscription.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium capitalize">
              {subscription.plan_tier} {subscription.billing_interval && `(${subscription.billing_interval})`}
            </p>
          </div>

          {subscription.current_period_end && (
            <div>
              <p className="text-sm text-muted-foreground">
                {subscription.cancel_at_period_end ? 'Expires on' : 'Next billing date'}
              </p>
              <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
            </div>
          )}

          {subscription.payment_method && (
            <div>
              <p className="text-sm text-muted-foreground">Payment method</p>
              <p className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {subscription.payment_method.brand} •••• {subscription.payment_method.last4}
              </p>
            </div>
          )}

          {subscription.days_until_expiry > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Days remaining</p>
              <p className="font-medium">{subscription.days_until_expiry} days</p>
            </div>
          )}
        </div>

        {/* Cancellation Notice */}
        {subscription.cancel_at_period_end && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Subscription scheduled for cancellation
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  Your subscription will remain active until {formatDate(subscription.current_period_end)}. 
                  You can reactivate anytime before then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleOpenPortal}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Manage Subscription
          </Button>

          {subscription.cancel_at_period_end ? (
            <Button
              onClick={handleReactivate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Reactivate Subscription
            </Button>
          ) : (
            subscription.status === 'active' && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={loading}
              >
                Cancel Subscription
              </Button>
            )
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of your current billing period on{' '}
              <strong>{formatDate(subscription.current_period_end)}</strong>. 
              After that, you'll lose access to all premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BillingInfoCard;
