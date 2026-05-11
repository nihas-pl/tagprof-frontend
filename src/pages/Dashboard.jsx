import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Instagram, AlertTriangle, MessageSquare, Users, CheckCircle, Package, ArrowUpRight, RefreshCw, Clock, Send, UserPlus, UserCheck, Settings2, Sparkles, Check, X } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from 'recharts'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { SentimentBadge } from '@/components/SentimentBadge'

// Time ago helper
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function Dashboard() {
  const { user } = useAuthStore()

  // Fetch dashboard metrics with performance optimization
  const { data: dashboardData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await api.dashboard.getMetrics()
      return response.data
    },
    staleTime: 60000, // Data stays fresh for 1 minute
    gcTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
  })

  // Fetch social status independently (non-blocking)
  const { data: socialStatus, isLoading: isLoadingSocial } = useQuery({
    queryKey: ['social-status'],
    queryFn: async () => {
      const response = await api.social.getStatus()
      return response.data
    },
    staleTime: 120000, // Data stays fresh for 2 minutes
    gcTime: 600000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch subscription status
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription-current'],
    queryFn: async () => {
      const response = await api.subscriptions.current()
      return response.data
    },
    staleTime: 60000, // Data stays fresh for 1 minute
    gcTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  })

  // Extract data from dashboard response
  const metrics = dashboardData?.metrics || {}
  const recentMentions = dashboardData?.recent_mentions || []
  const trendData = dashboardData?.trends || []

  const instagramConnected = socialStatus?.instagram?.connected || false

  // Check if user has active subscription (active or trialing)
  const hasActiveSubscription = subscriptionData?.status === 'active' || subscriptionData?.status === 'trialing'

  // Calculate completion rates
  const mentionsTotal = metrics?.total_mentions || 0
  const dmsSent = metrics?.dm_sent || 0
  const codesRedeemed = metrics?.redeemed_codes || 0
  const availableCodes = metrics?.available_codes || 0
  
  const responseRate = mentionsTotal > 0 ? Math.round((dmsSent / mentionsTotal) * 100) : 0
  const conversionRate = dmsSent > 0 ? Math.round((codesRedeemed / dmsSent) * 100) : 0

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
    <div className="space-y-6">
      {/* Instagram Connection Alert */}
      {!isLoadingSocial && !instagramConnected && (
        <Alert className="border-amber-200 bg-amber-50">
         
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                <strong>Instagram not connected.</strong> Connect to start automating your workflow.
              </span>
            </div>
            <Button asChild size="sm" className="ml-4 shrink-0">
              <Link to="/settings" className="gap-2">
                <Instagram className="h-4 w-4" />
                Connect Now
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Free Plan Upgrade Alert */}
      {!isLoadingSubscription && subscriptionData?.plan_tier === 'free' && (
        <Card className="border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <CardContent className="py-5 relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">Upgrade to Premium</h3>
                    <Badge className="bg-emerald-400 text-emerald-900 hover:bg-emerald-400 border-0 font-semibold px-2 py-0.5 text-xs">
                      Free: {subscriptionData?.usage?.mentions?.used || 0}/{subscriptionData?.limits?.monthly_mentions || 10} mentions
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Unlimited Mentions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Unlimited Campaigns
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Unlimited Codes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Priority Support
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-purple-700 hover:bg-white/90 font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  <Link to="/settings?tab=billing" className="gap-2">
                    <Sparkles className="h-5 w-5" />
                    Upgrade Now
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Section - Latest Mention and Quick Stats */}
      <div className="grid gap-6 md:grid-cols-[350px_1fr]">
        {/* Latest Mention Card - Instagram Style */}
        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
          <CardContent className="pt-6">
            {isLoadingMetrics ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
                <div className="flex gap-2 justify-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ) : recentMentions.length > 0 ? (
              <div className="flex flex-col items-center text-center">
                {/* Instagram-style avatar with gradient border */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full opacity-75"></div>
                  <Avatar className="relative h-20 w-20 text-lg border-4 border-white shadow-lg">
                    {recentMentions[0].contact?.avatar_url && (
                      <AvatarImage src={recentMentions[0].contact.avatar_url} alt={recentMentions[0].contact.name || recentMentions[0].ig_handle} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-brand to-purple-500 text-white text-xl">
                      {(recentMentions[0].contact?.name || recentMentions[0].ig_handle)?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Username and handle */}
                <h3 className="mt-4 text-lg font-bold text-gray-900">@{recentMentions[0].ig_handle}</h3>
                {recentMentions[0].contact?.name && (
                  <p className="text-sm text-gray-600 mt-0.5">{recentMentions[0].contact.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Latest mention {timeAgo(recentMentions[0].created_at)}
                  {recentMentions[0].contact?.follower_count !== undefined && (
                    <>
                      <span>·</span>
                      <span>{recentMentions[0].contact.follower_count.toLocaleString()} followers</span>
                    </>
                  )}
                </p>

                {/* Status badges */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {/* <SentimentBadge sentiment={recentMentions[0].sentiment_label} /> */}
                  
                  {recentMentions[0].status === 'dm_sent' ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                      <Send className="h-3 w-3" />
                      DM Sent
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-gray-600">
                      <Send className="h-3 w-3" />
                      No DM
                    </Badge>
                  )}
                </div>

                {/* Follow relationship status */}
                <div className="mt-4 w-full grid grid-cols-2 gap-2">
                  {/* They Follow Us */}
                  <div className={`p-1 rounded-lg flex items-center justify-center gap-1.5 ${
                    recentMentions[0].contact?.is_user_follow_business
                      ? 'bg-blue-50 border border-blue-100'
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    {recentMentions[0].contact?.is_user_follow_business ? (
                      <Check className="h-4 w-4 text-blue-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      recentMentions[0].contact?.is_user_follow_business ? 'text-blue-700' : 'text-gray-500'
                    }`}>They Follow</span>
                  </div>
                  
                  {/* We Follow Them */}
                  <div className={`p-1 rounded-lg flex items-center justify-center gap-1.5 ${
                    recentMentions[0].contact?.is_business_follow_user
                      ? 'bg-purple-50 border border-purple-100'
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    {recentMentions[0].contact?.is_business_follow_user ? (
                      <Check className="h-4 w-4 text-purple-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      recentMentions[0].contact?.is_business_follow_user ? 'text-purple-700' : 'text-gray-500'
                    }`}>We Follow</span>
                  </div>
                </div>

                {/* Instagram-style action buttons */}
                <div className="mt-4 w-full grid grid-cols-2 gap-2">
                  <Button 
                    asChild 
                    size="sm" 
                    className="bg-gradient-to-r from-brand to-purple-600 hover:from-brand/90 hover:to-purple-600/90 text-white"
                  >
                    <Link to="/mentions">View Details</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/mentions">All Mentions</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Instagram className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No mentions yet</p>
                <p className="text-xs text-gray-400 mt-1">Connect Instagram to start</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Stats Cards */}
        <div className="flex flex-col gap-6">
          {/* Response Rate and Conversion Rate in one row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Response Rate Card */}
            <Card className="bg-gradient-to-br from-purple-200 via-orange-50 to-orange-200 border-0 overflow-hidden relative">
              <CardContent className="pt-6 relative z-10 flex flex-col h-full min-h-[200px]">
                {isLoadingMetrics ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="mt-auto">
                      <Skeleton className="h-14 w-24 mb-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Response Rate</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Auto-replies sent</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <h2 className="text-5xl font-bold text-gray-900">{responseRate}%</h2>
                      <p className="text-sm text-gray-600 mt-1">Avg. Completed</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Conversion Rate Card */}
            <Card className="bg-gradient-to-br from-cyan-200 via-blue-50 to-blue-300 border-0 overflow-hidden relative">
              <CardContent className="pt-6 relative z-10 flex flex-col h-full min-h-[200px]">
                {isLoadingMetrics ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="mt-auto">
                      <Skeleton className="h-14 w-24 mb-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Conversion Rate</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Codes redeemed</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <h2 className="text-5xl font-bold text-gray-900">{conversionRate}%</h2>
                      <p className="text-sm text-gray-600 mt-1">Avg. Completed</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Connected Integrations */}
          <Card className="bg-gray-100 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Integrations connected</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {instagramConnected ? '1 active connection' : 'No connections yet'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {instagramConnected ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <Instagram className="h-6 w-6 text-brand" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button asChild variant="outline" size="sm" className="bg-white">
                      <Link to="/settings">
                        <Instagram className="h-4 w-4 mr-2" />
                        Connect Instagram
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Analytics and Recent Mentions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription className="mt-1">Mention trends over the last 30 days</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-brand"></div>
                  <span className="text-gray-600">Mentions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className="text-gray-600">Engagement</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-[300px] w-full" />
            ) : trendData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <p>No data available</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      stroke="#e2e8f0" 
                      interval={4}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      stroke="#e2e8f0"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mentions" 
                      stroke="#ec4992" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#b388dd" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Mentions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Mentions</CardTitle>
                <CardDescription className="mt-1">Latest activity</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/mentions" className="text-xs">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingMetrics ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </>
            ) : recentMentions.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No mentions yet</p>
              </div>
            ) : (
              recentMentions.slice(0, 5).map((mention) => (
                <Link 
                  key={mention.id} 
                  to="/mentions"
                  className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      {mention.contact?.avatar_url && (
                        <AvatarImage src={mention.contact.avatar_url} alt={mention.contact.name || mention.ig_handle} />
                      )}
                      <AvatarFallback className="text-xs bg-brand/10 text-brand">
                        {(mention.contact?.name || mention.ig_handle)?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          @{mention.ig_handle}
                        </p>
                        <SentimentBadge sentiment={mention.sentiment_label} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo(mention.created_at)}</span>
                        <span>•</span>
                        {mention.status === 'dm_sent' ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Replied
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            No Reply
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="pt-6">
            <Link to="/mentions" className="block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mentions This Week</p>
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-1">{mentionsTotal}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                  <Users className="h-6 w-6 text-brand" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="pt-6">
            <Link to="/codes" className="block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Discount Codes</p>
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-1">{availableCodes}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                  <Package className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="pt-6">
            <Link to="/settings" className="block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Settings</p>
                  <p className="text-sm text-gray-500 mt-1">Configure automation</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Settings2 className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
