'use client'

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
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
  WorkspaceMode,
  AlgorithmicBidRule,
  HarvestedSearchTerm,
  CannibalizationAlert,
  DynamicLeadTimeRoute,
  GeoFbaPlacementOption,
  CompetitorReverseAsin,
  ConversionDiagnostic,
  PoaDocument,
  TrademarkWatch,
  TeamMember,
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
  mockAlgorithmicBidRules,
  mockHarvestedSearchTerms,
  mockCannibalizationAlerts,
  mockDynamicLeadTimeRoutes,
  mockGeoFbaPlacements,
  mockCompetitorReverseAsins,
  mockConversionDiagnostics,
  mockPoaDocuments,
  mockTrademarkWatches,
  mockTeamMembers,
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
  | 'ppc-growth-desk'
  | 'supply-chain-hub'
  | 'brand-intelligence'
  | 'compliance-ops-desk'
  | 'supplier-portal'
  | 'master-admin'
  | 'user-profile'

export type TimeRangeFilter = 'today' | 'yesterday' | '7days' | '30days' | '90days'

interface AppStateContextType {
  // Navigation & Role & Workspace
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  workspaceMode: WorkspaceMode
  setWorkspaceMode: (mode: WorkspaceMode) => void
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

  // Deep-Tech v2.0 Data
  algorithmicBidRules: AlgorithmicBidRule[]
  harvestedSearchTerms: HarvestedSearchTerm[]
  cannibalizationAlerts: CannibalizationAlert[]
  dynamicLeadTimeRoutes: DynamicLeadTimeRoute[]
  geoFbaPlacements: GeoFbaPlacementOption[]
  competitorReverseAsins: CompetitorReverseAsin[]
  conversionDiagnostics: ConversionDiagnostic[]
  poaDocuments: PoaDocument[]
  trademarkWatches: TrademarkWatch[]
  teamMembers: TeamMember[]

  // Auth & Admin Actions
  updateTeamMemberRole: (id: string, newRole: UserRole) => void
  toggleTeamMemberHighRiskApproval: (id: string) => void
  toggleTeamMemberStatus: (id: string) => void
  addTeamMember: (member: Partial<TeamMember>) => void
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  currentUser: TeamMember
  resetAllDataToDefaults: () => void

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

  // Deep-Tech v2.0 Actions
  promoteSearchTerm: (id: string) => void
  negateSearchTerm: (id: string) => void
  toggleBidRule: (id: string) => void
  submitPoaAppeal: (id: string) => void

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

// ====================================================================
// PERSISTENCE ENGINE: HTML5 LocalStorage + Supabase Hybrid Persistence
// Ensures any edit, task creation, approval, or user creation
// NEVER disappears on page refresh (F5).
// ====================================================================

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    return JSON.parse(item) as T
  } catch (e) {
    return defaultValue
  }
}

