import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, Copy, Trash2, MessageCircle, Package } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const tokens = ['{username}', '{code}', '{expiry}', '{discount_value}', '{min_order}']

function PhonePreview({ message }) {
  return (
    <div className="rounded-[3rem] border-[12px] border-gray-900 bg-black shadow-2xl w-[280px] h-[480px] mx-auto overflow-hidden relative">
      {/* Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-black rounded-full z-10" />
      
      {/* Screen */}
      <div className="h-full w-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="h-14 flex items-end justify-between px-6 pb-2">
          <div className="text-[11px] font-semibold">9:41</div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-3" viewBox="0 0 16 12" fill="none">
              <path d="M1.5 4.5h2v3h-2v-3zm3 0h2v3h-2v-3zm3 0h2v3h-2v-3zm3 0h2v3h-2v-3z" fill="currentColor"/>
            </svg>
            <svg className="w-6 h-3.5" viewBox="0 0 24 12" fill="none">
              <rect x="1" y="1" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="20" y="4" width="2" height="4" rx="1" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Instagram Header */}
        <div className="bg-gradient-to-r from-brand to-purple-500 px-4 py-3 flex items-center gap-2.5 shadow-sm">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">TP</div>
          <div className="text-white text-sm font-semibold">@tagprof</div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-gray-50 p-4 space-y-3 overflow-y-auto">
          <div className="text-center text-[10px] text-gray-400 font-medium">Today</div>
          <div className="bg-white rounded-[20px] rounded-tl-md border border-gray-200 px-3.5 py-2.5 max-w-[85%] text-gray-800 shadow-sm text-[13px] leading-relaxed">
            {message || 'Your message will appear here...'}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="h-8 flex items-center justify-center">
          <div className="w-32 h-1 rounded-full bg-gray-900" />
        </div>
      </div>
    </div>
  )
}

