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
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OAuthCallback from './pages/OAuthCallback'
import Verification from './pages/Verification'
import ConnectInstagram from './pages/ConnectInstagram'
import TrialBanner from './components/TrialBanner'
import SubscriptionBlockedModal from './components/SubscriptionBlockedModal'
import PlanSelectionDialog from './components/PlanSelectionDialog'
import { useState } from 'react'

export default function App() {
  const [showPlanDialog, setShowPlanDialog] = useState(false)

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/connect/instagram" element={<ConnectInstagram />} />
        
        <Route element={<Layout />}>
          <Route index element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <Dashboard />
            </>
          } />
          <Route path="mentions" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <Mentions />
            </>
          } />
          <Route path="dm-templates" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <AutoReplies />
            </>
          } />
          <Route path="campaigns" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <DiscountCampaigns />
            </>
          } />
          <Route path="campaigns/:id" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <CampaignDetail />
            </>
          } />
          <Route path="discount-codes" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <DiscountCodes />
            </>
          } />
          <Route path="settings/discounts" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <DiscountSettings />
            </>
          } />
          <Route path="verification" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <Verification />
            </>
          } />
          <Route path="settings" element={
            <>
              <TrialBanner onUpgradeClick={() => setShowPlanDialog(true)} />
              <Settings />
            </>
          } />
        </Route>
      </Routes>
      
      {/* Global Subscription Components */}
      <SubscriptionBlockedModal />
      <PlanSelectionDialog 
        open={showPlanDialog} 
        onOpenChange={setShowPlanDialog} 
      />
      
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
