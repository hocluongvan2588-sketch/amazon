'use client'

import React, { createContext, useContext, useState, useMemo } from 'react'
import {
  AccountHealthMetric,
  AIRecommendation,
  AuditLogEntry,
  ClientPerformanceReport,
  ClientSupplier,
  CustomerMessage,
  InventoryItem,
  ListingData,
  OperationalTask,
  Order,
  PpcCampaign,
  PpcKeyword,
  Product,
  Promotion,
  SyncJob,
  UserRole,
  VeximAgencyKPIs,
} from './types'
import {
  mockAccountHealth,
  mockAgencyKpis,
  mockAuditLogs,
  mockClientReports,
  mockClients,
  mockCustomerMessages,
  mockInventory,
  mockListings,
  mockOrders,
  mockPpcCampaigns,
  mockPpcKeywords,
  mockProducts,
  mockPromotions,
  mockRecommendations,
  mockSyncJobs,
  mockTasks,
} from './mock-data'
import { spApiConnector } from './amazon-sp-api'
import { SupabaseDatabaseService } from './supabase-service'

export type ActiveNavTab =
  | 'ai-operations'
  | 'overview'
  | 'products'
  | 'listings'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'ppc'
  | 'promotions'
  | 'account-health'
  | 'tasks'
  | 'sales-analyst'
  | 'reports'
  | 'sync-center'
  | 'vexim-kpis'
  | 'ai-efficiency'
  | 'audit-log'

export type TimeRangeFilter = 'today' | 'yesterday' | '7days' | '30days' | '90days'

interface AppStateContextType {
  // Navigation & Role
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  activeTab: ActiveNavTab
  setActiveTab: (tab: ActiveNavTab) => void
  selectedClientId: string // 'ALL' or client-id
  setSelectedClientId: (id: string) => void
  timeRange: TimeRangeFilter
  setTimeRange: (range: TimeRangeFilter) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Data
  clients: ClientSupplier[]
  products: Product[]
  listings: ListingData[]
  inventory: InventoryItem[]
  orders: Order[]
  ppcCampaigns: PpcCampaign[]
  ppcKeywords: PpcKeyword[]
  promotions: Promotion[]
  customerMessages: CustomerMessage[]
  accountHealth: AccountHealthMetric
  recommendations: AIRecommendation[]
  tasks: OperationalTask[]
  auditLogs: AuditLogEntry[]
  syncJobs: SyncJob[]
  reports: ClientPerformanceReport[]
  agencyKpis: VeximAgencyKPIs

  // Filtered Data (respecting selected client & role isolation)
  filteredProducts: Product[]
  filteredListings: ListingData[]
  filteredInventory: InventoryItem[]
  filteredOrders: Order[]
  filteredCampaigns: PpcCampaign[]
  filteredKeywords: PpcKeyword[]
  filteredPromotions: Promotion[]
  filteredCustomerMessages: CustomerMessage[]
  filteredRecommendations: AIRecommendation[]
  filteredTasks: OperationalTask[]
  filteredReports: ClientPerformanceReport[]

  // Actions
  approveRecommendation: (id: string, notes?: string) => Promise<void>
  rejectRecommendation: (id: string, reason?: string) => Promise<void>
  executeRecommendation: (id: string) => Promise<void>
  modifyRecommendation: (id: string, modifiedActionData: Record<string, any>) => Promise<void>
  createTask: (task: Partial<OperationalTask>) => void
  updateTaskStatus: (id: string, status: OperationalTask['status']) => void
  runAiFullScan: () => Promise<number>
  triggerSyncJob: (jobId: string) => Promise<void>
  applyListingDraft: (listingId: string) => Promise<void>
  sendCustomerReply: (messageId: string, replyText: string) => Promise<void>
  addProduct: (product: Partial<Product>) => void
  connectAmazonAccount: (clientId: string) => Promise<void>

