// VEXIM AMAZON OPERATIONS PLATFORM - TYPES DEFINITIONS V1.0

export type UserRole =
  | 'SUPER_ADMIN' // Vexim Super Admin / Giám đốc Vận hành
  | 'OPS_MANAGER' // Amazon Operations Manager
  | 'PPC_SPECIALIST' // Chuyên viên Quảng cáo & Growth PPC
  | 'SUPPLY_CHAIN_SPECIALIST' // Chuyên viên Kho vận & Chuỗi cung ứng FBA
  | 'BRAND_CS_SPECIALIST' // Chuyên viên Listing, CRO & Chăm sóc Khách hàng
  | 'COMPLIANCE_SPECIALIST' // Chuyên viên Pháp lý, FDA & POA Kháng cáo
  | 'ACCOUNT_EXECUTIVE' // Account Executive quản lý Client
  | 'CLIENT_SUPPLIER' // Chủ Doanh nghiệp / Nhà xưởng Việt Nam

export type ServiceTier =
  | 'AMAZON_AUDIT' // $100-300 one-time
  | 'AMAZON_LAUNCH' // $500-1,500/SKU
  | 'AMAZON_OPERATIONS' // $500-1,000/month
  | 'AMAZON_GROWTH' // $1,000-2,500+/month

export interface ClientSupplier {
  id: string
  name: string
  companyName: string
  taxCode: string
  contactPerson: string
  email: string
  phone: string
  province: string
  category: string
  serviceTier: ServiceTier
  joinedAt: string
  amazonSellerId: string
  amazonStoreName: string
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'NEEDS_REAUTH' | 'PENDING'
  avatarUrl?: string
  activeSkuCount: number
  monthlyRevenue: number
  growthRate: number
  readinessAverage: number
}

export interface AmazonAccount {
  id: string
  clientId: string
  sellerId: string
  storeName: string
  marketplaceId: string // ATVPDKIKX0DER for Amazon US
  marketplaceName: string
  region: 'US'
  authStatus: 'AUTHORIZED' | 'EXPIRED' | 'PENDING_OAUTH' | 'REVOKED'
  tokenExpiry: string
  lastSyncTime: string
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'
  apiQuotaUsage: number // percentage
  activeListingsCount: number
  accountHealthRating: number // 200 - 1000
}

export type InventoryRisk = 'HEALTHY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'OVERSTOCK'

export interface ProductDocument {
  id: string
  title: string
  type: 'COA' | 'FDA_REGISTRATION' | 'LABEL_SPEC' | 'USDA_ORGANIC' | 'SAFETY_DATA' | 'PHYTOSANITARY' | 'FACTORY_AUDIT'
  fileUrl: string
  fileName: string
  fileSize: string
  uploadDate: string
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'REJECTED' | 'EXPIRED'
  extractedData?: {
    productName?: string
    ingredients?: string[]
    manufacturer?: string
    countryOfOrigin?: string
    certNumber?: string
    expiryDate?: string
  }
}

export interface ComplianceIssue {
  id: string
  code: string
  title: string
  severity: 'CRITICAL_BLOCK' | 'WARNING' | 'INFO'
  category: 'FDA' | 'PROPOSITION_65' | 'LABELING' | 'HAZMAT' | 'CLAIMS'
  description: string
  remedy: string
  isResolved: boolean
}

export interface ProductReadinessScore {
  overall: number // 0 - 100
  productInfo: number // 0 - 100
  listingQuality: number // 0 - 100
  mediaAssets: number // 0 - 100
  keywordCoverage: number // 0 - 100
  pricingCompetitiveness: number // 0 - 100
  complianceScore: number // 0 - 100
  documentationScore: number // 0 - 100
  blockersCount: number
  canLaunch: boolean
  recommendations: string[]
}

