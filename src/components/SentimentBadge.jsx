import { Badge } from './ui/badge'

export function SentimentBadge({ sentiment }) {
  const v = sentiment === 'positive' ? 'positive' : sentiment === 'negative' ? 'negative' : 'neutral'
  return <Badge variant={v} className="capitalize">{sentiment}</Badge>
}

export function DMStatusIcon({ status }) {
  if (status === 'dm_sent') return <span className="inline-flex items-center gap-1 text-teal-600 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> DM Sent</span>
  if (status === 'approved') return <span className="inline-flex items-center gap-1 text-green-600 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Approved</span>
  if (status === 'pending') return <span className="inline-flex items-center gap-1 text-amber-600 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pending</span>
  if (status === 'processing') return <span className="inline-flex items-center gap-1 text-blue-600 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Processing</span>
  if (status === 'rejected') return <span className="inline-flex items-center gap-1 text-gray-500 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Rejected</span>
  if (status === 'dm_failed') return <span className="inline-flex items-center gap-1 text-red-600 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> DM Failed</span>
  if (status === 'error') return <span className="inline-flex items-center gap-1 text-red-600 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Error</span>
  if (status === 'no_code_available') return <span className="inline-flex items-center gap-1 text-orange-600 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> No Code</span>
  return <span className="inline-flex items-center gap-1 text-gray-400 text-xs capitalize">{status}</span>
}
