import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Sparkles, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'

function StatusBadge({ status }) {
  const map = {
    available: 'success',
    assigned: 'teal',
    redeemed: 'default',
    expired: 'neutral',
  }
  return <Badge variant={map[status] || 'secondary'}>{status}</Badge>
}

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function DiscountCodes() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['discount-codes', page, statusFilter],
    queryFn: async () => {
      const params = { page, per_page: 50 }
      if (statusFilter !== 'all') params.status = statusFilter
      
      const response = await api.discountCodes.list(params)
      return response.data
    },
  })

  const discounts = data?.codes || []
  const stats = data?.stats || {}
  const totalPages = data?.meta?.total_pages || 1

  const filtered = useMemo(() => {
    if (!search) return discounts
    return discounts.filter((d) => d.code.toLowerCase().includes(search.toLowerCase()))
  }, [discounts, search])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Discount Codes</h2>
          <p className="text-sm text-gray-500">View all discount codes across campaigns</p>
        </div>
        <Link to="/campaigns">
          <Button variant="outline">
            Manage Campaigns
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Total Codes</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Available</div>
            <div className="text-2xl font-bold text-green-600">{stats.available || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Assigned</div>
            <div className="text-2xl font-bold text-teal-600">{stats.assigned || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Redeemed</div>
            <div className="text-2xl font-bold text-brand">{stats.redeemed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Codes table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CardTitle>All Codes</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  className="pl-8 h-8 w-[180px]"
                  placeholder="Search code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-8"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="redeemed">Redeemed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No discount codes found</p>
              <p className="text-xs mt-2">Codes are generated within campaigns</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm font-medium text-gray-900">{c.code}</TableCell>
                    <TableCell>
                      {c.campaign ? (
                        <Link 
                          to={`/campaigns/${c.campaign.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                        >
                          {c.campaign.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {c.assigned_to ? `@${c.assigned_to}` : <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {c.campaign ? (
                        <>
                          {c.campaign.discount_value}
                          {c.campaign.discount_type === 'percentage' ? '%' : ' $'} off
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{timeAgo(c.created_at)}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {c.individual_expiry_date ? new Date(c.individual_expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
