import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings, Info, Save } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function DiscountSettings() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    auto_discount_enabled: true,
    rotation_enabled: false,
    assign_on_user_signup: false,
    default_campaign_id: null,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['discount-settings'],
    queryFn: async () => {
      const response = await api.discountSettings.get()
      return response.data
    },
  })

  useEffect(() => {
    if (data?.settings) {
      setFormData({
        auto_discount_enabled: data.settings.auto_discount_enabled ?? true,
        rotation_enabled: data.settings.rotation_enabled ?? false,
        assign_on_user_signup: data.settings.assign_on_user_signup ?? false,
        default_campaign_id: data.settings.default_campaign_id || null,
      })
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: async (settings) => {
      return await api.discountSettings.update(settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-settings'] })
      toast.success('Settings saved successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to save settings')
    },
  })

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const settings = data?.settings
  const availableCampaigns = data?.available_campaigns || []

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Discount Settings</h2>
        <p className="text-sm text-gray-500">Configure how discount codes are created and assigned</p>
      </div>

      {/* Auto-Assignment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auto-Assignment Configuration</CardTitle>
          <CardDescription>
            Control how discount codes are assigned to Instagram mentions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="auto_discount_enabled" className="text-sm font-medium">
                Enable Auto Discount Creation
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically create new codes when assigning to mentions
              </p>
            </div>
            <Switch
              id="auto_discount_enabled"
              checked={formData.auto_discount_enabled}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, auto_discount_enabled: checked })
              }
            />
          </div>

          <div className="border-t pt-5">
            <Label htmlFor="default_campaign_id" className="text-sm font-medium mb-2 block">
              Default Campaign for Assignments
            </Label>
            <Select
              value={formData.default_campaign_id?.toString() || ''}
              onValueChange={(value) => 
                setFormData({ ...formData, default_campaign_id: value ? parseInt(value) : null })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {availableCampaigns.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    No active campaigns available
                  </div>
                ) : (
                  availableCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name} ({campaign.discount_type === 'percentage' 
                        ? `${campaign.discount_value}%` 
                        : `$${campaign.discount_value}`})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              This campaign will be used when assigning codes to mentions with positive sentiment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rotation Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rotation Mode</CardTitle>
          <CardDescription>
            Use pre-generated codes in rotation instead of creating new ones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="rotation_enabled" className="text-sm font-medium">
                Enable Rotation Mode
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Assign oldest available code from pool instead of generating new codes
              </p>
            </div>
            <Switch
              id="rotation_enabled"
              checked={formData.rotation_enabled}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, rotation_enabled: checked })
              }
            />
          </div>

          {formData.rotation_enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Rotation Mode Active</p>
                  <p>
                    When enabled, codes will be picked from the oldest available codes in your selected campaign. 
                    If no codes are available, assignments will fail. Make sure to have enough codes generated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Signup Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Signup Assignment</CardTitle>
          <CardDescription>
            Automatically assign discount codes to new customers when they sign up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="assign_on_user_signup" className="text-sm font-medium">
                Assign Code on New Customer Signup
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Welcome new customers with a discount code when they create an account
              </p>
            </div>
            <Switch
              id="assign_on_user_signup"
              checked={formData.assign_on_user_signup}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, assign_on_user_signup: checked })
              }
            />
          </div>

          {formData.assign_on_user_signup && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Signup Assignment Enabled</p>
                  <p>
                    New customers will receive a discount code from your default campaign when they sign up. 
                    Codes will be sent via email or shown in the welcome flow.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Summary Card */}
      {settings && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Current Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium">
                  {formData.rotation_enabled ? 'Rotation (Use existing codes)' : 'Auto-generation (Create new codes)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Default Campaign:</span>
                <span className="font-medium">
                  {formData.default_campaign_id 
                    ? availableCampaigns.find(c => c.id === formData.default_campaign_id)?.name || 'Unknown'
                    : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Signup Assignment:</span>
                <span className="font-medium">
                  {formData.assign_on_user_signup ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
