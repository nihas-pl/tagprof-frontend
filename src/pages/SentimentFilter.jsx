import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Send, Ban, Plus } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { toast } from 'sonner'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

// Mock data for keywords and flagged mentions
const blockedKeywords = ['spam', 'fake', 'scam']
const flaggedMentions = []
const sentimentLast7Days = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  positive: Math.floor(Math.random() * 30) + 10,
  neutral: Math.floor(Math.random() * 15) + 5,
  negative: Math.floor(Math.random() * 10) + 2,
}))

export default function SentimentFilter() {
  const sentimentThreshold = useSettingsStore((state) => state.sentimentThreshold)
  const setSentimentThreshold = useSettingsStore((state) => state.setSentimentThreshold)
  
  const [autoReply, setAutoReply] = useState([sentimentThreshold])
  const [flagLow, setFlagLow] = useState([40])
  const [flagHigh, setFlagHigh] = useState([sentimentThreshold])
  const [block, setBlock] = useState([40])
  const [keywords, setKeywords] = useState(blockedKeywords)
  const [newKeyword, setNewKeyword] = useState('')

  function addKeyword() {
    const k = newKeyword.trim().toLowerCase()
    if (!k || keywords.includes(k)) return
    setKeywords([...keywords, k])
    setNewKeyword('')
    toast.success(`"${k}" added to blocked keywords`)
  }

  function saveThresholds() {
    setSentimentThreshold(autoReply[0])
    toast.success('Sentiment threshold saved')
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left column */}
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Thresholds</CardTitle>
            <CardDescription>Score ranges decide whether AutoThanker replies, flags, or blocks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">Auto-reply if score above</span>
                <span className="text-sm font-mono tabular-nums text-emerald-600">{autoReply[0]}</span>
              </div>
              <Slider value={autoReply} onValueChange={setAutoReply} min={0} max={100} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">Flag for review if between</span>
                <span className="text-sm font-mono tabular-nums text-amber-600">{flagLow[0]} – {flagHigh[0]}</span>
              </div>
              <Slider value={flagLow} onValueChange={setFlagLow} min={0} max={100} />
              <div className="h-2" />
              <Slider value={flagHigh} onValueChange={setFlagHigh} min={0} max={100} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">Block auto-reply if below</span>
                <span className="text-sm font-mono tabular-nums text-red-600">{block[0]}</span>
              </div>
              <Slider value={block} onValueChange={setBlock} min={0} max={100} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-2">Visual zones</p>
              <div className="h-7 rounded-md flex overflow-hidden border border-gray-200">
                <div className="bg-red-200/60 text-red-700 text-[10px] font-medium flex items-center justify-center" style={{ width: `${block[0]}%` }}>Block</div>
                <div className="bg-amber-200/60 text-amber-700 text-[10px] font-medium flex items-center justify-center" style={{ width: `${autoReply[0] - block[0]}%` }}>Flag</div>
                <div className="bg-emerald-200/60 text-emerald-700 text-[10px] font-medium flex items-center justify-center" style={{ width: `${100 - autoReply[0]}%` }}>Auto-reply</div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono"><span>0</span><span>50</span><span>100</span></div>
            </div>

            <Button className="w-full" onClick={saveThresholds}>Save Thresholds</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blocked Keywords</CardTitle>
            <CardDescription>Mentions containing these words always trigger a block, regardless of score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <Badge key={k} variant="negative" className="pl-2 pr-1 gap-1">
                  {k}
                  <button
                    className="ml-0.5 hover:bg-red-100 rounded-full p-0.5"
                    onClick={() => {
                      setKeywords(keywords.filter((kw) => kw !== k))
                      toast(`"${k}" removed`)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {keywords.length === 0 && <p className="text-xs text-gray-400">No keywords yet.</p>}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add a keyword..."
              />
              <Button onClick={addKeyword}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Recent Flagged Mentions</CardTitle>
            <CardDescription>Mentions in the yellow zone awaiting your decision.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {flaggedMentions.map((m) => (
                <li key={m.id} className="px-6 py-3.5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">@{m.username}</span>
                      <Badge variant="warning" className="font-mono">{m.score}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{m.story}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="text-teal-600 hover:bg-teal-50" onClick={() => toast.success('Reply sent')}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => toast('User blocked')}>
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast('Dismissed')}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Stats</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentLast7Days} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#e2e8f0" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#e2e8f0" />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                  <Bar dataKey="positive" stackId="a" fill="#E11D74" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="neutral" stackId="a" fill="#0891B2" />
                  <Bar dataKey="negative" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-emerald-50 border border-emerald-100 rounded-md p-3">
              <span className="text-emerald-700 font-semibold">94%</span>
              of mentions handled automatically this week.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
