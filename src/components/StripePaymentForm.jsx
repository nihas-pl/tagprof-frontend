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
  const { subscribe, fetchSubscription } = useSubscriptionStore();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const handlePaymentElementChange = (event) => {
    setIsReady(event.complete);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm setup with PaymentElement
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href, // Not used in our flow
        },
        redirect: 'if_required', // Stay on page
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Create subscription with payment method
        await subscribe(priceId, setupIntent.payment_method);

        // Refresh subscription data
        await fetchSubscription();

        // Success!
        toast.success('Payment successful!');
        onSuccess();
      } else {
        throw new Error('Payment setup was not completed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const annualMonthlyPrice = annualPrice ? (annualPrice / 12).toFixed(2) : '0.00';

  return (
    <div className="grid md:grid-cols-2 gap-20 px-6 py-6">
      {/* Left Side - Plan Selection */}
      <div className="space-y-3">
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
                      Ideal for short-term sprints & trials.
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
                      Commit for a year with{' '}
                      <span className="text-brand font-medium">20% savings</span>.
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
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>All tools, unlocked with no limits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>Work together in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>Sync your workflow across any device</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>Faster help with priority support</span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            Everything unlocked, synced, and built for speed. Collaborate in real time, 
            scale your workflow smoothly, and get help fast with priority support.
          </p>
        </div>
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

        {/* Payment Element - includes cards, wallets, and other payment methods */}
        <PaymentElement
          options={PAYMENT_ELEMENT_OPTIONS}
          onChange={handlePaymentElementChange}
        />

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
          <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your payment data is fully encrypted and handled with the highest security standards.
          </p>
        </div>
      </form>
    </div>
  );
};

// Wrapper component that fetches clientSecret and provides Elements context
const StripePaymentForm = (props) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const { data } = await api.subscriptions.createSetupIntent();
        setClientSecret(data.client_secret);
      } catch (err) {
        console.error('Failed to create setup intent:', err);
        setError(err.message || 'Failed to initialize payment');
        toast.error('Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="py-12">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Failed to initialize payment. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#d91a7a', // brand color
        borderRadius: '8px',
        spacingUnit: '4px',
        fontSizeBase: '14px',
      },
      rules: {
        '.Input': {
          padding: '10px 12px',
          fontSize: '14px',
        },
        '.Label': {
          fontSize: '13px',
          marginBottom: '4px',
        },
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