export interface Product {
  id: string
  clientId: string
  sku: string
  asin: string
  fnsku: string
  upc: string
  title: string
  brand: string
  category: string
  subCategory: string
  mainImage: string
  galleryImages: string[]
  price: number
  cogs: number // Cost of goods sold (Supplier manufacturing cost)
  fbaFeeEstimated: number
  referralFeeEstimated: number
  estimatedMargin: number // percentage
  weightLbs: number
  dimensionsInches: { length: number; width: number; height: number }
  status: 'DRAFT' | 'COMPLIANCE_REVIEW' | 'READY_FOR_LAUNCH' | 'ACTIVE' | 'SUPPRESSED' | 'INACTIVE'
  readinessScore: ProductReadinessScore
  documents: ProductDocument[]
  complianceIssues: ComplianceIssue[]
  createdAt: string
  updatedAt: string
}

export interface ListingScore {
  overall: number // 0 - 100
  titleScore: number
  bulletScore: number
  keywordScore: number
  contentScore: number
  conversionPotential: 'A+' | 'A' | 'B' | 'C' | 'D'
  complianceRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  strengths: string[]
  weaknesses: string[]
}

export interface ListingData {
  id: string
  productId: string
  sku: string
  asin: string
  title: string
  bulletPoints: string[]
  description: string
  backendSearchTerms: string
  aplusContentHtml?: string
  aplusModules?: {
    type: string
    headline: string
    body: string
    imageUrl: string
  }[]
  price: number
  currency: string
  lastOptimizedAt?: string
  currentScore: ListingScore
  aiOptimizationDraft?: {
    id: string
    title: string
    bulletPoints: string[]
    description: string
    backendSearchTerms: string
    targetKeywords: string[]
    projectedScore: number
    reasoning: string
    status: 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'
  }
}

export interface InventoryItem {
  id: string
  clientId: string
  sku: string
  asin: string
  title: string
  imageUrl: string
  fbaAvailable: number
  fbaReserved: number
  fbaInbound: number // In transit from Vietnam or Amazon FC receiving
  dailyVelocity7d: number // units/day
  dailyVelocity30d: number // units/day
  daysOfSupply: number // available / velocity
  supplierLeadTimeDays: number // Vietnam factory + ocean/air shipping (e.g. 35 days)
  reorderPointDays: number
  reorderPointUnits: number
  riskLevel: InventoryRisk
  inventoryValueUsd: number
  unitCostUsd: number
  recommendedReorderQty: number
  estimatedStockoutDate: string | null
  lastRestockedDate: string
  supplierReadyStatus?: 'PENDING_CONFIRMATION' | 'FACTORY_READY' | 'BOOKED_TRANSIT' | 'IN_TRANSIT'
  supplierReadyDate?: string
  supplierReadyQty?: number
  supplierReadyNotes?: string
  bookingDetails?: {
    carrierName: string
    billOfLadingNumber: string
    fbaShipmentId: string
    pickupDateTime: string
    driverInfo: string
    licensePlate: string
    etdPort: string
    etaFba: string
    confirmedBy: string
    confirmedAt: string
  }
}

export interface OrderItem {
  sku: string
  asin: string
  title: string
  quantity: number
  unitPrice: number
  itemTotal: number
}

export interface Order {
  id: string
  amazonOrderId: string
  clientId: string
  purchaseDate: string
  orderStatus: 'PENDING' | 'UNSHIPPED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  fulfillmentChannel: 'FBA' | 'FBM'
  salesChannel: 'Amazon.com'
  orderTotal: number
  itemCount: number
  customerCity: string
  customerState: string
  customerPostalCode: string
  carrier?: string
  trackingNumber?: string
  items: OrderItem[]
  hasProblem: boolean
  problemReason?: string
  aiProblemDiagnosis?: string
}

export interface PpcCampaign {
  id: string
  clientId: string
  campaignName: string
  type: 'SPONSORED_PRODUCTS' | 'SPONSORED_BRANDS' | 'SPONSORED_DISPLAY'
  targetingType: 'AUTO' | 'MANUAL'
  status: 'ENABLED' | 'PAUSED' | 'ARCHIVED'
  dailyBudget: number
  spend7d: number
  sales7d: number
  orders7d: number
  impressions7d: number
  clicks7d: number
  ctr: number
  cpc: number
  acos: number // Spend / Sales
  targetAcos: number
  tacos: number // Total Ad Spend / Total Brand Sales
  roas: number
}

