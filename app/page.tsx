'use client'

import React, { useState } from 'react'
import { AppStateProvider, useAppState } from '@/lib/state-context'
import { Sidebar } from '@/components/Sidebar'
import { TopHeader } from '@/components/TopHeader'
import { AIChatDrawer } from '@/components/AIChatDrawer'

// Standard Views
import { AIOperationsCenter } from '@/components/views/AIOperationsCenter'
import { AmazonOverview } from '@/components/views/AmazonOverview'
import { ProductManagement } from '@/components/views/ProductManagement'
import { ListingManagement } from '@/components/views/ListingManagement'
import { InventoryManagement } from '@/components/views/InventoryManagement'
import { OrderManagement } from '@/components/views/OrderManagement'
import { CustomerAssistance } from '@/components/views/CustomerAssistance'
import { PpcAdvertising } from '@/components/views/PpcAdvertising'
import { PromotionManagement } from '@/components/views/PromotionManagement'
import { AccountHealthCenter } from '@/components/views/AccountHealthCenter'
import { TaskManagement } from '@/components/views/TaskManagement'
import { SalesAnalystView } from '@/components/views/SalesAnalystView'
import { ClientReporting } from '@/components/views/ClientReporting'
import { SyncEngineView } from '@/components/views/SyncEngineView'
import { VeximBusinessKpi } from '@/components/views/VeximBusinessKpi'
import { AIEfficiencyMonitor } from '@/components/views/AIEfficiencyMonitor'
import { AuditLogView } from '@/components/views/AuditLogView'

// Deep-Tech v2.0 Views
import { PpcGrowthDesk } from '@/components/views/PpcGrowthDesk'
import { SupplyChainHub } from '@/components/views/SupplyChainHub'
import { BrandIntelligenceView } from '@/components/views/BrandIntelligenceView'
import { ComplianceLegalDesk } from '@/components/views/ComplianceLegalDesk'
import { SupplierExecutivePortal } from '@/components/views/SupplierExecutivePortal'
import { MasterAdminControlCenter } from '@/components/views/MasterAdminControlCenter'
import { UserProfileAccount } from '@/components/views/UserProfileAccount'
import { LoginScreen } from '@/components/views/LoginScreen'

// Modals
import { ApprovalModal } from '@/components/modals/ApprovalModal'
import { ProductIntakeModal } from '@/components/modals/ProductIntakeModal'
import { TaskCreateModal } from '@/components/modals/TaskCreateModal'
import { AlertCircle, CheckCircle2, Info, Menu, X } from 'lucide-react'

function MainAppShell() {
  const { activeTab, notification, setNotification, isAuthenticated } = useAppState()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false)

  // If user is logged out, show official login screen
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  const renderActiveView = () => {
    switch (activeTab) {
      // Deep-Tech v2.0 Desks
      case 'ppc-growth-desk':
        return <PpcGrowthDesk />
      case 'supply-chain-hub':
        return <SupplyChainHub />
      case 'brand-intelligence':
        return <BrandIntelligenceView />
      case 'compliance-ops-desk':
        return <ComplianceLegalDesk />
      case 'supplier-portal':
        return <SupplierExecutivePortal />
      case 'master-admin':
        return <MasterAdminControlCenter />
      case 'user-profile':
        return <UserProfileAccount />
      case 'training-academy':
        return <TrainingKnowledgeHub />

      // Core Views
      case 'ai-operations':
        return <AIOperationsCenter />
      case 'overview':
        return <AmazonOverview />
      case 'sales-analyst':
        return <SalesAnalystView />
      case 'products':
        return <ProductManagement />
      case 'listings':
        return <ListingManagement />
      case 'inventory':
        return <InventoryManagement />
      case 'orders':
        return <OrderManagement />
      case 'customers':
        return <CustomerAssistance />
      case 'ppc':
        return <PpcAdvertising />
      case 'promotions':
        return <PromotionManagement />
      case 'account-health':
        return <AccountHealthCenter />
      case 'tasks':
        return <TaskManagement />
      case 'reports':
        return <ClientReporting />
      case 'sync-center':
        return <SyncEngineView />
      case 'vexim-kpis':
        return <VeximBusinessKpi />
      case 'ai-efficiency':
        return <AIEfficiencyMonitor />
      case 'audit-log':
        return <AuditLogView />
      default:
        return <AIOperationsCenter />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <div className="flex items-center">
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-16 items-center justify-center border-b border-border bg-white px-4 text-slate-600 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <TopHeader onOpenChat={() => setChatDrawerOpen(true)} />
          </div>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div className="sticky top-16 z-30 flex items-center justify-between border-b border-blue-200 bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm">
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? (
                <AlertCircle size={16} className="text-red-200" />
              ) : notification.type === 'info' ? (
                <Info size={16} className="text-blue-200" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-200" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="rounded p-0.5 text-white/80 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Interactive AI Copilot Drawer */}
      <AIChatDrawer isOpen={chatDrawerOpen} onClose={() => setChatDrawerOpen(false)} />

      {/* Global Modals */}
      <ApprovalModal />
      <ProductIntakeModal />
      <TaskCreateModal />
    </div>
  )
}

export default function Page() {
  return (
    <AppStateProvider>
      <MainAppShell />
    </AppStateProvider>
  )
}
