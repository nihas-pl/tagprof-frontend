import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatCard } from '@/components/StatCard'
import { SentimentBadge, DMStatusIcon } from '@/components/SentimentBadge'
import { MentionDetailSheet } from '@/components/MentionDetailSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Instagram, AlertTriangle } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { api } from '@/lib/api'
import { formatAED } from '@/lib/utils'

// Mock trend data for now (can be replaced with API data later)
const trendData = Array.from({ length: 30 }, (_, i) => ({
  date: `Dec ${i + 1}`,
  mentions: Math.floor(Math.random() * 20) + 10,
  replies: Math.floor(Math.random() * 18) + 8,
}))

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function Dashboard() {
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await api.dashboard.getMetrics()
      return response.data
    },
  })

  const { data: socialStatus } = useQuery({
    queryKey: ['social-status'],
    queryFn: async () => {
      const response = await api.social.getStatus()
      return response.data
    },
  })

  const instagramConnected = socialStatus?.instagram?.connected || false

  const sentimentBreakdown = metrics?.sentiment_breakdown ? [
    { name: 'Positive', value: metrics.sentiment_breakdown.positive || 0, color: '#10b981' },
    { name: 'Neutral', value: metrics.sentiment_breakdown.neutral || 0, color: '#6b7280' },
    { name: 'Negative', value: metrics.sentiment_breakdown.negative || 0, color: '#ef4444' },
  ] : []

  const conversionRate = metrics?.conversion_rate || 0
  const recentMentions = metrics?.recent_mentions || []

  return (
    <div className="space-y-6">
      {/* Instagram Connection Alert */}
      {!instagramConnected && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-800">
                <strong>Instagram not connected.</strong> Connect your Instagram account to start receiving mentions and sending automated discount codes.
              </span>
            </div>
            <Button asChild size="sm" className="ml-4 shrink-0">
              <Link to="/connect/instagram" className="gap-2">
                <Instagram className="h-4 w-4" />
                Connect Instagram
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard 
          label="Total Mentions" 
          value={metrics?.total_mentions?.toString() || '0'} 
          sub="this month" 
          trend="18%" 
          trendDirection="up" 
        />
        <StatCard 
          label="Auto-DMs Sent" 
          value={metrics?.dm_sent?.toString() || '0'} 
          sub="this month" 
          trend="12%" 
          trendDirection="up" 
        />
        <StatCard 
          label="Codes Redeemed" 
          value={metrics?.redeemed_codes?.toString() || '0'} 
          sub={`conversion: ${conversionRate}%`} 
          trend="6%" 
          trendDirection="up" 
        />
        <StatCard 
          label="Available Codes" 
          value={metrics?.available_codes?.toString() || '0'} 
          sub={`of ${metrics?.total_codes || 0} total`} 
          trend="24%" 
          trendDirection="up" 
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mentions & Replies Over Time</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand" /> Mentions</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" /> Replies</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[280px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#e2e8f0" interval={4} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#e2e8f0" />
                  <Tooltip />
                  <Line type="monotone" dataKey="mentions" stroke="#E11D74" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="replies" stroke="#0891B2" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mention Sentiment</CardTitle>
            <CardDescription>Across all mentions this month</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sentimentBreakdown.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Mentions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mentions</CardTitle>
          <CardDescription>Click a row to see the full detail</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentMentions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No mentions yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMentions.map((m) => (
                  <TableRow
                    key={m.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelected(m)
                      setOpen(true)
                    }}
                  >
                    <TableCell className="font-medium text-gray-900">@{m.ig_handle}</TableCell>
                    <TableCell><SentimentBadge sentiment={m.sentiment_label} /></TableCell>
                    <TableCell><DMStatusIcon status={m.status} /></TableCell>
                    <TableCell className="font-mono text-xs text-gray-700">{m.discount_code || '—'}</TableCell>
                    <TableCell className="text-right text-xs text-gray-500">{timeAgo(m.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MentionDetailSheet mention={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}
