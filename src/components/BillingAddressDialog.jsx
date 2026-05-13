import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, MapPin } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

// Country list (ISO 2-letter codes)
const COUNTRIES = [
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'CN', name: 'China' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'IN', name: 'India' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

const EMPTY_ADDRESS = {
  billing_address_line1: '',
  billing_address_line2: '',
  billing_city: '',
  billing_state: '',
  billing_postcode: '',
  billing_country: '',
};

const BillingAddressDialog = ({ open, onOpenChange, onSaved }) => {
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.users.getBillingAddress()
      .then(({ data }) => {
        const addr = data.billing_address || {};
        setForm({
          billing_address_line1: addr.line1 || '',
          billing_address_line2: addr.line2 || '',
          billing_city: addr.city || '',
          billing_state: addr.state || '',
          billing_postcode: addr.postcode || '',
          billing_country: addr.country || '',
        });
      })
      .catch(() => setForm(EMPTY_ADDRESS))
      .finally(() => setLoading(false));
  }, [open]);

  const validate = () => {
    const e = {};
    if (!form.billing_address_line1.trim()) e.billing_address_line1 = 'Required';
    if (!form.billing_city.trim()) e.billing_city = 'Required';
    if (!form.billing_state.trim()) e.billing_state = 'Required';
    if (!form.billing_postcode.trim()) e.billing_postcode = 'Required';
    if (!form.billing_country) e.billing_country = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await api.users.updateBillingAddress(form);
      toast.success('Billing address saved');
      onSaved && onSaved(data.billing_address);
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save billing address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" />
            Billing Address
          </DialogTitle>
          <DialogDescription>
            Enter your billing address. This is required for payment processing.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Address Line 1 */}
            <div className="space-y-1">
              <Label htmlFor="line1">
                Address Line 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="line1"
                placeholder="Street address"
                value={form.billing_address_line1}
                onChange={handleChange('billing_address_line1')}
              />
              {errors.billing_address_line1 && (
                <p className="text-xs text-red-500">{errors.billing_address_line1}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-1">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                placeholder="Apt, suite, unit, etc. (optional)"
                value={form.billing_address_line2}
                onChange={handleChange('billing_address_line2')}
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={form.billing_city}
                  onChange={handleChange('billing_city')}
                />
                {errors.billing_city && (
                  <p className="text-xs text-red-500">{errors.billing_city}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">
                  State / Province <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={form.billing_state}
                  onChange={handleChange('billing_state')}
                />
                {errors.billing_state && (
                  <p className="text-xs text-red-500">{errors.billing_state}</p>
                )}
              </div>
            </div>

            {/* Postcode + Country */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="postcode">
                  Postcode / ZIP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postcode"
                  placeholder="Postcode"
                  value={form.billing_postcode}
                  onChange={handleChange('billing_postcode')}
                />
                {errors.billing_postcode && (
                  <p className="text-xs text-red-500">{errors.billing_postcode}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <select
                  id="country"
                  value={form.billing_country}
                  onChange={handleChange('billing_country')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.billing_country && (
                  <p className="text-xs text-red-500">{errors.billing_country}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save & Continue'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillingAddressDialog;
