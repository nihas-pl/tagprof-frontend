import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Check, Clock, X, Send, Tag, Calendar } from 'lucide-react'
import { timeAgo } from '@/lib/mockData'
import { toast } from 'sonner'
import { useState } from 'react'

function SentimentBadge({ sentiment }) {
  const variant = sentiment === 'positive' ? 'positive' : sentiment === 'negative' ? 'negative' : 'neutral'
  return <Badge variant={variant} className="capitalize">{sentiment}</Badge>
}

export function MentionDetailSheet({ mention, open, onOpenChange }) {
  const [reply, setReply] = useState('')
  const [blocked, setBlocked] = useState(false)
  if (!mention) return null

  const username = mention.ig_handle || 'unknown'
  const name = mention.contact?.name || mention.contact?.instagram_username || username
  const initial = name.charAt(0).toUpperCase()
  const avatarUrl = mention.contact?.avatar_url

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-0 flex flex-col">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="bg-gradient-to-br from-brand to-purple-500 text-white font-semibold">{initial}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-base">@{username}</SheetTitle>
              {mention.contact?.name && (
                <div className="text-sm text-gray-600 font-normal">{mention.contact.name}</div>
              )}
              <SheetDescription className="text-xs">{timeAgo(mention.created_at)} · Mention #{mention.id}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 py-4 space-y-5 flex-1 overflow-y-auto">
          {mention.message_text && (
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wide text-gray-500">
                  {mention.is_story_mention ? 'Story Mention' : 'Comment/Message'}
                </Label>
                {mention.is_story_mention && (
                  <Badge variant="outline" className="text-xs">Story</Badge>
                )}
              </div>
              <div className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {mention.message_text || 'No message text available'}
              </div>
            </div>
          )}

          {mention.content_url && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-gray-500">Content URL</Label>
              <div className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                <a href={mention.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {mention.content_url}
                </a>
              </div>
            </div>
          )}

          <div>
            {/* <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-gray-500">Sentiment score</Label>
              <SentimentBadge sentiment={mention.sentiment_label} />
            </div> */}
            {/* <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${mention.sentiment_score}%`,
                    background:
                      mention.sentiment_score >= 70 ? '#10b981' : mention.sentiment_score >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">{mention.sentiment_score}/100</span>
            </div> */}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Status</div>
              <div className="mt-1.5 flex items-center gap-2 text-sm font-medium">
                {mention.status === 'dm_sent' && (<><Check className="h-4 w-4 text-teal-500" /> DM Sent</>)}
                {mention.status === 'approved' && (<><Check className="h-4 w-4 text-green-500" /> Approved</>)}
                {mention.status === 'pending' && (<><Clock className="h-4 w-4 text-amber-500" /> Pending</>)}
                {mention.status === 'processing' && (<><Clock className="h-4 w-4 text-blue-500" /> Processing</>)}
                {mention.status === 'rejected' && (<><X className="h-4 w-4 text-red-500" /> Rejected</>)}
                {mention.status === 'error' && (<><X className="h-4 w-4 text-red-500" /> Error</>)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{mention.processed_at ? timeAgo(mention.processed_at) : 'Not processed'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Discount Code</div>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm font-mono font-medium text-gray-900">
                <Tag className="h-3.5 w-3.5 text-brand" />
                {mention.discount_code?.code || '—'}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {mention.discount_code?.status === 'redeemed' ? 'Redeemed ✓' : mention.discount_code ? `Status: ${mention.discount_code.status}` : 'No code issued'}
              </div>
            </div>
          </div>

          {/* <div>
            <Label className="text-xs uppercase tracking-wide text-gray-500">Send a manual reply</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              placeholder={`Hey @${username}, thanks for tagging us!`}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <Button
              className="mt-2"
              size="sm"
              onClick={() => {
                toast.success('DM sent', { description: `Reply delivered to @${username}` })
                setReply('')
              }}
              disabled={!reply.trim()}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" /> Send DM
            </Button>
          </div> */}

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <div>
              <div className="text-sm font-medium text-gray-900">Block this user</div>
              <div className="text-xs text-gray-500">No future auto-replies will be sent to @{username}</div>
            </div>
            <Switch
              checked={blocked}
              onCheckedChange={(v) => {
                setBlocked(v)
                toast(v ? 'User blocked' : 'User unblocked')
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
