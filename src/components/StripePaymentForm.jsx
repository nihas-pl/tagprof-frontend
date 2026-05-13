import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import useSubscriptionStore from '../stores/subscriptionStore';
import { Card, CardContent } from './ui/card';
import BillingAddressDialog from './BillingAddressDialog';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// PaymentElement appearance to match application style
const PAYMENT_ELEMENT_OPTIONS = {
  layout: {
    type: 'accordion',
    defaultCollapsed: false,
    radios: 'auto',
    spacedAccordionItems: true
  },
  wallets: {
    applePay: 'auto',
    googlePay: 'auto',
  },
  fields: {
    billingDetails: {
      address: {
        country: 'auto',
      }
    }
  },
  terms: {
    card: 'never'
  }
};

// Inner form component that uses PaymentElement
const PaymentForm = ({ 
  priceId, 
  billingInterval, 
  amount, 
  onSuccess,
  monthlyPrice,
  annualPrice,
  onBillingIntervalChange 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { fetchSubscription } = useSubscriptionStore();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [billingAddress, setBillingAddress] = useState(null);
  const [billingAddressChecked, setBillingAddressChecked] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Load billing address on mount
  useEffect(() => {
    api.users.getBillingAddress()
      .then(({ data }) => {
        const addr = data.billing_address;
        const isComplete = addr?.line1 && addr?.city && addr?.state && addr?.postcode && addr?.country;
        setBillingAddress(isComplete ? addr : null);
      })
      .catch(() => setBillingAddress(null))
      .finally(() => setBillingAddressChecked(true));
  }, []);

  // After billing address is saved, continue with payment if user was trying to submit
  const handleAddressSaved = (savedAddress) => {
    setBillingAddress(savedAddress);
    setShowAddressDialog(false);
    if (pendingSubmit) {
      setPendingSubmit(false);
      // Trigger payment after address is saved
      setTimeout(() => processPayment(), 100);
    }
  };

  // Update Elements amount when billing interval changes (deferred intent mode)
  useEffect(() => {
    if (elements && amount) {
      elements.update({ amount: Math.round(amount * 100) });
    }
  }, [amount, elements]);

  const handlePaymentElementChange = (event) => {
    setIsReady(event.complete);
  };

  const processPayment = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Validate the payment element fields
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);

      // Step 2: Create the subscription on the backend (returns PaymentIntent client_secret)
      const { data } = await api.subscriptions.initiate(priceId);
      const { client_secret } = data;

      // Step 3: Confirm the PaymentIntent — Stripe handles 3DS automatically on_session
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/settings?tab=billing&payment_complete=true`,
          payment_method_data: {
            billing_details: {
              address: {
                line1: billingAddress?.line1 || '',
                line2: billingAddress?.line2 || '',
                city: billingAddress?.city || '',
                state: billingAddress?.state || '',
                postal_code: billingAddress?.postcode || '',
                country: billingAddress?.country || '',
              }
            }
          }
        },
        redirect: 'if_required',
      });

      if (confirmError) throw new Error(confirmError.message);

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        await fetchSubscription();
        toast.success('Payment successful! Your subscription is now active.');
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    // Check billing address before proceeding
    if (!billingAddress) {
      setPendingSubmit(true);
      setShowAddressDialog(true);
      return;
    }

    await processPayment();
  };

  const annualMonthlyPrice = annualPrice ? (annualPrice / 12).toFixed(2) : '0.00';
  const savingsPct = monthlyPrice && annualPrice
    ? Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100)
    : 0;

  return (
    <>
    <div className="grid md:grid-cols-2 gap-20 p-3">
      {/* Left Side - Plan Selection */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Activate Your Premium Plan
          </h2>
          <p className="text-sm text-gray-600">
            Get unlimited access to all productivity tools in seconds.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Select Plan</h3>
          
          {/* Monthly Option */}
          <Card
            onClick={() => onBillingIntervalChange('monthly')}
            className={`cursor-pointer transition-all ${
              billingInterval === 'monthly'
                ? 'border-brand'
                : 'hover:border-gray-400'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    billingInterval === 'monthly'
                      ? 'border-brand bg-brand'
                      : 'border-gray-300'
                  }`}>
                    {billingInterval === 'monthly' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Monthly Plan</h4>
                    <p className="text-xs text-gray-500">
                      Billed monthly. Cancel anytime.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    ${monthlyPrice}
                  </div>
                  <div className="text-xs text-gray-500">/Month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Annual Option */}
          <Card
            onClick={() => onBillingIntervalChange('annual')}
            className={`cursor-pointer transition-all ${
              billingInterval === 'annual'
                ? 'border-brand'
                : 'hover:border-gray-400'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    billingInterval === 'annual'
                      ? 'border-brand bg-brand'
                      : 'border-gray-300'
                  }`}>
                    {billingInterval === 'annual' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Annual Plan</h4>
                    <p className="text-xs text-gray-500">
                      Billed annually. {savingsPct > 0 && (
                        <> <span className="text-brand font-medium">Save {savingsPct}% vs monthly</span>.</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    ${annualMonthlyPrice}
                  </div>
                  <div className="text-xs text-gray-500">/Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What you'll unlock */}
        <div className="pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
            What you'll unlock <span className="text-brand">→</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-center gap-1">
              <span className="text-brand">•</span>
              <span>Monitor and manage all Instagram mentions</span>
            </li>
            <li className="flex items-center gap-1">
              <span className="text-brand">•</span>
              <span>Run discount campaigns with unique code pools</span>
            </li>
            <li className="flex items-center gap-1">
              <span className="text-brand">•</span>
              <span>Auto-send personalised DMs to every commenter</span>
            </li>
            <li className="flex items-center gap-1">
              <span className="text-brand">•</span>
              <span>Sentiment analysis and priority support</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-gray-500 mt-auto pt-4 leading-relaxed">
          Track every mention, reply with custom DM templates, and reward your audience with unique discount codes — all automated and managed in one place.
        </p>
      </div>

      {/* Right Side - Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Payment Detail Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Detail</h3>
          <p className="text-sm text-gray-600 mt-1">
            All transactions are secure and encrypted
          </p>
        </div>

        {/* Billing Address Summary */}
        {billingAddressChecked && (
          <div className={`rounded-lg border px-3 py-2.5 flex items-start justify-between gap-3 ${
            billingAddress ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="min-w-0">
              <p className={`text-xs font-medium ${billingAddress ? 'text-green-800' : 'text-amber-800'}`}>
                Billing Address
              </p>
              {billingAddress ? (
                <p className="text-xs text-green-700 mt-0.5 truncate">
                  {billingAddress.line1}, {billingAddress.city}, {billingAddress.postcode}, {billingAddress.country}
                </p>
              ) : (
                <p className="text-xs text-amber-700 mt-0.5">
                  Required — will be prompted on Subscribe
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAddressDialog(true)}
              className={`text-xs font-medium shrink-0 underline ${billingAddress ? 'text-green-700 hover:text-green-900' : 'text-amber-700 hover:text-amber-900'}`}
            >
              {billingAddress ? 'Edit' : 'Add'}
            </button>
          </div>
        )}

        {/* Payment Element - includes cards, wallets, and other payment methods */}
        <PaymentElement
          options={PAYMENT_ELEMENT_OPTIONS}
          onChange={handlePaymentElementChange}
        />

        {/* Processing Message */}
        {/* {processing && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <div className="text-blue-900">
                <p className="font-medium">Processing your payment...</p>
                <p className="text-sm mt-1">
                  {isReady 
                    ? '⚠️ If a verification window appears, please complete it to finish your payment. Do not close the window.' 
                    : 'Preparing payment form...'}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )} */}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Total */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              ${amount.toFixed(2)} / {billingInterval === 'monthly' ? 'Month' : 'Year'}
            </span>
          </div>

          {/* Subscribe Button */}
          <Button
            type="submit"
            disabled={!stripe || processing || !isReady}
            size="lg"
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe'
            )}
          </Button>

          {/* Security Message */}
          <div className="text-left mt-3 space-y-1">
            <p className="text-xs text-gray-500 flex items-start justify-center gap-1">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Secure payment processing. You may be asked to verify your identity with your bank.
            </p>
            {/* {!processing && (
              <p className="text-xs text-gray-400">
                ⓘ Complete any verification prompts to avoid payment delays
              </p>
            )} */}
          </div>
        </div>
      </form>
    </div>

    {/* Billing Address Dialog */}
    <BillingAddressDialog
      open={showAddressDialog}
      onOpenChange={(open) => {
        setShowAddressDialog(open);
        if (!open) setPendingSubmit(false);
      }}
      onSaved={handleAddressSaved}
    />
    </>
  );
};

