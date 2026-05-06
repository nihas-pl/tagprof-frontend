import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Search, Edit, Trash2, Calendar, Package, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'
import CampaignForm from '@/components/CampaignForm'

function StatusBadge({ status }) {
  const map = {
    available: 'success',
    assigned: 'teal',
    redeemed: 'default',
    expired: 'neutral',
  }
  return <Badge variant={map[status] || 'secondary'}>{status}</Badge>
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openGenerateCodes, setOpenGenerateCodes] = useState(false)
  const [generateCount, setGenerateCount] = useState(50)
  const [openEditCampaign, setOpenEditCampaign] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await api.campaigns.get(id)
      return response.data.campaign
    },
  })

  const generateCodesMutation = useMutation({
    mutationFn: async (count) => {
      return await api.campaigns.generateCodes(id, count)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
      toast.success(response.data.message || 'Codes generated successfully')
      setOpenGenerateCodes(false)
      setGenerateCount(50)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to generate codes')
    },
  })

  const updateCampaignMutation = useMutation({
    mutationFn: async (formData) => {
      return await api.campaigns.update(id, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign updated successfully')
      setOpenEditCampaign(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to update campaign')
    },
  })

  const deleteCodeMutation = useMutation({
    mutationFn: async (codeId) => {
      return await api.discountCodes.delete(codeId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
      toast.success('Code deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete code')
    },
  })

  const handleGenerateCodes = () => {
    const count = parseInt(generateCount)
    if (count < 1 || count > 1000) {
      toast.error('Count must be between 1 and 1000')
      return
    }
    generateCodesMutation.mutate(count)
  }

  const handleDeleteCode = (codeId) => {
    if (confirm('Are you sure you want to delete this code?')) {
      deleteCodeMutation.mutate(codeId)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">Campaign not found</h3>
          <Button onClick={() => navigate('/campaigns')} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Campaigns
          </Button>
        </CardContent>
      </Card>
    )
  }

  const campaign = data
  const codes = campaign.codes || []
  const isExpired = campaign.expired || (campaign.overall_expiry_date && new Date(campaign.overall_expiry_date) < new Date())

  const filteredCodes = codes.filter((code) => {
    const matchesSearch = code.code.toLowerCase().includes(search.toLowerCase()) ||
                          (code.assigned_to && code.assigned_to.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{campaign.name}</h2>
              {campaign.is_active && !isExpired ? (
                <Badge variant="success">Active</Badge>
              ) : isExpired ? (
                <Badge variant="neutral">Expired</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            {campaign.description && (
              <p className="text-sm text-gray-500">{campaign.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => setOpenEditCampaign(true)}>
          <Edit className="h-4 w-4 mr-1.5" /> Edit Campaign
        </Button>
      </div>

      {/* Campaign Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Discount</div>
            <div className="text-2xl font-bold text-gray-900">
              {campaign.discount_type === 'percentage' 
                ? `${campaign.discount_value}%` 
                : `$${campaign.discount_value}`}
            </div>
            {campaign.minimum_order_value > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Min order: ${campaign.minimum_order_value}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Total Codes</div>
            <div className="text-2xl font-bold text-gray-900">
              {campaign.stats?.total_codes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Available</div>
            <div className="text-2xl font-bold text-green-600">
              {campaign.stats?.available_codes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 mb-1">Assigned / Redeemed</div>
            <div className="text-2xl font-bold text-gray-900">
              {campaign.stats?.assigned_codes || 0} / {campaign.stats?.redeemed_codes || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Overall Expiry</div>
              <div className="font-medium">
                {campaign.overall_expiry_date 
                  ? format(new Date(campaign.overall_expiry_date), 'MMM d, yyyy')
                  : 'No expiry'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Code Expiry</div>
              <div className="font-medium">
                {campaign.code_expiry_duration 
                  ? `${campaign.code_expiry_duration} ${campaign.code_expiry_unit} from assignment`
                  : 'No expiry'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Created</div>
              <div className="font-medium">
                {format(new Date(campaign.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Discount Codes <span className="text-gray-500 font-normal">({filteredCodes.length} codes)</span>
            </CardTitle>
            <Button size="sm" onClick={() => setOpenGenerateCodes(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Generate More Codes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search codes or assigned to..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Codes Table */}
          {filteredCodes.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No codes found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {codes.length === 0 
                  ? 'Generate codes to get started' 
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Individual Expiry</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>
                        <StatusBadge status={code.status} />
                      </TableCell>
                      <TableCell>
                        {code.assigned_to ? (
                          <span className="text-gray-900">@{code.assigned_to}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.individual_expiry_date ? (
                          <span className="text-sm">
                            {format(new Date(code.individual_expiry_date), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(code.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCode(code.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Codes Dialog */}
      <Dialog open={openGenerateCodes} onOpenChange={setOpenGenerateCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate More Codes</DialogTitle>
            <DialogDescription>
              Generate additional discount codes for this campaign
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="count">Number of Codes (1-1000)</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 6-character alphanumeric (e.g., A1B2C3)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenGenerateCodes(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCodes}
              disabled={generateCodesMutation.isPending}
            >
              {generateCodesMutation.isPending ? 'Generating...' : 'Generate Codes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <CampaignForm
        open={openEditCampaign}
        onClose={() => setOpenEditCampaign(false)}
        onSubmit={(formData) => updateCampaignMutation.mutate(formData)}
        initialData={campaign}
        isLoading={updateCampaignMutation.isPending}
      />
    </div>
  )
}
