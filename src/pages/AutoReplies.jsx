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
import { Plus, Edit, Copy, Trash2, MessageCircle, Package, Info, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const tokens = ['{username}', '{code}', '{expiry}', '{discount_value}', '{min_order}']
const DEFAULT_TEMPLATE = 'Hey {username}! 💕 Thanks for tagging us! Use {code} for {discount_value} off. Valid for {expiry}.'
const INSTAGRAM_DM_LIMIT = 1000

function PhonePreview({ message }) {
  return (
    <div className="rounded-[3rem] border-[12px] border-gray-900 bg-black shadow-2xl w-[280px] h-[480px] mx-auto overflow-hidden relative">
      {/* Dynamic Island */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
      
      {/* Screen */}
      <div className="h-full w-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="h-10 flex items-center justify-between px-4">
          <div className="text-[11px] font-semibold">9:41</div>
          <div className="flex items-center gap-1.5">
            {/* Signal Strength */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 13h2v2H1v-2zm3-3h2v5H4v-5zm3-3h2v8H7V7zm3-3h2v11h-2V4zm3-3h2v14h-2V1z"/>
            </svg>
            {/* WiFi */}
            <svg className="w-4 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-4c-2.2 0-4.2.9-5.7 2.3L8 18c1-1 2.4-1.6 4-1.6s3 .6 4 1.6l1.7-1.7C16.2 14.9 14.2 14 12 14zm0-4c-3.3 0-6.3 1.3-8.5 3.5L5.2 15c1.7-1.7 4.1-2.8 6.8-2.8s5.1 1.1 6.8 2.8l1.7-1.5C18.3 11.3 15.3 10 12 10zm0-4C7.4 6 3.3 7.9.5 11.5L2.2 13C4.7 10.5 8.2 9 12 9s7.3 1.5 9.8 4l1.7-1.5C20.7 7.9 16.6 6 12 6z" opacity="0.3"/>
              <path d="M12 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm5.7-3.7C16.2 12.9 14.2 12 12 12s-4.2.9-5.7 2.3L8 16c1-1 2.4-1.6 4-1.6s3 .6 4 1.6l1.7-1.7z"/>
            </svg>
            {/* Battery */}
            <svg className="w-6 h-3.5" viewBox="0 0 24 12" fill="none">
              <rect x="1" y="1" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="2.5" y="2.5" width="15" height="7" rx="1" fill="currentColor"/>
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
  const [body, setBody] = useState(template?.body || DEFAULT_TEMPLATE)
  const [language, setLanguage] = useState(template?.language || 'en')
  const [threshold, setThreshold] = useState([template?.threshold || 0])
  const [campaignId, setCampaignId] = useState(template?.campaign?.id?.toString() || '')
  const [sentimentTarget, setSentimentTarget] = useState(template?.sentiment_target || 'positive')
  const [priority, setPriority] = useState(template?.priority || 0)
  const [showSampleDialog, setShowSampleDialog] = useState(false)

  // Update form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name || '')
      setBody(template.body || DEFAULT_TEMPLATE)
      setLanguage(template.language || 'en')
      setThreshold([template.threshold || 70])
      setCampaignId(template.campaign?.id?.toString() || '')
      setSentimentTarget(template.sentiment_target || 'positive')
      setPriority(template.priority || 0)
    } else {
      // Reset form for new template
      setName('')
      setBody(DEFAULT_TEMPLATE)
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

  const validateTokens = (text) => {
    const errors = []
    
    // Check for unmatched brackets
    let openCount = 0
    let closeCount = 0
    let lastOpenIndex = -1
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        openCount++
        lastOpenIndex = i
      } else if (text[i] === '}') {
        closeCount++
        if (closeCount > openCount) {
          errors.push('Found closing bracket } without matching opening bracket {')
          break
        }
      }
    }
    
    if (openCount > closeCount) {
      const unclosedText = text.substring(lastOpenIndex, Math.min(lastOpenIndex + 20, text.length))
      errors.push(`Found unclosed bracket: ${unclosedText}...`)
    }
    
    // Check for empty tokens
    if (text.includes('{}')) {
      errors.push('Found empty token {}')
    }
    
    // Check for nested brackets
    if (text.includes('{{') || text.includes('}}')) {
      errors.push('Found nested brackets ({{ or }})')
    }
    
    // Find all valid tokens and check against allowed list
    const tokenPattern = /\{([^}]+)\}/g
    const foundTokens = [...text.matchAll(tokenPattern)].map(match => `{${match[1]}}`)
    const invalidTokens = foundTokens.filter(token => !tokens.includes(token))
    
    if (invalidTokens.length > 0) {
      errors.push(`Invalid tokens: ${[...new Set(invalidTokens)].join(', ')}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
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

    // Check if campaign-dependent tokens are used
    const campaignTokens = ['{code}', '{discount_value}', '{expiry}', '{min_order}']
    const usesCampaignTokens = campaignTokens.some(token => body.includes(token))
    
    if (usesCampaignTokens && !campaignId) {
      toast.error('Campaign is required when using {code}, {discount_value}, {expiry}, or {min_order} tokens')
      return
    }

    // Validate tokens
    const validation = validateTokens(body)
    if (!validation.isValid) {
      toast.error(
        <div className="space-y-1">
          <div className="font-semibold">Template validation failed:</div>
          <ul className="text-sm list-disc list-inside">
            {validation.errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
          <div className="text-xs mt-2 opacity-75">Valid tokens: {tokens.join(', ')}</div>
        </div>,
        { duration: 5000 }
      )
      return
    }

    onSave({
      name: name.trim(),
      body: body.trim(),
      language,
      threshold: threshold[0],
      sentiment_target: sentimentTarget,
      discount_campaign_id: campaignId ? parseInt(campaignId) : null,
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
          <div className="space-y-4 px-1">
            <div>
              <Label>Template name</Label>
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Default Thank You" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Message body</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono tabular-nums ${
                    body.length > INSTAGRAM_DM_LIMIT ? 'text-red-600 font-semibold' :
                    body.length > INSTAGRAM_DM_LIMIT * 0.9 ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    {body.length} / {INSTAGRAM_DM_LIMIT}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSampleDialog(true)}
                    className="h-6 px-2 text-xs"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    View Sample
                  </Button>
                </div>
              </div>
              <Textarea
                className="mt-1.5 font-mono text-xs"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={INSTAGRAM_DM_LIMIT}
              />
              {body.length > INSTAGRAM_DM_LIMIT * 0.9 && (
                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    {body.length >= INSTAGRAM_DM_LIMIT
                      ? 'Instagram DM character limit reached'
                      : `Approaching Instagram DM limit (${INSTAGRAM_DM_LIMIT - body.length} characters remaining)`}
                  </span>
                </div>
              )}
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

            <div className="grid grid-cols-1 gap-3">
              {/* <div>
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              {/* <div>
                <Label>Sentiment Target</Label>
                <Select value={sentimentTarget} onValueChange={setSentimentTarget}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div>
              <Label>Campaign (Optional)</Label>
              <Select value={campaignId || "none"} onValueChange={(value) => setCampaignId(value === "none" ? "" : value)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a campaign (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
              <p className="text-xs text-gray-500 mt-1.5">Discount codes will be assigned from this campaign (if selected)</p>
            </div>
            </div>

            

            {/* <div>
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
            </div> */}

            {/* <div>
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
            </div> */}
          </div>

          <div>
            <div className=" rounded-xl bg-gray-50 border border-gray-200 p-2">
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

      {/* Sample Template Dialog */}
      <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sample Template</DialogTitle>
            <DialogDescription>
              This is a sample template you can use as a starting point. Copy and customize it for your needs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-gray-800 leading-relaxed">{DEFAULT_TEMPLATE}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Available tokens:</p>
              <div className="flex flex-wrap gap-1.5">
                {tokens.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center text-xs font-mono bg-brand/10 text-brand-700 rounded-full px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(DEFAULT_TEMPLATE)
                toast.success('Sample template copied to clipboard')
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Sample
            </Button>
            <Button onClick={() => setShowSampleDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

export default function AutoReplies() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [openEditor, setOpenEditor] = useState(false)
  const [duplicating, setDuplicating] = useState(null)
  const [duplicateName, setDuplicateName] = useState('')

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
    mutationFn: async ({ id, name }) => {
      return await api.dmTemplates.duplicate(id, { name })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-templates'] })
      toast.success('Template duplicated successfully')
      setDuplicating(null)
      setDuplicateName('')
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

  const handleDuplicate = (template) => {
    setDuplicating(template)
    setDuplicateName(`${template.name} (Copy)`)
  }

  const handleConfirmDuplicate = () => {
    if (!duplicateName.trim()) {
      toast.error('Template name is required')
      return
    }
    duplicateMutation.mutate({ id: duplicating.id, name: duplicateName.trim() })
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
                    <div className={`h-7 w-7 rounded-md flex items-center justify-center ${t.active ? 'bg-brand/10' : 'bg-gray-100'}`}>
                      <MessageCircle className={`h-3.5 w-3.5 ${t.active ? 'text-brand' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`capitalize font-semibold ${t.active ? 'text-gray-900' : 'text-gray-500'}`}>{t.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary" className={t.active ? '' : 'opacity-60'}>
                        {t.language === 'en' ? 'English' : t.language === 'ar' ? 'Arabic' : 'Both'}
                      </Badge>
                      {/* <Badge variant="teal">{t.sentiment_target}</Badge> */}
                      {/* {t.priority > 0 && <Badge variant="outline">Priority: {t.priority}</Badge>} */}
                    </div>
                  </div>
                  <Switch
                    checked={t.active}
                    onCheckedChange={(active) => toggleActiveMutation.mutate({ id: t.id, active })}
                  />
                </div>

                <p className={`text-sm leading-relaxed line-clamp-3 rounded-md p-3 border ${t.active ? 'text-gray-600 bg-gray-50 border-gray-100' : 'text-gray-400 bg-gray-50 border-gray-100'}`}>
                  {t.body}
                </p>

                <div className={`flex items-center justify-between text-xs ${t.active ? 'text-gray-500' : 'text-gray-400'}`}>
                  <span className="inline-flex items-center gap-1">
                    <Package className="h-3 w-3" /> {t.campaign?.name || 'No campaign'}
                  </span>
                  {/* <span>Threshold: {t.threshold}%</span> */}
                </div>

                <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(t)}>
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

      {/* Duplicate Template Dialog */}
      <Dialog open={!!duplicating} onOpenChange={(open) => {
        if (!open) {
          setDuplicating(null)
          setDuplicateName('')
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Template</DialogTitle>
            <DialogDescription>
              Enter a name for the duplicated template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Template name</Label>
              <Input 
                className="mt-1.5" 
                value={duplicateName} 
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="e.g. Default Thank You (Copy)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmDuplicate()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDuplicating(null)
                setDuplicateName('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmDuplicate} disabled={duplicateMutation.isPending}>
              {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