export interface PpcKeyword {
  id: string
  campaignId: string
  campaignName: string
  keywordText: string
  matchType: 'EXACT' | 'PHRASE' | 'BROAD'
  bid: number
  suggestedBid: { low: number; mid: number; high: number }
  impressions: number
  clicks: number
  ctr: number
  spend: number
  sales: number
  orders: number
  acos: number
  conversionRate: number
  status: 'ENABLED' | 'PAUSED'
}

export interface Promotion {
  id: string
  clientId: string
  name: string
  type: 'COUPON' | 'PRIME_EXCLUSIVE_DISCOUNT' | 'LIGHTNING_DEAL' | 'PERCENT_OFF'
  discountValue: number // e.g. 15 for 15% off or $5 off
  discountType: 'PERCENT' | 'AMOUNT'
  targetSkus: string[]
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'CANCELLED'
  budget: number
  spend: number
  redemptions: number
  attributedSales: number
  salesUpliftPercent: number
  marginImpactPercent: number
  roi: number
}

export interface CustomerMessage {
  id: string
  clientId: string
  amazonMessageId: string
  orderId?: string
  customerName: string
  receivedAt: string
  messageSubject: string
  messageBody: string
  classification: 'NORMAL_INQUIRY' | 'COMPLAINT' | 'REFUND_REQUEST' | 'PRODUCT_QUALITY' | 'SAFETY_CRITICAL'
  safetyRiskDetected: boolean
  safetyKeywords?: string[]
  aiSuggestedDraft: string
  finalReply?: string
  status: 'UNREAD' | 'PENDING_APPROVAL' | 'SENT' | 'ESCALATED_TO_HUMAN'
  approvedBy?: string
  sentAt?: string
}

export interface AccountHealthMetric {
  overallScore: number // 200 - 1000
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL'
  orderDefectRate: { value: number; target: number; status: 'GOOD' | 'WARNING' | 'POOR' } // < 1%
  lateShipmentRate: { value: number; target: number; status: 'GOOD' | 'WARNING' | 'POOR' } // < 4%
  validTrackingRate: { value: number; target: number; status: 'GOOD' | 'WARNING' | 'POOR' } // > 95%
  policyComplianceIssues: {
    id: string
    type: 'INTELLECTUAL_PROPERTY' | 'FOOD_SAFETY' | 'LISTING_POLICY' | 'RESTRICTED_PRODUCTS' | 'CUSTOMER_COMPLAINT'
    title: string
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
    detectedAt: string
    deadline: string
    status: 'OPEN' | 'APPEAL_SUBMITTED' | 'RESOLVED'
    affectedAsin: string
    recommendedAction: string
  }[]
  openCasesCount: number
}

export type AIAgentType =
  | 'INVENTORY'
  | 'LISTING'
  | 'SALES'
  | 'PPC'
  | 'ACCOUNT_HEALTH'
  | 'PROMOTION'
  | 'CUSTOMER'
  | 'COMPLIANCE'

export type AIRecommendationPriority = 'CRITICAL' | 'HIGH' | 'OPPORTUNITY' | 'LOW'
export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RecommendationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'EXECUTED'

export interface AIRecommendation {
  id: string
  clientId: string
  clientName: string
  amazonAccountId?: string
  agentType: AIAgentType
  entityType: 'INVENTORY' | 'LISTING' | 'CAMPAIGN' | 'KEYWORD' | 'ORDER' | 'CUSTOMER_MESSAGE' | 'ACCOUNT_HEALTH' | 'PROMOTION' | 'COMPLIANCE'
  entityId: string
  entityIdentifier: string // SKU, ASIN, Campaign Name, Case #
  title: string
  description: string
  reason: string
  confidenceScore: number // percentage e.g. 94%
  priority: AIRecommendationPriority
  riskLevel: AIRiskLevel
  proposedAction: string
  actionData: Record<string, any>
  beforeState?: Record<string, any>
  proposedState?: Record<string, any>
  expectedImpact: string
  requiresExplicitApproval: boolean // sensitive actions like price change, refund, high budget
  status: RecommendationStatus
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectReason?: string
  executedAt?: string
}

