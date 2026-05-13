import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Instagram, Slack, Download, AlertTriangle, CheckCircle2, ExternalLink, Sparkles, Key, CreditCard, MapPin, Pencil } from 'lucide-react'
import { invoices } from '@/lib/mockData'
import { formatAED } from '@/lib/utils'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import useSubscriptionStore from '@/stores/subscriptionStore'
import BillingInfoCard from '@/components/BillingInfoCard'
import PlanSelectionDialog from '@/components/PlanSelectionDialog'
import BillingAddressDialog from '@/components/BillingAddressDialog'

export default function Settings() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { subscription, fetchSubscription, loading: subscriptionLoading } = useSubscriptionStore()
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [billingAddress, setBillingAddress] = useState(null)
  const [billingAddressLoading, setBillingAddressLoading] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  // Get active tab from URL or default to "account"
  const activeTab = searchParams.get('tab') || 'account'

  // Handle tab change
  const handleTabChange = (value) => {
    setSearchParams({ tab: value })
  }

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    password_confirmation: ''
  })

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  // Fetch subscription on mount
  useEffect(() => {
    fetchSubscription().catch(() => {
      // Silently fail - user might not have subscription yet
    })
  }, [])

  // Fetch billing address when billing tab is active
  useEffect(() => {
    if (activeTab !== 'billing') return
    setBillingAddressLoading(true)
    api.users.getBillingAddress()
      .then(({ data }) => {
        const addr = data.billing_address
        const isComplete = addr?.line1 && addr?.city && addr?.state && addr?.postcode && addr?.country
        setBillingAddress(isComplete ? addr : null)
      })
      .catch(() => setBillingAddress(null))
      .finally(() => setBillingAddressLoading(false))
  }, [activeTab])

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'instagram_connected') {
      toast.success('Instagram connected successfully!')
      queryClient.invalidateQueries({ queryKey: ['social-status'] })
      // Clean up URL
      searchParams.delete('success')
      setSearchParams(searchParams, { replace: true })
    } else if (error) {
      const errorMessages = {
        access_denied: 'You denied access to Instagram',
        connection_failed: 'Failed to connect Instagram account',
        missing_code: 'Invalid OAuth response from Instagram'
      }
      toast.error(errorMessages[error] || 'Failed to connect Instagram')
      // Clean up URL
      searchParams.delete('error')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, queryClient])

  const { data: socialStatus, isLoading: socialLoading } = useQuery({
    queryKey: ['social-status'],
    queryFn: async () => {
      const response = await api.social.getStatus()
      return response.data
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (provider) => api.social.disconnect(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-status'] })
      toast.success('Account disconnected')
    },
    onError: () => {
      toast.error('Failed to disconnect account')
    },
  })

  const handleConnectInstagram = () => {
    navigate('/connect/instagram')
  }

  const handleDisconnect = (provider) => {
    disconnectMutation.mutate(provider)
  }

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: () => api.users.updateProfile(profileForm.name),
    onSuccess: (response) => {
      updateUser(response.data.user)
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    },
  })

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: () => api.users.updatePassword(
      passwordForm.current_password,
      passwordForm.new_password,
      passwordForm.password_confirmation
    ),
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPasswordForm({
        current_password: '',
        new_password: '',
        password_confirmation: ''
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to change password')
    },
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate()
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    
    // Validate password
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    if (passwordForm.new_password !== passwordForm.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    
    changePasswordMutation.mutate()
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.name[0].toUpperCase()
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your account, integrations, billing and more.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account" className="space-y-4">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal info shown across the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 text-base">
                    {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user?.name || 'User'} />}
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-gray-500">
                    {user?.avatar_url ? (
                      <p>Signed in with Google</p>
                    ) : (
                      <p>Using default avatar</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
                  <div>
                    <Label>Display name</Label>
                    <Input 
                      className="mt-1.5" 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      className="mt-1.5" 
                      type="email" 
                      value={profileForm.email}
                      placeholder="your.email@example.com"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="max-w-md space-y-4">
                  <div>
                    <Label>Current password</Label>
                    <Input 
                      className="mt-1.5" 
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <Label>New password</Label>
                    <Input 
                      className="mt-1.5" 
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  </div>
                  <div>
                    <Label>Confirm new password</Label>
                    <Input 
                      className="mt-1.5" 
                      type="password"
                      value={passwordForm.password_confirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram */}
        <TabsContent value="instagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Connection</CardTitle>
              <CardDescription>Connect your Instagram Business account to receive mention notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : socialStatus?.instagram?.connected ? (
                <>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center text-white">
                        <Instagram className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            @{socialStatus.instagram.username || 'Instagram'}
                          </span>
                          {socialStatus.instagram.status === 'active' && !socialStatus.instagram.expired ? (
                            <Badge variant="success">Connected</Badge>
                          ) : socialStatus.instagram.expired ? (
                            <Badge variant="negative">Expired</Badge>
                          ) : (
                            <Badge variant="secondary">{socialStatus.instagram.status}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {socialStatus.instagram.account_type || 'Business account'} · 
                          Connected {new Date(socialStatus.instagram.connected_at).toLocaleDateString()}
                          {socialStatus.instagram.last_used_at && (
                            <> · Last used {new Date(socialStatus.instagram.last_used_at).toLocaleDateString()}</>
                          )}
                        </p>
                        {socialStatus.instagram.error_message && (
                          <p className="text-xs text-red-600 mt-1">
                            {socialStatus.instagram.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">Disconnect</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect Instagram?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will stop receiving mention notifications. You can reconnect anytime.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDisconnect('instagram')}>
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {socialStatus.instagram.webhooks_active && socialStatus.instagram.status === 'active' && (
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Connection Active</div>
                          <p className="text-xs text-gray-500">
                            Receiving mention events from Instagram in real time
                            {socialStatus.instagram.expires_at && !socialStatus.instagram.expired && (
                              <> · Token expires {new Date(socialStatus.instagram.expires_at).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {socialStatus.instagram.scopes && socialStatus.instagram.scopes.length > 0 && (
                    <div className="p-4 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-900 mb-2">Permissions Granted</div>
                      <div className="flex flex-wrap gap-2">
                        {socialStatus.instagram.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand/10 to-purple-500/10 flex items-center justify-center mb-4">
                    <Instagram className="h-7 w-7 text-brand" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Connect Instagram
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
                    Connect your Instagram Business account to start receiving mention notifications and sending automated discount codes
                  </p>
                  <Button onClick={handleConnectInstagram} className="gap-2">
                    <Instagram className="h-4 w-4" />
                    Connect Instagram Account
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    Requires Instagram Business or Creator account
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          {subscriptionLoading ? (
            <Card>
              <CardContent className="p-5">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : subscription ? (
            <>
              {/* Current Subscription Details */}
              {subscription.plan_tier === 'free' ? (
                <Card className="border-gray-200 bg-gray-50/50">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge variant="secondary" className="mb-2">Free Plan</Badge>
                          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                            Current Plan
                          </h3>
                          <p className="text-sm text-gray-700 mt-2">
                            You're on the free plan with limited features.
                          </p>
                        </div>
                        <Button onClick={() => setShowPlanDialog(true)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Upgrade to Premium
                        </Button>
                      </div>
                      
                      {/* Usage Stats */}
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="font-medium text-gray-900">Your Usage</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Mentions this month</span>
                              <span className="font-medium">
                                {subscription.usage?.mentions?.used || 0} / {subscription.limits?.monthly_mentions || 10}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-brand h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min(((subscription.usage?.mentions?.used || 0) / (subscription.limits?.monthly_mentions || 10)) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Campaigns</span>
                              <span className="font-medium">
                                {subscription.usage?.campaigns?.used || 0} / {subscription.limits?.max_campaigns || 1}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-brand h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min(((subscription.usage?.campaigns?.used || 0) / (subscription.limits?.max_campaigns || 1)) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : subscription.status === 'active' || subscription.cancel_at_period_end ? (
                <BillingInfoCard subscription={subscription} />
              ) : subscription.status === 'incomplete' ? (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge variant="warning" className="mb-2">Payment Incomplete</Badge>
                          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                            Complete Your Payment
                          </h3>
                          <p className="text-sm text-gray-700 mt-2">
                            Your subscription is pending payment confirmation. This usually happens when 3D Secure authentication is required or if there was an issue with your payment method.
                          </p>
                        </div>
                        <Button onClick={() => setShowPlanDialog(true)} variant="default">
                          Complete Payment
                        </Button>
                      </div>
                      
                      {/* Show subscription details if available */}
                      {subscription.payment_method && (
                        <div className="border-t pt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Plan</p>
                            <p className="font-medium capitalize">
                              {subscription.plan_tier} ({subscription.billing_interval})
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium capitalize flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              {subscription.payment_method.brand} •••• {subscription.payment_method.last4}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-amber-100 border border-amber-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0" />
                          <div className="text-sm text-amber-900">
                            <p className="font-medium mb-1">What to do next:</p>
                            <ul className="list-disc list-inside space-y-1 text-amber-800">
                              <li>Click "Complete Payment" to retry with the same card</li>
                              <li>Or try a different payment method</li>
                              <li>Ensure your card supports 3D Secure authentication if required</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="negative" className="mb-2">Subscription Expired</Badge>
                        <h3 className="text-2xl font-semibold text-gray-900">Renew Your Subscription</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          Your subscription has expired. Renew now to regain access to all premium features.
                        </p>
                      </div>
                      <Button onClick={() => setShowPlanDialog(true)}>
                        Renew Subscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Free Plan</Badge>
                    <h3 className="text-2xl font-semibold text-gray-900">Upgrade to Premium</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Unlock unlimited mentions, campaigns, and priority support
                    </p>
                  </div>
                  <Button onClick={() => setShowPlanDialog(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Billing Address
                  </CardTitle>
                  <CardDescription>Used for invoices and payment verification.</CardDescription>
                </div>
                {!billingAddressLoading && (
                  <Button variant="outline" size="sm" onClick={() => setShowAddressDialog(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    {billingAddress ? 'Edit' : 'Add'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {billingAddressLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : billingAddress ? (
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p>{billingAddress.line1}</p>
                  {billingAddress.line2 && <p>{billingAddress.line2}</p>}
                  <p>{[billingAddress.city, billingAddress.state, billingAddress.postcode].filter(Boolean).join(', ')}</p>
                  <p>{billingAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-amber-600">No billing address on file. Add one before subscribing.</p>
              )}
            </CardContent>
          </Card>

          {/* Plan Selection Dialog */}
          <PlanSelectionDialog
            open={showPlanDialog}
            onOpenChange={setShowPlanDialog}
          />

          <BillingAddressDialog
            open={showAddressDialog}
            onOpenChange={setShowAddressDialog}
            onSaved={(addr) => {
              setBillingAddress(addr)
              setShowAddressDialog(false)
            }}
          />
        </TabsContent>

      </Tabs>
    </div>
  )
}
