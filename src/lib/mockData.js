// Centralised realistic mock data for AutoThanker

export const usernames = [
  'sara_almansouri', 'fatima.alzaabi', 'ahmed_dxb', 'noor.hassan', 'mariam_ah',
  'khalid.boutique', 'lulu_dubai', 'rashed_ae', 'alia.styles', 'hessa_collective',
  'omar_aljaber', 'reem.designs', 'yousef_dxb', 'zayed_ae', 'amna.alketbi',
  'maitha_collective', 'tariq.alfaisal', 'shamma_ah', 'mohammed_ux', 'lina_alhammadi',
  'nada.shop', 'aisha_kitchen', 'abdulla.dxb', 'dana_alqasimi', 'jana.abudhabi',
]

const stories = [
  'Just got my new bag from @tagprof, obsessed 😍',
  'Best customer service in Dubai, hands down. @tagprof',
  'Honestly the packaging from @tagprof is unreal',
  'My everyday earrings — got them at @tagprof',
  'Absolutely loving the new collection from @tagprof',
  'Wearing my new outfit from @tagprof to brunch today ✨',
  'Running through Marina with the new sneakers from @tagprof',
  '@tagprof never disappoints, this dress is everything',
  'New skincare set from @tagprof, my skin is glowing',
  'Got my Eid look sorted thanks to @tagprof 🌙',
  'Honestly nothing beats the quality of @tagprof',
  '@tagprof is my go-to for gifts, the packaging is so thoughtful',
  'Order took ages to arrive but finally here. @tagprof',
  'Not loving the fit on this one tbh @tagprof',
  'Got my coffee mug from @tagprof, perfect for the office ☕',
  'Such a vibe at the @tagprof pop-up at Mall of the Emirates today!',
  'Why is everyone sleeping on @tagprof? best store in DXB',
  'Just a quick shoutout to @tagprof for the fast delivery',
  'Returning this. The colour is nothing like the photos @tagprof',
  '@tagprof I love you but please bring back the cream version 🥺',
]

const sentiments = ['positive', 'positive', 'positive', 'positive', 'neutral', 'positive', 'positive', 'negative', 'positive', 'neutral']
const dmStatuses = ['sent', 'sent', 'sent', 'pending', 'sent', 'sent', 'blocked', 'sent', 'sent', 'sent']

function rand(arr, i) { return arr[i % arr.length] }

export function generateMentions(count = 24) {
  const out = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const sentiment = rand(sentiments, i + Math.floor(i / 3))
    const dmStatus = sentiment === 'negative' ? 'blocked' : rand(dmStatuses, i)
    const score = sentiment === 'positive'
      ? 70 + Math.floor(Math.random() * 28)
      : sentiment === 'neutral'
        ? 45 + Math.floor(Math.random() * 22)
        : 10 + Math.floor(Math.random() * 28)
    out.push({
      id: `mn_${1000 + i}`,
      username: rand(usernames, i),
      story: rand(stories, i),
      sentiment,
      score,
      dmStatus,
      code: dmStatus === 'sent' ? `STORY-${rand(usernames, i).split(/[._]/)[0].toUpperCase().slice(0, 5)}-${1000 + i}` : null,
      redeemed: dmStatus === 'sent' && i % 5 === 0,
      time: new Date(now - i * 1000 * 60 * (15 + (i % 60))).toISOString(),
    })
  }
  return out
}

export const mentions = generateMentions(24)

// 30 days of trend data
export function generateTrend(days = 30) {
  const out = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = 6 + Math.round(Math.sin(i / 4) * 4) + Math.floor(Math.random() * 5)
    const mentionsCount = Math.max(1, base + Math.floor(Math.random() * 6))
    const repliesCount = Math.max(0, mentionsCount - Math.floor(Math.random() * 3) - 1)
    const redemptionsCount = Math.max(0, Math.floor(repliesCount * (0.15 + Math.random() * 0.1)))
    out.push({
      date: d.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' }),
      mentions: mentionsCount,
      replies: repliesCount,
      redemptions: redemptionsCount,
    })
  }
  return out
}

export const trendData = generateTrend(30)

export const sentimentBreakdown = [
  { name: 'Positive', value: 74, color: '#E11D74' },
  { name: 'Neutral', value: 18, color: '#0891B2' },
  { name: 'Negative', value: 8, color: '#94a3b8' },
]

export const dayOfWeekData = [
  { day: 'Mon', count: 28 },
  { day: 'Tue', count: 32 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 47 },
  { day: 'Fri', count: 58 },
  { day: 'Sat', count: 64 },
  { day: 'Sun', count: 41 },
]

export const hourlyData = Array.from({ length: 24 }, (_, h) => {
  let count
  if (h < 6) count = 2 + Math.floor(Math.random() * 3)
  else if (h < 11) count = 6 + Math.floor(Math.random() * 6)
  else if (h < 16) count = 12 + Math.floor(Math.random() * 8)
  else if (h < 21) count = 22 + Math.floor(Math.random() * 12)
  else count = 8 + Math.floor(Math.random() * 5)
  return { hour: `${h}h`, count }
})