export interface OperationalTask {
  id: string
  taskNumber: number
  clientId: string
  clientName: string
  title: string
  description: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'REJECTED'
  assignedTo: string
  assignedRole: UserRole
  dueDate: string
  source: 'AI_INVENTORY_AGENT' | 'AI_LISTING_AGENT' | 'AI_SALES_AGENT' | 'AI_PPC_AGENT' | 'AI_HEALTH_AGENT' | 'MANUAL_OPS'
  linkedEntity?: {
    type: string
    id: string
    name: string
  }
  recommendationId?: string
  createdAt: string
  updatedAt: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actorName: string
  actorRole: UserRole
  source: 'HUMAN' | 'AI_AGENT' | 'SP_API_SYNC'
  agentType?: AIAgentType
  actionType: string
  entityType: string
  entityId: string
  entityName: string
  beforeValue?: string
  afterValue?: string
  approvalNotes?: string
  ipAddress: string
}

export interface SyncJob {
  id: string
  name: string
  module: 'ORDERS' | 'INVENTORY' | 'LISTINGS' | 'PERFORMANCE_ADS' | 'ACCOUNT_HEALTH' | 'AI_NIGHTLY_SCAN'
  frequency: '1_HOUR' | '6_HOURS' | '24_HOURS' | 'WEEKLY'
  status: 'SYNC_PENDING' | 'SYNC_RUNNING' | 'SYNC_SUCCESS' | 'SYNC_FAILED'
  lastRunTime: string
  nextRunTime: string
  itemsProcessed: number
  errorCount: number
  lastErrorMessage?: string
}

export interface ClientPerformanceReport {
  id: string
  clientId: string
  clientName: string
  period: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_MONTH' | 'CUSTOM'
  startDate: string
  endDate: string
  grossSales: number
  previousGrossSales: number
  salesGrowthPercent: number
  unitsSold: number
  ordersCount: number
  averageOrderValue: number
  conversionRate: number
  previousConversionRate: number
  sessions: number
  adSpend: number
  adSales: number
  acos: number
  tacos: number
  estimatedGrossProfit: number
  estimatedNetMarginPercent: number
  executiveSummaryVi: string // AI generated executive summary in Vietnamese
  topPerformers: { sku: string; title: string; revenue: number; units: number }[]
  keyRisksAndActionPlan: string[]
  generatedAt: string
}

export interface VeximAgencyKPIs {
  totalManagedClients: number
  activeManagedSkus: number
  totalManagedRevenueMonthly: number
  averageClientGrowthRate: number
  totalOpenIssues: number
  totalAIRecommendationsGenerated: number
  humanApprovedRecommendations: number
  executedRecommendations: number
  aiAssistedOperationsRate: number // e.g. 74.2%
  humanHoursSavedThisMonth: number
  serviceRevenueBreakdown: {
    amazonAudit: number
    amazonLaunch: number
    amazonOperations: number
    amazonGrowth: number
  }
}

// ==========================================
// VEXIM PLATFORM V2.0 - DEEP TECH DATA TYPES
// ==========================================

export type WorkspaceMode =
  | 'ALL_OPERATIONS'
  | 'PPC_GROWTH'
  | 'SUPPLY_CHAIN'
  | 'BRAND_INTELLIGENCE'
  | 'COMPLIANCE_OPS'
  | 'SUPPLIER_PORTAL'

// 1. PPC & Growth Desk Types
export interface AlgorithmicBidRule {
  id: string
  ruleName: string
  ruleType: 'DAY_PARTING' | 'TARGET_ACOS_TUNER' | 'INVENTORY_THROTTLE' | 'PLACEMENT_BOOST'
  targetCampaignIds: string[]
  parameters: {
    peakHoursBidMultiplier?: number // e.g. 1.25 (+25%)
    offPeakBidMultiplier?: number // e.g. 0.60 (-40%)
    targetAcosThreshold?: number // e.g. 25%
    stockoutThresholdDays?: number // e.g. 14 days
    topOfSearchMultiplier?: number // e.g. +45%
  }
  status: 'ACTIVE' | 'PAUSED'
  executionsCount24h: number
  estimatedDailySavingsUsd: number
  lastTriggeredAt: string
}

