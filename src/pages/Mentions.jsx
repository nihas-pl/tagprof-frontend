import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { SentimentBadge, DMStatusIcon } from '@/components/SentimentBadge'
import { MentionDetailSheet } from '@/components/MentionDetailSheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Search, Download, MoreHorizontal, Eye, Send, Ban, Copy, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function Mentions() {
  const [query, setQuery] = useState('')
  const [sentiment, setSentiment] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['mentions', page, query, sentiment, status],
    queryFn: async () => {
      const params = {
        page,
        per_page: 20,
      }
      if (query) params.search = query
      if (sentiment !== 'all') params.sentiment = sentiment
      if (status !== 'all') params.status = status
      
      const response = await api.mentions.list(params)
      return response.data
    },
  })

  const mentions = data?.mentions || []
  const totalPages = data?.pagination?.total_pages || 1

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username..."
                className="pl-8"
              />
            </div>
            <Select value={sentiment} onValueChange={setSentiment}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sentiment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="dm_sent">DM Sent</SelectItem>
                <SelectItem value="dm_failed">DM Failed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Last 30 days
            </Button>
            <div className="md:ml-auto">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => toast.success('Exporting mentions to CSV...')}>
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : mentions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No mentions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"><Checkbox /></TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Redeemed</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentions.map((m) => (
                  <TableRow
                    key={m.id}
                    className="cursor-pointer"
                    onClick={() => { setSelected(m); setOpen(true) }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">@{m.ig_handle}</TableCell>
                    <TableCell><SentimentBadge sentiment={m.sentiment_label} /></TableCell>
                    <TableCell><DMStatusIcon status={m.status} /></TableCell>
                    <TableCell className="font-mono text-xs text-gray-700">{m.discount_code?.code || '—'}</TableCell>
                    <TableCell>
                      {m.discount_code?.status === 'redeemed' ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{timeAgo(m.created_at)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelected(m); setOpen(true) }}>
                            <Eye className="h-4 w-4 mr-2 text-gray-500" /> View Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast('Manual reply opened')}>
                            <Send className="h-4 w-4 mr-2 text-gray-500" /> Manually Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast(`@${m.ig_handle} has been blocked`)}>
                            <Ban className="h-4 w-4 mr-2 text-gray-500" /> Block User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { 
                            navigator.clipboard?.writeText(m.discount_code?.code || ''); 
                            toast.success('Code copied') 
                          }}>
                            <Copy className="h-4 w-4 mr-2 text-gray-500" /> Copy Code
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing {data?.pagination?.current_page || 1}–{mentions.length} of {data?.pagination?.total_count || 0}
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
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <Button
              key={i + 1}
              variant="outline"
              size="sm"
              className={page === i + 1 ? 'bg-gray-50' : ''}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
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

      <MentionDetailSheet mention={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}