export const sentimentLast7Days = [
  { day: 'Mon', positive: 22, neutral: 4, negative: 1 },
  { day: 'Tue', positive: 26, neutral: 3, negative: 2 },
  { day: 'Wed', positive: 31, neutral: 5, negative: 1 },
  { day: 'Thu', positive: 38, neutral: 6, negative: 2 },
  { day: 'Fri', positive: 47, neutral: 7, negative: 3 },
  { day: 'Sat', positive: 52, neutral: 8, negative: 2 },
  { day: 'Sun', positive: 35, neutral: 4, negative: 1 },
]

export const templates = [
  {
    id: 't1',
    name: 'Default Thank You',
    body: 'Hey {username}! 💕 Thank you so much for tagging us! Here\'s 15% off your next order: {code}. Valid for {expiry}. xx',
    language: 'English',
    active: true,
    sentimentTarget: 'Positive only',
    threshold: 70,
    pool: 'Pool A',
    poolRemaining: 43,
    expiry: '72h',
  },
  {
    id: 't2',
    name: 'Arabic Welcome',
    body: 'أهلًا {username}! 🌸 شكرًا لذكرك لنا! خصم خاص لك: {code}. ساري لمدة {expiry}.',
    language: 'Arabic',
    active: true,
    sentimentTarget: 'Positive only',
    threshold: 70,
    pool: 'Pool B',
    poolRemaining: 28,
    expiry: '48h',
  },
  {
    id: 't3',
    name: 'VIP Customer',
    body: 'Hey {username}! As one of our VIPs, here\'s 25% off just for you: {code}. Valid for {expiry}. Always grateful 💖',
    language: 'Both',
    active: false,
    sentimentTarget: 'Neutral+Positive',
    threshold: 55,
    pool: 'VIP Pool',
    poolRemaining: 12,
    expiry: '7d',
  },
]

export const codePools = [
  { id: 'p1', name: 'Instagram Story Pool A', used: 57, total: 100, status: 'Active', expiryRule: '72 hours after issue', format: 'STORY-SARA-XXXX' },
  { id: 'p2', name: 'Instagram Story Pool B', used: 72, total: 100, status: 'Active', expiryRule: '48 hours after issue', format: 'STORY-NOOR-XXXX' },
  { id: 'p3', name: 'VIP Pool', used: 88, total: 100, status: 'Paused', expiryRule: '7 days after issue', format: 'VIP-2026-XXXX' },
]

export const codeStatuses = ['Available', 'Assigned', 'Redeemed', 'Expired']

export function generateCodes(count = 15) {
  return Array.from({ length: count }, (_, i) => {
    const status = codeStatuses[i % codeStatuses.length]
    const issued = new Date(Date.now() - i * 1000 * 60 * 60 * 5)
    return {
      id: `c_${i}`,
      code: `STORY-SARA-${(2000 + i).toString().padStart(4, '0')}`,
      assignedTo: status === 'Available' ? null : rand(usernames, i),
      issuedAt: issued.toISOString(),
      expiresAt: new Date(issued.getTime() + 72 * 3600 * 1000).toISOString(),
      status,
    }
  })
}

export const codes = generateCodes(15)

export const blockedKeywords = ['scam', 'worst', 'never again', 'fake', 'disappointed']

export const flaggedMentions = [
  { id: 'fl1', username: 'maitha_collective', story: 'It\'s okay I guess, expected more for the price', score: 52 },
  { id: 'fl2', username: 'tariq.alfaisal', story: 'Took longer than promised but the product is fine', score: 48 },
  { id: 'fl3', username: 'shamma_ah', story: 'Quality is decent, packaging could be better', score: 58 },
  { id: 'fl4', username: 'omar_aljaber', story: 'Not bad, will probably order again at some point', score: 64 },
  { id: 'fl5', username: 'reem.designs', story: 'Mid. The colour is different from the photos', score: 41 },
]

export const topMentioners = [
  { username: 'sara_almansouri', mentions: 14, redeemed: 4, revenue: 1240, last: '2 hours ago' },
  { username: 'fatima.alzaabi', mentions: 11, redeemed: 3, revenue: 980, last: 'yesterday' },
  { username: 'ahmed_dxb', mentions: 9, redeemed: 4, revenue: 1100, last: '3 days ago' },
  { username: 'noor.hassan', mentions: 8, redeemed: 2, revenue: 540, last: 'today' },
  { username: 'mariam_ah', mentions: 7, redeemed: 2, revenue: 480, last: '5 hours ago' },
  { username: 'khalid.boutique', mentions: 6, redeemed: 3, revenue: 720, last: '2 days ago' },
  { username: 'lulu_dubai', mentions: 6, redeemed: 1, revenue: 240, last: 'today' },
  { username: 'rashed_ae', mentions: 5, redeemed: 2, revenue: 460, last: 'yesterday' },
  { username: 'alia.styles', mentions: 5, redeemed: 1, revenue: 220, last: '4 days ago' },
  { username: 'hessa_collective', mentions: 4, redeemed: 2, revenue: 540, last: '6 hours ago' },
]

export const templateRedemptions = [
  { name: 'Default Thank You', redemptions: 22 },
  { name: 'Arabic Welcome', redemptions: 9 },
  { name: 'VIP Customer', redemptions: 3 },
]

export const invoices = [
  { id: 'INV-2026-003', date: 'Apr 1, 2026', amount: 9, status: 'Paid' },
  { id: 'INV-2026-002', date: 'Mar 1, 2026', amount: 9, status: 'Paid' },
  { id: 'INV-2026-001', date: 'Feb 1, 2026', amount: 9, status: 'Paid' },
]

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