export interface HarvestedSearchTerm {
  id: string
  campaignName: string
  adGroupName: string
  searchTerm: string
  matchTypeSource: 'AUTO' | 'BROAD' | 'PHRASE'
  impressions: number
  clicks: number
  orders: number
  spend: number
  sales: number
  acos: number
  cvr: number
  suggestedAction: 'PROMOTE_EXACT' | 'ADD_NEGATIVE_EXACT' | 'MONITOR'
  confidenceScore: number
  status: 'PENDING' | 'PROMOTED' | 'NEGATED' | 'IGNORED'
}

export interface CannibalizationAlert {
  id: string
  keyword: string
  campaignCount: number
  conflictingSkus: { sku: string; title: string; currentBid: number; acos: number }[]
  combinedMonthlySpend: number
  wastedSpendEstimate: number
  recommendation: string
}

// 2. Supply Chain Hub Types
export interface DynamicLeadTimeRoute {
  id: string
  originPort: string // e.g. "Cảng Cát Lái (HCMC)"
  destinationPort: string // e.g. "Port of Long Beach / LA"
  destinationFbaHub: string // e.g. "West Coast (ONT8 / LAX9)"
  factoryProductionDays: number
  oceanTransitDays: number
  portCustomsClearanceDays: number
  domesticDrayageDays: number
  fbaCheckinDays: number
  totalLeadTimeDays: number
  historicalAverageDays: number
  congestionDelayDays: number
  riskFactors: { factor: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; notes: string }[]
  seasonalSurgeForecast: string
}

export interface GeoFbaPlacementOption {
  id: string
  strategyName: string
  description: string
  fbaPlacementFeePerUnit: number
  totalPlacementFeeUsd: number
  inboundFreightCostUsd: number
  totalInboundCostUsd: number
  regionalBreakdown: { region: string; warehouseCode: string; percentage: number; units: number }[]
  avgDeliveryTimeToPrimeBuyer: string // e.g. "1.4 days"
  savingsVsSingleDestinationUsd: number
  recommended: boolean
}

// 3. Brand Intelligence & CRO Types
export interface CompetitorReverseAsin {
  id: string
  competitorAsin: string
  competitorBrand: string
  productTitle: string
  estimatedMonthlyUnits: number
  estimatedMonthlyRevenueUsd: number
  price: number
  bsrRank: number
  reviewCount: number
  reviewRating: number
  sharedTopKeywords: { keyword: string; competitorOrganicRank: number; ourOrganicRank: number; searchVolume: number }[]
  keywordOverlapScore: number
  pricingStrategyInsight: string
}

export interface ConversionDiagnostic {
  sku: string
  asin: string
  title: string
  sessions7d: number
  unitSessionPercentage: number // CVR
  categoryBenchmarkCvr: number
  ctr: number
  categoryBenchmarkCtr: number
  bounceRate: number
  bottleneckType: 'IMAGE_GALLERY' | 'PRICE_DISCONNECT' | 'BAD_REVIEWS' | 'IRRELEVANT_TRAFFIC' | 'BULLET_POINTS'
  diagnosisTitleVi: string
  diagnosisDetailVi: string
  suggestedActionVi: string
  estimatedRevenueUpliftMonthly: number
}

// 4. Compliance & Ops Lead Types
export interface PoaDocument {
  id: string
  issueId: string
  asin: string
  productName: string
  amazonNoticeType: 'INAUTHENTIC_COMPLAINT' | 'FOOD_SAFETY_EXPIRATION' | 'PEST_REGULATION' | 'INTELLECTUAL_PROPERTY'
  dateReceived: string
  deadlineDate: string
  rootCauseAnalysisVi: string
  rootCauseAnalysisEn: string
  immediateCorrectiveActionsVi: string
  immediateCorrectiveActionsEn: string
  preventiveMeasuresVi: string
  preventiveMeasuresEn: string
  attachedEvidence: { name: string; type: string; url: string; verified: boolean }[]
  status: 'DRAFT' | 'READY_FOR_LEGAL_REVIEW' | 'SUBMITTED_TO_AMAZON' | 'REINSTATED'
  attorneyApproved: boolean
}