function TemplateEditor({ open, onOpenChange, template, onSave, campaigns = [] }) {
  const [name, setName] = useState(template?.name || '')
  const [body, setBody] = useState(template?.body || 'Hey {username}! 💕 Thanks for tagging us! Use {code} for {discount_value} off. Valid for {expiry}.')
  const [language, setLanguage] = useState(template?.language || 'en')
  const [threshold, setThreshold] = useState([template?.threshold || 70])
  const [campaignId, setCampaignId] = useState(template?.campaign?.id?.toString() || '')
  const [sentimentTarget, setSentimentTarget] = useState(template?.sentiment_target || 'positive')
  const [priority, setPriority] = useState(template?.priority || 0)

  // Update form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name || '')
      setBody(template.body || 'Hey {username}! 💕 Thanks for tagging us! Use {code} for {discount_value} off. Valid for {expiry}.')
      setLanguage(template.language || 'en')
      setThreshold([template.threshold || 70])
      setCampaignId(template.campaign?.id?.toString() || '')
      setSentimentTarget(template.sentiment_target || 'positive')
      setPriority(template.priority || 0)
    } else {
      // Reset form for new template
      setName('')
      setBody('Hey {username}! 💕 Thanks for tagging us! Use {code} for {discount_value} off. Valid for {expiry}.')
      setLanguage('en')
      setThreshold([70])
      setCampaignId('')
      setSentimentTarget('positive')
      setPriority(0)
    }
  }, [template, open])

  function insertToken(token) {
    setBody((b) => b + ' ' + token)
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Template name is required')
      return
    }
    if (!body.trim()) {
      toast.error('Message body is required')
      return
    }
    if (!campaignId) {
      toast.error('Please select a campaign')
      return
    }

    onSave({
      name: name.trim(),
      body: body.trim(),
      language,
      threshold: threshold[0],
      sentiment_target: sentimentTarget,
      discount_campaign_id: parseInt(campaignId),
      priority,
      active: template?.active ?? true,
    })
  }

  const selectedCampaign = campaigns.find(c => c.id.toString() === campaignId)
  const previewText = body
    .replace('{username}', '@sara_almansouri')
    .replace('{code}', 'ABC123')
    .replace('{expiry}', '72 hours')
    .replace('{discount_value}', selectedCampaign ? 
      (selectedCampaign.discount_type === 'percentage' ? `${selectedCampaign.discount_value}%` : `$${selectedCampaign.discount_value}`)
      : '15%')
    .replace('{min_order}', selectedCampaign?.minimum_order_value > 0 ? `$${selectedCampaign.minimum_order_value}` : '$50')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'New Template'}</DialogTitle>
          <DialogDescription>Configure how your auto-reply DMs are sent.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto pr-1">
          <div className="space-y-4">
            <div>
              <Label>Template name</Label>
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Default Thank You" />
            </div>

            <div>
              <Label>Message body</Label>
              <Textarea
                className="mt-1.5 font-mono text-xs"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-500 mr-1 self-center">Insert:</span>
                {tokens.map((t) => (
                  <button
                    key={t}
                    onClick={() => insertToken(t)}
                    className="inline-flex items-center text-xs font-mono bg-brand/10 text-brand-700 hover:bg-brand/20 rounded-full px-2 py-0.5 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sentiment Target</Label>
                <Select value={sentimentTarget} onValueChange={setSentimentTarget}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Campaign</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a campaign" /></SelectTrigger>
                <SelectContent>
                  {campaigns.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No campaigns available
                    </div>
                  ) : (
                    campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name} ({campaign.discount_type === 'percentage' 
                          ? `${campaign.discount_value}%` 
                          : `$${campaign.discount_value}`})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1.5">Discount codes will be assigned from this campaign</p>
            </div>

            <div>
              <Label>Priority</Label>
              <Input 
                className="mt-1.5" 
                type="number" 
                min="0"
                value={priority} 
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)} 
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1.5">Higher priority templates are matched first</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Sentiment threshold</Label>
                <span className="text-xs font-mono text-gray-700 tabular-nums">≥ {threshold[0]}</span>
              </div>
              <Slider
                className="mt-3"
                value={threshold}
                onValueChange={setThreshold}
                min={0}
                max={100}
                step={1}
              />
              <p className="text-xs text-gray-500 mt-1.5">Only auto-reply when score is above {threshold[0]}.</p>
            </div>
          </div>

          <div>
            <Label>Live preview</Label>
            <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 p-6">
              <PhonePreview message={previewText} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AutoReplies() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [openEditor, setOpenEditor] = useState(false)

  // Fetch templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['dm-templates'],
    queryFn: async () => {
      const response = await api.dmTemplates.list()
      return response.data.templates
    },
  })

  // Fetch campaigns for the dropdown
  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns-for-templates'],
    queryFn: async () => {
      const response = await api.campaigns.list({ per_page: 100 })
      return response.data.campaigns.filter(c => c.is_active && !c.expired)
    },
  })

  const templates = templatesData || []
  const campaigns = campaignsData || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await api.dmTemplates.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] })
      toast.success('Template created successfully')
      setOpenEditor(false)
      setEditing(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to create template')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await api.dmTemplates.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] })
      toast.success('Template updated successfully')
      setOpenEditor(false)
      setEditing(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to update template')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.dmTemplates.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] })
      toast.success('Template deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete template')
    },
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id) => {
      return await api.dmTemplates.duplicate(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] })
      toast.success('Template duplicated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to duplicate template')
    },
  })

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      return await api.dmTemplates.update(id, { active })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] })
      const template = templates.find(t => t.id === variables.id)
      toast.success(variables.active ? `${template?.name} activated` : `${template?.name} paused`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.join(', ') || 'Failed to toggle template')
    },
  })

  const handleSave = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (template) => {
    setEditing(template)
    setOpenEditor(true)
  }

  const handleNew = () => {
    setEditing(null)
    setOpenEditor(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Auto-Reply Templates</h2>
          <p className="text-sm text-gray-500">Templates run when a mention matches their sentiment & language criteria.</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-1.5" /> New Template
        </Button>
      </div>

      {templatesLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No templates yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first auto-reply template to get started</p>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-brand/10 flex items-center justify-center">
                        <MessageCircle className="h-3.5 w-3.5 text-brand" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant="secondary">
                        {t.language === 'en' ? 'English' : t.language === 'ar' ? 'Arabic' : 'Both'}
                      </Badge>
                      <Badge variant="teal">{t.sentiment_target}</Badge>
                      {t.priority > 0 && <Badge variant="outline">Priority: {t.priority}</Badge>}
                    </div>
                  </div>
                  <Switch
                    checked={t.active}
                    onCheckedChange={(active) => toggleActiveMutation.mutate({ id: t.id, active })}
                  />
                </div>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 bg-gray-50 rounded-md p-3 border border-gray-100">
                  {t.body}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Package className="h-3 w-3" /> {t.campaign?.name || 'No campaign'}
                  </span>
                  <span>Threshold: {t.threshold}%</span>
                </div>

                <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => duplicateMutation.mutate(t.id)}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Duplicate
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto" 
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateEditor 
        open={openEditor} 
        onOpenChange={(open) => {
          setOpenEditor(open)
          if (!open) setEditing(null)
        }}
        template={editing} 
        onSave={handleSave}
        campaigns={campaigns}
      />
    </div>
  )
}