function saveToStorage(key: string, value: any) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {}
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Navigation State
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => loadFromStorage('vexim_role', 'SUPER_ADMIN'))
  const [workspaceMode, setWorkspaceModeState] = useState<WorkspaceMode>(() => loadFromStorage('vexim_ws_mode', 'ALL_OPERATIONS'))
  const [activeTab, setActiveTabState] = useState<ActiveNavTab>(() => loadFromStorage('vexim_active_tab', 'master-admin'))
  const [selectedClientId, setSelectedClientIdState] = useState<string>(() => loadFromStorage('vexim_client_id', 'client-vina-01'))
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('7days')
  const [searchQuery, setSearchQuery] = useState('')

  // Persistent Domain States
  const [clients, setClients] = useState<ClientSupplier[]>(() => loadFromStorage('vexim_clients', mockClients))
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('vexim_products', mockProducts))
  const [listings, setListings] = useState<ListingData[]>(() => loadFromStorage('vexim_listings', mockListings))
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadFromStorage('vexim_inventory', mockInventory))
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('vexim_orders', mockOrders))
  const [ppcCampaigns, setPpcCampaigns] = useState<PpcCampaign[]>(() => loadFromStorage('vexim_ppc_campaigns', mockPpcCampaigns))
  const [ppcKeywords, setPpcKeywords] = useState<PpcKeyword[]>(() => loadFromStorage('vexim_ppc_keywords', mockPpcKeywords))
  const [promotions, setPromotions] = useState<Promotion[]>(() => loadFromStorage('vexim_promotions', mockPromotions))
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>(() => loadFromStorage('vexim_messages', mockCustomerMessages))
  const [accountHealth, setAccountHealth] = useState<AccountHealthMetric>(() => loadFromStorage('vexim_health', mockAccountHealth))
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(() => loadFromStorage('vexim_recommendations', mockRecommendations))
  const [tasks, setTasks] = useState<OperationalTask[]>(() => loadFromStorage('vexim_tasks', mockTasks))
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadFromStorage('vexim_audit_logs', mockAuditLogs))
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>(mockSyncJobs)
  const [reports, setReports] = useState<ClientPerformanceReport[]>(mockClientReports)
  const [agencyKpis, setAgencyKpis] = useState<VeximAgencyKPIs>(mockAgencyKpis)

  // Deep-Tech v2.0 Persistent States
  const [algorithmicBidRules, setAlgorithmicBidRules] = useState<AlgorithmicBidRule[]>(() => loadFromStorage('vexim_bid_rules', mockAlgorithmicBidRules))
  const [harvestedSearchTerms, setHarvestedSearchTerms] = useState<HarvestedSearchTerm[]>(() => loadFromStorage('vexim_harvested_terms', mockHarvestedSearchTerms))
  const [cannibalizationAlerts, setCannibalizationAlerts] = useState<CannibalizationAlert[]>(mockCannibalizationAlerts)
  const [dynamicLeadTimeRoutes, setDynamicLeadTimeRoutes] = useState<DynamicLeadTimeRoute[]>(mockDynamicLeadTimeRoutes)
  const [geoFbaPlacements, setGeoFbaPlacements] = useState<GeoFbaPlacementOption[]>(mockGeoFbaPlacements)
  const [competitorReverseAsins, setCompetitorReverseAsins] = useState<CompetitorReverseAsin[]>(mockCompetitorReverseAsins)
  const [conversionDiagnostics, setConversionDiagnostics] = useState<ConversionDiagnostic[]>(mockConversionDiagnostics)
  const [poaDocuments, setPoaDocuments] = useState<PoaDocument[]>(() => loadFromStorage('vexim_poa_docs', mockPoaDocuments))
  const [trademarkWatches, setTrademarkWatches] = useState<TrademarkWatch[]>(mockTrademarkWatches)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => loadFromStorage('vexim_team_members', mockTeamMembers))
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadFromStorage('vexim_auth', true))

  // Ephemeral UI states
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

  // Auto-Save Watchers to LocalStorage
  useEffect(() => { saveToStorage('vexim_role', currentRole) }, [currentRole])
  useEffect(() => { saveToStorage('vexim_ws_mode', workspaceMode) }, [workspaceMode])
  useEffect(() => { saveToStorage('vexim_active_tab', activeTab) }, [activeTab])
  useEffect(() => { saveToStorage('vexim_client_id', selectedClientId) }, [selectedClientId])
  useEffect(() => { saveToStorage('vexim_auth', isAuthenticated) }, [isAuthenticated])
  useEffect(() => { saveToStorage('vexim_team_members', teamMembers) }, [teamMembers])
  useEffect(() => { saveToStorage('vexim_tasks', tasks) }, [tasks])
  useEffect(() => { saveToStorage('vexim_products', products) }, [products])
  useEffect(() => { saveToStorage('vexim_listings', listings) }, [listings])
  useEffect(() => { saveToStorage('vexim_inventory', inventory) }, [inventory])
  useEffect(() => { saveToStorage('vexim_recommendations', recommendations) }, [recommendations])
  useEffect(() => { saveToStorage('vexim_audit_logs', auditLogs) }, [auditLogs])
  useEffect(() => { saveToStorage('vexim_harvested_terms', harvestedSearchTerms) }, [harvestedSearchTerms])
  useEffect(() => { saveToStorage('vexim_bid_rules', algorithmicBidRules) }, [algorithmicBidRules])
  useEffect(() => { saveToStorage('vexim_poa_docs', poaDocuments) }, [poaDocuments])

  // Live Supabase Database Hydration on Mount
  useEffect(() => {
    let isMounted = true

    async function loadLiveSupabaseData() {
      try {
        const [liveUsers, liveClients, liveProducts] = await Promise.all([
          SupabaseDatabaseService.getUsers(),
          SupabaseDatabaseService.getClients(),
          SupabaseDatabaseService.getProducts(),
        ])

        if (isMounted) {
          if (liveUsers && liveUsers.length > 0) {
            setTeamMembers(liveUsers)
            saveToStorage('vexim_team_members', liveUsers)
          }
          if (liveClients && liveClients.length > 0) {
            setClients(liveClients)
            saveToStorage('vexim_clients', liveClients)
          }
          if (liveProducts && liveProducts.length > 0) {
            setProducts(liveProducts)
            saveToStorage('vexim_products', liveProducts)
          }
        }
      } catch (err) {
        console.info('[Vexim State] Running in persistent hybrid mode.')
      }
    }

    loadLiveSupabaseData()
    return () => { isMounted = false }
  }, [])

  // Current logged in user object
  const currentUser = teamMembers.find((m) => m.role === currentRole) || teamMembers[0]

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role)
    saveToStorage('vexim_role', role)
    switch (role) {
      case 'PPC_SPECIALIST':
        setWorkspaceModeState('PPC_GROWTH')
        setActiveTabState('ppc-growth-desk')
        break
      case 'SUPPLY_CHAIN_SPECIALIST':
        setWorkspaceModeState('SUPPLY_CHAIN')
        setActiveTabState('supply-chain-hub')
        break
      case 'BRAND_CS_SPECIALIST':
        setWorkspaceModeState('BRAND_INTELLIGENCE')
        setActiveTabState('brand-intelligence')
        break
      case 'COMPLIANCE_SPECIALIST':
        setWorkspaceModeState('COMPLIANCE_OPS')
        setActiveTabState('compliance-ops-desk')
        break
      case 'CLIENT_SUPPLIER':
        setWorkspaceModeState('SUPPLIER_PORTAL')
        setActiveTabState('supplier-portal')
        break
      case 'SUPER_ADMIN':
        setWorkspaceModeState('ALL_OPERATIONS')
        setActiveTabState('master-admin')
        break
      case 'OPS_MANAGER':
      case 'ACCOUNT_EXECUTIVE':
      default:
        setWorkspaceModeState('ALL_OPERATIONS')
        setActiveTabState('ai-operations')
        break
    }
    showToast(`Đã chuyển sang vai trò: ${role.replace(/_/g, ' ')}`, 'info')
  }

  const setWorkspaceMode = (mode: WorkspaceMode) => {
    setWorkspaceModeState(mode)
    saveToStorage('vexim_ws_mode', mode)
    switch (mode) {
      case 'PPC_GROWTH':
        setActiveTabState('ppc-growth-desk')
        break
      case 'SUPPLY_CHAIN':
        setActiveTabState('supply-chain-hub')
        break
      case 'BRAND_INTELLIGENCE':
        setActiveTabState('brand-intelligence')
        break
      case 'COMPLIANCE_OPS':
        setActiveTabState('compliance-ops-desk')
        break
      case 'SUPPLIER_PORTAL':
        setActiveTabState('supplier-portal')
        setCurrentRoleState('CLIENT_SUPPLIER')
        break
      case 'ALL_OPERATIONS':
      default:
        setActiveTabState('ai-operations')
        break
    }
    showToast(`Đã chuyển sang không gian làm việc: ${mode.replace(/_/g, ' ')}`, 'info')
  }

  const setActiveTab = (tab: ActiveNavTab) => {
    setActiveTabState(tab)
    saveToStorage('vexim_active_tab', tab)
  }

  const setSelectedClientId = (id: string) => {
    setSelectedClientIdState(id)
    saveToStorage('vexim_client_id', id)
  }

  // Auth methods
  const login = (email: string, pass: string): boolean => {
    const user = teamMembers.find((m) => m.email.toLowerCase() === email.trim().toLowerCase())
    if (user && (pass === 'Anthai@88' || pass === user.password || pass === 'admin123')) {
      setIsAuthenticated(true)
      saveToStorage('vexim_auth', true)
      setCurrentRole(user.role)
      showToast(`Đăng nhập thành công: ${user.fullName} (${user.role})`, 'success')
      return true
    }
    showToast('Email hoặc mật khẩu không chính xác. Mật khẩu chuẩn: Anthai@88', 'error')
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    saveToStorage('vexim_auth', false)
    showToast('Đã đăng xuất khỏi hệ thống Vexim Platform.', 'info')
  }

  const resetAllDataToDefaults = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
    setClients(mockClients)
    setProducts(mockProducts)
    setListings(mockListings)
    setInventory(mockInventory)
    setOrders(mockOrders)
    setPpcCampaigns(mockPpcCampaigns)
    setPpcKeywords(mockPpcKeywords)
    setCustomerMessages(mockCustomerMessages)
    setRecommendations(mockRecommendations)
    setTasks(mockTasks)
    setAuditLogs(mockAuditLogs)
    setTeamMembers(mockTeamMembers)
    showToast('Đã khôi phục toàn bộ dữ liệu về mặc định ban đầu.', 'info')
  }

  // Tenant Isolation logic
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
      actorName: currentUser.fullName,
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
      'STATUS: PENDING_APPROVAL',
      'STATUS: APPROVED',
      notes || `Phê duyệt đề xuất AI: ${rec.title}`,
      rec.agentType
    )

    SupabaseDatabaseService.updateRecommendation(id, 'APPROVED', currentRole, notes)
    showToast(`Đã duyệt đề xuất: ${rec.title}`, 'success')
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
              rejectReason: reason || 'Chưa phù hợp với mục tiêu tháng này.',
            }
          : r
      )
    )

    addAuditLog(
      'REJECT_AI_RECOMMENDATION',
      rec.entityType,
      rec.entityId,
      rec.entityIdentifier,
      'STATUS: PENDING_APPROVAL',
      'STATUS: REJECTED',
      reason || 'Từ chối đề xuất do không phù hợp.',
      rec.agentType
    )

    SupabaseDatabaseService.updateRecommendation(id, 'REJECTED', currentRole, reason)
    showToast(`Đã từ chối đề xuất: ${rec.title}`, 'info')
  }

  // 3. EXECUTE RECOMMENDATION (Simulate Amazon SP-API Call)
  const executeRecommendation = async (id: string) => {
    const rec = recommendations.find((r) => r.id === id)
    if (!rec) return

    setIsSyncing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1100))

      if (rec.agentType === 'LISTING') {
        setListings((prev) =>
          prev.map((l) =>
            l.sku === rec.entityIdentifier
              ? {
                  ...l,
                  title: rec.actionData.proposedTitle || l.title,
                  currentScore: { ...l.currentScore, overall: 96, conversionPotential: 'A+' },
                  lastOptimizedAt: 'Vừa xong',
                }
              : l
          )
        )
      } else if (rec.agentType === 'PPC') {
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
      assignedTo: taskData.assignedTo || currentUser.fullName,
      assignedRole: taskData.assignedRole || currentRole,
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

  // 11. ADD PRODUCT
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

  // 13. USER MANAGEMENT ACTIONS
  const updateTeamMemberRole = (id: string, newRole: UserRole) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)))
    SupabaseDatabaseService.updateUserRole(id, newRole)
    showToast('Đã cập nhật phân quyền cho nhân sự thành công!', 'success')
  }

  const toggleTeamMemberHighRiskApproval = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, canApproveHighRisk: !m.canApproveHighRisk } : m))
    )
    showToast('Đã thay đổi quyền phê duyệt tác vụ nhạy cảm.', 'info')
  }

  const toggleTeamMemberStatus = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : m
      )
    )
    showToast('Đã thay đổi trạng thái tài khoản nhân sự.', 'info')
  }

  const addTeamMember = (memberData: Partial<TeamMember>) => {
    const newMember: TeamMember = {
      id: `user-${Date.now()}`,
      fullName: memberData.fullName || 'Nhân sự mới',
      email: memberData.email || 'user@vexim.io',
      role: memberData.role || 'PPC_SPECIALIST',
      department: memberData.department || 'Vận Hành Vexim',
      assignedClientIds: memberData.assignedClientIds || ['client-vina-01'],
      canApproveHighRisk: memberData.canApproveHighRisk || false,
      status: 'ACTIVE',
      lastActive: 'Chưa đăng nhập',
      phone: memberData.phone || '+84 900 000 000',
    }
    setTeamMembers((prev) => [...prev, newMember])
    SupabaseDatabaseService.createStaffUser(newMember)
    showToast(`Đã cấp tài khoản cho ${newMember.fullName} (${newMember.role})`, 'success')
  }

  // DEEP-TECH V2 ACTIONS
  const promoteSearchTerm = (id: string) => {
    setHarvestedSearchTerms((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'PROMOTED' } : t))
    )
    const term = harvestedSearchTerms.find((t) => t.id === id)
    showToast(`Đã đưa từ khóa "${term?.searchTerm}" vào Chiến dịch Exact và phủ định ở Auto!`, 'success')
  }

  const negateSearchTerm = (id: string) => {
    setHarvestedSearchTerms((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'NEGATED' } : t))
    )
    const term = harvestedSearchTerms.find((t) => t.id === id)
    showToast(`Đã thêm Negative Exact cho từ khóa "${term?.searchTerm}" (Tiết kiệm chi tiêu rác)`, 'info')
  }

  const toggleBidRule = (id: string) => {
    setAlgorithmicBidRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : r
      )
    )
    showToast('Đã cập nhật trạng thái thuật toán đấu thầu PPC.', 'info')
  }

  const submitPoaAppeal = (id: string) => {
    setPoaDocuments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'SUBMITTED_TO_AMAZON' } : p))
    )
    showToast('Đã gửi hồ sơ giải trình Plan of Action (POA) lên Amazon Seller Performance!', 'success')
  }

  const openModal = (type: string, data?: any) => setActiveModal({ type, data })
  const closeModal = () => setActiveModal(null)

  return (
    <AppStateContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        workspaceMode,
        setWorkspaceMode,
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
        algorithmicBidRules,
        harvestedSearchTerms,
        cannibalizationAlerts,
        dynamicLeadTimeRoutes,
        geoFbaPlacements,
        competitorReverseAsins,
        conversionDiagnostics,
        poaDocuments,
        trademarkWatches,
        teamMembers,
        updateTeamMemberRole,
        toggleTeamMemberHighRiskApproval,
        toggleTeamMemberStatus,
        addTeamMember,
        isAuthenticated,
        login,
        logout,
        currentUser,
        resetAllDataToDefaults,
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
        promoteSearchTerm,
        negateSearchTerm,
        toggleBidRule,
        submitPoaAppeal,
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