  // UI state
  isScanning: boolean
  isSyncing: boolean
  lastSyncNotice: string | null
  activeModal: { type: string; data?: any } | null
  openModal: (type: string, data?: any) => void
  closeModal: () => void
  notification: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null
  setNotification: (notif: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null) => void
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('OPS_MANAGER')
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('ai-operations')
  const [selectedClientId, setSelectedClientId] = useState<string>('client-vina-01')
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('7days')
  const [searchQuery, setSearchQuery] = useState('')

  // Raw states
  const [clients, setClients] = useState<ClientSupplier[]>(mockClients)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [listings, setListings] = useState<ListingData[]>(mockListings)
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [ppcCampaigns, setPpcCampaigns] = useState<PpcCampaign[]>(mockPpcCampaigns)
  const [ppcKeywords, setPpcKeywords] = useState<PpcKeyword[]>(mockPpcKeywords)
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions)
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>(mockCustomerMessages)
  const [accountHealth, setAccountHealth] = useState<AccountHealthMetric>(mockAccountHealth)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(mockRecommendations)
  const [tasks, setTasks] = useState<OperationalTask[]>(mockTasks)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs)
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>(mockSyncJobs)
  const [reports, setReports] = useState<ClientPerformanceReport[]>(mockClientReports)
  const [agencyKpis, setAgencyKpis] = useState<VeximAgencyKPIs>(mockAgencyKpis)

  const [isScanning, setIsScanning] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncNotice, setLastSyncNotice] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<{ type: string; data?: any } | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'info' | 'warning' | 'error'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4500)
  }

  // Tenant Isolation logic:
  // If role is CLIENT_SUPPLIER, lock client view to their own account.
  // If Vexim admin/ops, allow selecting specific client or 'ALL'.
  const effectiveClientId = currentRole === 'CLIENT_SUPPLIER' ? 'client-vina-01' : selectedClientId

  const filterByClient = <T extends { clientId?: string }>(list: T[]): T[] => {
    if (effectiveClientId === 'ALL' && currentRole !== 'CLIENT_SUPPLIER') return list
    return list.filter((item) => item.clientId === effectiveClientId)
  }

  const filteredProducts = useMemo(() => filterByClient(products), [products, effectiveClientId, currentRole])
  const filteredListings = useMemo(() => {
    const validProdIds = new Set(filteredProducts.map((p) => p.id))
    return listings.filter((l) => validProdIds.has(l.productId))
  }, [listings, filteredProducts])
  const filteredInventory = useMemo(() => filterByClient(inventory), [inventory, effectiveClientId, currentRole])
  const filteredOrders = useMemo(() => filterByClient(orders), [orders, effectiveClientId, currentRole])
  const filteredCampaigns = useMemo(() => filterByClient(ppcCampaigns), [ppcCampaigns, effectiveClientId, currentRole])
  const filteredKeywords = useMemo(() => {
    const validCampIds = new Set(filteredCampaigns.map((c) => c.id))
    return ppcKeywords.filter((k) => validCampIds.has(k.campaignId))
  }, [ppcKeywords, filteredCampaigns])
  const filteredPromotions = useMemo(() => filterByClient(promotions), [promotions, effectiveClientId, currentRole])
  const filteredCustomerMessages = useMemo(
    () => filterByClient(customerMessages),
    [customerMessages, effectiveClientId, currentRole]
  )
  const filteredRecommendations = useMemo(
    () => filterByClient(recommendations),
    [recommendations, effectiveClientId, currentRole]
  )
  const filteredTasks = useMemo(() => filterByClient(tasks), [tasks, effectiveClientId, currentRole])
  const filteredReports = useMemo(() => filterByClient(reports), [reports, effectiveClientId, currentRole])

  // Log an audit entry
  const addAuditLog = (
    actionType: string,
    entityType: string,
    entityId: string,
    entityName: string,
    beforeVal?: string,
    afterVal?: string,
    notes?: string,
    agentType?: any
  ) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actorName: currentRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Alex Nguyen (Operations)',
      actorRole: currentRole,
      source: 'HUMAN',
      agentType,
      actionType,
      entityType,
      entityId,
      entityName,
      beforeValue: beforeVal,
      afterValue: afterVal,
      approvalNotes: notes || 'Đã kiểm tra và phê duyệt hành động theo quy chuẩn Vexim.',
      ipAddress: '113.161.72.10',
    }
    setAuditLogs((prev) => [newLog, ...prev])
    SupabaseDatabaseService.createAuditLog(newLog)
  }

  // 1. APPROVE RECOMMENDATION
  const approveRecommendation = async (id: string, notes?: string) => {
    const rec = recommendations.find((r) => r.id === id)
    if (!rec) return

    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'APPROVED',
              approvedAt: new Date().toISOString(),
              approvedBy: currentRole,
            }
          : r
      )
    )

    // Update Agency KPI
    setAgencyKpis((prev) => ({
      ...prev,
      humanApprovedRecommendations: prev.humanApprovedRecommendations + 1,
      aiAssistedOperationsRate: Number(
        (((prev.humanApprovedRecommendations + 1) / (prev.totalAIRecommendationsGenerated || 1)) * 100).toFixed(1)
      ),
    }))

    addAuditLog(
      'APPROVE_AI_RECOMMENDATION',
      rec.entityType,
      rec.entityId,
      rec.entityIdentifier,
      JSON.stringify(rec.beforeState || {}),
      JSON.stringify(rec.proposedState || {}),
      notes || rec.proposedAction,
      rec.agentType
    )

    SupabaseDatabaseService.updateRecommendation(id, 'APPROVED', currentRole, notes)

    showToast(`Đã phê duyệt đề xuất: ${rec.title.slice(0, 50)}...`, 'success')
  }

  // 2. REJECT RECOMMENDATION
  const rejectRecommendation = async (id: string, reason?: string) => {
    const rec = recommendations.find((r) => r.id === id)
    if (!rec) return

    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'REJECTED',
              rejectedAt: new Date().toISOString(),
              rejectedBy: currentRole,
              rejectReason: reason || 'Không phù hợp với chiến lược thương hiệu hiện tại.',
            }
          : r
      )
    )

    addAuditLog(
      'REJECT_AI_RECOMMENDATION',
      rec.entityType,
      rec.entityId,
      rec.entityIdentifier,
      'STATUS: PENDING',
      `STATUS: REJECTED (${reason || 'Bác bỏ'})`,
      reason,
      rec.agentType
    )

    SupabaseDatabaseService.updateRecommendation(id, 'REJECTED', currentRole, reason)

    showToast(`Đã bác bỏ đề xuất từ ${rec.agentType} Agent.`, 'info')
  }

  // 3. EXECUTE RECOMMENDATION (Push to SP-API / Database)
  const executeRecommendation = async (id: string) => {
    const rec = recommendations.find((r) => r.id === id)
    if (!rec) return

    setIsSyncing(true)
    try {
      // Simulate SP-API patch or internal action
      if (rec.agentType === 'LISTING') {
        await spApiConnector.pushListingUpdate('B0DC89X102', rec.actionData)
        // Apply listing changes
        setListings((prev) =>
          prev.map((l) =>
            l.id === 'list-01' && l.aiOptimizationDraft
              ? {
                  ...l,
                  title: l.aiOptimizationDraft.title,
                  bulletPoints: l.aiOptimizationDraft.bulletPoints,
                  currentScore: { ...l.currentScore, overall: 96, conversionPotential: 'A+' },
                  lastOptimizedAt: 'Vừa xong',
                }
              : l
          )
        )
      } else if (rec.agentType === 'PPC') {
        // Update bid
        if (rec.actionData?.keywordId) {
          setPpcKeywords((prev) =>
            prev.map((k) => (k.id === rec.actionData.keywordId ? { ...k, bid: rec.actionData.newBid } : k))
          )
        }
      }

      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'EXECUTED',
                executedAt: new Date().toISOString(),
              }
            : r
        )
      )

      setAgencyKpis((prev) => ({
        ...prev,
        executedRecommendations: prev.executedRecommendations + 1,
        humanHoursSavedThisMonth: prev.humanHoursSavedThisMonth + 4,
      }))

      addAuditLog(
        'EXECUTE_AI_ACTION_SP_API',
        rec.entityType,
        rec.entityId,
        rec.entityIdentifier,
        'STATE: APPROVED',
        'STATE: EXECUTED_ON_AMAZON_US',
        `Thực thi thành công qua SP-API Connector: ${rec.proposedAction}`,
        rec.agentType
      )

      showToast(`Đã thực thi thành công lên Amazon US qua SP-API!`, 'success')
    } catch (err) {
      showToast('Lỗi khi gửi dữ liệu lên Amazon SP-API. Vui lòng thử lại.', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  // 4. MODIFY RECOMMENDATION
  const modifyRecommendation = async (id: string, modifiedActionData: Record<string, any>) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'APPROVED',
              actionData: { ...r.actionData, ...modifiedActionData },
              proposedAction: `Đã tùy chỉnh thông số bởi ${currentRole}: ${JSON.stringify(modifiedActionData)}`,
              approvedAt: new Date().toISOString(),
              approvedBy: currentRole,
            }
          : r
      )
    )
    showToast('Đã lưu thông số tùy chỉnh và phê duyệt đề xuất.', 'success')
  }

  // 5. CREATE TASK
  const createTask = (taskData: Partial<OperationalTask>) => {
    const newTask: OperationalTask = {
      id: `task-${Date.now()}`,
      taskNumber: Math.floor(1000 + Math.random() * 9000),
      clientId: taskData.clientId || effectiveClientId || 'client-vina-01',
      clientName: clients.find((c) => c.id === taskData.clientId)?.name || 'Vinacacao Organics',
      title: taskData.title || 'Nhiệm vụ mới',
      description: taskData.description || '',
      priority: taskData.priority || 'MEDIUM',
      status: taskData.status || 'OPEN',
      assignedTo: taskData.assignedTo || 'Alex Nguyen (Operations)',
      assignedRole: taskData.assignedRole || 'OPS_MANAGER',
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      source: taskData.source || 'MANUAL_OPS',
      linkedEntity: taskData.linkedEntity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
    SupabaseDatabaseService.createTask(newTask)
    showToast(`Đã tạo Task #${newTask.taskNumber}: ${newTask.title}`, 'success')
  }

  // 6. UPDATE TASK STATUS
  const updateTaskStatus = (id: string, status: OperationalTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    )
    showToast(`Đã cập nhật trạng thái công việc thành ${status}`, 'info')
  }

  // 7. RUN AI SCAN
  const runAiFullScan = async (): Promise<number> => {
    setIsScanning(true)
    await new Promise((resolve) => setTimeout(resolve, 1400))
    setIsScanning(false)
    showToast('AI Multi-Agent Scan hoàn tất: Đã phân tích 12 SKUs, 3 Chiến dịch PPC, và Tình trạng Tài khoản.', 'success')
    return 7
  }

  // 8. TRIGGER SYNC JOB
  const triggerSyncJob = async (jobId: string) => {
    setIsSyncing(true)
    setSyncJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'SYNC_RUNNING' } : j))
    )

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSyncJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'SYNC_SUCCESS',
              lastRunTime: 'Vừa xong',
              itemsProcessed: j.itemsProcessed + 4,
            }
          : j
      )
    )
    setIsSyncing(false)
    setLastSyncNotice('Đồng bộ Amazon SP-API thành công (0 lỗi).')
    showToast('Đồng bộ Amazon SP-API hoàn tất thành công.', 'success')
  }

  // 9. APPLY LISTING DRAFT
  const applyListingDraft = async (listingId: string) => {
    const list = listings.find((l) => l.id === listingId)
    if (!list || !list.aiOptimizationDraft) return

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId && l.aiOptimizationDraft
          ? {
              ...l,
              title: l.aiOptimizationDraft.title,
              bulletPoints: l.aiOptimizationDraft.bulletPoints,
              currentScore: { ...l.currentScore, overall: 96, conversionPotential: 'A+' },
              lastOptimizedAt: 'Vừa cập nhật',
            }
          : l
      )
    )
    showToast('Đã áp dụng bản tối ưu hóa Listing AI V2!', 'success')
  }

  // 10. SEND CUSTOMER REPLY
  const sendCustomerReply = async (messageId: string, replyText: string) => {
    setCustomerMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: 'SENT',
              finalReply: replyText,
              approvedBy: currentRole,
              sentAt: new Date().toISOString(),
            }
          : m
      )
    )
    showToast('Đã gửi phản hồi chính thức tới khách hàng qua Amazon Buyer-Seller Messaging.', 'success')
  }

  // 11. ADD PRODUCT (Intake workflow)
  const addProduct = (prodData: Partial<Product>) => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      clientId: prodData.clientId || effectiveClientId || 'client-vina-01',
      sku: prodData.sku || `VXM-NEW-${Math.floor(100 + Math.random() * 900)}`,
      asin: prodData.asin || `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      fnsku: `X00${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      upc: prodData.upc || '893601239999',
      title: prodData.title || 'Sản phẩm mới tiếp nhận',
      brand: prodData.brand || 'Vexim Supplier',
      category: prodData.category || 'Grocery & Gourmet Food',
      subCategory: prodData.subCategory || 'General',
      mainImage:
        prodData.mainImage ||
        'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80',
      galleryImages: [],
      price: prodData.price || 19.99,
      cogs: prodData.cogs || 4.5,
      fbaFeeEstimated: 3.8,
      referralFeeEstimated: 3.0,
      estimatedMargin: 42.5,
      weightLbs: prodData.weightLbs || 0.8,
      dimensionsInches: prodData.dimensionsInches || { length: 6, width: 4, height: 2 },
      status: 'COMPLIANCE_REVIEW',
      readinessScore: {
        overall: 72,
        productInfo: 85,
        listingQuality: 70,
        mediaAssets: 75,
        keywordCoverage: 68,
        pricingCompetitiveness: 80,
        complianceScore: 70,
        documentationScore: 65,
        blockersCount: 1,
        canLaunch: false,
        recommendations: ['Cần xác thực phiếu kiểm nghiệm COA trước khi duyệt Launch.'],
      },
      documents: prodData.documents || [],
      complianceIssues: [],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    }

    setProducts((prev) => [newProd, ...prev])
    showToast(`Đã tiếp nhận sản phẩm SKU ${newProd.sku} vào quy trình US Market Assessment.`, 'success')
  }

  // 12. CONNECT AMAZON ACCOUNT
  const connectAmazonAccount = async (clientId: string) => {
    setIsSyncing(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, connectionStatus: 'CONNECTED' } : c))
    )
    setIsSyncing(false)
    showToast('Kết nối Amazon SP-API thành công qua OAuth Authorization!', 'success')
  }

  const openModal = (type: string, data?: any) => setActiveModal({ type, data })
  const closeModal = () => setActiveModal(null)

  return (
    <AppStateContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        selectedClientId,
        setSelectedClientId,
        timeRange,
        setTimeRange,
        searchQuery,
        setSearchQuery,
        clients,
        products,
        listings,
        inventory,
        orders,
        ppcCampaigns,
        ppcKeywords,
        promotions,
        customerMessages,
        accountHealth,
        recommendations,
        tasks,
        auditLogs,
        syncJobs,
        reports,
        agencyKpis,
        filteredProducts,
        filteredListings,
        filteredInventory,
        filteredOrders,
        filteredCampaigns,
        filteredKeywords,
        filteredPromotions,
        filteredCustomerMessages,
        filteredRecommendations,
        filteredTasks,
        filteredReports,
        approveRecommendation,
        rejectRecommendation,
        executeRecommendation,
        modifyRecommendation,
        createTask,
        updateTaskStatus,
        runAiFullScan,
        triggerSyncJob,
        applyListingDraft,
        sendCustomerReply,
        addProduct,
        connectAmazonAccount,
        isScanning,
        isSyncing,
        lastSyncNotice,
        activeModal,
        openModal,
        closeModal,
        notification,
        setNotification,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used within an AppStateProvider')
  return context
}