export interface TrademarkWatch {
  id: string
  trademarkName: string
  serialNumber: string
  applicantName: string
  filingDate: string
  usptoClass: string // e.g. "Class 30: Cocoa & Tea"
  similarityScore: number // percentage e.g. 88%
  status: 'PUBLISHED_FOR_OPPOSITION' | 'PENDING_EXAMINATION' | 'OPPOSITION_FILED'
  oppositionDeadline: string
  riskAssessmentVi: string
  recommendedLegalAction: string
}

// Master Admin & Team RBAC Management Types
export interface TeamMember {
  id: string
  fullName: string
  email: string
  password?: string
  role: UserRole
  department: string
  assignedClientIds: string[] // 'ALL' or array of clientIds
  canApproveHighRisk: boolean // Permission to approve price changes > 15% and budgets > $500
  status: 'ACTIVE' | 'SUSPENDED'
  lastActive: string
  avatarUrl?: string
  phone?: string
  title?: string
  twoFactorEnabled?: boolean
  createdAt?: string
}

// Cross-Department Notification & Event Dispatcher Types
export type NotificationType =
  | 'CRITICAL_SAFETY'
  | 'LOW_STOCK'
  | 'COMPLIANCE'
  | 'PPC_HARVEST'
  | 'LOGISTICS'
  | 'APPROVAL'
  | 'TASK'
  | 'LISTING'
  | 'FINANCE'
  | 'SYSTEM'

export interface AppNotification {
  id: string
  title: string
  description: string
  type: NotificationType
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  timestamp: string
  createdAt: string
  isRead: boolean
  targetRoles: (UserRole | 'ALL')[]
  targetTab: string
  clientId?: string
  clientName?: string
  actionBy?: {
    name: string
    role: UserRole
  }
}

// ====================================================================
// LOGISTICS, FREIGHT RATES, CBM & SHIPMENT INTAKE TYPES
// ====================================================================

export type FreightTransportMode = 'OCEAN_FCL_40HC' | 'OCEAN_FCL_20FT' | 'OCEAN_LCL' | 'AIR_EXPRESS' | 'AIR_CARGO'

export interface FreightRateCard {
  id: string
  carrierPartnerName: string
  transportMode: FreightTransportMode
  originPort: string // 'Cát Lái (HCMC)', 'Hải Phòng (HPH)'
  destinationPort: string // 'Los Angeles (LAX)', 'Long Beach (LGB)', 'Tacoma', 'New York (NYC)'
  ratePerCbmUsd?: number
  ratePerKgUsd?: number
  ratePerContainerUsd?: number
  estimatedTransitDays: number
  customsClearanceDaysEst: number
  validUntil: string
  fuelSurchargePercent: number
  documentationFeeUsd: number
  drayageEstUsd: number
}

export interface InboundShipmentItem {
  sku: string
  asin: string
  title: string
  unitsPerCarton: number
  cartonCount: number
  totalUnits: number
  fobUnitCostUsd: number
  cartonDimensionsCm: { length: number; width: number; height: number }
  cartonWeightKg: number
}

export interface LandedCostCalculationResult {
  totalUnits: number
  totalCartons: number
  grossWeightKg: number
  totalCbm: number
  volumetricWeightKg: number
  chargeableWeightKg: number
  freightCostUsd: number
  importTariffDutyUsd: number
  customsAndDrayageUsd: number
  fbaInboundPlacementFeeUsd: number
  totalLandedCostUsd: number
  fobCostPerUnit: number
  freightCostPerUnit: number
  dutyCostPerUnit: number
  fbaInboundFeePerUnit: number
  finalLandedCostPerUnit: number
  landedCostMultiplier: number // e.g. 1.38x of FOB
}

export interface ForwarderWebhookPayload {
  event: 'MILESTONE_UPDATED' | 'CUSTOMS_CLEARED' | 'VESSEL_DEPARTED' | 'VESSEL_ARRIVED' | 'OUT_FOR_DELIVERY' | 'DELIVERED_3PL'
  shipmentId: string
  trackingNumber: string
  carrierName: string
  containerNumber?: string
  billOfLadingNumber?: string
  vesselName?: string
  voyageNumber?: string
  currentLocation: string
  etaTimestamp: string
  eventTimestamp: string
  statusNotesVi: string
  temperatureControlledAlert?: boolean
}
