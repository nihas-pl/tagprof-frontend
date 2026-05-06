import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Mentions from './pages/Mentions'
import AutoReplies from './pages/AutoReplies'
import DiscountCampaigns from './pages/DiscountCampaigns'
import CampaignDetail from './pages/CampaignDetail'
import DiscountCodes from './pages/DiscountCodes'
import DiscountSettings from './pages/DiscountSettings'
import SentimentFilter from './pages/SentimentFilter'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OAuthCallback from './pages/OAuthCallback'
import Verification from './pages/Verification'
import ConnectInstagram from './pages/ConnectInstagram'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/connect/instagram" element={<ConnectInstagram />} />
        
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="mentions" element={<Mentions />} />
          <Route path="dm-templates" element={<AutoReplies />} />
          <Route path="campaigns" element={<DiscountCampaigns />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="discount-codes" element={<DiscountCodes />} />
          <Route path="settings/discounts" element={<DiscountSettings />} />
          <Route path="sentiment-filter" element={<SentimentFilter />} />
          <Route path="verification" element={<Verification />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '13px',
          },
        }}
      />
    </>
  )
}
