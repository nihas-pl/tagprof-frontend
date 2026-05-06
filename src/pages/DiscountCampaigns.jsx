import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Eye, Edit, Trash2, Calendar, TrendingUp, Package } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import CampaignForm from '@/components/CampaignForm'
import { format } from 'date-fns'

function CampaignCard({ campaign, onView, onEdit, onDelete }) {
  const isExpired = campaign.expired || (campaign.overall_expiry_date && new Date(campaign.overall_expiry_date) < new Date())
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
              {campaign.is_active && !isExpired ? (
                <Badge variant="success">Active</Badge>
              ) : isExpired ? (
                <Badge variant="neutral">Expired</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            {campaign.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Discount</div>
            <div className="font-semibold text-gray-900">
              {campaign.discount_type === 'percentage' 
                ? `${campaign.discount_value}%` 
                : `$${campaign.discount_value}`}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Min Order</div>
            <div className="font-semibold text-gray-900">
              {campaign.minimum_order_value > 0 ? `$${campaign.minimum_order_value}` : 'No minimum'}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-0.5">Total Codes</div>
            <div className="font-semibold text-gray-900">
              {campaign.stats?.total_codes || 0}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-0.5">Available</div>
            <div className="font-semibold text-green-600">
              {campaign.stats?.available_codes || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {campaign.overall_expiry_date 
              ? `Expires ${format(new Date(campaign.overall_expiry_date), 'MMM d, yyyy')}`
              : 'No expiry'}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {campaign.stats?.assigned_codes || 0} assigned
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(campaign.id)} className="flex-1">
            <Eye className="h-3.5 w-3.5 mr-1.5" /> View Codes
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(campaign)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(campaign.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, icon: Icon, variant = 'default' }) {
  const colors = {
    default: 'text-gray-900',
    success: 'text-green-600',
    primary: 'text-blue-600',
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">{title}</div>
            <div className={`text-2xl font-bold ${colors[variant]}`}>{value}</div>
          </div>
          {Icon && <Icon className="h-8 w-8 text-gray-400" />}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DiscountCampaigns() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [openForm, setOpenForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, statusFilter],
    queryFn: async () => {
      const params = { page, per_page: 50 }
      if (statusFilter !== 'all') params.status = statusFilter
      
      const response = await api.campaigns.list(params)
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return await api.campaigns.create(formData)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign created successfully')
      setOpenForm(false)
      setEditingCampaign(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to create campaign')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await api.campaigns.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign updated successfully')
      setOpenForm(false)
      setEditingCampaign(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to update campaign')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.campaigns.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign deactivated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete campaign')
    },
  })

  const handleSubmit = (formData) => {
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign)
    setOpenForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to deactivate this campaign? All codes will be expired.')) {
      deleteMutation.mutate(id)
    }
  }

  const campaigns = data?.campaigns || []
  const stats = data?.stats || {}

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Discount Campaigns</h2>
          <p className="text-sm text-gray-500">Manage discount campaigns and generate codes</p>
        </div>
        <Button onClick={() => {
          setEditingCampaign(null)
          setOpenForm(true)
        }}>
          <Plus className="h-4 w-4 mr-1.5" /> New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          title="Total Campaigns" 
          value={stats.total_campaigns || 0} 
          icon={Package}
        />
        <StatCard 
          title="Active Campaigns" 
          value={stats.active_campaigns || 0} 
          icon={TrendingUp}
          variant="success"
        />
        <StatCard 
          title="Total Codes" 
          value={stats.total_codes || 0}
        />
        <StatCard 
          title="Available Codes" 
          value={stats.available_codes || 0}
          variant="primary"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No campaigns yet</h3>
            <p className="text-sm text-gray-500 mb-4">Get started by creating your first discount campaign</p>
            <Button onClick={() => setOpenForm(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={(id) => navigate(`/campaigns/${id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta?.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.meta.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.meta.total_pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Campaign Form Dialog */}
      <CampaignForm
        open={openForm}
        onClose={() => {
          setOpenForm(false)
          setEditingCampaign(null)
        }}
        onSubmit={handleSubmit}
        initialData={editingCampaign}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