// Wrapper component that provides Elements context using deferred intent mode
// No SetupIntent needed - Elements initialised with mode:'payment' and amount
// On submit: backend creates subscription → confirmPayment on_session → 3DS handled naturally
const StripePaymentForm = (props) => {
  const { fetchSubscription } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);

  // Handle return from 3D Secure redirect
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
      const paymentComplete = urlParams.get('payment_complete');

      if (paymentComplete === 'true' && paymentIntentClientSecret) {
        setLoading(true);
        try {
          const stripeInstance = await stripePromise;
          const { paymentIntent, error } = await stripeInstance.retrievePaymentIntent(paymentIntentClientSecret);

          if (error) {
            toast.error(`Payment failed: ${error.message}`);
          } else if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
            await fetchSubscription();
            toast.success('Payment successful! Your subscription is now active.');
            window.history.replaceState({}, '', '/settings?tab=billing');
            props.onSuccess();
          } else {
            toast.error(`Payment status: ${paymentIntent.status}. Please try again.`);
          }
        } catch (err) {
          toast.error('Failed to complete payment. Please try again.');
        } finally {
          setLoading(false);
          window.history.replaceState({}, '', '/settings?tab=billing');
        }
        return;
      }
    };

    handlePaymentReturn();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-gray-600">Completing your payment...</p>
      </div>
    );
  }

  const amount = props.billingInterval === 'monthly'
    ? Math.round((parseFloat(props.monthlyPrice) || 14.99) * 100)
    : Math.round((parseFloat(props.annualPrice) || 118.80) * 100);

  const options = {
    mode: 'payment',
    amount,
    currency: 'usd',
    setup_future_usage: 'off_session',
    payment_method_types: ['card'],
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#d91a7a',
        borderRadius: '8px',
        spacingUnit: '4px',
        fontSizeBase: '14px',
      },
      rules: {
        '.Input': { padding: '10px 12px', fontSize: '14px' },
        '.Label': { fontSize: '13px', marginBottom: '4px' },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
