import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Info } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function CampaignForm({ open, onClose, onSubmit, initialData = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    discount_value: initialData?.discount_value || '',
    discount_type: initialData?.discount_type || 'percentage',
    minimum_order_value: initialData?.minimum_order_value || '',
    overall_expiry_date: initialData?.overall_expiry_date ? new Date(initialData.overall_expiry_date) : null,
    code_expiry_duration: initialData?.code_expiry_duration || '',
    code_expiry_unit: initialData?.code_expiry_unit || 'days',
    is_active: initialData?.is_active ?? true,
    generate_codes_count: initialData ? null : 1,
    generate_mode: 'single',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Campaign name is required'
    }
    
    if (!formData.discount_value || formData.discount_value <= 0) {
      newErrors.discount_value = 'Discount value must be greater than 0'
    }
    
    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      newErrors.discount_value = 'Percentage cannot exceed 100'
    }
    
    if (!initialData && formData.generate_mode === 'bulk') {
      const count = parseInt(formData.generate_codes_count)
      if (!count || count < 1 || count > 1000) {
        newErrors.generate_codes_count = 'Code count must be between 1 and 1000'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    const payload = {
      name: formData.name,
      description: formData.description,
      discount_value: parseFloat(formData.discount_value),
      discount_type: formData.discount_type,
      minimum_order_value: formData.minimum_order_value ? parseFloat(formData.minimum_order_value) : 0,
      overall_expiry_date: formData.overall_expiry_date?.toISOString(),
      code_expiry_duration: formData.code_expiry_duration ? parseInt(formData.code_expiry_duration) : null,
      code_expiry_unit: formData.code_expiry_unit,
      is_active: formData.is_active,
    }
    
    // Add generate_codes_count only for create (not edit)
    if (!initialData && formData.generate_mode !== 'none') {
      payload.generate_codes_count = formData.generate_mode === 'single' ? 1 : parseInt(formData.generate_codes_count)
    }
    
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Update campaign settings and discount details' 
              : 'Set up a new discount campaign with codes'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Welcome Discount, VIP Rewards"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this campaign..."
                rows={2}
              />
            </div>
          </div>

          {/* Discount Settings */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Discount Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_value">Discount Value *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => handleChange('discount_value', e.target.value)}
                  placeholder="10"
                  className={errors.discount_value ? 'border-red-500' : ''}
                />
                {errors.discount_value && <p className="text-xs text-red-500 mt-1">{errors.discount_value}</p>}
              </div>

              <div>
                <Label htmlFor="discount_type">Type</Label>
                <Select value={formData.discount_type} onValueChange={(val) => handleChange('discount_type', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="minimum_order_value">Minimum Order Value ($)</Label>
                <Input
                  id="minimum_order_value"
                  type="number"
                  step="0.01"
                  value={formData.minimum_order_value}
                  onChange={(e) => handleChange('minimum_order_value', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty or 0 for no minimum</p>
              </div>
            </div>
          </div>

          {/* Expiry Settings */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Expiry Settings</h4>
            <div className="space-y-4">
              <div>
                <Label>Overall Campaign Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.overall_expiry_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.overall_expiry_date ? format(formData.overall_expiry_date, 'PPP') : 'No expiry'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.overall_expiry_date}
                      onSelect={(date) => handleChange('overall_expiry_date', date)}
                      disabled={(date) => date < new Date()}
                    />
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChange('overall_expiry_date', null)}
                        className="w-full"
                      >
                        Clear Date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1">When expired, all codes become invalid</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code_expiry_duration">Individual Code Expiry</Label>
                  <Input
                    id="code_expiry_duration"
                    type="number"
                    value={formData.code_expiry_duration}
                    onChange={(e) => handleChange('code_expiry_duration', e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="code_expiry_unit">Unit</Label>
                  <Select value={formData.code_expiry_unit} onValueChange={(val) => handleChange('code_expiry_unit', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5" />
                <span>Codes expire N days/months from assignment date (can be manually adjusted per code)</span>
              </p>
            </div>
          </div>

          {/* Code Generation (only for create) */}
          {!initialData && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Generate Codes</h4>
              <RadioGroup value={formData.generate_mode} onValueChange={(val) => handleChange('generate_mode', val)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="font-normal cursor-pointer">
                    Don't generate now (add codes later)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal cursor-pointer">
                    Generate 1 code
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bulk" id="bulk" />
                  <Label htmlFor="bulk" className="font-normal cursor-pointer">
                    Generate bulk codes
                  </Label>
                </div>
              </RadioGroup>

              {formData.generate_mode === 'bulk' && (
                <div className="mt-3">
                  <Label htmlFor="generate_codes_count">Number of Codes (1-1000)</Label>
                  <Input
                    id="generate_codes_count"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.generate_codes_count}
                    onChange={(e) => handleChange('generate_codes_count', e.target.value)}
                    placeholder="50"
                    className={errors.generate_codes_count ? 'border-red-500' : ''}
                  />
                  {errors.generate_codes_count && <p className="text-xs text-red-500 mt-1">{errors.generate_codes_count}</p>}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData ? 'Update Campaign' : 'Create Campaign')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
