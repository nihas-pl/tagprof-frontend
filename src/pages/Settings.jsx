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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Instagram, Slack, Download, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { invoices } from '@/lib/mockData'
import { formatAED } from '@/lib/utils'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function Settings() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()

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
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your account, integrations, billing and more.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal info shown across the dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 text-base">
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change avatar</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
                <div>
                  <Label>Display name</Label>
                  <Input className="mt-1.5" defaultValue="Sara Al Mansouri" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input className="mt-1.5" type="email" defaultValue="sara@tagprof.ae" />
                </div>
                <div className="md:col-span-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="Asia/Dubai">
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-2">
                <Button onClick={() => toast.success('Profile saved')}>Save changes</Button>
              </div>
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
                            <Badge variant="destructive">Expired</Badge>
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

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>We'll send these to your account email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'When a mention is flagged for review', default: true },
                { label: 'When a code pool is running low (< 10 remaining)', default: true },
                { label: 'Daily summary report', default: false },
              ].map((opt) => (
                <div key={opt.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                  </div>
                  <Switch defaultChecked={opt.default} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slack</CardTitle>
              <CardDescription>Get real-time notifications in Slack.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-purple-50 flex items-center justify-center text-purple-600">
                    <Slack className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Slack workspace</div>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => toast('Opening Slack OAuth...')}>Connect Slack</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => toast.success('Notification preferences saved')}>Save preferences</Button>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="default" className="mb-2">Current Plan</Badge>
                  <h3 className="text-2xl font-semibold text-gray-900">$9 <span className="text-sm font-normal text-gray-500">/ month</span></h3>
                  <p className="text-sm text-gray-700 font-medium mt-0.5">Starter</p>
                  <p className="text-xs text-gray-500 mt-1">Up to 500 auto-DMs / month</p>
                </div>
                <Button>Upgrade</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage this month</CardTitle>
              <CardDescription>Resets on May 1, 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700"><span className="font-medium">189</span> / 500 DMs used</span>
                <span className="text-gray-500 font-mono">37.8%</span>
              </div>
              <Progress value={37.8} />
              <p className="text-xs text-gray-500 mt-3">Next billing date: <span className="text-gray-700 font-medium">May 1, 2026</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-[10px] font-bold">VISA</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Visa •••• 4242</div>
                    <p className="text-xs text-gray-500">Expires 09/2027</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Invoice</th>
                    <th className="text-left p-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Date</th>
                    <th className="text-left p-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Amount</th>
                    <th className="text-left p-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Status</th>
                    <th className="text-right p-3 text-xs uppercase tracking-wide text-gray-500 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50/60 last:border-0">
                      <td className="p-3 font-mono text-xs text-gray-700">{inv.id}</td>
                      <td className="p-3 text-gray-700">{inv.date}</td>
                      <td className="p-3 text-gray-700">${inv.amount}.00</td>
                      <td className="p-3"><Badge variant="success">{inv.status}</Badge></td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.success('Downloading invoice...')}>
                          <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-4">
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>Destructive actions. Some of these can't be undone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-white">
                <div>
                  <div className="text-sm font-medium text-gray-900">Pause Automation</div>
                  <p className="text-xs text-gray-500">Stop sending auto-DMs to all incoming mentions.</p>
                </div>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => toast('Automation paused')}>
                  Pause
                </Button>
              </div>

              <AlertDialog>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-white">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Clear All Codes</div>
                    <p className="text-xs text-gray-500">Permanently deletes every code in every pool.</p>
                  </div>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">Clear Codes</Button>
                  </AlertDialogTrigger>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all codes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete every code across all pools. Codes already issued to users will remain valid until they expire, but no new codes will be available.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toast.success('All codes cleared')}>Yes, clear codes</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-white">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Delete Account</div>
                    <p className="text-xs text-gray-500">Wipes everything: templates, pools, mentions, billing.</p>
                  </div>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This is permanent. All your data, templates, codes, and historical mentions will be deleted. You'll be invoiced for any usage since your last billing cycle.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toast.success('Account scheduled for deletion')}>Yes, delete forever</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
